const { split } = require('../util');
const { add, multiply } = require('../math2');

/**
 * # [Advent of Code 2022 Day 13](https://adventofcode.com/2022/day/13)
 *
 * Parsing is super easy on this one, since each non-blank line is valid JSON: `JSON.parse(line)`
 * for each and you're done.
 *
 * The crux of the problem was writing a good comparator function: write it correctly for part 1
 * and part 2 becomes a cinch. A comparator function (as used in `sort()`) must receive exactly two
 * arguments, and return a negative number if they're in the right order, a positive number if
 * they're not, and `0` if they have equal sort precedence. Writing a comparator that conforms to
 * this and can recursively compare the elements in each of the packets is the puzzle 90% solved.
 *
 * Things that I noticed could trip you up:
 *
 * - The search through the object tree is depth-first, not breadth-first. It returns immediately
 *   upon discovering an unequal element; later elements will have no effect on the sort order.
 * - If both arguments are numbers, you don't recurse; just take the difference and return.
 * - Any remaining elements in the longer array after the shorter one has been completely inspected
 *   are ignored; you compare the array lengths instead.
 *
 * For part one, just feed each pair of packets into the comparator, then convert each negative
 * value to that pair's index position (1-based) and each positive value to `0`. Add up the
 * resulting values to get the answer.
 *
 * For part two, flatten the array of pairs by one level so that you have a flat list of packets.
 * Add the two divider packets (keeping references to them) to the end of the list, then sort the
 * list. Locate the divider packets and multiply their (1-based) indexes for the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const pairs = split(input, { group: true })
    .map(pair => pair.map(packet => JSON.parse(packet)));
  return [ part1, part2 ].map(part => part(pairs));
};

/**
 * The comparator: takes any two packets and returns a negative number if they're in the right
 * order, a positive number if they're not, and `0` if they have equal sort precedence.
 *
 * @param {Array|number} pkt1 - the first packet
 * @param {Array|number} pkt2 - the second packet
 * @returns {number} - the sort result
 */
const compare = (pkt1, pkt2) => {
  pkt1 = typeof pkt1 === 'number' ? [ pkt1 ] : pkt1;
  pkt2 = typeof pkt2 === 'number' ? [ pkt2 ] : pkt2;
  const len = Math.min(pkt1.length, pkt2.length);

  for (let i = 0; i < len; i++) {
    const v1 = pkt1[i];
    const v2 = pkt2[i];

    if (typeof v1 === 'number' && typeof v2 === 'number') {
      const diff = v1 - v2;

      if (diff !== 0) {
        return diff;
      }

      continue;
    }

    const diff = compare(v1, v2);

    if (diff !== 0) {
      return diff;
    }
  }

  return pkt1.length - pkt2.length;
};

/**
 * Solves part one.
 *
 * @param {Array<Array<Array<Array|number>>>} pairs - the grouped pairs
 * @returns {number} - the answer to part one
 */
const part1 = pairs => {
  const results = pairs.map(pair => compare(...pair));
  return add(results.map((result, i) => result < 0 ? i + 1 : 0));
};

/**
 * Solves part two.
 *
 * @param {Array<Array<Array<Array|number>>>} pairs - the grouped pairs
 * @returns {number} - the answer to part two
 */
const part2 = pairs => {
  const packets = pairs.flat(1);
  const dividers = [ [ [ 2 ] ], [ [ 6 ] ] ];
  packets.push(...dividers);
  packets.sort(compare);
  return multiply(dividers.map(divider => packets.indexOf(divider) + 1));
}
