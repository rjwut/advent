const DELTAS = {
  nw: [ -1,  0,  1 ],
   n: [  0, -1,  1 ],
  ne: [  1, -1,  0 ],
  sw: [ -1,  1,  0 ],
   s: [  0,  1, -1 ],
  se: [  1,  0, -1 ],
};

/**
 * # [Advent of Code 2017 Day 11](https://adventofcode.com/2017/day/11)
 *
 * Red Blob Games has a great resource on
 * [hexagonal grids](https://www.redblobgames.com/grids/hexagons). For this
 * puzzle,
 * [cube coordinates](https://www.redblobgames.com/grids/hexagons/#coordinates-cube)
 * are helpful because it's trivial to
 * [compute distances](https://www.redblobgames.com/grids/hexagons/#distances-cube):
 * sum the absolute values of the coordinates and divide by two. The coordinate
 * deltas for each of the six directions are:
 *
 * | dir |  q |  r |  s |
 * | --- | -: | -: | -: |
 * |  NW | -1 |  0 |  1 |
 * |   N |  0 | -1 |  1 |
 * |  NE |  1 | -1 |  0 |
 * |  SW | -1 |  1 |  0 |
 * |   S |  0 |  1 | -1 |
 * |  SE |  1 |  0 | -1 |
 *
 * Here are the end coordinates in `(q, r, s)` for each of the example paths,
 * assuming we start at `(0, 0, 0)`:
 *
 * | Path           | Coordinates | Distance |
 * | -------------- | ----------: | -------: |
 * | ne,ne,ne       |  (3, -3, 0) |        3 |
 * | ne,ne,sw,sw    |   (0, 0, 0) |        0 |
 * | ne,ne,s,s      |  (2, 0, -2) |        2 |
 * | se,sw,se,sw,sw | (-1, 3, -2) |        3 |
 *
 * To find the answers for both parts, we simply start at `(0, 0, 0)`, and for
 * each step we add the coordinate deltas for the current direction to the
 * coordinates, then compute the distance from the origin. If that distance is
 * larger than the largest seen so far, that becomes the new largest distance.
 * At the end, we report the current distance as the answer to part one, and
 * the largest distance as the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const path = input.trim().split(',');
  let coords = [ 0, 0, 0 ];
  let furthest = 0;
  path.forEach(dir => {
    const delta = DELTAS[dir];
    coords = coords.map((coord, i) => coord + delta[i]);
    furthest = Math.max(furthest, distance(coords));
  });
  return [ distance(coords), furthest ];
};

/**
 * Computes the "hexagonal Manhattan distance" from the given hexagonal
 * coordinates to the origin.
 *
 * @param {Array} coords - the coordinates
 * @returns {number} - the distance
 */
const distance = coords => coords.reduce((sum, coord) => sum + Math.abs(coord), 0) / 2;
