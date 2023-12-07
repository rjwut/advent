const SimpleGrid = require('../simple-grid');
const { add } = require('../math2');

/**
 * # [Advent of Code 2023 Day 3](https://adventofcode.com/2023/day/3)
 *
 * The trick here is to ensure that we only ever consider each part number once, even when it is
 * attached to multiple symbols. We do this by keeping a set of part number coordinates. As we
 * search the grid, if we find any symbols that have exactly two adjacent part numbers, that's a
 * gear; we'll keep the locations of their part numbers in a separate array so we can get the
 * the answer to part two. Once we've iterated the entire grid, we'll have everything we need to
 * compute the answers. Full algorithm:
 *
 * 1. Create a `Set` of part number coordinates and an array of gear part number coordinate pairs.
 * 2. For each symbol in the grid:
 *    1. Find the adjacent digits.
 *    2. For each digit, search left until you find the leftmost digit.
 *    3. Concatenate the coordinates of each leftmost digit and insert them into a new `Set`.
 *    4. If the `Set` contains exactly two elements, the symbol represent a gear. Push both
 *       coordinates into the array of all gear part number coordinates.
 *    5. Insert the coordinates of each leftmost digit into a set of part number coordinates.
 * 3. Solving part one:
 *    1. Convert the `Set` of part number coordinates to an array of part numbers:
 *       1. Start with a part number of `0`.
 *       2. For each digit in the part number, multiply the part number by `10` and add the digit.
 *    2. Sum the part numbers.
 * 4. Solving part two:
 *    1. For each pair of gear part number coordinates, convert the coordinates to part numbers as
 *       described above, then multiply them together.
 *    2. Sum the gear ratios.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const grid = new SimpleGrid({ data: input });

  /**
   * Produces the part number whose leftmost digit is located at the given coordinates.
   *
   * @param {string} coords - the coordinates of the leftmost digit, as a string like `r,c`
   * @returns {number} - the part number
   */
  const coordsToPartNumber = coords => {
    let [ r, c ] = coords.split(',').map(Number);
    let value = 0;
    let cell = grid.get(r, c);

    do {
      value = value * 10 + Number(cell);
      c++;
      cell = grid.get(r, c);
    } while (isDigit(cell));

    return value;
  };

  const partNumberCoords = new Set();
  const gearPartCoords = [];
  grid.findAll(isSymbol).forEach(({ r, c }) => {
    /*
     * Find the adjacent part numbers. Since each part number can possibly have multiple digits
     * adjacent to the symbol, we search left until we find the leftmost digit, then put the
     * coordinates of that location into a `Set`. This ensures that the same part number isn't
     * counted more than once.
     */
    const partNumberCoordsForThisSymbol = new Set();
    grid.forEachNear(r, c, (value, r, c) => {
      if (isDigit(value)) {
        while (c > 0 && isDigit(grid.get(r, c - 1))) {
          c--;
        }

        partNumberCoordsForThisSymbol.add(`${r},${c}`);
      }
    });

    if (partNumberCoordsForThisSymbol.size === 2) {
      // There are exactly two adjacent part numbers, so this is a gear.
      gearPartCoords.push([ ...partNumberCoordsForThisSymbol ]);
    }

    partNumberCoordsForThisSymbol.forEach(coords => partNumberCoords.add(coords));
  });

  // We've found the locations of all part numbers, so now extract them.
  const partNumbers = [ ...partNumberCoords ].map(coordsToPartNumber);

  // We've also got the locations of all gear part numbers, so now extract and multiply them to
  // compute the gear ratios.
  const gearRatios = gearPartCoords.map(([ coords1, coords2 ]) => {
    const partNumber1 = coordsToPartNumber(coords1);
    const partNumber2 = coordsToPartNumber(coords2);
    return partNumber1 * partNumber2;
  });

  // Add the arrays of part numbers and gear ratios to get the answers.
  return [ add(partNumbers), add(gearRatios) ];
};

/**
 * @param {string} value - a character
 * @returns {boolean} - whether the character is a symbol
 */
const isSymbol = value => value !== '.' && (value < '0' || value > '9');

/**
 * @param {string} value - a character
 * @returns {boolean} - whether the character is a digit
 */
const isDigit = value => value >= '0' && value <= '9';
