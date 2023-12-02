const { split } = require('../util');

/**
 * Represents a single cube game.
 */
class Game {
  #id;
  #cubeSets;

  /**
   * Parses the given game line into a `Game` object.
   *
   * @param {string} line - the game line
   */
  constructor(line) {
    const [ name, rest ] = line.split(': ');
    this.#id = parseInt(name.split(' ')[1], 10);
    this.#cubeSets = rest.split('; ').map(description => new CubeSet(description));
  }

  /**
   * @returns {number} - the game ID
   */
  get id() {
    return this.#id;
  }

  /**
   * Determines whether this Game can be played with the given bag of cubes.
   *
   * @param {CubeSet} bag - the bag of cubes
   * @returns {boolean} - whether the game can be played
   */
  possible(bag) {
    return this.#cubeSets.every(cubeSet => bag.gte(cubeSet));
  }

  /**
   * Computes the smallest possible bag of cubes that makes this game possible.
   *
   * @returns {CubeSet} - the smallest possible bag of cubes
   */
  fit() {
    return this.#cubeSets.reduce((max, cubeSet) => max.max(cubeSet), new CubeSet());
  }
}

/**
 * Represents a collection of cubes.
 */
class CubeSet extends Map {
  /**
   * Creates a new `CubeSet`.
   *
   * @param {*} [description] - either a string description of the cubes (e.g. `'3 blue, 4 red'`)
   * or any argument accepted by `Map`'s constructor
   */
  constructor(description) {
    const fromString = typeof description === 'string';
    super(fromString ? undefined : description);

    if (fromString) {
      description.split(', ').forEach(cube => {
        const [ count, color ] = cube.split(' ');
        this.set(color, parseInt(count, 10));
      });
    }
  }

  /**
   * @returns {number} - the product of the cube counts in this `CubeSet`.
   */
  get power() {
    return [ ...this.values() ].reduce((power, count) => power * count, 1);
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

  /**
   * Returns the smallest `CubeSet` that satisfies `this.gte(other)`.
   *
   * @param {CubeSet} other - the other `CubeSet`
   * @returns {CubeSet} - the composite `CubeSet`
   */
  max(other) {
    const colors = new Set([ ...this.keys(), ...other.keys() ]);
    const entries = [ ...colors ].map(
      color => [ color, Math.max(this.get(color) ?? 0, other.get(color) ?? 0) ]
    );
    return new CubeSet(entries);
  }
}

const BAG = new CubeSet('12 red, 13 green, 14 blue');

/**
 * # [Advent of Code 2023 Day 2](https://adventofcode.com/2023/day/2)
 *
 * I created a `CubeSet` class which extends `Map` and represents any collection of cubes of any
 * colors, and a `Game` class which represents a single game. See the documentation for those
 * methods for details.
 *
 * Part 1:
 * 1. Filter games to those that are possible with the given bag of cubes.
 * 2. Sum the IDs of those games.
 *
 * Part 2:
 * 1. Compute the maximum number of cubes of each color needed for each game.
 * 2. Compute the power of the required bag for each game.
 * 3. Sum the powers.
 *
 * - Constructor accepts a string description of the cubes, e.g. `'3 blue, 4 red'`
 * - `power` getter returns the product of all cube counts
 * - `gte(other)` method returns whether this `CubeSet` contains at least as many cubes of each
 *   color as the given `CubeSet`
 * - `max(other)` method computes the smallest `CubeSet` that satisfies `this.gte(other)`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const games = split(input).map(line => new Game(line));
  return [
    games.filter(game => game.possible(BAG))
      .reduce((sum, game) => sum + game.id, 0),
    games.map(game => game.fit().power)
      .reduce((sum, power) => sum + power, 0),
  ];
};
