const parseTile = require('./day-20.tile');
const buildGrid = require('./day-20.grid');
const findMonsters = require('./day-20.monster');
const { multiply } = require('../math2');
const { split } = require('../util');

/**
 * # [Advent of Code 2020 Day 20](https://adventofcode.com/2020/day/20)
 *
 * By far the most time-consuming puzzle in this year's advent challenge! The
 * first part of the puzzle can be done without actually assembling the tiles;
 * just find the matching tiles for each tile's edges, then find the tiles
 * where only two of their edges match. However, you have to actually assemble
 * the image for part two, so my solution does that, then just grabs the four
 * corner tiles from the result.
 *
 * Because this solution is so complex, I broke it into several modules:
 *
 * - `matrix`: Accepts a two-dimensional array of characters, and can retrieve
 *   or set the character at a particular coordinate, after applying a given
 *   transformation. Each tile has a matrix which is used to read off its
 *   characters in order to assemble the final image. The final image itself is
 *   also a matrix, which allows it to be flipped and rotated as needed to find
 *   sea monsters.
 * - `tile`: Responsible for parsing tiles and producing a string representing
 *   a requested edge. Each tile has a matrix, which allows the characters on
 *   it to be read with any needed orientation.
 * - `grid`: Represents the assembled tiles. The grid consists of a collection
 *   of "cells". Each cell contains a single tile, and tracks its location,
 *   orientation, and neighbors.
 * - `bounds`: Keeps track of a bounding rectangle. When a coordinate is
 *   `put()` into the bounds object, the bounds are expanded to include the
 *   given coordinate. Can also iterate all the coordinates within the bounds,
 *   or map each coordinate in the bounds to a two-dimensional array. This is
 *   used by `grid` to keep track of the area in which the tiles are being laid
 *   down.
 * - `monster`: Can inspect a matrix for sea monsters and mark them.
 *
 * See the documentation in the individual modules for more details about how
 * they work.
 *
 * The solution algorithm is as follows:
 *
 *  1. Parse the input into an array of tile objects.
 *  2. Create a grid and place any tile in the (0,0) cell.
 *  3. Put all other tiles into an unplaced tile list.
 *  4. Push the four edges of the origin cell into an edge queue.
 *  5. While any unplaced tiles exist:
 *     1. Take edges from the edge queue until you find one that has has only
 *        one neighbor.
 *     2. Search the unplaced tiles for one that has a matching edge.
 *     3. When it is found, remove that tile from the unplaced tiles list and
 *        place it in the grid at the correct location and orientation so that
 *        the edges line up.
 *  6. Select the four corner tiles and multiply their IDs together. This is
 *     the answer to part one.
 *  7. Create a square matrix that can contain every character in the assembled
 *     image. (Remember that we will strip off the edges of the tiles.)
 *  8. Iterate the tiles, and iterate the non-border characters on each tile,
 *     and write them to the final image. (Remember to take each tile's
 *     orientation into account.)
 *  9. Iterate the eight possible orientations of the final image:
 *     1. Scan the transformed image to check for sea monsters.
 *     2. For each sea monster found, replace the `#` characters with `O`s.
 *        (This prevents any part of that sea monster from being matched
 *        again.)
 *     3. If any sea monsters were found, you have found the correct
 *        orientation; skip the rest.
 * 10. Count the remaining `#` characters in the image. This is the answer to
 *     part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const tiles = parse(input);
  const grid = assemble(tiles);
  const corners = grid.getCorners();
  const matrix = grid.toMatrix();
  findMonsters(matrix);
  return [
    multiply(corners.map(cell => cell.tile.id)),
    matrix.count('#'),
  ];
};

/**
 * Parses the input into an array of tile objects.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the tile objects
 */
const parse = input => split(input, { group: true }).map(parseTile);

/**
 * Assembles the tiles, rotating and flipping them as needed.
 *
 * @param {Array} tiles - the tiles to assemble
 * @returns {Object} - a grid object with all tiles placed
 */
const assemble = tiles => {
  const grid = buildGrid(tiles[0]);
  const unplacedTiles = tiles.slice(1);
  const edgeQueue = [];

  for (let direction = 0; direction < 4; direction++) {
    edgeQueue.push({ cell: grid.origin, direction });
  }

  do {
    const { cell, direction } = edgeQueue.shift();

    if (cell.getNeighbor(direction)) {
      continue;
    }

    const newCell = findMatchingTile(grid, cell, direction, unplacedTiles);

    if (newCell) {
      unplacedTiles.splice(unplacedTiles.indexOf(newCell.tile), 1);

      for (let i = 0; i < 4; i++) {
        if (!newCell.getNeighbor(i)) {
          edgeQueue.push({ cell: newCell, direction: i });
        }
      }
    }
  } while (unplacedTiles.length);

  return grid;
};

/**
 * Locates an unplaced tile that can be placed adjacent to the given cell in
 * the indicated direction. If one is found, that tile is placed there, and the
 * new cell is returned.
 *
 * @param {Object} grid - the grid object 
 * @param {Object} cell - the cell that will be the neighbor of the
 * newly-placed tile
 * @param {number} direction - the direction from the existing cell in which we
 * are attempting to place the tile
 * @param {Array} unplacedTiles - the tiles to check
 * @returns {object|undefined} - the new cell if a matching tile was found, or
 * `undefined` if no match was found
 */
const findMatchingTile = (grid, cell, direction, unplacedTiles) => {
  const edge = cell.getEdge(direction);
  const targetCoords = buildGrid.DIRECTIONS[direction](cell.coords);
  const otherDirection = (direction + 2) % 4;

  for (let tile of unplacedTiles) {
    for (let flips = 0; flips < 2; flips++) {
      for (let rotations = 0; rotations < 4; rotations++) {
        if (tile.getEdge(flips, rotations, otherDirection) === edge) {
          return grid.set(targetCoords, tile, flips, rotations);
        }
      }
    }
  }
};
