const REGEXP = /Hit Points: (?<hp>\d+)\s+Damage: (?<damage>\d+)\s+Armor: (?<armor>\d+)/;
const ME = { cost: 0, hp: 100, damage: 0, armor: 0 };
const WEAPONS = [
  [ [ 'cost',  8 ], [ 'damage', 4 ] ], // Dagger
  [ [ 'cost', 10 ], [ 'damage', 5 ] ], // Shortsword
  [ [ 'cost', 25 ], [ 'damage', 6 ] ], // Warhammer
  [ [ 'cost', 40 ], [ 'damage', 7 ] ], // Longsword
  [ [ 'cost', 74 ], [ 'damage', 8 ] ], // Greataxe
];
const ARMOR = [
  [],                                  // (no armor)
  [ [ 'cost',  13 ], [ 'armor', 1 ] ], // Leather
  [ [ 'cost',  31 ], [ 'armor', 2 ] ], // Chainmail
  [ [ 'cost',  53 ], [ 'armor', 3 ] ], // Splintmail
  [ [ 'cost',  75 ], [ 'armor', 4 ] ], // Bandedmail
  [ [ 'cost', 102 ], [ 'armor', 5 ] ], // Platemail
];
const RINGS = [
  [],                                   // (no ring)
  [ [ 'cost',  25 ], [ 'damage', 1 ] ], // Damage +1
  [ [ 'cost',  50 ], [ 'damage', 2 ] ], // Damage +2
  [ [ 'cost', 100 ], [ 'damage', 3 ] ], // Damage +3
  [ [ 'cost',  20 ], [ 'armor',  1 ] ], // Defense +1
  [ [ 'cost',  40 ], [ 'armor',  2 ] ], // Defense +2
  [ [ 'cost',  80 ], [ 'armor',  3 ] ], // Defense +3
];
const RING_COMBINATIONS = (() => {
  const combinations = [ [ RINGS[0], RINGS[0] ] ];
  
  const max = RINGS.length - 1;

  for (let i = 0; i < max; i++) {
    const ring1 = RINGS[i];

    for (let j = i + 1; j < RINGS.length; j++) {
     combinations.push([ ring1, RINGS[j] ]);
    }
  }

  return combinations;
})();
const PARTS = [
  {
    startCost: Infinity,
    isBetter: (won, cost, bestCost) => won && cost < bestCost,
  },
  {
    startCost: -1,
    isBetter: (won, cost, bestCost) => !won && cost > bestCost,
  },
];

