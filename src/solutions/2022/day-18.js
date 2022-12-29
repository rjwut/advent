const { split } = require('../util');
const InfiniteGrid = require('../infinite-grid');

const DIRECTIONS = [
  [ -1,  0,  0 ],
  [  1,  0,  0 ],
  [  0, -1,  0 ],
  [  0,  1,  0 ],
  [  0,  0, -1 ],
  [  0,  0,  1 ],
];

/**
 * # [Advent of Code 2022 Day 18](https://adventofcode.com/2022/day/18)
 *
 * My existing `InfiniteGrid` class was ideal for mapping out the lava droplet. I represented a
 * lava cube with a `'#'` in the grid. The solution to part one is easily computed while building
 * the droplet. The number of cube sides within the droplet is the number of cubes times 6. As each
 * lava cube is placed, I inspect its neighboring cells, and subtract 2 from the the total number
 * of sides for each neighboring lava cube I find (since those cubes have sides facing each other,
 * which are therefore not part of the surface area). When all cubes have been placed, the count of
 * the remaining sides is the answer to part one.
 *
 * For part two, I have to distinguish which empty cells are external to the droplet versus
 * internal, and only count the surface area that touches those external cells. For this, I perform
 * a "flood fill" of the exterior of the droplet. I do this by expanding the bounds of the droplet
 * by one unit, then putting the coordinates of a corner of the expanded bounds into a queue.
 * Starting with a surface area of `0`, I then perform the following steps for each set of
 * coordinates I extract from the queue until the queue is empty:
 *
 * 1. If the cell is not empty, skip it.
 * 2. Put a `'~'` into the cell.
 * 3. Iterate the six neighboring cells:
 *    1. If the neighbor cell is outside the expanded bounds, skip it.
 *    2. If the cell contains a `'#'`, increment the surface area.
 *    3. If the cell is empty, enqueue its coordinates.
 *    4. Otherwise, skip it.
 *
 * When the queue is empty, the surface area value is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { grid, surfaceArea } = buildDroplet(input);
  return [ surfaceArea, getExteriorSurfaceArea(grid) ];
};

const buildDroplet = input => {
  const cubes = split(input).map(line => line.split(',').map(Number));
  const grid = new InfiniteGrid();
  let surfaceArea = cubes.length * 6;
  cubes.forEach(cube => {
    DIRECTIONS.forEach(direction => {
      const neighborCoords = cube.map((coord, i) => coord + direction[i]);
      const neighbor = grid.get(neighborCoords);

      if (neighbor === '#') {
        surfaceArea -= 2;
      }
    });
    grid.put(cube, '#');
  });
  return { grid, surfaceArea };
};

const getExteriorSurfaceArea = grid => {
  let bounds = grid.getBounds();
  bounds = [
    [ bounds[0].min - 1, bounds[1].min - 1, bounds[2].min - 1 ],
    [ bounds[0].max + 1, bounds[1].max + 1, bounds[2].max + 1 ],
  ];
  const queue = [ bounds[0] ];
  let area = 0;

  do {
    const coords = queue.shift();

    if (grid.get(coords) !== undefined) {
      continue;
    }

    grid.put(coords, '~');
    DIRECTIONS.forEach(direction => {
      const neighborCoords = coords.map((coord, i) => coord + direction[i]);
      const [ x, y, z ] = neighborCoords;

      if (
        x < bounds[0][0] || x > bounds[1][0] ||
        y < bounds[0][1] || y > bounds[1][1] ||
        z < bounds[0][2] || z > bounds[1][2]
      ) {
        return; // don't enqueue out of bounds cube
      }

      const neighbor = grid.get(neighborCoords);

      if (neighbor === '#') {
        area++; // Neighbor is lava
      } else if (neighbor === undefined) {
        queue.push(neighborCoords); // Neighbor is unvisited
      }
    });
  } while (queue.length);

  return area;
};
