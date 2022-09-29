const INPUT_REGEXP = /Hit Points: (?<hp>\d+)\nDamage: (?<damage>\d+)/;
const ME = { hp: 50, armor: 0, mana: 500 };

const doTurn = require('./day-22.state');

/**
 * # [Advent of Code 2015 Day 22](https://adventofcode.com/2015/day/22)
 *
 * The difficulty with this puzzle is mainly with making sure that the rules of
 * the RPG are implemented exactly. Things that can trip you up:
 *
 * - The player loses the game if their HP reaches 0 _OR_ they can't cast any
 *   spells.
 * - You must deduct the spell's cost from the player's mana pool on cast.
 * - Spells can have effects on cast, on the start of a turn, and on wearing
 *   off:
 *   - Magic Missile and Drain are instants, and act immediately when they are
 *     cast.
 *   - Shield boosts armor on cast, and reduces it on wearing off.
 *   - Poison and Recharge have no effects on cast or wearing off, but do at
 *     the start of every turn while they are active (both the player's and the
 *     boss's). Their effect still occurs on the turn that they wear off.
 * - Shield, Poison, and Recharge cannot be cast while their effects are still
 *   active. They _can_ be re-cast on the same turn that they wear off.
 * - Recharge's effect does not count as spending negative mana.
 * - At the hard difficulty level, the player incurs 1 HP damage at the start
 *   of _their_ turn, _not_ the boss's turn.
 *
 * I did a breadth first search of the entire decision tree, pruning branches
 * where the amount of mana spent already exceeded the amount of the best
 * branch found so far. To facilitate testing the game engine, I broke the code
 * that transitions from one state to the next states into a separate module.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solve = input => {
  const boss = parse(input);
  return [ false, true ].map(hard => run(ME, boss, hard))
};

/**
 * Returns an object represeting the boss's stats, having `hp` and `damage`
 * properties.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the boss stats
 */
const parse = input => Object.fromEntries(
  Object.entries(
    input.match(INPUT_REGEXP).groups
  ).map(([ key, value ]) => [ key, parseInt(value, 10) ])
);

/**
 * Performs a depth first search of the game space and returns the lowest
 * possible mana cost for a victorious branch.
 * 
 * @param {Object} me - the player stats
 * @param {number} me.hp - hit points
 * @param {number} me.armor - armor
 * @param {number} me.mana - mana available
 * @param {number} me.spent - mana spent
 * @param {Object} boss - the boss's stats
 * @param {number} boss.hp - hit points
 * @param {number} boss.damage - attack damage
 * @param {boolean} hard - whether to play at hard difficulty
 * @returns {number} - minimum possible mana cost for victory
 */
const run = (me, boss, hard) => {
  const queue = [ {
    me: {
      ...{ ...me },
      spent: 0,
    },
    boss: { ...boss },
    effects: [],
    hard,
    myTurn: true,
  } ];
  let best = { me: { spent: Infinity } };

  do {
    const state = queue.shift();

    if (state.me.spent >= best.me.spent) {
      continue; // spent too much mana; prune this branch
    }

    const results = doTurn(state);
    results.forEach(result => {
      if (result.boss.hp <= 0) { // boss is dead
        if (result.me.spent < best.me.spent) {
          best = result; // found new best result
        }
      } else if (result.me.hp > 0) { // player is still alive
        queue.push(result);
      }
    });
  } while (queue.length);

  return best.me.spent;
};

module.exports = solve;
