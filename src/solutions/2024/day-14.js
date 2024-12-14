const { match } = require('../util');
const { mod } = require('../math2');

const ROBOT_REGEXP = /^p=(?<px>\d+),(?<py>\d+) v=(?<vx>-?\d+),(?<vy>-?\d+)$/gm;

/**
 * # [Advent of Code 2024 Day 14](https://adventofcode.com/2024/day/14)
 *
 * You can pretty easily compute the position of a robot at any point in time with:
 *
 * ```txt
 * x = mod(x0 + vx * t, width)
 * y = mod(y0 + vy * t, height)
 * ```
 *
 * One thing to note: `mod()` is not the same as the `%` operator, because the result from `mod()`
 * is always positive; e.g. `-8 % 7 = -1`, but `mod(-8, 7) = 6`. This is important for ensuring that
 * our robots stay in bounds.
 *
 * For part one, we can project the positions of all robots at `t = 100`. Then we just count how
 * many robots are in each quadrant and multiply the counts together.
 *
 * We need some way to programmatically detect when the tree appears in part two. Normally, the
 * robots are spread out all over the place. But when the tree appears, the robots are suddenly
 * significantly closer together on average. For each second, I compute the positions of the robots
 * at that second, then the average distance between robots. (For speed, I went with Manhattan
 * distance, which is perfectly fine for this.) Some experimentation showed that this average
 * hovered between 66 and 70 tiles. But at one point, it dropped to just over 40. So I just added a
 * condition that when the average dropped under 50, assume that was the moment the tree appeared.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, w = 101, h = 103) => {
  // Parse out the robot record
  const robots = match(
    input,
    ROBOT_REGEXP,
    { px: Number, py: Number, vx: Number, vy: Number }
  );

  if (w !== 101) {
    return part1(robots, w, h);
  }

  return [ part1, part2 ].map(fn => fn(robots, w, h));
};

/**
 * Compute the answer to part 1.
 *
 * @param {Object[]} robots - the robot objects
 * @param {number} w - the area width
 * @param {number} h - the area height
 * @returns {number} - the answer
 */
const part1 = (robots, w, h) => {
  let projected = project(robots, 100, w, h)
  const xMid = Math.floor(w / 2);
  const yMid = Math.floor(h / 2);
  const quadrants = Array(4).fill(0);
  projected.filter(({ px, py }) => px !== xMid && py !== yMid)
    .forEach(({ px, py }) => {
      quadrants[(px > xMid ? 1 : 0) + (py > yMid ? 2 : 0)]++;
    });
  return quadrants.reduce((factor, count) => factor * count, 1);
};

/**
 * Compute the answer to part 2.
 *
 * @param {Object[]} robots - the robot objects
 * @param {number} w - the area width
 * @param {number} h - the area height
 * @returns {number} - the answer
 */
const part2 = (robots, w, h) => {
  let seconds = 0;

  do {
    const projected = project(robots, ++seconds, w, h);
    const averageDistance = computeAverageDistance(projected);

    if (averageDistance < 50) {
      return seconds;
    }
  } while (true);
};

/**
 * Compute the positions of all the robots at a given time.
 *
 * @param {Object[]} robots - the robot objects
 * @param {number} seconds - the time to compute for
 * @param {number} w - the area width
 * @param {number} h - the area height
 * @returns {Object[]} - the robot positions
 */
const project = (robots, seconds, w, h) => robots.map(
  ({ px, py, vx, vy }) => ({
    px: mod(px + vx * seconds, w),
    py: mod(py + vy * seconds, h),
  })
);

/**
 * Computes the average Manhattan distance between the robots.
 *
 * @param {Object[]} robots - the robot objects
 * @returns {number} - the average Manhattan distance
 */
const computeAverageDistance = robots => {
  let totalDistance = 0, comparisons = 0;

  for (let i = 0; i < robots.length; i++) {
    const robot1 = robots[i];

    for (let j = i + 1; j < robots.length; j++) {
      const robot2 = robots[j];
      totalDistance += Math.abs(robot1.px - robot2.px) + Math.abs(robot1.py - robot2.py);
      comparisons++;
    }
  }

  return totalDistance / comparisons;
};
