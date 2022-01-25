const { manhattanDistance } = require('../math2');
const { split } = require('../util');

const MAX_DISTANCE = 3;

/**
 * # [Advent of Code 2018 Day 25](https://adventofcode.com/2018/day/25)
 *
 * The puzzle text isn't explicit about this, but lone points count as their
 * own constellations. The main complication here is the fact that two points
 * can be in the same constellation even if they're not close to each other,
 * since other points can connect them. If you try to build constellations in
 * parallel, you'll end up having to figure out how to merge them later.
 * Instead, I find all the points in one constellation before attempting to
 * start a new one. Here's a description of the algorithm, using letters to
 * represent the points. We start will all the points in an array of ungrouped
 * points, and no constellations:
 *
 * ```js
 * // Ungrouped points
 * [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ]
 * 
 * // Constellations
 * []
 * ```
 *
 * Let's start our first constellation with point `A`, removing it from the
 * ungrouped points array. We'll set a pointer at its location in the new
 * constellation array:
 *
 * ```js
 * // Ungrouped points
 * [ 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ]
 * 
 * // Constellations
 * [
 *   [ 'A' ],
 * //   ^ pointer
 * ]
 * ```
 *
 * Now we iterate the remaining ungrouped points and find all the points whose
 * Manhattan distances to point `A` are `3` or less. We'll remove them from the
 * ungrouped points array and add them to the constellation array. Let's say
 * that points `D` and `I` are found to be close enough to `A` to belong to the
 * constellation. After that, we increment the pointer:
 *
 * ```js
 * // Ungrouped points
 * [ 'B', 'C', 'E', 'F', 'G', 'H', 'J' ]
 * 
 * // Constellations
 * [
 *   [ 'A', 'D', 'I' ],
 * //        ^ pointer
 * ]
 * ```
 *
 * We repeat the process for each point in the contellation as the pointer
 * reaches them. Suppose that we find no more points that are close to `D`, but
 * `C` turns out to be close to `I`:
 *
 * ```js
 * // Ungrouped points
 * [ 'B', 'E', 'F', 'G', 'H', 'J' ]
 * 
 * // Constellations
 * [
 *   [ 'A', 'D', 'I', 'C' ],
 * //                  ^ pointer
 * ]
 * ```
 *
 * With the addition of `C` to the constellation, we now check for points that
 * close to `C`. Let's suppose we only find `G`, and that after incrementing
 * the pointer again and checking for points close to `G`, we find no more
 * points. The pointer reaches the end of the constellation array, meaning this
 * constellation is complete:
 *
 * ```js
 * // Ungrouped points
 * [ 'B', 'E', 'F', 'H', 'J' ]
 * 
 * // Constellations
 * [
 *   [ 'A', 'D', 'I', 'C', 'G' ],
 * //                          ^ pointer
 * ]
 * ```
 *
 * We now repeat the entire process again for the next constellation, taking
 * `B` as its first point. Let's say that we find no points close to `B` at
 * all, making `B` a constellation all by itself:
 *
 * ```js
 * // Ungrouped points
 * [ 'E', 'F', 'H', 'J' ]
 * 
 * // Constellations
 * [
 *   [ 'A', 'D', 'I', 'C', 'G' ],
 *   [ 'B' ],
 * //      ^ pointer
 * ]
 * ```
 *
 * Point `E` becomes the start of the third constellation. We continue this
 * process, creating new constellations until the ungrouped points array is
 * empty:
 *
 * ```js
 * // Ungrouped points
 * []
 * 
 * // Constellations
 * [
 *   [ 'A', 'D', 'I', 'C', 'G' ],
 *   [ 'B' ],
 *   [ 'E', 'H', 'J', 'F' ],
 * ]
 * ```
 *
 * The puzzle solution is the number of constellations found after all points
 * have been grouped by their constellations. In this case, the answer is `3`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const points = split(input).map(line => line.split(',').map(Number));
  const constellations = [];

  do {
    constellations.push(findConstellation(points));
  } while (points.length);

  return [ constellations.length, undefined ];
};

/**
 * Finds all the points that are part of the same constellation as the first
 * point in the given array. Those points will be removed from that array and
 * returned as a separate array.
 *
 * @param {Array} points - the points that could be part of the constellation
 * @returns {Array} - the new constellation
 */
const findConstellation = points => {
  const constellation = [ points.shift() ];
  let i = 0;

  do {
    const point1 = constellation[i];

    for (let j = 0; j < points.length; j++) {
      const point2 = points[j];

      if (manhattanDistance(point1, point2) <= MAX_DISTANCE) {
        constellation.push(point2);
        points.splice(j, 1);
        j--; // Don't skip a point because we removed one
      }
    }
  } while(++i < constellation.length);

  return constellation;
};
