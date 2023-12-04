const { split } = require('../util');
const { add } = require('../math2');

/**
 * # [Advent of Code 2023 Day 4](https://adventofcode.com/2023/day/4)
 *
 * The tricky part of this puzzle for me was the parsing; if you don't trim the string before
 * parsing it as a number, it could come back as `NaN`. Failing to do this cost me some time. For
 * part two, rather than duplicate a `Card` whenever I got another copy of it, I simply added a
 * `copies` property to my `Card` class. So if I had `5` copies of a `Card` and it had two winning
 * numbers, I added `5` to the `copies` property of the next `2` cards.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const cards = split(input).map(line => new Card(line));
  return [ part1(cards), part2(cards) ];
};

/**
 * Solves part one by adding together the scores for each `Card`.
 *
 * @param {Array<Card>} cards - the `Card`s to score
 * @returns {number} - the total score
 */
const part1 = cards => add(cards.map(card => card.score));

/**
 * Solves part two by determining how many `Card`s we have.
 *
 * @param {Array<Card>} cards - the `Card`s to score
 * @returns {number} - the number of `Card`s
 */
const part2 = cards => {
  return cards.reduce((totalCopies, card, i) => {
    const wins = card.winCount;
    const jLimit = Math.min(i + wins + 1, cards.length);

    for (let j = i + 1; j < jLimit; j++) {
      cards[j].copies += card.copies;
    }

    return totalCopies + card.copies;
  }, 0);
};

/**
 * Represents a single scratchcard.
 */
class Card {
  copies;
  #winning;
  #have;

  /**
   * Parses a line of input into a `Card`.
   *
   * @param {string} line - the input line
   */
  constructor(line) {
    const [ , numbersStr ] = line.split(': ');
    this.copies = 1;
    const [ winning, have ] = numbersStr.split(' | ').map(numbersStrToNumbers);
    this.#winning = new Set(winning);
    this.#have = have;
  }

  /**
   * @returns {number} - how many of the numbers we have on this `Card` are winners
   */
  get winCount() {
    return this.#have.filter(n => this.#winning.has(n)).length;
  }

  /**
   * @returns {number} - the part 1 score for this `Card`
   */
  get score() {
    const wins = this.winCount;
    return wins ? 2 ** (wins - 1) : 0;
  }
}

/**
 * Converts a string of space-separated numbers to an array of numbers.
 *
 * @param {string} str - the number string
 * @returns {Array<number>} - the actual values
 */
const numbersStrToNumbers = str => str.trim()
  .split(/\s+/)
  .map(n => parseInt(n.trim(), 10));
