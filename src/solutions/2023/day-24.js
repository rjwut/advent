const { match } = require('../util');
const z3 = require('z3-solver');

const HAILSTONE_REGEXP = /^(?<px>-?\d+),\s+(?<py>-?\d+),\s+(?<pz>-?\d+)\s+@\s+(?<vx>-?\d+),\s+(?<vy>-?\d+),\s+(?<vz>-?\d+)$/gm;
const COORD_MIN = 200_000_000_000_000;
const COORD_MAX = 400_000_000_000_000;

/**
 * # [Advent of Code 2023 Day 24](https://adventofcode.com/2023/day/24)
 *
 * ## Part One
 *
 * We're asked to find the number of intersections of the hailstone's paths when projected on the
 * XY plane, subject to two constraints:
 *
 * - The X and Y coordinates of the intersections must fall within the given range of values.
 * - The intersections must occur at values of `t` greater than `0`.
 *
 * First, for each hailstone, we must determine the slope and y-intercept of its line on the XY
 * plane, which is simply `m = Δy / Δx` and `a = y - m * x`.
 *
 * Two lines will intersect if their slopes are unequal. At the point of intersection, their `x`
 * and `y` values will be equal, so we can solve for `x` as follows:
 *
 * ```txt
 * y = m1 * x + a1
 * y = m2 * x + a2
 * m1 * x + a1 = m2 * x + a2
 * m1 * x - m2 * x = a2 - a1
 * x * (m1 - m2) = a2 - a1
 * x = (a2 - a1) / (m1 - m2)
 * ```
 *
 * Having determined the value of `x`, we can then solve for `y` using either of the original
 * equations.
 *
 * Now that we've found the intersection, we must check that it satisfies the constraints. The
 * first constraint is simply a matter of checking that `x` and `y` fall within the given range.
 * For the second constraint, we have to determine when the hailstone reaches that point to make
 * sure it isn't in the past. We can pick either axis (let's go with `x`), and solve for `t` as
 * follows:
 *
 * ```txt
 * x = x₀ + Δx * t
 * x - x₀ = Δx * t
 * t = (x - x₀) / Δx
 * ```
 *
 * If the resulting value of `t` is greater than `0`, then the hailstone will reach that point in
 * the future and should be counted.
 *
 * Repeat the above for every pair of hailstones, and count the number of intersections which
 * statisfy the constraints. This is the answer to part one.
 *
 * ## Part Two
 *
 * I'm not particularly happy with my part two solution for this one, since I resorted to using the
 * `z3-solver` library, when all my previous solutions have been pure JavaScript. I may try to
 * revisit this one and see if I can come up with a different solution.
 *
 * The position of any hailstone at any time `t` can be expressed as follows:
 *
 * ```txt
 * x = x₀ + Δx * t
 * y = y₀ + Δy * t
 * z = z₀ + Δz * t
 * ```
 *
 * We're trying to determine when and where the thrown rock matches the hailstone's position. If
 * the rock's initial position is `(xₛ₀, yₛ₀, zₛ₀)` and its velocity is `(Δxₛ, Δyₛ, Δzₛ)`, then we
 * can express the collision as follows:
 *
 * ```txt
 * xrₛ₀ + Δxₛ * t = x₀ + Δx * t
 * yrₛ₀ + Δyₛ * t = y₀ + Δy * t
 * zrₛ₀ + Δzₛ * t = z₀ + Δz * t
 * ```
 *
 * In this system of equations, we have seven unknowns and three equations, so we can't solve for
 * `t` using a single hailstone. However, each new hailstone we add to the system gives us three
 * more equations while adding only one more unknown (the new hailstone's collision time). With
 * two hailstones we have eight unknowns and six equations, and with three hailstones we have nine
 * unknowns and nine equations, which is enough to solve for the stone's initial position. Building
 * the system of equations and feeding it to Z3 gives us the initial position of the rock. Adding
 * together its coordinates is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = async (input, coordMin = COORD_MIN, coordMax = COORD_MAX) => {
  const hailstones = parse(input);
  return [
    part1(hailstones, coordMin, coordMax),
    await part2(hailstones),
  ];
};

/**
 * Parses the input into an array of `Hailstone` objects.
 *
 * @param {string} input - the puzzle input
 * @returns {Array<Hailstone>} - the parsed hailstones
 */
const parse = input => match(input, HAILSTONE_REGEXP, {
  px: Number, py: Number, pz: Number, vx: Number, vy: Number, vz: Number,
}).map(record => new Hailstone(record));

/**
 * Counts the number of intersections of the hailstones' paths on the XY plane that occur in the
 * future within the given range of values.
 *
 * @param {Array<Hailstone>} hailstones - the hailstones
 * @param {number} coordMin - the minimum value of X and Y
 * @param {number} coordMax - the maximum value of X and Y
 * @returns {number} - the number of intersections
 */
