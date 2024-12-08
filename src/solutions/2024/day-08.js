const SimpleGrid = require('../simple-grid');

/**
 * # [Advent of Code 2024 Day 8](https://adventofcode.com/2024/day/8)
 *
 * After parsing the input, the first step is to group the locations of the antennae by frequency in
 * a `Map`. For part 1, we then need to find the coordinate differences between each pair of
 * antennae, and then compute the coordinates of the antinodes. Since there's an antinode on each
 * side, we'll evaluate each pair of antennae twice, once from the perspective of each antenna. The
 * locations are pushed into a `Set` to ensure that each antinode location is only counted once,
 * regardless of how many pairs of antennae have an antinode at that position.
 *
 * For part 2, the process is similar, but this time we continue adding the coordinate deltas in a
 * loop to locate more antinodes as long as the resulting coordinates are in bounds of the grid.
 * The other difference is that antinodes are located at the sites of the antennae themselves (as
 * long there is at least one other with the same frequency), so we need to ensure we count those
 * locations, as well. We handle that easily by starting with the location of the second antenna in
 * each pair and adding that to the antinode set before adding the deltas to the coordinates in the
 * loop.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input });
  const antennae = groupAntennae(grid);
  const antinodes1 = findAntinodes1(grid, antennae);
  const antinodes2 = findAntinodes2(grid, antennae);
  return [ antinodes1.size, antinodes2.size ];
};

const groupAntennae = grid => {
  const antennae = new Map();
  grid.forEach((cell, r, c) => {
    if (cell === '.') {
      return;
    }

    const locations = antennae.get(cell) ?? [];
    locations.push([ r, c ]);
    antennae.set(cell, locations);
  });
  return antennae;
};

const findAntinodes1 = (grid, antennae) => {
  const antinodes = new Set();
  antennae.forEach(locations => {
    for (let i = 0; i < locations.length; i++) {
      const [ r1, c1 ] = locations[i];

      for (let j = 0; j < locations.length; j++) {
        if (i === j) {
          continue;
        }

        let [ r2, c2 ] = locations[j];
        const dr = r2 - r1;
        const dc = c2 - c1;
        r2 += dr;
        c2 += dc;

        if (grid.inBounds(r2, c2)) {
          antinodes.add(`${r2},${c2}`);
        }
      }
    }
  });
  return antinodes;
};

const findAntinodes2 = (grid, antennae) => {
  const antinodes = new Set();
  antennae.forEach(locations => {
    for (let i = 0; i < locations.length; i++) {
      const [ r1, c1 ] = locations[i];

      for (let j = 0; j < locations.length; j++) {
        if (i === j) {
          continue;
        }

        let [ r2, c2 ] = locations[j];
        const dr = r2 - r1;
        const dc = c2 - c1;

        do {
          antinodes.add(`${r2},${c2}`);
          r2 += dr;
          c2 += dc;
        } while (grid.inBounds(r2, c2));
      }
    }
  });
  return antinodes;
};
