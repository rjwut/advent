const dijkstra = require('./day-15.dijkstra');

const SQUARE_SORT = (a, b) => a.r === b.r ? a.c - b.c : a.r - b.r;
const ENEMY_SORT = (a, b) => a.hp === b.hp ? SQUARE_SORT(a, b) : a.hp - b.hp;

/**
 * Produces an object that manages the rules for conducting the battle.
 *
 * @param {Battlefield} battlefield - the `Battlefield` object
 * @param {number} part - the puzzle part (used to determine end conditions)
 * @returns {Object} - the API for managing the battle simulation
 */
module.exports = (battlefield, part) => {
  /**
   * Returns whether only one faction is left alive.
   *
   * @returns {boolean} - `true` if only one faction remains; `false` otherwise
   */
  const oneFactionRemains = () => {
    let seen;

    for (let unit of battlefield.units) {
      if (!unit.alive) {
        continue;
      }

      if (seen) {
        if (seen !== unit.faction) {
          return false;
        }
      } else {
        seen = unit.faction;
      }
    }

    return true;
  };

  const END_CONDITIONS = [
    oneFactionRemains,
    () => battlefield.elfDeaths !== 0 || oneFactionRemains(),
  ];

  /**
   * Returns whether the battle is over.
   *
   * @returns {boolean} - `true` if the battle's over; `false` otherwise
   */
  const isBattleOver = END_CONDITIONS[part - 1];

  /**
   * Performs the next move for the given `Unit`.
   *
   * @param {Unit} unit - the `Unit` to move
   */
  const move = unit => {
    const enemies = battlefield.getEnemies(unit.faction);

    if (enemies.some(enemy => unit.distance(enemy) === 1)) {
      return null; // already adjacent to an enemy
    }

    // Determine target squares
    const squares = [];
    enemies.forEach(enemy => {
      battlefield.getAdjacentSpaces(enemy).forEach(square => {
        if (!squares.find(s => s.r === square.r && s.c === square.c)) {
          squares.push(square);
        }
      });
    });
    const move = dijkstra(battlefield, unit, squares);

    if (move) {
      battlefield.moveUnit(unit, move);
    }
  };

  /**
   * Performs the next attack for the given `Unit`.
   *
   * @param {Unit} unit - the attacking `Unit`
   */
  const attack = unit => {
    const enemies = battlefield.getAdjacentEnemies(unit).sort(ENEMY_SORT);

    if (enemies.length) {
      battlefield.attack(unit, enemies[0]);
    }
  };

  /**
   * Performs this `Unit`'s turn.
   *
   * @param {Unit} unit - the `Unit` whose turn should be performed
   */
  const go = unit => {
    move(unit);
    attack(unit);
  }

  return { isBattleOver, go };
};
