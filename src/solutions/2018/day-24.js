const Group = require('./day-24.group');
const { split } = require('../util');

const FACTION_NAME_REGEXP = /^(.+):$/;

/**
 * # [Advent of Code 2018 Day 24](https://adventofcode.com/2018/day/24)
 *
 * There isn't really a "trick" to this puzzle; the two hardest parts are:
 *
 * - Parsing the complex input
 * - Correctly implementing all the rules
 *
 * I created a `Group` class that is responsible for parsing each `Group` from
 * the input and managing its state. I used a `RegExp` to parse the line and
 * extract most of the data. The "traits" (immunities and weaknesses) were
 * tricky to deal with in a `RegExp`, so I simply captured that whole section
 * and parsed it separately. These get turned into a `Map` of damage
 * multipliers; immunity is a multiplier of `0`, while weakness is a multiplier
 * of `2`. Any damage type not mentioned in the multipliers `Map` is assumed to
 * have a multiplier of `1`. The `getDamageMultiplier()` method performs the
 * multiplier lookup.
 *
 * `Group` has two static sorting functions: `TARGET_SELECTION_PRIORITY_SORT`
 * sorts `Group`s by who gets priority for selecting their target, and
 * `ATTACK_PRIORITY_SORT` sorts `Group`s by who gets priority for attacking.
 * Individual `Group`s also have private `targetFilter()` and `targetSort()`
 * functions. The `targetFilter()` function is used to reduce the list of
 * `Group`s to those which are eligible targets (belongs to enemy faction, has
 * at least one unit, doesn't have immunity against this `Group`'s attack
 * type). The `targetSort()` function takes the `Group`s which are eligible
 * targets and sorts them as described in the puzzle description to select the
 * highest priority target.
 *
 * Things that will bite you if you're not careful:
 *
 * - `Group`s with no units can't attack or be attacked. Note that a `Group`
 *   may be alive when it selects its target, but dead before it attacks.
 * - A `Group` may not be attacked by more than one `Group` per round.
 * - A `Group` can't attack anyone if all surviving enemies are immune to its
 *   attack type.
 * - It's possible for a battle to end in a stalemate, where no surviving group
 *   can inflict any kills on any enemy group. You'll have to be able to detect
 *   this (nobody dies in a round) and cancel the battle. There are a couple of
 *   scenarios where this happens:
 *   - All `Group`s are immune to all attacks the enemy can inflict.
 *   - All `Group`s which can attack a non-immune enemy `Group` are too weak to
 *     inflict enough damage to kill a unit.
 * - You have to clone `Group`s before using them in a battle so that each
 *   battle starts with a pristine state.
 *
 * I considered performing a binary search in part two to find the optimal
 * boost, but it was hard to know what to do in the event that a battle was a
 * stalemate. As it turned out, just incrementing the boost until the immune
 * system wins is plenty fast.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const groups = [];
  split(input, { group: true }).forEach(lines => {
    const faction = lines[0].match(FACTION_NAME_REGEXP)[1];
    lines.slice(1).forEach(line => groups.push(new Group(faction, line)));
  });
  const part1 = Math.abs(fight(groups));
  let boost = 1;
  let part2;

  do {
    part2 = fight(groups, boost++);
  } while (part2 === null || part2 < 0);

  return [ part1, part2 ];
};

/**
 * Performs a single battle and reports the margin of victory (or defeat, if
 * the infection wins) in number of units. This number is positive for a
 * victory and negative for a defeat. If the battle is a stalemate, this
 * function returns `null`.
 *
 * @param {Array} groups - the `Group`s to battle (which will be cloned before
 * the battle starts)
 * @param {number} [boost=0] - the boost to apply to units' attack power
 * @returns {number|null} - the margin of victory (or defeat if the return
 * value is negative) in surviving units, or `null` if the battle is a
 * stalemate
 */
const fight = (groups, boost = 0) => {
  groups = groups.map(group => {
    group = group.clone();

    if (boost && group.faction === 'Immune System') {
      group.boost(boost);
    }

    return group;
  });

  do {
    // Select targets
    const targetSelectionOrder = groups.sort(Group.TARGET_SELECTION_PRIORITY_SORT);
    const targets = new Map();
    const untargeted = [ ...groups ];
    targetSelectionOrder.forEach(group => {
      const target = group.chooseTarget(untargeted);

      if (target) {
        targets.set(group, target);
      }
    });

    // Perform attacks
    const attackOrder = [ ...targets.keys() ].sort(Group.ATTACK_PRIORITY_SORT);
    let kills = 0;
    attackOrder.forEach(attacker => {
      const target = targets.get(attacker);
      const before = target.units;
      target.computeDamage(attacker, true);
      kills += before - target.units;
    });

    if (kills === 0) {
      return null; // stalemate
    }

    // Remove dead groups
    groups = groups.filter(group => group.alive);
  } while (!battleOver(groups));

  const factionSign = groups[0].faction === 'Infection' ? -1 : 1;
  return factionSign * groups.reduce((sum, group) => sum + group.units, 0);
};

/**
 * Determines whether one faction has been eliminated.
 *
 * @param {Array} survivors - the surviving `Group`s
 * @returns {boolean} - `true` if the battle is over; `false` otherwise
 */
const battleOver = survivors => {
  let faction = null;

  for (const survivor of survivors) {
    if (faction === null) {
      faction = survivor.faction;
    } else if (faction !== survivor.faction) {
      return false;
    }
  }

  return true;
};
