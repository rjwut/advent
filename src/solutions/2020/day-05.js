const { split } = require('../util');

const ROW_COUNT = 128;
const COLUMN_COUNT = 8;
const ROW_CHARS = Math.log2(ROW_COUNT);

/**
 * # [Advent of Code 2020 Day 5](https://adventofcode.com/2020/day/5)
 *
 * First we write a `decode()` function that accepts a boarding pass code and
 * returns a seat ID. We'll compute the row index first, then the column index,
 * then combine them to produce the seat ID. A simple way to handle computing
 * the row index is to remember that for the first character, the partition
 * size is the number of rows (128) divided by two, and that for each
 * subsequent character, the partition size is halved. So we can simply iterate
 * the first seven characters, and for each `B` we encounter, add the partition
 * size to the row index. We follow a similar process for the last three
 * characters to determine the column index, then compute the seat ID. We
 * `map()` the `decode()` function on each line of the input to produce an
 * array of seat IDs.
 * 
 * Part one of the puzzle simply wants the largest seat ID, which is super
 * easy. Part two wants the ID of our seat. The flight is completely full, so
 * ours would be the only missing one, except that the front and back rows
 * don't have the full complement of eight seats. We're told that the seat
 * IDs adjacent to ours will be occupied. I handled this by first populating a
 * `Set` with all possible seat IDs, then removing all my discovered seat IDs
 * from that `Set`. This resulted in a `Set` containing only the missing seats.
 * I then filtered out those seats that were in the first or last row, or whose
 * adjacent IDs were missing. (As it turned out, only the latter check was
 * required, but this more robust check fulfills the letter of the problem
 * statement.) This leaves only one seat: ours!
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = split(input).map(decode);
  return [ findMaxId, findMissingSeat ].map(fn => fn(input));
};

/**
 * Converts a boarding pass code to its ID.
 *
 * @param {string} pass - the boarding pass code
 * @returns {number} - the ID
 */
const decode = pass => {
  let halfSize = ROW_COUNT / 2;
  let row = 0, column = 0;

  for (let i = 0; i < ROW_CHARS; i++) {
    if (pass.charAt(i) === 'B') {
      row += halfSize;
    }

    halfSize /= 2;
  }

  halfSize = COLUMN_COUNT / 2;

  for (let i = ROW_CHARS; i < pass.length; i++) {
    if (pass.charAt(i) === 'R') {
      column += halfSize;
    }

    halfSize /= 2;
  }

  return row * COLUMN_COUNT + column;
};

/**
 * Finds the maximum pass ID among the given pass IDs.
 *
 * @param {Array} passes - the pass IDs
 * @returns {number} - the maximum pass ID
 */
const findMaxId = passes => passes.reduce((max, cur) => max > cur ? max : cur);

/**
 * Given a list of seat IDs, finds the ID of the seat that:
 * - is not in the given list
 * - is not on the very first or very last row of the plane
 * - the IDs one less and one greater than it are in the given list
 * @param {Array} ids - the pass IDs
 * @returns {number} - the seat ID that meets the criteria
 */
const findMissingSeat = ids => {
  const remaining = new Set();

  for (let i = 0; i < 1024; i++) {
    remaining.add(i);
  }

  ids.forEach(id => {
    remaining.delete(id);
  });

  const emptySeats = Array.from(remaining);
  const lastValidSeat = (ROW_COUNT - 1) * COLUMN_COUNT;
  return emptySeats.filter((id, i) => {
    if (i === 0 || i + 1 === remaining.length || id < COLUMN_COUNT || id > lastValidSeat) {
      return false;
    }

    if (emptySeats[i - 1] === id - 1 || emptySeats[i + 1] === id + 1) {
      return false;
    }

    return true;
  })[0];
};
