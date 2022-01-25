const { parseGrid } = require('../util');
const Unit = require('./day-15.unit');

const UP = { r: -1, c: 0 };
const RIGHT = { r: 0, c: 1 };
const DOWN = { r: 1, c: 0 };
const LEFT = { r: 0, c: -1 };
const DIRECTIONS = [ UP, RIGHT, DOWN, LEFT ];
const SQUARE_SORT = (a, b) => a.r === b.r ? a.c - b.c : a.r - b.r;
const STARTING_HP = 200;
const DEFAULT_ATTACK_POWER = 3;

/**
 * Parses the input into an object that tracks information about the
 * battlefield and the units on it.
 */
class Battlefield {
  #grid;
  #width;
  #height;
  #elfAp;
  #units = new Map();
  #round = 0;
  #elfDeaths = 0;

  /**
   * Creates a new `Battlefield` and populates it from data parsed from the
   * input.
   *
   * @param {string} input - the puzzle input
   * @param {number} elfAp - the attack power for the elves
   */
  constructor(input, elfAp = DEFAULT_ATTACK_POWER) {
    this.#grid = parseGrid(input);
    this.#width = this.#grid[0].length;
    this.#height = this.#grid.length;
    this.#elfAp = elfAp;

    for (let r = 0; r < this.#grid.length; r++) {
      const row = this.#grid[r];

      for (let c = 0; c < row.length; c++) {
        const chr = row[c];

        if (chr !== '.' && chr !== '#') {
          const ap = chr === 'E' ? elfAp : DEFAULT_ATTACK_POWER;
          this.#units.set(
            `${r},${c}`,
            new Unit(r, c, chr, STARTING_HP, ap),
          );
        }
      }
    }
  }

  /**
   * Returns the character located at this position in the grid.
   *
   * @param {number} r - the cell row
   * @param {number} c - the cell column
   * @returns {string} - the character at the given position
   */
  get(r, c) {
    return this.#grid[r][c];
  }

  /**
   * Returns the width of the battlefield.
   *
   * @returns {number} - the width
   */
  get width() {
    return this.#width;
  }

  /**
   * Returns the height of the battlefield.
   *
   * @returns {number} - the height
   */
  get height() {
    return this.#height;
  }

  /**
   * Returns the remaining `Unit`s on the battlefield in "reading order."
   *
   * @returns {Array} - the remaining units
   */
  get units() {
    let units = [ ...this.#units.values() ];
    units.sort(SQUARE_SORT);
    return units;
  }

  /**
   * Returns the outcome score (the product of the number of completed rounds
   * and the total HP of the remaining units).
   *
   * @returns {number} - the outcome score
   */
  get outcome() {
    const totalHp = this.units.reduce((sum, unit) => sum + unit.hp, 0);
    return this.#round * totalHp;
  }

  /**
   * Returns the number of elves that have died.
   *
   * @returns {number} - the number of elf deaths
   */
  get elfDeaths() {
    return this.#elfDeaths;
  }

  /**
   * Returns the remaining `Unit`s that do not belong to the named faction.
   *
   * @param {string} faction - the faction whose enemies should be returned
   * @returns {Array} - the remaining enemies
   */
  getEnemies(faction) {
    return [ ...this.#units.values() ]
      .filter(unit => unit.faction !== faction);
  }

  /**
   * Returns the unoccupied squares adjacent to the given square.
   *
   * @param {Object} square - a square location
   * @returns {Array} - the adjacent unoccupied squares
   */
  getAdjacentSpaces(square) {
    return DIRECTIONS.map(dir => {
      const r1 = square.r + dir.r;
      const c1 = square.c + dir.c;
      const chr = this.#grid[r1][c1];
      return chr === '.' ? { r: r1, c: c1 } : null;
    }).filter(square => square);
  }

  /**
   * Returns the enemy `Unit`s that are adjacent to the given `Unit`.
   *
   * @param {Unit} unit - the `Unit` to check
   * @returns {Array} - the adjacent enemy `Unit`s
   */
  getAdjacentEnemies(unit) {
    return DIRECTIONS.map(dir => {
      const r1 = unit.r + dir.r;
      const c1 = unit.c + dir.c;
      const chr = this.#grid[unit.r + dir.r][unit.c + dir.c];

      if (chr !== '.' && chr !== '#' && chr !== unit.faction) {
        return this.#units.get(`${r1},${c1}`);
      }
    }).filter(enemy => enemy);
  }

  /**
   * Moves the given `Unit` to the indicated target square.
   *
   * @param {Unit} unit - the `Unit` to move
   * @param {Object} target - the coordinates of the target square
   * @throws {Error} - if the target square is occupied or not adjacent
   */
  moveUnit(unit, target) {
    if (unit.distance(target) !== 1) {
      throw new Error(`Unit is not adjacent to (${target.r},${target.c})`);
    }

    const chr = this.#grid[target.r][target.c];

    if (chr !== '.') {
      throw new Error(`Can't move unit to (${target.r},${target.c}); occupied by ${chr}`);
    }

    this.#grid[unit.r][unit.c] = '.';
    this.#units.delete(`${unit.r},${unit.c}`);
    unit.move(target.r, target.c);
    this.#grid[unit.r][unit.c] = unit.faction;
    this.#units.set(`${unit.r},${unit.c}`, unit);
  }

  /**
   * Performs an attack.
   *
   * @param {Unit} attacker - the attacking `Unit`
   * @param {Unit} target - the `Unit` being attacked
   */
  attack(attacker, target) {
    target.hit(attacker.ap);

    if (!target.alive) {
      this.#units.delete(`${target.r},${target.c}`);
      this.#grid[target.r][target.c] = '.';

      if (target.faction === 'E') {
        this.#elfDeaths++;
      }
    }
  }

  /**
   * Notifies the `Battlefield` object that the current round is complete.
   */
  endRound() {
    this.#round++;
  }

  /**
   * Produces a string representation of the `Battlefield`.
   *
   * @returns {string} - the battlefield map
   */
  toString() {
    return `elfAp=${this.#elfAp} round=${this.#round}\n` +
      this.#grid.map(row => row.join('')).join('\n');
  }
}

module.exports = Battlefield;
