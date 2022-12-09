const { match } = require('../util');

const REGEXP = /^(?<dir>[UDLR]) (?<steps>\d+)$/gm;
const ROPE_LENGTHS = [ 2, 10 ];
const DIRECTIONS = {
  U: [ -1,  0 ],
  D: [  1,  0 ],
  L: [  0, -1 ],
  R: [  0,  1 ],
};

/**
 * # [Advent of Code 2022 Day 9](https://adventofcode.com/2022/day/9)
 *
 * I parsed the input using my util `match()` function with a simple `RegExp` to capture all of the
 * instructions. I then converted the instructions to a list of one-unit moves, expressed as delta
 * values for rows and columns. This way, I only had to add each delta to the corresponding
 * coordinate to perform a move.
 *
 * The difference between the two parts is only the length of the rope: 2 knots for part one, 10
 * knots for part two. The rope is represented as an array of coordinate pairs, with the head at
 * index `0` and the tail at index `rope.length - 1`. They all start at `[ 0, 0 ]`. I apply the
 * move to the head, then compute the appropriate move of each following knot relative to the knot
 * before it.
 *
 * The relative moves are comptued as follows:
 *
 * 1. Compute the differences between the coordinates in each dimension.
 * 2. If the difference is less than 2 in all dimensions, don't move the knot.
 * 3. Compute `Math.sign()` for each delta, then apply that to the knot.
 *
 * After all knots are moved, I concatenate the coordinates of the tail and `add()` it to a `Set`
 * of visited coordinates. When all moves have been executed, the size of that `Set` is the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const moves = parse(input);
  return ROPE_LENGTHS.map(ropeLength => simulate(ropeLength, moves));
};

/**
 * Parse the input into an array of move deltas.
 *
 * @param {string} input - the puzzle input
 * @returns {Array<Array<number>>} - the move deltas
 */
const parse = input => {
  return match(input, REGEXP, { steps: Number })
    .reduce((moves, { dir, steps }) => {
      const dirObj = DIRECTIONS[dir];

      for (let i = 0; i < steps; i++) {
        moves.push(dirObj);
      }

      return moves;
    }, []);
};

/**
 * Simulates the movement of the rope.
 *
 * @param {number} ropeLength - the length of the rope
 * @param {Array<Array<number>>} moves - the moves to execute on the head of the rope
 * @returns {number} - the number of unique positions occupied by the tail of the rope
 */
const simulate = (ropeLength, moves) => {
  // Create the rope
  const rope = [];

  for (let i = 0; i < ropeLength; i++) {
    rope.push([ 0, 0 ]);
  }

  const head = rope[0];
  const tail = rope[ropeLength - 1];

  // Perform the simulation
  const visited = new Set([ tail.join(',') ]);

  moves.forEach(move => {
    // Move the head first
    head[0] += move[0];
    head[1] += move[1];
    let headKnot = head;

    // Now propagate down the rope
    for (let i = 1; i < ropeLength; i++) {
      const tailKnot = rope[i];
      const dr = headKnot[0] - tailKnot[0];
      const dc = headKnot[1] - tailKnot[1];

      if (Math.max(Math.abs(dr), Math.abs(dc)) > 1) {
        // The leading knot is more than one unit away in any direction;
        // move the following knot toward it.
        tailKnot[0] += Math.sign(dr);
        tailKnot[1] += Math.sign(dc);
      }

      headKnot = tailKnot;
    }

    // Record the tail position
    visited.add(tail.join(','));
  });

  return visited.size;
};
