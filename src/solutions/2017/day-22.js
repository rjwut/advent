const { parseGrid } = require('../util');
const InfiniteGrid = require('../infinite-grid');

const DIRECTIONS = [
  [ -1,  0 ], // up
  [  0,  1 ], // right
  [  1,  0 ], // down
  [  0, -1 ], // left
];
const STATES = [ undefined, 'W', '#', 'F' ];
const TURNS = [ 3, 0, 1, 2 ];

/**
 * # [Advent of Code 2017 Day 22](https://adventofcode.com/2017/day/22)
 *
 * The `InfiniteGrid` class helps out again. We simply load the starting state
 * into a new `InfiniteGrid`, then run the rules as specified in the puzzle. We
 * keep track of our current direction as a index on the `DIRECTIONS` array,
 * which contains the coordinate deltas to move in the indicated direction.
 * To turn, we just add an amount to the direction index, applying `% 4` to
 * keep it in range: add `1` to turn right, `2` to turn around, and `3` to turn
 * left.
 *
 * One tricky bit is that cells in the `InfiniteGrid` start out `undefined`, so
 * I have to use `undefined` to mean "clean" rather than `'.'`. I should
 * probably consider making it so that you can specify the value that's
 * returned when you attempt to access a previously untouched cell.
 *
 * To handle part two, I added a `STATES` array to list the four possible
 * states in order, and a `TURNS` array to give direction index offset to apply
 * to turn the proper direction when the node is in that state.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = parse(input);
  return [ part1, part2 ].map(fn => fn(grid));
};

/**
 * Converts the input into an `InfiniteGrid`.
 *
 * @param {string} input - the puzzle input
 * @returns {InfiniteGrid} - the grid
 */
const parse = input => {
  const startGrid = parseGrid(input);
  const grid = new InfiniteGrid();
  const rCenter = Math.floor(startGrid.length / 2);
  const cCenter = Math.floor(startGrid[0].length / 2);

  for (let r = 0; r < startGrid.length; r++) {
    for (let c = 0; c < startGrid[0].length; c++) {
      const chr = startGrid[r][c];

      if (chr === '#') {
        grid.put([ r - rCenter, c - cCenter ], '#');
      }
    }
  }

  return grid;
};

/**
 * Runs the simulation according to part one's rules.
 *
 * @param {InfiniteGrid} grid - the grid 
 * @returns {number} - the number of infections caused
 */
const part1 = grid => {
  grid = new InfiniteGrid(grid);
  const coords = [ 0, 0 ];
  let dir = 0, infections = 0;

  for (let i = 0; i < 10_000; i++) {
    const infected = grid.get(coords) === '#';
    infections += infected ? 0 : 1;
    dir = (dir + (infected ? 1 : 3)) % 4;
    grid.put(coords, infected ? undefined : '#');
    const delta = DIRECTIONS[dir];
    coords.forEach((_, index) => coords[index] += delta[index]);
  }

  return infections;
};

/**
 * Runs the simulation according to part two's rules.
 *
 * @param {InfiniteGrid} grid - the grid 
 * @returns {number} - the number of infections caused
 */
const part2 = grid => {
  const coords = [ 0, 0 ];
  let dir = 0, infections = 0;

  for (let i = 0; i < 10_000_000; i++) {
    const state = grid.get(coords);
    const stateIndex = STATES.indexOf(state);
    infections += state === 'W' ? 1 : 0;
    dir = (dir + TURNS[stateIndex]) % 4;
    const nextState = STATES[(stateIndex + 1) % 4];
    grid.put(coords, nextState);
    const delta = DIRECTIONS[dir];
    coords.forEach((_, index) => coords[index] += delta[index]);
  }

  return infections;
};
