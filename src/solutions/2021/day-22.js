const { split } = require('../util');

const LINE_REGEXP = /^(?<state>on|off) x=(?<x0>-?\d+)\.\.(?<x1>-?\d+),y=(?<y0>-?\d+)\.\.(?<y1>-?\d+),z=(?<z0>-?\d+)\.\.(?<z1>-?\d+)$/;

/**
 * # [Advent of Code 2021 Day 22](https://adventofcode.com/2021/day/22)
 *
 * Counting the number of cubes individually works for part one, but there are
 * way too many for part two. The solution used here is to employ negative
 * volume cuboids. The idea is, each time you add a cuboid, you first cancel
 * out the overlapping parts of existing cuboids by adding cuboids for the
 * intersections with the opposite volume. Once the intersections for any
 * overlapping cuboids are cancelled, you add the new cuboid if it's on, or
 * just leave it out if it's off.
 *
 * Here's a one-dimensional illustration of the concept. Let's start with just
 * a single line segment, `A`:
 *
 * ```txt
 *         |---------A---------|            length = 4
 * <--+----+----+----+----+----+----+----+-->
 *    2    3    4    5    6    7    8    9
 *
 * Now we add another line segment `B`, and want to compute the total length of
 * the union of those segments:
 *
 * ```txt
 *         |---------A---------|            length = 4
 *                   |---------B---------|  length = 4
 *         |----------------------------|  <-- solve for A ∪ B
 * <--+----+----+----+----+----+----+----+-->
 *    2    3    4    5    6    7    8    9
 * ```
 *
 * To do this, we create another segment `D` representing `A ∩ B`, but consider its
 * length negative, rather than positive. This cancels out the doubling of the
 * intersection between `A` and `B` when we add them up.
 *
 * ```txt
 *         |---------A---------|            length =  4
 *                   |---------B---------|  length =  4
 *                   |----D----|            length = -2 (A ∩ B)
 *         |-----------------------------|  <-- solve for A ∪ B
 * <--+----+----+----+----+----+----+----+-->
 *    2    3    4    5    6    7    8    9
 * ```
 *
 * Now we just add all their lengths: `4 + 4 - 2 = 6`.
 *
 * Now suppose we add a third line segment, `C`, and we want to compute
 * `A ∪ B ∪ C`?
 *
 * ```txt
 *         |---------A---------|            length =  4
 *                   |---------B---------|  length =  4
 *    |---------C---------|                 length =  4
 *                   |----D----|            length = -2 (A ∩ B)
 *    |----------------------------------|  <-- solve for A ∪ B ∪ C
 * <--+----+----+----+----+----+----+----+-->
 *    2    3    4    5    6    7    8    9
 * ```
 *
 * We do the same as before, except against `A`, `B`, and `D`:
 *
 * ```txt
 *         |---------A---------|            length =  4
 *                   |---------B---------|  length =  4
 *    |---------C---------|                 length =  4
 *                   |----D----|            length = -2 (A ∩ B)
 *         |------E-------|                 length = -3 (A ∩ C)
 *                   |-F--|                 length = -1 (B ∩ C)
 *                   |-G--|                 length =  1 (D ∩ C)
 *    |----------------------------------|  <-- solve for A ∪ B ∪ C
 * <--+----+----+----+----+----+----+----+-->
 *    2    3    4    5    6    7    8    9
 * ```
 *
 * Note that `G` represents the intersection between `C` and `D`, but since `D`
 * is already negative, `G` will be positive. Now we add up the lengths:
 *
 * `4 + 4 + 4 - 2 - 3 - 1 + 1 = 7`
 *
 * ---
 *
 * Procedure for adding a cuboid:
 *
 * 1. If we're in part one, reduce the cuboid to its intersection with the
 *    initialization procedure region.
 * 2. Copy the list of existing cuboids, then iterate the copy:
 *    1. Compute the intersection between the new cuboid and the existing one.
 *    2. If they intersect, add the intersection to the list of existing
 *       cuboids, with the opposite sign from the existing one.
 * 3. If this is an "on" cuboid, add it to the list of existing cuboids.
 *
 * Once all the cuboids are added, the answer is simply the sum of all the
 * cuboids, positive or negative.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solution = input => {
  return [ true, false ].map(init => {
    const engine = new Reactor(init);
    parse(input).forEach(cuboid => engine.add(cuboid));
    return engine.onCount;
  });
};

/**
 * Parses the input into a list of cuboids. "On" cuboids have positive volume,
 * while "off" cuboids have negative volume.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the list of cuboids
 */
const parse = input => split(input).map(line => {
  const match = line.match(LINE_REGEXP);
  const on = match.groups.state === 'on';
  const x0 = parseInt(match.groups.x0, 10);
  const x1 = parseInt(match.groups.x1, 10);
  const y0 = parseInt(match.groups.y0, 10);
  const y1 = parseInt(match.groups.y1, 10);
  const z0 = parseInt(match.groups.z0, 10);
  const z1 = parseInt(match.groups.z1, 10);
  return new Cuboid(x0, x1, y0, y1, z0, z1, on);
});

