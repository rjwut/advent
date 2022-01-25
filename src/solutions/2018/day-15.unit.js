const { manhattanDistance } = require('../math2');

/**
 * Represents a single unit on the battlefield, elf or goblin.
 */
class Unit {
  #r;
  #c;
  #faction;
  #hp;
  #ap;

  /**
   * Creates a new unit.
   *
   * @param {number} r - the unit's starting row
   * @param {number} c - the unit's starting column 
   * @param {string} faction - the unit's faction
   * @param {number} hp - the unit's starting hit points
   * @param {number} ap - the unit's attack power
   */
  constructor(r, c, faction, hp, ap) {
    this.#r = r;
    this.#c = c;
    this.#faction = faction;
    this.#hp = hp;
    this.#ap = ap;
  }

  /**
   * Returns the unit's row.
   *
   * @returns {number} - the row
   */
  get r() {
    return this.#r;
  }

  /**
   * Returns the unit's column.
   *
   * @returns {number} - the column
   */
  get c() {
    return this.#c;
  }

  /**
   * Returns the unit's faction.
   *
   * @returns {string} - the faction
   */
  get faction() {
    return this.#faction;
  }

  /**
   * Returns the unit's hit points.
   *
   * @returns {number} - the HP
   */
  get hp() {
    return this.#hp;
  }

  /**
   * Returns the unit's attack power.
   *
   * @returns {number} - the AP
   */
  get ap() {
    return this.#ap;
  }

  /**
   * Returns whether the unit is alive.
   *
   * @returns {boolean} - `true` if alive; `false` if dead
   */
  get alive() {
    return this.#hp > 0;
  }

  /**
   * Moves the unit to the given coordinates.
   *
   * @param {number} r - the new row
   * @param {number} c - the new column
   */
  move(r, c) {
    this.#r = r;
    this.#c = c;
  }

  /**
   * Reduces the unit's hit points by the given amount.
   *
   * @param {number} attack - the damage incurred
   */
  hit(attack) {
    this.#hp = Math.max(this.#hp - attack, 0);
  }

  /**
   * Returns the Manhattan distance between two units.
   *
   * @param {Unit} other - the other unit
   * @returns {number} - the Manhattan distance
   */
  distance(other) {
    return manhattanDistance(
      [ this.#r, this.#c ],
      [ other.r, other.c ]
    );
  }
}

module.exports = Unit;
