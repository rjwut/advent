const { match } = require('../util');
const { polygonArea } = require('../math2');

const STEP_REGEXP = /^(?<dir0>[UDLR]) (?<dist0>\d+) \(#(?<dist1>[0-9a-f]{5})(?<dir1>[0-3])\)$/gm;
const Direction = {
  R: [  0,  1 ],
  D: [  1,  0 ],
  L: [  0, -1 ],
  U: [ -1,  0 ],
};
const Directions = Object.values(Direction);

/**
 * # [Advent of Code 2023 Day 18](https://adventofcode.com/2023/day/18)
 *
 * My first thought was to use a 2D array to represent the lagoon, but it turns out that will not
 * work for part two, where it's way too big to fit into memory. What _will_ work is to use the
 * [shoelace formula](https://en.wikipedia.org/wiki/Shoelace_formula), which can compute the area
 * of a simple (non-self-intersecting) polygon given its vertices. I added a `polygonArea()` method
 * to my `math2` module to compute this.
 *
 * The vertices are easy to compute from the input, but the shoelace formula won't accurately
 * compute the area of that polygon. To understand why, look at the diagram of the trench made by
 * the digger as it digs out the border of the lagoon:
 *
 * ```txt
 * #########################################
 * #########################################
 * ###+-------------------------------------
 * ###|
 * ###|
 * ###|      --  --  --  --  --  --  --  --
 * ###|     |
 * ###|
 * ###|     |     +-------------------------
 * ###|           |#########################
 * ###|     |     |#########################
 * ```
 *
 * The dotted line shows the perimeter of the path described by the input, but the edges of a
 * polygon have zero width, while the trench dug by the digger is one meter wide. This means that
 * roughly half of the trench will be inside the polygon and half will be outside. To include the
 * part of the trench that's outside the polygon, we multiply the length of the perimeter by half a
 * meter and add that to the area.
 *
 * There is one additional discrepancy: the corners. Looking at the diagram above, we can see that
 * if this were an outside corner, the polygon would include only 1/4 of the square that makes up
 * the corner, while if it's an inside corner, it would include 3/4 of it. This means that our
 * previous adjustment of adding half a square meter to the lagoon area per meter of perimeter will
 * not be accurate for the corner squares. An outside corner introduces an inaccuracy of -0.25 m^2
 * to the computed area, while each inside corner adds +0.25 m^2 inaccuracy. There are exactly four
 * more outside corners than inside corners, meaning all the inside corner inaccuracies are
 * cancelled out. So we add one square meter back to the computed area to account for this
 * discrepancy.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const steps = parse(input);
  return [ 0, 1 ].map(part => {
    const partSteps = steps.map(stepArr => stepArr[part]);
    const vertices = buildVertices(partSteps);
    return polygonArea(vertices, 1);
  });
};

/**
 * Parses the instructions. Each instruction produces a part one step and a part two step. Each
 * step is an object with a `dir`ection and a `dist`ance.
 *
 * @param {string} input - the puzzle input
 * @returns {Array<Array<Object>>} - the parsed steps
 */
const parse = input => {
  return match(input, STEP_REGEXP, ({ dir0, dist0, dist1, dir1 }) => {
    dir0 = Direction[dir0];
    dist0 = parseInt(dist0, 10);
    dist1 = parseInt(dist1, 16);
    dir1 = Directions[dir1];
    return [ { dir: dir0, dist: dist0 }, { dir: dir1, dist: dist1 } ];
  });
};

/**
 * Converts an array of steps to an array of vertices. Each vertex is an array of two coordinate
 * values.
 *
 * @param {Array<Object>} steps - the steps to convert
 * @returns {Array<Array<number>>} - the vertices
 */
const buildVertices = steps => {
  let pos = [ 0, 0 ];
  const vertices = [ pos ];
  steps.forEach(({ dir, dist }) => {
    pos = pos.map((coord, i) => coord + dir[i] * dist);
    vertices.push(pos);
  });
  return vertices;
};
