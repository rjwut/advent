const { split } = require('../util');

/**
 * # [Advent of Code 2020 Day 22](https://adventofcode.com/2020/day/22)
 *
 * This is one of the easiest of the later puzzles if you're comfortable with
 * recursion. I created a `play()` function that accepts two arguments:
 *
 * - an array containing each player's deck
 * - a rules object that describes the unique rules for the game
 *
 * The `play()` function returns the index of the game winner. The rules object
 * has two methods:
 *
 * - `isInInfiniteLoop()`: Returns `true` if player 1 should win due to the
 *   infinite loop rule of part two.
 *   - For part one, this method always returns `false`.
 *   - For part two, this method compares the current game state against the
 *     states stored in a given `Set`. If it finds a matching state, it returns
 *     `true` to indicate that the game has looped. Otherwise, the current game
 *     state is added to the `Set`. Game states are strings which are created
 *     by serializing the array containing the players' decks as JSON.
 * - `resolvePlays()`: Returns the index of the winning player, given their
 *   decks and the cards they played.
 *   - For part one, this method simply returns the index of the player who
 *     played the higher-numbered card.
 *   - For part two, it checks to see if both players played a number higher
 *     than or equal to the size of their current deck. If so, it creates a new
 *     deck for each player by `slice()`ing their deck to get a sub-deck that
 *     contains the indicated number of cards, then passes the sub-decks into
 *     `play()` to play the recursed game, then returns the index that `play()`
 *     returns. If either player didn't have enough cards for the recursed
 *     game, it uses part one's rule to determine the winner instead.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const decks = parse(input);
  return [ rules1, rules2 ].map(rules => {
    const clonedDecks = cloneDecks(decks);
    const winner = play(clonedDecks, rules);
    return computeScore(clonedDecks[winner]);
  });
};

/**
 * Parses the puzzle input into two arrays of numbers.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - contains two arrays, one for each deck
 */
const parse = input => split(input, { group: true })
    .map(group => group.slice(1).map(line => parseInt(line, 10)));

/**
 * Clones the given decks. This is used at the start of each puzzle part so
 * that we don't accidentally alter the starting game state for part two.
 *
 * @param {Array} decks - the player decks
 * @returns {Array} - the cloned decks
 */
const cloneDecks = decks => decks.map(deck => [ ...deck ]);

/**
 * Plays a game, starting with the given decks for the players, using the
 * indicated ruleset.
 *
 * @param {Array} decks - the starting player decks 
 * @param {Object} rules - the rules for the game
 * @returns {number} - the index of the winner
 */
const play = (decks, rules) => {
  const states = new Set();

  do {
    if (rules.isInInfiniteLoop(states, decks)) {
      return 0;
    }

    // Take a card from each player's deck.
    const plays = decks.map(deck => deck.shift());

    // Ask the rules who won.
    const winnerIndex = rules.resolvePlays(decks, plays);

    // Put the played cards at the bottom of the winner's deck.
    const loserIndex = winnerIndex === 0 ? 1 : 0;
    const winnerDeck = decks[winnerIndex];
    winnerDeck.push(plays[winnerIndex]);
    winnerDeck.push(plays[loserIndex]);
  } while (decks.every(deck => deck.length)); // play until someone runs out

  const winnerIndex = decks[0].length ? 0 : 1;
  return winnerIndex;
};

/**
 * The rules for part one.
 */
const rules1 = {
  /**
   * Returns `false`, indicating that nobody ever wins using the infinite loop
   * rule in part one, since we only use that rule for part two.
   * @returns {boolean} - always false
   */
  isInInfiniteLoop: () => false,

  /**
   * Returns the index of the player who played the higher card.
   * @param {Array} _ - argument ignored
   * @param {Array} plays - the cards played by each player 
   * @returns {number} - the index of the winning player
   */
  resolvePlays: (_, plays) => plays[0] > plays[1] ? 0 : 1,
};

/**
 * The rules for part two.
 */
const rules2 = {
  /**
   * Returns `true` if the current state of the decks is present in the
   * `states` `Set`; otherwise, the current decks state is stored in `states`.
   * Deck state is represented as the JSON serialization of `decks`.
   * @param {Set} - the previous game states
   * @param {Array} - the players' decks
   * @returns {boolean} - if we've reached an infinite loop
   */
   isInInfiniteLoop: (states, decks) => {
    const state = JSON.stringify(decks);

    if (states.has(state)) {
      return true;
    }

    states.add(state);
    return false;
  },

  /**
   * Returns the index of the player who wins this round. This may invoke
   * `play()` if a recursive game is required to determine the winner.
   * @param {Array} decks - the players' decks
   * @param {Array} plays - the cards played by each player 
   * @returns {number} - the index of the winning player
   */
  resolvePlays: (decks, plays) => {
    if (plays.every((play, i) => decks[i].length >= play)) {
      const subgameDecks = decks.map((deck, i) => deck.slice(0, plays[i]));
      return play(subgameDecks, rules2);
    }

    return rules1.resolvePlays(null, plays);
  },
};

/**
 * Computes the score for the given deck.
 *
 * @param {Array} deck - the deck for which to compute the score 
 * @returns {number} - the computed score
 */
const computeScore = deck => deck.reverse()
  .reduce((score, card, i) => score + card * (i + 1), 0);
