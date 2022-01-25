const TARGET_AREA_REGEXP = /^target area: x=(?<x0>-?\d+)\.\.(?<x1>-?\d+), y=(?<y0>-?\d+)\.\.(?<y1>-?\d+)$/;

/**
 * # [Advent of Code 2021 Day 17](https://adventofcode.com/2021/day/17)
 *
 * My approach to this problem was to first compute the range of possible
 * velocities in both axes for the projectile. Let's call the target area range
 * `x0, y0` through `x1, y1` and the projectile velocity range `vx0, vy0`
 * through `vx1, vy1`. Note that the target area lies below the X axis, so `y0`
 * and `y1` are both negative, and `y0`'s magnitude is _greater_ ("more
 * negative") than that of `y1`. Also note that the X and Y velocities are
 * independent of one another, and so can be computed separately.
 *
 * A useful observation is that on both axes, we encounter situations where the
 * position of the projectile can be computed by summing a sequence of
 * consecutive integers:
 *
 * - The highest Y position when shooting the projectile at a `vy` greater than
 *   `0` will be the sum of the sequence `1 + 2 + ... + vy`.
 * - The X position where the projectile reaches `vx = 0` will be the sum of
 *   the sequence `1 + 2 + ... + vx`.
 *
 * The sum of a sequence of consecutive integers (starting with `1`) can be
 * computed with the formula `s = (n * (n + 1)) / 2`, where `n` is the largest
 * integer in the sequence.
 *
 * The value of `vx0` is going to be the lowest velocity such that it just
 * reaches the left edge of the target area when its velocity reaches `0`. This
 * idea can be expressed mathematically as `x0 = (vx0 * (vx0 + 1)) / 2`. We can
 * solve for `vx0` using the quadratic formula. The result is fractional, so we
 * round up to make sure we don't fall short of the target:
 *
 * ```js
 * vx0 = Math.ceil((Math.sqrt(8 * x0 + 1) - 1) / 2)
 * ```
 *
 * The maximum X velocity would be firing it so quickly that the first tick
 * takes it to the right edge of the target area:
 *
 * ```js
 * vx1 = x1
 * ```
 * 
 * Similarly, the minimum Y velocity would be firing it down quickly so that
 * the first tick takes to the bottom edge of the target area:
 *
 * ```js
 * vy0 = y0
 * ```
 *
 * Lastly, the maximum Y velocity is shooting it up in a big arc so that it
 * goes way up, then comes back down fast enough that when it crosses the X
 * axis, it has enough velocity that the next tick takes it to the bottom edge
 * of the target area. This seems like it would be hard to compute at first,
 * until we realize that if we shoot it up at `vy`, when it reaches the X axis
 * again it will be travelling at `-vy`. This means that at the next tick, its
 * Y position will be `-vy - 1`. We want that to be `y0`, so our velocity would
 * be:
 *
 * ```js
 * vy1 = -y0 - 1
 * ```
 *
 * Solving part one is easy now: compute the maximum Y value reached by the
 * projectile when fired at velocity `vy1`. The Y coordinates of the projectile
 * are progressively smaller integers, so we can use `vy1 * (vy1 + 1) / 2 to`
 * compute the answer.
 *
 * For part two, we have a range of all the possible velocities for each axis,
 * but not every combination of them will hit the target. For example, firing
 * at `vx0` and `vy0` will miss. Since the velocity on each axis is independent
 * of the other, we can simulate the projectile's motion on each axis
 * separately, and for each value in the velocity range, store the time indexes
 * where it's within the target area. Then we just check all the combinations
 * of X and Y velocities to see if any of them have the same time indexes; each
 * one that does is a possible velocity combination. Counting the number of
 * times that happens gives us the answer.
 *
 * One wrinkle with this approach is that on the X axis, the projectile will
 * eventually come to zero velocity. In our simulations, this will only ever
 * happen within the target range, since we're not testing velocities where it
 * would happen before reaching it, and we stop simulating once the projectile
 * moves beyond it. So we have to 1) recognize when this happens so that we can
 * stop the simulation, and 2) account for the fact that every time index after
 * the last one we simulate is valid for that axis.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const target = parse(input.trim());
  return compute(target);
};

/**
 * Parses the input line into an object representing the target area.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the target area
 */
const parse = input => {
  const match = input.match(TARGET_AREA_REGEXP).groups;
  return {
    x0: parseInt(match.x0, 10),
    y0: parseInt(match.y0, 10),
    x1: parseInt(match.x1, 10),
    y1: parseInt(match.y1, 10),
  };
};

