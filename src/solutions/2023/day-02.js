const { split } = require('../util');

class CubeSet extends Map {
  #id;

  /**
   * Creates a new `CubeSet`. Can accept a string description of the cubes (e.g. `'3 blue, 4 red'`)
   * or any argument accepted by `Map`'s constructor.
   *
   * @param {*} arg - the constructor argument
   */
  constructor(arg) {
    const fromString = typeof arg === 'string';
    super(fromString ? undefined : arg);

    if (fromString) {
      const colonPos = arg.indexOf(': ');

      if (colonPos !== -1) {
        // We have an ID
        const [ name, rest ] = arg.split(': ');
        this.#id = parseInt(name.split(' ')[1], 10);
        arg = rest;
      }

      arg.split(/[;,] /).map(description => {
        let [ count, color ] = description.split(' ');
        count = Math.max(parseInt(count, 10), this.get(color));
        this.set(color, count);
      });
    }
  }

  get id() {
    return this.#id;
  }

  /**
   * @returns {number} - the product of the cube counts in this `CubeSet`.
   */
  get power() {
    return [ ...this.values() ].reduce((power, count) => power * count, 1);
  }

  /**
   * Overrides `Map.get()` to return `0` for colors that aren't present in this `CubeSet`.
   *
   * @param {string} color - the cube color
   * @returns {number} - the number of cubes of the given color in the `CubeSet`
   */
  get(color) {
    return super.get(color) ?? 0;
  }

  /**
   * Determines whether this `CubeSet` contains at least as many cubes of each color as the given
   * `CubeSet`.
   *
   * @param {CubeSet} other - the other `CubeSet`
   * @returns {boolean} - whether this `CubeSet` contains at least as many cubes of each color
   */
  gte(other) {
    return [ ...other.entries() ].every(([ color, count ]) => this.get(color) >= count);
  }
}

const BAG = new CubeSet('12 red, 13 green, 14 blue');

/**
 * # [Advent of Code 2023 Day 2](https://adventofcode.com/2023/day/2)
 *
 * I created a `CubeSet` class which extends `Map` and represents any collection of cubes of any
 * colors. I then overrode the constructor so that it could accept a string description of the set
 * of cubes and `get()` so that it would return `0` for colors that aren't present in the set.
 *
 * A key realization that simplified the solution was to recognize that there was no need to keep
 * track of the individual sets of cubes pulled out in each game. Instead, I could simply iterate
 * each count and color combination in the description and ensure that the bag has at least that
 * many cubes of that color in it. Thus, each game is automatically reduced to the smallest set of
 * cubes that could satisfy it, which makes solving part two much easier. This means that `CubeSet`
 * can be used to represent an entire game, so I added an `id` property to it and updated the
 * constructor to extract it.
 *
 * With that done, I just needed a couple of other things:
 *
 * - A `gte()` (greater than or equal to) method to determine whether one `CubeSet` contains at
 *   least as many cubes of each color as another
 * - A `power` getter to compute the product of the cube counts in a `CubeSet`
 *
 * Now I had everything needed to solve it:
 *
 * 1. Parse each line into a `CubeSet`.
 * 2. Create a `BAG` `CubeSet` from the string `'12 red, 13 green, 14 blue'`.
 * 3. Filter the games array to only those where `BAG.gte(game)`.
 * 4. Sum the IDs of the remaining games. This is the answer to part one.
 * 5. Sum the `power` property of all games. This is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const games = split(input).map(line => new CubeSet(line));
  return [
    games.filter(game => BAG.gte(game))
      .reduce((sum, game) => sum + game.id, 0),
    games.map(game => game.power)
      .reduce((sum, power) => sum + power, 0),
  ];
};
