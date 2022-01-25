const Math2 = require('../math2');
const { match } = require('../util');
const CircularLinkedList = require('../circular-linked-list');

const INPUT_REGEXP = /(?<playerCount>\d+) players; last marble is worth (?<lastMarble>\d+) points/g;

/**
 * # [Advent of Code 2018 Day 9](https://adventofcode.com/2018/day/9)
 *
 * Using a normal dynamic array for storing the marbles in the circle works
 * fine for part one, but is too slow for part two, because inserting and
 * removing element is inefficient. Instead, we use a
 * [circular linked list](https://en.wikipedia.org/wiki/Linked_list#Circularly_linked_list)
 * to store the marbles. Inserts and removals are much faster because no
 * element shifting is required.
 *
 * @param {string} input - the puzzle input
 * @param {number} part - the puzzle part to run
 * @returns {Array|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  const { playerCount, lastMarble } = match(input, INPUT_REGEXP, {
    playerCount: Number,
    lastMarble: Number,
  })[0];
  const parts = [ 1, 100 ];

  if (part) {
    return game(playerCount, parts[part - 1] * lastMarble);
  }

  return parts.map(
    multiplier => game(playerCount, lastMarble * multiplier)
  );
};

/**
 * Runs the marble game with the given number of players and marbles, and
 * returns the winning player's score.
 *
 * @param {number} playerCount - the number of players
 * @param {number} lastMarble - the value of the last marble to play
 * @returns {number} - the winner's score
 */
const game = (playerCount, lastMarble) => {
  const scores = new Array(playerCount).fill(0);
  const circle = new CircularLinkedList();
  circle.insertAfter(0);

  for (let turn = 1; turn <= lastMarble; turn++) {
    if (turn % 23 === 0) {
      const player = turn % playerCount;
      circle.rotate(-7);
      scores[player] += turn + circle.remove();
    } else {
      circle.rotate(1);
      circle.insertAfter(turn);
    }
  }

  return Math2.max(scores);
};
