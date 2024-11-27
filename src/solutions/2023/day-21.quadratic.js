const fs = require('fs/promises');
const path = require('path');
const SimpleGrid = require('../simple-grid');
const reachable = require('./day-21.reachable');

const INPUT_FILE = path.join(__dirname, '..', '..', '..', 'input', '2023', '21.txt');

/**
 * This module prints out the data points to be fed into Wolfram Alpha's quadratic fit calculator
 * to solve part 2.
 */
const solve = async () => {
  const input = await fs.readFile(INPUT_FILE, 'utf8');
  const grid = new SimpleGrid({ data: input });
  let start = grid.coordsOf('S');
  const size = grid.rows;
  const halfSize = Math.floor(size / 2);
  const superGrid = new SimpleGrid({ rows: size * 5, cols: size * 5 });

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      superGrid.paste(grid, r * size, c * size);
    }
  }

  start = { r: start.r + grid.rows * 2, c: start.c + grid.cols * 2 };
  console.log(reachable(superGrid, start, [ halfSize, halfSize + size, halfSize + size * 2 ]));
};

solve();