const part1 = (hailstones, coordMin, coordMax) => {
  const limit = hailstones.length - 1;
  let count = 0;

  for (let i = 0; i < limit; i++) {
    const hail1 = hailstones[i];

    for (let j = i + 1; j < hailstones.length; j++) {
      const hail2 = hailstones[j];
      const intersection = hail1.line.intersection(hail2.line);

      if (intersection) {
        const [ x, y ] = intersection;
        const t1 = (x - hail1.p[0]) / hail1.v[0];
        const t2 = (x - hail2.p[0]) / hail2.v[0];

        if (
          t1 >= 0 && t2 >= 0 &&
          x >= coordMin && x <= coordMax && y >= coordMin && y <= coordMax
        ) {
          count++;
        }
      }
    }
  }

  return count;
};

/**
 * Finds the initial position and velocity of the rock which will collide with the hailstones, then
 * sums its initial position coordinates to produce the answer to part two.
 *
 * @param {Hailstone[]} hailstones - the hailstones
 * @returns {number} - the sum of the rock's initial position coordinates
 */
const part2 = async hailstones => {
  const { Context, em } = await z3.init();
  const { Solver, Int } = new Context('main');
  // The rock's initial position (what we're trying to find)
  const x = Int.const('x');
  const y = Int.const('y');
  const z = Int.const('z');

  // The rock's initial velocity
  const vx = Int.const('vx');
  const vy = Int.const('vy');
  const vz = Int.const('vz');
  const solver = new Solver();

  for (let i = 0; i < 3; i++) {
    const hailstone = hailstones[i];

    // The hailstone's initial position
    const xh = Int.const(`x${i}`);
    const yh = Int.const(`y${i}`);
    const zh = Int.const(`z${i}`);
    solver.add(xh.eq(hailstone.p[0]));
    solver.add(yh.eq(hailstone.p[1]));
    solver.add(zh.eq(hailstone.p[2]));

    // The hailstone's initial velocity
    const vxh = Int.const(`vx${i}`);
    const vyh = Int.const(`vy${i}`);
    const vzh = Int.const(`vz${i}`);
    solver.add(vxh.eq(hailstone.v[0]));
    solver.add(vyh.eq(hailstone.v[1]));
    solver.add(vzh.eq(hailstone.v[2]));

    // The time the hailstone collides with the rock
    const th = Int.const(`t${i}`);
    solver.add(th.gt(0));

    // Set the coordinates of the rock and the hailstone at this time to be equal
    solver.add(x.add(vx.mul(th)).eq(xh.add(vxh.mul(th))));
    solver.add(y.add(vy.mul(th)).eq(yh.add(vyh.mul(th))));
    solver.add(z.add(vz.mul(th)).eq(zh.add(vzh.mul(th))));
  }

  // The answer to the problem (the sum of the coordinates for the rock's initial position)
  const answer = Int.const('answer');
  solver.add(answer.eq(x.add(y).add(z)));

  // Feed the system to Z3
  await solver.check();
  em.PThread.terminateAllThreads(); // https://github.com/Z3Prover/z3/issues/6701
  return parseInt(solver.model().get(answer).toString(), 10);
};

/**
 * Represents a single hailstone.
 */
class Hailstone {
  #p;
  #v;
  #line;

  /**
   * Makes a new `Hailstone` from the given record parsed from the input.
   *
   * @param {Object} param0 - the parsed record
   */
  constructor({ px, py, pz, vx, vy, vz }) {
    this.#p = [ px, py, pz ];
    this.#v = [ vx, vy, vz ];
    this.#line = new Line(px, py, vx, vy);
  }

  /**
   * @returns {number[]} - the hailstone's position at `t = 0`
   */
  get p() {
    return this.#p;
  }

  /**
   * @returns {number[]} - the hailstone's velocity
   */
  get v() {
    return this.#v;
  }

  /**
   * @returns {Line} - the hailstone's line on the XY plane, and its velocity along that line
   */
  get line() {
    return this.#line;
  }

  /**
   * Computes the position of the `Hailstone` at the given time.
   *
   * @param {number} t - the time to compute for
   * @returns {number[]} - the `Hailstone`'s position at that time
   */
  posAt(t) {
    return this.#p.map((p, i) => p + this.#v[i] * t);
  }
}

/**
 * Represents the path and velocity of a `Hailstone` on the XY plane.
 */
class Line {
  #slope;
  #yIntercept;

  /**
   *
   * @param {number} px - the initial position on the X axis
   * @param {number} py - the initial position on the Y axis
   * @param {number} vx - the velocity on the X axis
   * @param {number} vy - the velocity on the Y axis
   */
  constructor(px, py, vx, vy) {
    this.#slope = vy / vx;
    this.#yIntercept = py - this.#slope * px;
  }

  /**
   * @return {number} - the `Line`'s slope
   */
  get slope() {
    return this.#slope;
  }

  /**
   * @return {number} - the `Line`'s y-intercept
   */
  get yIntercept() {
    return this.#yIntercept;
  }

  /**
   * Computes the intersection of this `Line` with another `Line`, if it exists.
   *
   * @param {Line} that - the other `Line` which may intersect with this one
   * @returns {number[]|null} - the intersection point, or `null` if the lines are parallel
   */
  intersection(that) {
    if (this.#slope === that.#slope) {
      return null;
    }

    const x = (that.#yIntercept - this.#yIntercept) / (this.#slope - that.#slope);
    const y = this.#slope * x + this.#yIntercept;
    return [ x, y ];
  }
}
