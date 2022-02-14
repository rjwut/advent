const { match } = require('../util');

const ROOM_REGEXP = /^(?<encrypted>[a-z-]+)-(?<sectorId>\d+)\[(?<checksum>[a-z]+)\]$/gm;
const ASCII_a = 97;
const TARGET_ROOM_NAME = 'northpole object storage';

/**
 * Sorts letter count object entries by descending count, then alphabetically.
 *
 * @param {Array} a - the first entry
 * @param {Array} b - the second entry
 * @returns {number} - the comparison result
 */
const LETTER_COUNT_SORT = (a, b) => {
  const freqSort = b[1] - a[1];
  return freqSort === 0 ? a[0].localeCompare(b[0]) : freqSort;
};

/**
 * # [Advent of Code 2016 Day 4](https://adventofcode.com/2016/day/4)
 *
 * Rooms are parsed with the `match()` function from my `util` module, then
 * each one is passed to `decrypt()`, which determines if the room is real, and
 * if so, decrypts its name. For part one, we just sum the sector IDs of all
 * the rooms whose names we decrypt; for part two, we return the sector ID of
 * the room whose real name is `'northpole object storage'` (exact name
 * discovered by examining the decrypted room names).
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  let sectorIdSum = 0, target;
  match(
    input,
    ROOM_REGEXP,
    { sectorId: Number }
  ).forEach(room => {
    const decrypted = decrypt(room);

    if (decrypted) {
      sectorIdSum += room.sectorId;

      if (decrypted === TARGET_ROOM_NAME) {
        target = room;
      }
    }
  });
  return [ sectorIdSum, target?.sectorId ];
};

/**
 * Given a room object, determines whether the room is real, and if so,
 * decrypts its name. Room objects are expected to have the following
 * properties:
 *
 * - `encrypted`: the encrypted room name
 * - `sectorId`: the room's sector ID
 * - `checksum`: the room's checksum
 *
 * @param {Object} room - the room object
 * @returns {String|null} - the decrypted name, or `null` if it's not a real
 * room
 */
const decrypt = room => {
  // Count the letters
  const letterCounts = {};
  [ ...room.encrypted.replaceAll('-', '') ].forEach(letter => {
    letterCounts[letter] = (letterCounts[letter] ?? 0) + 1;
  });

  // Compute the checksum
  const expectedChecksum = Object.entries(letterCounts)
    .sort(LETTER_COUNT_SORT)
    .slice(0, 5)
    .map(([ letter ]) => letter)
    .join('');

  if (expectedChecksum !== room.checksum) {
    return null; // fake room
  }

  // Decrypt the room name
  let decrypted = '';

  for (let i = 0; i < room.encrypted.length; i++) {
    let fromCode = room.encrypted.charCodeAt(i);
    let toCode;

    if (fromCode === 45) {
      toCode = 32; // dash to space
    } else {
      // Change the letter's ASCII code to a number between 0 and 25, shift it,
      // then convert it back to ASCII.
      toCode = (fromCode + room.sectorId - ASCII_a) % 26 + ASCII_a;
    }

    decrypted += String.fromCharCode(toCode);
  }

  return decrypted;
};
