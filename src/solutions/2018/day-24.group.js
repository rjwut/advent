const GROUP_REGEXP = /^(?<units>\d+) units each with (?<hitPoints>\d+) hit points(?: \((?<traits>.+)\))? with an attack that does (?<attackDamage>\d+) (?<damageType>\w+) damage at initiative (?<initiative>\d+)/;
const SPACE_START = 7;
const TRAIT_MULTIPLIERS = {
  'immune': 0,
  'weak': 2,
};

/**
 * Represents a single group of units.
 */
class Group {
  #faction;
  #units;
  #hitPoints;
  #damageMultipliers = new Map();
  #attackDamage;
  #damageType;
  #initiative;
  #targetFilter;
  #targetSort;

  /**
   * Creates a new `Group` from the string definition from the input. The
   * `definition` argument is made optional to facilitate cloning; it should
   * always be provided when creating a new `Group`.
   *
   * @param {string} faction - the faction to which the group belongs
   * @param {string} [definition] - the string definition of the group
   */
  constructor(faction, definition) {
    this.#faction = faction;

    if (!definition) {
      return;
    }

    const groupMatch = GROUP_REGEXP.exec(definition);

    if (!groupMatch) {
      throw new Error(`Invalid group definition: ${definition}`);
    }

    this.#units = Number(groupMatch.groups.units);
    this.#hitPoints = Number(groupMatch.groups.hitPoints);
    this.#attackDamage = Number(groupMatch.groups.attackDamage);
    this.#damageType = groupMatch.groups.damageType;
    this.#initiative = Number(groupMatch.groups.initiative);

    // Build damage multipliers
    if (groupMatch.groups.traits) {
      groupMatch.groups.traits.split('; ').forEach(trait => {
        const traitType = trait.startsWith('immune') ? 'immune' : 'weak';
        const spaceIndex = trait.indexOf(' ', SPACE_START);
        const attackTypes = trait.substring(spaceIndex + 1).split(', ');
        attackTypes.forEach(attackType => {
          this.#damageMultipliers.set(attackType, TRAIT_MULTIPLIERS[traitType]);
        });
      });
    }

    this.#buildTargetFilterAndSort();
  }

  /**
   * Clones this `Group`.
   *
   * @returns {Group} - the clone
   */
  clone() {
    const clone = new Group(this.#faction);
    clone.#units = this.#units;
    clone.#hitPoints = this.#hitPoints;
    clone.#damageMultipliers = new Map(this.#damageMultipliers);
    clone.#attackDamage = this.#attackDamage;
    clone.#damageType = this.#damageType;
    clone.#initiative = this.#initiative;
    clone.#buildTargetFilterAndSort();
    return clone;
  }

  get faction() {
    return this.#faction;
  }

  /**
   * Returns whether this `Group` has any units left.
   *
   * @returns {boolean} - `true` if there's at least one unit; `false` otherwise
   */
  get alive() {
    return this.#units !== 0;
  }

  get units() {
    return this.#units;
  }

  get hitPoints() {
    return this.#hitPoints;
  }

  get effectivePower() {
    return this.#units * this.#attackDamage;
  }

  get attackDamage() {
    return this.#attackDamage;
  }

  get damageType() {
    return this.#damageType;
  }

  /**
   * Increases the attack damage of this `Group` by the given amount.
   *
   * @param {number} amount - the boost amount
   */
  boost(amount) {
    this.#attackDamage += amount;
  }

  get initiative() {
    return this.#initiative;
  }

  /**
   * Returns the damage multiplier for the given attack type. If this `Group`
   * is immune to the given damage type, this will return `0`. If it's weak
   * to the damage type, it returns `2`. Otherwise, it returns `1`.
   *
   * @param {string} damageType - the damage type to evaluate
   * @returns {number} - the multiplier for that damage type
   */
  getDamageMultiplier(damageType) {
    return this.#damageMultipliers.get(damageType) ?? 1;
  }

  /**
   * Allows this `Group` to select an enemy `Group` from the given list of
   * `Group`s to attack. If a target is selected, it will be removed from the
   * `untargeted` array and returned; otherwise, `null` is returned.
   *
   * @param {Array} untargeted - the `Group`s that are not yet targeted by any
   * `Group`
   * @returns {Group|null} - the targeted `Group`, or `null` if no target was
   * selected
   */
  chooseTarget(untargeted) {
    const targets = untargeted.filter(this.#targetFilter);
    const target = targets.length ? targets.sort(this.#targetSort)[0] : null;

    if (target) {
      untargeted.splice(untargeted.indexOf(target), 1);
    }

    return target;
  }

  /**
   * Returns the amount of damage that would be inflicted by the given attacker
   * `Group` if it attacked this `Group`. This considers the damage multiplier
   * but ignores "overkill" (inflicting more damage than the `Group` can
   * actually absorb). If `apply` is `true`, the damage is actually applied to
   * this `Group`, and its unit count is decreased accordingly.
   *
   * @param {Group} attacker - the attacking `Group`
   * @param {boolean} [apply=false] - whether to apply the damage to this
   * `Group`
   * @returns {number} - the amount of damage that would be inflicted
   */
  computeDamage(attacker, apply = false) {
    const damage = attacker.effectivePower * this.getDamageMultiplier(attacker.damageType);

    if (apply) {
      const unitsKilled = Math.min(Math.floor(damage / this.#hitPoints), this.#units);
      this.#units -= unitsKilled;
    }

    return damage;
  }

  /**
   * Returns a plain JSON-friendly object representation of this `Group`. This
   * is used to serialize the `Group` for comparison by Jest.
   *
   * @returns {Object} - the JSON-friendly object
   */
  toJSON() {
    return {
      units: this.#units,
      hitPoints: this.#hitPoints,
      damageMultipliers: Object.fromEntries([ ...this.#damageMultipliers.entries() ]),
      attackDamage: this.#attackDamage,
      damageType: this.#damageType,
      initiative: this.#initiative,
    };
  }

  /**
   * Builds the `targetFilter()` and `targetSort()` functions used by this
   * `Group` and sets them onto the corresponding private fields.
   */
  #buildTargetFilterAndSort() {
    this.#targetFilter = target => {
      return target.alive && this.#faction !== target.faction &&
        target.getDamageMultiplier(this.#damageType) !== 0;
    };

    this.#targetSort = (a, b) => {
      const aDamage = a.computeDamage(this);
      const bDamage = b.computeDamage(this);

      if (aDamage === bDamage) {
        const aPower = a.effectivePower;
        const bPower = b.effectivePower;

        if (aPower === bPower) {
          return b.initiative - a.initiative;
        }

        return bPower - aPower;
      }

      return bDamage - aDamage;
    };
  }
}

/**
 * Sorts `Group`s by priority for selecting targets.
 *
 * @param {Group} a - the first `Group`
 * @param {Group} b - the second `Group`
 * @returns {number} - the comparison result
 */
Group.TARGET_SELECTION_PRIORITY_SORT = (a, b) => {
  const aPower = a.effectivePower;
  const bPower = b.effectivePower;
  return aPower === bPower ? b.initiative - a.initiative : bPower - aPower;
};

/**
 * Sorts `Group`s by attack priority.
 *
 * @param {Group} a - the first `Group`
 * @param {Group} b - the second `Group`
 * @returns {number} - the comparison result
 */
Group.ATTACK_PRIORITY_SORT = (a, b) => b.initiative - a.initiative;

module.exports = Group;