/**
 * Computes the answers to both parts of the puzzle.
 *
 * @param {Object} target - the target area
 * @returns {Array} - the puzzle answers
 */
const compute = target => {
  // Compute velocity ranges
  const vx0 = Math.ceil((Math.sqrt(8 * target.x0 + 1) - 1) / 2);
  const vx1 = target.x1;
  const vy0 = target.y0;
  const vy1 = -target.y0 - 1;
  return [
    vy1 * (vy1 + 1) / 2,
    computePossibleVelocities(vx0, vx1, vy0, vy1, target),
  ];
};

/**
 * Counts the number of velocity combinations that hit the target area. For
 * maximum efficiency, each axis is simulated separately, and only those
 * velocity combinations that reach the target area on both axes on the same
 * time index are counted.
 *
 * @param {number} vx0 - the minimum X velocity
 * @param {number} vx1 - the maximum X velocity
 * @param {number} vy0 - the minimum Y velocity
 * @param {number} vy1 - the maximum Y velocity
 * @param {Object} target - the target area
 * @returns {number} - the number of possible velocity combinations
 */
const computePossibleVelocities = (vx0, vx1, vy0, vy1, target) => {
  // Build simulation functions
  const accX = v => v - Math.sign(v);
  const accY = v => v - 1;
  const testX = x => {
    if (x < target.x0) {
      return -1;
    }

    return x > target.x1 ? 1 : 0;
  };
  const testY = y => {
    if (y > target.y1) {
      return -1;
    }

    return y < target.y0 ? 1 : 0;
  };

  // Simulate for each axis
  const xSims = simulateAxis(vx0, vx1, accX, testX);
  const ySims = simulateAxis(vy0, vy1, accY, testY);

  // Count instances where time indexes match up
  let count = 0;

  xSims.forEach(xSim => {
    ySims.forEach(ySim => {
      if (ySim.times.some(xSim.test)) {
        count++;
      }
    });
  });

  return count;
};

/**
 * Simulates each possible velocity in the given range and returns an array of
 * objects representing each velocity that hit the target. Each velocity object
 * has these properties:
 *
 * - `v0`: the initial velocity
 * - `times`: an array of time indexes where `testFn()` returned `0`
 * - `infinite`: if `true`, the projectile never left the target range, so
 *   every time index after the last is also valid (only happens on the X axis)
 *
 * See the documentation for `simulate()` for information about `accFn` and
 * `testFn`.
 *
 * @param {number} vMin - the minimum velocity
 * @param {number} vMax - the maximum velocity
 * @param {Function} accFn - the acceleration function
 * @param {Function} testFn - the test function
 * @returns {Array} - an object representing each successful velocity
 */
const simulateAxis = (vMin, vMax, accFn, testFn) => {
  const sims = [];

  for (let v0 = vMin; v0 <= vMax; v0++) {
    const result = simulate(v0, accFn, testFn);

    if (result.times.length) {
      let tLast = result.times[result.times.length - 1];
      /**
       * Tests whether the projectile is within the target range at the given
       * time index for this velocity.
       *
       * @param {number} t - the time index
       * @returns {boolean} - `true` if the projectile is within the target at
       * that time, `false` otherwise
       */
      const test = t => result.times.includes(t) || result.infinite && t > tLast;
      sims.push({
        v0,
        times: result.times,
        test,
      });
    }
  }

  return sims;
};

/**
 * Simulates the projectile's motion for the given initial velocity along a
 * single axis, and determines what time indexes (if any) have the projectile
 * within the target range.
 *
 * You must provide two functions:
 *
 * - `accFn`: The acceleration function, which takes the projectile's velocity
 *   at the current time index, and returns its velocity for the next time
 *   index.
 * - `testFn`: The test function, which takes the projectile's current position
 *   and returns a negative value if the projectile has not yet reached the
 *   target range, `0` if it is within the target range, and a positive value
 *   if the projectile has passed the target range.
 *
 * @param {number} v0 - the projectile's initial velocity
 * @param {Function} accFn - the acceleration function
 * @param {Function} testFn - the test function
 * @returns {Array} - the time indexes where the projectile is within the
 * target range
 */
const simulate = (v0, accFn, testFn) => {
  let t = 0, p = 0, v = v0, result, times = [], infinite = false;

  do {
    t++;
    p += v;
    result = testFn(p);

    if (result === 0) {
      times.push(t); // Hit!
    }

    const newV = accFn(v);

    if (v === newV && result <= 0) {
      // No more acceleration
      infinite = true;
      break;
    }

    v = newV;
  } while (result <= 0);

  return {
    times,
    infinite,
  };
};
