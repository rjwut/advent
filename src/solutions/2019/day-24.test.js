const solver = require('./day-24');
const { grid: buildGrid, split } = require('../util');
const fs = require('fs').promises;

const EXAMPLE = `....#
#..#.
#..##
..#..
#....`;

describe('Day 24', () => {
  /**
   * This test confirms that the adjacency list is correct. It uses the
   * contents of `day-24.step-tests.txt`. That file contains 24 states rendered
   * as strings as would be output by `toString()`. Each one starts with a bug
   * at depth `0` in one square (`A` for the first one, `B` for the second,
   * etc.) From that initial state, the simulation is advanced one step, and
   * the result is rendered as a string and compared against the expected state
   * as read from the file. If all 24 states match, the test passes.
   */
  test('Part two step tests', async () => {
    const testData = await fs.readFile(`${__dirname}/day-24.step-tests.txt`, 'utf8');
    const tests = split(testData, { delimiter: '\n\n' });
    tests.forEach((expected, i) => {
      const grid = buildGrid(5, 5, '.');
      const index = i > 11 ? i + 1 : i;
      const r = Math.floor(index / 5);
      const c = index % 5;
      grid[r][c] = '#';
      const input = grid.map(row => row.join('')).join('\n');
      const eris = solver.api2(input);
      eris.step();
      expect(eris.toString()).toBe(expected);
    });
  });

  test('Example', () => {
    expect(solver(EXAMPLE, 10)).toEqual([ 2129920, 99 ]);
  });
});