/**
 * # [Advent of Code 2015 Day 21](https://adventofcode.com/2015/day/21)
 *
 * The steps to solve both parts are:
 * 
 * 1. Parse the input to get the boss's beginning stats.
 * 2. Generate a list of all possible permutations of gear.
 * 3. Iterate the gear permutations:
 *    1. Produce my stats for the battle with this gear.
 *    2. Simulate the battle.
 *    3. Compare the results against the best result so far for each part, and
 *       track the best ones.
 * 4. Return the cost of the best battle for each part.
 *
 * ## Parse Input
 *
 * This was straightforward: I just wrote a simple regular expression to
 * extract the stats, then converted each captured value to a number.
 *
 * ## Generate Gear Permutations
 *
 * For each permutation, we had to have exactly one weapon, no more than one
 * armor, and no more than two rings (which must be different from one
 * another). Some things I did to simplify this:
 *
 * - Each item is represented as an array of attribute value deltas. For
 *   example, the Bandedmail item has two attribute deltas: `cost=75` and
 *   `armor=4`. This allows an array of items to easily be iterated to sum
 *   up the attributes.
 * - I created an empty attribute entry to represent "no armor", and one to
 *   represent "no ring". (I didn't do this for weapons because the puzzle text
 *   specifies that you must have a weapon.)
 * - I built an array of ring combinations. This had to ensure that the same
 *   ring didn't appear twice in the same combination, and that the case where
 *   no ring is worn on either finger is covered.
 * - I used a generator function to produce the final list of gear
 *   permutations: I simply iterated the weapon options, then the armor
 *   options, then the ring combinations. For each of those cases, I could then
 *   assemble the selected gear into an array and yield it.
 *
 * ## Produce Stats
 *
 * With any given gear permutation, generating the stats is easy. I start with
 * the baseline stats of 0 cost, 0 damage, and 0 armor. I iterate the
 * attributes of each item in the gear loadout, adding the value of each to its
 * corresponding property on the baseline stats. When I'm done, I have the
 * player's stats for the battle.
 *
 * ## Simulate the Battle
 *
 * It's tempting to write something that takes turns deducting HP from each
 * combatant, but you don't need to. Each combatant does the same amount of
 * damage every turn, so all you have to do is compute how many turns it would
 * take for each combatant to kill their opponent: divide the opponent's HP by
 * the combatant's damage per turn (rounded up). If the player requires equal
 * or fewer turns, they win.
 *
 * ## Track Best Results
 *
 * What is considered "best" differs between the two parts:
 *
 * - Part 1: The cheapest loadout that results in player victory
 * - Part 2: The most expensive loadout that results in player defeat
 *
 * I encapsulated these differences into an object for each part, containing
 * the following:
 *
 * - The "starting best cost": a value that is guaranteed to be worse than the
 *   cost of any potential loadout. This made it so I didn't have to `null`
 *   check for the first battle. For part one, it's `Infinity`; for part two,
 *   it's `-1`.
 * - The comparator function that determines whether a particular outcome is
 *   better than the best one so far.
 *
 * With this, I could make a single pass through the gear loadouts and track
 * the best result for each part. After all gear permutations had been
 * evaluated, I simply return the costs of the best results.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solver = input => {
  const boss = parse(input);
  let best = PARTS.map(part => ({ cost: part.startCost }));
  const iter = buildGearPermutationIterator();

  for (let entry = iter.next(); !entry.done; entry = iter.next()) {
    const me = equip(entry.value);
    const won = battle(me, { ...boss });
    PARTS.forEach(({ isBetter }, i) => {
      if (isBetter(won, me.cost, best[i].cost)) {
        best[i] = me;
      }
    });
  }

  return best.map(entry => entry.cost);
};

/**
 * Extracts the boss stats from the input.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the boss stats
 */
const parse = input => Object.fromEntries(
  Object.entries(input.match(REGEXP).groups)
    .map(entry => [ entry[0], parseInt(entry[1]) ])
);

/**
 * Returns the player's starting stats with the given gear loadout. The loadout
 * is an array containing the items the player is wearing. Each item is
 * represented by an array of attribute deltas applied by that item.
 *
 * @param {Array<Array>} gear - the gear the player is wearing
 * @returns {Object} - the player's stats
 */
const equip = gear => gear.reduce((stats, item) => {
  item.forEach(([ key, value ]) => {
    stats[key] += value;
  });
  return stats;
}, { ...ME, gear });

/**
 * Produces an iterator for all possible permutations of gear.
 *
 * @returns {Iterator<Array<Array>>} - the gear permutation iterator
 */
function* buildGearPermutationIterator() {
  for (const weapon of WEAPONS) {
    for (const armor of ARMOR) {
      for (const rings of RING_COMBINATIONS) {
        yield [ weapon, armor, ...rings ];
      }
    }
  }
}

/**
 * Determines who wins the battle between the two given combatants.
 *
 * @param {Object} me - the player's stats
 * @param {Object} boss - the boss's stats
 * @returns {boolean} - `true` for player victory, `false` for boss victory
 */
const battle = (me, boss) => {
  const myDamagePerTurn = Math.max(me.damage - boss.armor, 1);
  const myTurnsToWin = Math.ceil(boss.hp / myDamagePerTurn);
  const bossDamagePerTurn = Math.max(boss.damage - me.armor, 1);
  const bossTurnsToWin = Math.ceil(me.hp / bossDamagePerTurn);
  return myTurnsToWin <= bossTurnsToWin;
};

solver.battle = battle;
module.exports = solver;