/**
 * Class representing the submarine's reactor.
 */
class Reactor {
  #maskCuboid;
  #cuboids = [];

  /**
   * Creates a new `Reactor`. If `init` is `true`, we're doing the
   * initialization procedure (part one), otherwise, we're doing the full
   * reboot (part two).
   *
   * @param {boolean} init - whether we're doing the initialization procedure
   */
  constructor(init) {
    if (init) {
      this.#maskCuboid = new Cuboid(-50, 50, -50, 50, -50, 50)
    }
  }

  /**
   * Adds a cuboid to the reactor. This may also add other cuboids as needed in
   * order to compensate for overlaps that the new cuboid may have with any
   * existing cuboids.
   *
   * @param {Cuboid} cuboid - the cuboid to add
   */
  add(cuboid) {
    if (this.#maskCuboid) {
      // Part 1: Reduce the input Cuboid to its intersection with the
      // initialization region.
      cuboid = cuboid.intersection(this.#maskCuboid, cuboid.on);

      if (!cuboid) {
        return; // input Cuboid is outside the initialization region
      }
    }

    // "Hollow out" a space for the new Cubiod by cancelling the intersection
    // volumes.
    [ ...this.#cuboids ].forEach(existing => {
      const intersection = cuboid.intersection(existing, !existing.on);

      if (intersection) {
        this.#cuboids.push(intersection);
      }
    });

    if (cuboid.on) {
      this.#cuboids.push(cuboid);
    }
  }

  /**
   * Returns the number of cubes that are on in the rector.
   */
  get onCount() {
    return this.#cuboids.reduce((count, cuboid) => count + cuboid.volume, 0);
  }
}

/**
 * Represents a three-dimensional space in the shape of a rectangular prism.
 * `Cuboid`s can have negative volume, which is used to cancel out the positive
 * volume `Cuboid`s with which they overlap.
 */
class Cuboid {
  #x0;
  #x1;
  #y0;
  #y1;
  #z0;
  #z1;
  #volume;

  /**
   * Create a new `Cuboid`. If `on` is `false`, the volume will be negative.
   *
   * @param {number} x0 - the minimum X coordinate 
   * @param {number} x1 - the maximum X coordinate
   * @param {number} y0 - the minimum Y coordinate
   * @param {number} y1 - the maximum Y coordinate
   * @param {number} z0 - the minimum Z coordinate
   * @param {number} z1 - the maximum Z coordinate
   * @param {boolean} on - `true` for positive volume, `false` for negative
   */
  constructor(x0, x1, y0, y1, z0, z1, on) {
    this.#x0 = x0;
    this.#x1 = x1;
    this.#y0 = y0;
    this.#y1 = y1;
    this.#z0 = z0;
    this.#z1 = z1;
    this.#volume = (on ? 1 : -1) * (x1 - x0 + 1) * (y1 - y0 + 1) * (z1 - z0 + 1);
  }

  /**
   * Returns the volume of this `Cuboid` (which may be negative).
   *
   * @returns {number} - the volume
   */
  get volume() {
    return this.#volume;
  }

  /**
   * Returns whether this `Cuboid`'s volume is non-negative.
   *
   * @returns {boolean} - `true` if the volume is non-negative, `false`
   * otherwise
   */
  get on() {
    return this.#volume > 0;
  }

  /**
   * Returns a new `Cuboid` which represents the intersection between this
   * `Cuboid` and the given `Cuboid` (`that`).
   *
   * @param {Cuboid} that - the other `Cuboid`
   * @param {boolean} on - if `false`, the intersection volume will be negative
   * @returns {Cuboid|null} - the intersection, or `null` if they don't overlap
   */
  intersection(that, on) {
    if (
      // Do they intersect?
      Math.max(this.#x0, that.#x0) <= Math.min(this.#x1, that.#x1) &&
      Math.max(this.#y0, that.#y0) <= Math.min(this.#y1, that.#y1) &&
      Math.max(this.#z0, that.#z0) <= Math.min(this.#z1, that.#z1)
    ) {
      // Compute intersection
      return new Cuboid(
        Math.max(this.#x0, that.#x0),
        Math.min(this.#x1, that.#x1),
        Math.max(this.#y0, that.#y0),
        Math.min(this.#y1, that.#y1),
        Math.max(this.#z0, that.#z0),
        Math.min(this.#z1, that.#z1),
        on,
      );
    }

    return null;
  }

  /**
   * Returns a string representation of the `Cuboid`.
   *
   * @returns {string} - the string representation
   */
  toString() {
    return `${this.#x0}..${this.#x1},${this.#y0}..${this.#y1},${this.#z0}..${this.#z1}`;
  }
}

solution.Cuboid = Cuboid;
module.exports = solution;
