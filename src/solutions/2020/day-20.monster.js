/**
 * This module knows how to find sea monsters in a matrix.
 * 
 * The sea monster is encoded as an array of relative coordinates. To scan for
 * a sea monster, it uses the following algorithm:
 *
 * 1. Iterate all transformations of the matrix:
 *    1. Iterate all the positions in the matrix where a sea monster's
 *       upper-left corner could be placed and still fit in the matrix:
 *       1. Map all sea monster relative coordinates and resolve them against
 *          the current matrix position to produce an array of absolute
 *          coordinates to check for sea monster parts.
 *       2. Query the matrix for each coordinate using the current orientation
 *          to see if there is a `#` at that position.
 *       3. If a `#` is found at all sea monster coordinates, there is a sea
 *          monster at this location. Write an `O` at each of those positions
 *          to mark it.
 *    2. If any sea monsters were found in this matrix orientation, break.
 */

// Build an array of monster part coordinates.
const MONSTER = [
  '                  # ',
  '#    ##    ##    ###',
  ' #  #  #  #  #  #   ',
];
const MONSTER_DIMENSIONS = { w: MONSTER[0].length, h: MONSTER.length };
const MONSTER_COORDS = MONSTER.reduce((coords, line, y) => {
  [ ...line ].forEach((chr, x) => {
    if (chr === '#') {
      coords.push({ x, y });
    }
  });
  return coords;
}, []);

/**
 * Finds sea monsters in the given matrix and draws them in with `O`s.
 *
 * @param {Object} matrix - the matrix to search for sea monsters
 * @return {Object} - an object containing the orientation that found sea
 * monsters
 */
module.exports = matrix => {
  for (let flips = 0; flips < 2; flips++) {
    for (let rotations = 0; rotations < 4; rotations++) {
      if (find(matrix, flips, rotations)) {
        return { flips, rotations };
      }
    }
  }
};

/**
 * Finds sea monsters in the given matrix with the indicated orientation and
 * draws them in with `O`s.
 *
 * @param {Object} matrix - the matrix to search for sea monsters
 * @param {number} flips - the number of flips to apply
 * @param {number} rotations - the number of rotations to apply
 * @returns {boolean} - whether any sea monsters were found
 */
const find = (matrix, flips, rotations) => {
  const xLimit = matrix.size - MONSTER_DIMENSIONS.w + 1;
  const yLimit = matrix.size - MONSTER_DIMENSIONS.h + 1;
  let found = false;

  for (let y = 0; y < yLimit; y++) {
    for (let x = 0; x < xLimit; x++) {
      found = checkForMonsterAt(matrix, flips, rotations, x, y) || found;
    }
  }

  return found;
};

/**
 * Checks to see whether a sea monster exists at the given coordinates in the
 * matrix with the indicated orientation. If so, it is drawn in with `O`s.
 *
 * @param {Object} matrix - the matrix to search for sea monsters
 * @param {number} flips - the number of flips to apply
 * @param {number} rotations - the number of rotations to apply
 * @param {number} x - the X coordinate
 * @param {number} y - the Y coordinate
 * @returns {boolean} - whether a sea monster was found here
 */
const checkForMonsterAt = (matrix, flips, rotations, x, y) => {
  const coords = MONSTER_COORDS.map(coord => ({ x: x + coord.x, y: y + coord.y }));
  const monsterFound = coords.every(coord => matrix.get(flips, rotations, coord) === '#');

  if (monsterFound) {
    coords.forEach(coord => matrix.set(flips, rotations, coord, 'O'));
  }

  return monsterFound;
};
