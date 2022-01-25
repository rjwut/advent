const Battlefield = require('./day-15.battlefield');
const buildRules = require('./day-15.rules');

/**
 * # [Advent of Code 2018 Day 15](https://adventofcode.com/2018/day/15)
 *
 * This puzzle really tests your ability to carefully read and implement the
 * specification; there are lots of little details in the rules that will mess
 * things up if you get them wrong. The explanation of the rules in the puzzle
 * is accurate, but could be stated more clearly:
 *
 * 1. "Reading order" is the term the puzzle uses for the manner in which ties
 *    are broken when making decisions. It refers to the direction in which one
 *    reads English text (given that the puzzle is written in English): line
 *    by line, top to bottom, with each line processed left to right. Thus, the
 *    upper-left square comes first, then the square to its right, and so on
 *    for the entire row, before starting on the next row. A square that comes
 *    earlier in reading order has priority over one that comes later.
 * 2. The order in which the units will be processed is reading order at the
 *    start of the round. Unit movements during a round do not change their
 *    move order until the next round.
 * 3. Combat ends immediately as soon as you start to process a unit and it has
 *    no living enemies. This means that a round may be interrupted before all
 *    units have moved. If this happens, that round is considered incomplete
 *    and isn't included in the outcome computation. If, however, the last
 *    enemy is killed by the last unit processed in the round, it is considered
 *    a complete round.
 * 4. In every round, each unit may choose to move or not, then choose to
 *    attack or not.
 * 5. A unit may not move into a square occupied by a wall or another living
 *    unit. Corpses of units do not impede movement.
 * 5. If a unit is already standing next to an enemy, it will not move.
 * 6. If the unit is not already standing next to an enemy, it will seek the
 *    square adjacent to an enemy that requires the fewest steps to reach. If
 *    there is more than one such square, it will choose the one that comes
 *    first in reading order. If no such square is reachable, the unit will not
 *    move.
 * 7. When the target square is determined, the unit will find the shortest
 *    path to that square, then take the first step on that path. If there are
 *    multiple paths of equal length to that square with different first steps,
 *    the first step whose square comes first in reading order is chosen.
 * 8. After a unit has moved (or not), if the unit is next to an enemy, it will
 *    attack that enemy. If it is next to multiple enemies, they are
 *    prioritized first by lowest HP, then by reading order.
 * 9. When attacked, a unit's hit points are reduced by the attacker's attack
 *    power (`3` by default). If a unit's hit points reach `0` or less, it is
 *    killed.
 *
 * The trickiest part is getting the movement rules just right. Any path that
 * leads to a square adjacent to an enemy and does not pass through a wall or
 * another unit is valid. The paths are prioritized first by number of steps,
 * then by reading order of the target square, then by reading order of the
 * first step's square.
 *
 * This touches upon something that the instructions are slightly misleading
 * about. The puzzle instructions describe step 7 above like this:
 *
 * > The unit then takes a single **step** toward the chosen square along the
 * > **shortest path** to that square. If multiple steps would put the unit
 * > equally closer to its destination, the unit chooses the step which is
 * > first in reading order. (This requires knowing when there is **more than
 * > one shortest path so that you can consider the first step of each such
 * > path.)
 *
 * This may lead you to think that you have to keep track of all equal length
 * paths when performing pathfinding. In reality, you can consider the reading
 * order position of the target square and the reading order position of the
 * first step's square as part of the path's "weight" while pathfinding. It's
 * useful to think in terms of the "best" path rather than the shortest, since
 * length is only the first of the three factors to consider.
 *
 * I created additional modules to break up the solution:
 *
 * - `battlefield`: Responsible for parsing the input, locating and tracking
 *   units, reporting adjacent enemies and empty spaces, and computing the
 *   outcome score.
 * - `unit`: Holds the state of an individual unit and computes distances from
 *   itself to other locations.
 * - `rules`: Encodes all rules about moving and attacking except for the
 *   actual pathfinding.
 * - `dijkstra`: Pathfinding using a modified
 *   [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm).
 *
 * Once you get the answer to part one, that's about 95% of the work done. For
 * part two, I just had to modify the existing code in the following ways:
 *
 * - Permit the AP for the elves to be specified at the start.
 * - Optionally stop simulating the battle when the first elf dies.
 *
 * With those changes, I simply run the simulation repeatedly, incrementing elf
 * attack power each time until no elves die.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  let ap = 3;
  let battlefield = new Battlefield(input, ap);
  runBattle(battlefield, 1);
  const part1 = battlefield.outcome;

  do {
    battlefield = new Battlefield(input, ++ap);
    runBattle(battlefield, 2);
  } while (battlefield.elfDeaths !== 0);

  return [ part1, battlefield.outcome ];
};

/**
 * Runs a single battle simulation.
 *
 * @param {Battlefield} battlefield - the `Battlefield` object
 * @param {number} part - the puzzle part (used to determine end conditions)
 */
const runBattle = (battlefield, part) => {
  //console.log('\u001b[2J\u001b[3J');
  const rules = buildRules(battlefield, part);
  // eslint-disable-next-line no-unused-vars
  const printBattlefield = () => {
    console.log(
      '\u001b[1;1H' +
      battlefield.toString()
        .replaceAll('#', '\u001b[30;1m#\u001b[0m')
        .replaceAll('E', '\u001b[36;1mE\u001b[0m')
        .replaceAll('G', '\u001b[32;1mG\u001b[0m')
        .replaceAll('.', ' ')
    );
  };

  do {
    const units = battlefield.units;

    for (let unit of units) {
      if (!unit.alive) {
        continue;
      }

      if (rules.isBattleOver()) {
        return;
      }

      rules.go(unit);
    }

    battlefield.endRound();
  } while (true);
};
