const { split } = require('../util');

const UNIVERSE_SPLITS = [
  { move: 3, universes: 1 },
  { move: 4, universes: 3 },
  { move: 5, universes: 6 },
  { move: 6, universes: 7 },
  { move: 7, universes: 6 },
  { move: 8, universes: 3 },
  { move: 9, universes: 1 },
];

/**
 * # [Advent of Code 2021 Day 21](https://adventofcode.com/2021/day/21)
 *
 * The 100-sided deterministic die from part one is simpler than it might first
 * appear. Since there are only 10 positions on the circular board, only the
 * ones digit from the sum of the three rolls is actually important. Moreover,
 * there is a pattern to them:
 *
 * | Roll 1 | Roll 2 | Roll 3 | Total |
 * | -----: | -----: | -----: | ----: |
 * |      1 |      2 |      3 |     6 |
 * |      4 |      5 |      6 |    15 |
 * |      7 |      8 |      9 |    24 |
 * |     10 |     11 |     12 |    33 |
 * |     13 |     14 |     15 |    42 |
 * |     13 |     14 |     15 |    51 |
 *
 * Each set of three rolls sums to the previous three rolls' sum plus nine. The
 * ones digit follows the pattern `6`, `5`, `4`, `3`, `2`, `1`, `0`, `9`, `8`,
 * `7`, `6`, .... I implemented a generator function to produce this pattern.
 * Then we just simulate the game, counting the number of times that the die is
 * rolled as we go along. When the game ends, we just multiply the losing
 * player's score by the number of die rolls for our answer.
 *
 * Part two requires an entirely different approach. In the example problem,
 * the game was played in 786,316,482,957,123 different universes, far too many
 * for us to directly simulate. Instead, we'll use a `Map` to keep track of how
 * many universes are currently in a particular state. The game state is
 * represented by a string key in the format: `<p1>,<p2>,<s1>,<s2>`, where `p1`
 * and `p2` are the player positions, and `s1` and `s2` are the player scores.
 * There are only 10 possible positions for each player and 21 possible scores
 * (0 - 20, since we don't need to track a game anymore once someone reaches 21
 * points). With two players, that's `10 * 10 * 21 * 21`, or 44,100 possible
 * game states, far more reasonable for simulation. In reality, the number is
 * less because some combinations are impossible under the game rules. (For
 * example, you can't have one player close to winning while the other is still
 * at zero points.) And you'd never have all the possible states at once,
 * anyway.
 *
 * Next, we need to know how many moves a player makes in how many universes
 * when they roll the Dirac die. Since the universe splits in three each time
 * it is rolled, and it is rolled three times per turn, each turn multiplies
 * the number of universes in which the game is being played by 27. However,
 * there are only seven different numbers of moves that can result from the
 * three rolls. In one universe, the player rolls three 1s, for a total of
 * three spaces moved. There are three different universes in which the player
 * rolled two 1s and a 2, for a total of four spaces. The most common number of
 * moves in a single turn is six, with a total of seven universes in which the
 * player rolls that amount. The breakdown looks like this:
 *
 * | Moves | Universes |
 * | ----: | --------: |
 * |     3 |         1 |
 * |     4 |         3 |
 * |     5 |         6 |
 * |     6 |         7 |
 * |     7 |         6 |
 * |     8 |         3 |
 * |     9 |         1 |
 *
 * We start with the `Map` containing just one entry, the starting state, which
 * exists in just one universe. We then run the simulation of turns across all
 * universes until all the games have ended (the `Map` is empty). Each turn
 * looks like this:
 *
 * 1. Create a new `Map` for the game states created by this turn.
 * 2. Iterate over all the current game states:
 *    1. For each game state, iterate over all the possible moves:
 *       1. Multiply the number of universes in the previous state by the
 *          number of generated universes would have this number of moves. This
 *          is the number of universes in this new state from this move.
 *       2. Create the new game state.
 *       3. If this new game state constitutes a win for the current player,
 *          add the number of generated universes to that player's win counter.
 *       4. If the current player has not won yet, look up the new game state
 *          in the `Map`. If it does not exist, store the number of generated
 *          universes under that key in the `Map`. If it does exist, add the
 *          number of generated universes to the existing value.
 * 3. Replace the current game states `Map` with the new one.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const positions = parse(input);
  return [ part1(positions), part2(positions) ];
};

/**
 * Parses the starting position of each player.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the starting positions
 */
const parse = input => split(input)
  .map(line => parseInt(line.split(': ')[1], 10))

/**
 * Runs the game to 1000 points using the deterministic die.
 *
 * @param {Array} positions - the starting positions
 * @returns {number} - the losing player's score times the number of die rolls
 */
const part1 = positions => {
  positions = [ ...positions ];
  const scores = new Array(positions.length).fill(0);
  const die = deterministicDie();
  let turn = 0, rollCount = 0;

  do {
    const rolls = die.next().value;
    rollCount += 3;
    let newPosition = positions[turn] + rolls;

    if (newPosition > 10) {
      newPosition -= 10;
    }

    positions[turn] = newPosition;
    const newScore = scores[turn] + newPosition;
    scores[turn] = newScore;
    turn = (turn + 1) % scores.length;

    if (newScore >= 1000) {
      break;
    }
  } while (true);

  return scores[turn] * rollCount;
};

/**
 * Runs the game in all universes to 21 points using the Dirac die.
 *
 * @param {Array} positions - the starting positions
 * @returns {number} - the number of universes in which the winning player won
 */
const part2 = positions => {
  let universes = new Map();
  let nextUniverses = new Map();
  universes.set(`${positions[0]},${positions[1]},0,0`, 1);
  const wins = [ 0, 0 ];
  let turn = 0;

  do {
    for (let [ key, count ] of universes.entries()) {
      const args = key.split(',').map(Number);
      const positions = args.slice(0, 2);
      const scores = args.slice(2);
      UNIVERSE_SPLITS.forEach(split => {
        const newPositions = [ ...positions ];
        let newPosition = newPositions[turn] + split.move;

        if (newPosition > 10) {
          newPosition -= 10;
        }

        newPositions[turn] = newPosition;
        const newScore = scores[turn] + newPosition;
        const newCount = count * split.universes;

        if (newScore > 20) {
          wins[turn] += newCount;
        } else {
          const newScores = [ ...scores ];
          newScores[turn] = newScore;
          const newKey = `${newPositions.join()},${newScores.join()}`;
          let prevCount = nextUniverses.get(newKey) || 0;
          nextUniverses.set(newKey, prevCount + newCount);
        }
      });
    }

    universes = nextUniverses;
    nextUniverses = new Map();
    turn = (turn + 1) % 2;
  } while (universes.size > 0);

  return Math.max(...wins);
};

/**
 * Generator function to produce the die rolls for the deterministic die. This
 * generator produces `6`, `5` `4`, `3`, `2`, `1`, `9`, `8`, `7`, `6`, ....
 *
 * @yields {number} - the die rolls
 */
function* deterministicDie() {
  let value = 6;

  while (true) {
    yield value;
    value--;

    if (value === -1) {
      value = 9;
    }
  }
}
