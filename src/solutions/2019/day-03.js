const { manhattanDistance } = require('../math2');
const { split } = require('../util');

const DIRECTIONS = {
  U: [  0,  1 ],
  D: [  0, -1 ],
  L: [ -1,  0 ],
  R: [  1,  0 ],
};
const ORIGIN = [ 0, 0 ];

/**
 * The input for this puzzle is a list describing the layout of two wires. Each
 * line describes a single wire, and each wire is described by a
 * comma-delimited list of segments. Each segment is described by a direction
 * (one of `'U'`, `'D'`, `'L'`, or `'R'`) followed by a distance. For example,
 * the segment `'R75'` means "move right 75 units". Each wire starts at a
 * central port located at the origin. An intersection is formed at any
 * location (other than the origin) where the two wires meet.
 *
 * Part one asks us to find the Manhattan distance to the intersection closest
 * to the origin. Part two asks us to find the fewest combined steps the wires
 * must take to reach an intersection.
 *
 * The same code can solve both parts. First, we create a function that can
 * iterate all the coordinates in a wire, then use it to iterate each wire. For
 * the first wire, we simply store the number of steps required to reach that
 * coordinate. For the second wire, we check to see if the coordinate is
 * already in the map. If it is, we've found an intersection, so we store it
 * with its Manhattan distance from the origin and the combined number of
 * steps.
 *
 * Once that's done, part one is the minimum Manhattan distance, and part two
 * is the minimum combined steps.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const wires = parseInput(input);
  const intersections = findIntersections(wires);
  return [ 'manhattan', 'steps' ]
    .map(prop => findLowest(intersections, prop));
};

/**
 * Parses the input into an array, where each element describes a single wire.
 * Each wire element is an array of wire segments, where each segment is an
 * object with the following properties:
 *
 * - `direction` (array): the delta for each coordinate in the direction of
 *   travel
 * - `distance` (number): the distance to travel
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the wire array
 */
const parseInput = input => {
  return split(input).map(parseWire)};

/**
 * Finds and returns all the intersections for the given wires. Each
 * intersection is an object with the following properties:
 *
 * - `manhattan` (number): the Manhattan distance from the origin to the
 *   intersection
 * - `steps` (number): the combined number of steps required to reach the
 *   intersection
 *
 * @param {Array} wires - the two wire objects
 * @returns {Array} - the intersections found
 */
const findIntersections = wires => {
  const coordMap = new Map();
  iterateWire(wires[0], (coords, step) => {
    const key = coords.join();

    if (!coordMap.has(key)) {
      coordMap.set(key, step);
    }
  });
  const intersections = [];
  iterateWire(wires[1], (coords, step) => {
    const key = coords.join();

    if (coordMap.has(key)) {
      // We've found an intersection
      const steps0 = coordMap.get(key);
      coordMap.delete(key); // don't count the same intersection twice
      intersections.push({
        manhattan: manhattanDistance(coords),
        steps: steps0 + step,
      });
    }
  });
  return intersections;
}

/**
 * Returns the lowest value from the named property among the given array of
 * intersections.
 *
 * @param {Array} intersections - the intersection objects
 * @param {string} prop - one of `'manhattan'` or `'steps'` 
 * @returns {number} - the lowest value
 */
const findLowest = (intersections, prop) => {
  return intersections.reduce((min, intersection) => {
    return Math.min(min, intersection[prop]);
  }, Infinity);
};

/**
 * Parses a single line of input into an array of wire segments.
 *
 * @param {string} line - the input line
 * @returns {Array} - an array of wire segments
 */
 const parseWire = line => {
  let coords = [ ...ORIGIN ];
  return line.split(',')
    .map(token => parseToken(token, coords));
};

/**
 * Parses a single token from an input line into a wire segment. The
 * token takes the form `{dir}{dist}`, where `dir` is one of `'U'`, `'D'`,
 * `'L'`, or `'R'` indicating a direction, and `dist` is the distance to travel
 * in that direction.
 *
 * @param {string} token - the token to parse
 * @returns {Object} - the wire segment
 */
const parseToken = token => {
  const direction = DIRECTIONS[token.charAt(0)];
  const distance = parseInt(token.substring(1), 10);
  return { direction, distance };
};

/**
 * Iterates the coordinates for the indicated wire, invoking the given function
 * for each coordinate. The function receives the current coordinate and the
 * step number.
 *
 * @param {Object} wire - the wire object
 * @param {Function} fn - the callback function
 */
const iterateWire = (wire, fn) => {
  const coords = [ ...ORIGIN ];
  let step = 0;
  wire.forEach(segment => {
    for (let i = 0; i < segment.distance; i++) {
      coords[0] += segment.direction[0];
      coords[1] += segment.direction[1];
      fn(coords, ++step);
    }
  });
};

