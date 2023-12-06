const { split } = require('../util');
const { multiply } = require('../math2');

const FORMATTERS = [
  input => input,                       // accept part 1 input as-is
  input => input.replaceAll(/ +/g, ''), // remove all space characters for part 2
];

/**
 * # [Advent of Code 2023 Day 6](https://adventofcode.com/2023/day/6)
 *
 * You could brute force this by trying increasingly long hold times until you find the right ones,
 * but that will take a long time for part two. Instead, you can compute the minimum and maximum
 * hold times directly.
 *
 * The formula for the distance the boat will travel is:
 *
 * ```
 * d = (tMax - tHold) * tHold
 * ```
 *
 * ...where tMax is the duration of the race, and tHold is the hold time. We can put this into a
 * form where we can use the quadratic formula to solve for tHold:
 *
 * ```
 * 0 = tHold^2 - tMax * tHold + d
 * ```
 *
 * Applying the quadratic formula gives us:
 *
 * ```
 * tHold = (tMax ± √(tMax^2 - 4 * d)) / 2
 * ```
 *
 * We can't tie the record distance; we have to beat it by at least one millimeter, so `d` will be
 * the record distance plus `1`. The formula will produce two times, a minimum and a maximum hold
 * time. Since we're dealing with integer times, we'll round the minimum up and the maximum down.
 *
 * Once we have the minimum and maximum hold times, we can compute the number of ways to win by
 * subtracting the minimum from the maximum and adding `1` (since the range is inclusive).
 * Multiplying the value for each race gives us the answer.
 *
 * We can solve for part two simply by removing all space characters from the input before parsing.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => FORMATTERS.map(format => {
  const races = parse(format(input));
  return multiply(races.map(race => race.numberOfWaysToWin));
});

/**
 * Parses the race data out of the input.
 *
 * @param {string} input - the input
 * @returns {Array<Race>} - the parsed `Race` objects
 */
const parse = input => {
  const [ times, distances ] = split(input)
    .map(line => line.split(':')[1].trim())
    .map(line => line.split(/ +/).map(Number));
  return times.map((time, i) => new Race(time, distances[i]));
};

/**
 * Represents a single race.
 */
class Race {
  #time;
  #record;

  /**
   * @param {number} time - race duration
   * @param {number} record - record distance
   */
  constructor(time, record) {
    this.#time = time;
    this.#record = record;
  }

  /**
   * @returns {number} - the number of different integral button hold durations that will allow us
   * to beat the record distance
   */
  get numberOfWaysToWin() {
    const sqrt = Math.sqrt(this.#time ** 2 - 4 * (this.#record + 1));
    const holdMin = Math.ceil((this.#time - sqrt) / 2);
    const holdMax = Math.floor((this.#time + sqrt) / 2);
    return holdMax - holdMin + 1;
  }
}
