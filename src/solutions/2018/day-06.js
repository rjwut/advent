const { manhattanDistance, max } = require('../math2');
const { split } = require('../util');
const Bounds = require('../bounds');

const DEFAULT_PROXIMITY_THRESHOLD = 10_000;

/**
 * # [Advent of Code 2018 Day 6](https://adventofcode.com/2018/day/6)
 *
 * Both parts of the puzzle need the parsed list of target coordinates, and the
 * bounds of the area in which they are located. The latter is done using my
 * `Bounds` class. This class allows you to iterate all the coordinates within
 * the bounds, which will be used by both parts.
 *
 * Part one has us bucketing coordinates into areas, but the areas that reach
 * the edge of the bounds are infinite and are ignored. Each time a coordinate
 * is assigned to an area, we increment a counter for that area. If the area is
 * found to be on an edge, we change the counter to `-Infinity` so that it
 * can't end up being the largest area. Once all the coordinates have been
 * iterated, the largest counter value is the answer to part one.
 *
 * Part two is actually a little more straightforward. We again iterate each
 * cell within the bounds, but this time, we just sum the Manhattan distances
 * to each target. If the sum is less than the threshold value, we increment a
 * counter, which is the answer to part two when the iteration is complete.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, proximityThreshold = DEFAULT_PROXIMITY_THRESHOLD) => {
  const { targets, bounds } = parse(input);
  return [ part1(targets, bounds), part2(targets, bounds, proximityThreshold) ];
};

/**
 * Parses the list of target coordinates from the input, and creates the bounds
 * object that will be used to iterate all the coordinates. The returned object
 * contains these results under the `targets` and `bounds` keys.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parse result object
 */
const parse = input => {
  const bounds = new Bounds();
  const targets = split(input).map(
    line => line.split(',').map(Number)
  );
  targets.forEach(target => bounds.put(target));
  return { targets, bounds };
};

/**
 * Produces the answer to part one.
 *
 * @param {Array} targets - the list of target coordinates
 * @param {Bounds} bounds - the bounds object
 * @returns {number} - the answer to part one
 */
const part1 = (targets, bounds) => {
  const areaSizes = new Map();
  bounds.forEach(coords => {
    const closestTarget = findClosestTarget(coords, targets);

    if (closestTarget) {
      const key = closestTarget.join();
      let value

      if (bounds.distanceFromBorder(coords) === 0) {
        // This cell is on the border of the bounds, so the area it belongs to
        // is infinite.
        value = -Infinity;
      } else {
        value = (areaSizes.get(key) ?? 0) + 1;
      }

      areaSizes.set(key, value);
    }
  });
  return max([...areaSizes.values()]);
};

/**
 * Produces the answer to part two.
 *
 * @param {Array} targets - the list of target coordinates
 * @param {Bounds} bounds - the bounds object
 * @param {number} proximityThreshold - the proximity threshold
 * @returns {number} - the answer to part one
 */
const part2 = (targets, bounds, proximityThreshold) => {
  let regionSize = 0;
  bounds.forEach(coords => {
    const totalDistance = targets.reduce((total, target) => {
      return total + manhattanDistance(coords, target);
    }, 0);

    if (totalDistance < proximityThreshold) {
      regionSize++;
    }
  });
  return regionSize;
};

/**
 * Finds the closest target to the given coordinates, and returns the
 * coordinates of that target. If there is a tie for the closest target, this
 * function will return `undefined`.
 *
 * @param {Array} coords - the coordinates to find the closest target for
 * @param {Array} targets - the list of target coordinates
 * @returns {Array|undefined} - the coordinates of the closest target, or
 * `undefined` if there is a tie
 */
const findClosestTarget = (coords, targets) => {
  const closestTarget = targets.reduce((closest, target) => {
    const distance = manhattanDistance(coords, target);

    if (distance < closest.distance) {
      return { target, distance, tied: false };
    }

    if (distance === closest.distance) {
      closest.tied = true;
    }

    return closest;
  }, { distance: Infinity });

  return closestTarget.tied ? undefined : closestTarget.target;
};
