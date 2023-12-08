const { split } = require('../util');

// Predicates describing each hand type, in order of strength
const HandType = [
  groups => groups.length === 1, // five of a kind
  groups => groups.includes(4),  // four of a kind
  groups => groups.length === 2, // full house
  groups => groups.includes(3),  // three of a kind
  groups => groups.length === 3, // two pair
  groups => groups.length === 4, // pair
  () => true,                    // high card
];

/**
 * Detects the hand type for the given cards. This function does not consider wild cards.
 *
 * @param {string} cards - the cards, as a string like `'7K4JK'`
 * @returns {number} - the index of the detected hand type
 */
HandType.detect = cards => {
  const groups = groupCards(cards);
  return HandType.findIndex(predicate => predicate(groups));
};

const RANKS = [
  [ 'A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2' ], // part 1
  [ 'A', 'K', 'Q', 'T', '9', '8', '7', '6', '5', '4', '3', '2', 'J' ], // part 2
];
const WILD_REPLACEMENTS = RANKS[1].slice(0, RANKS[1].length - 1);

// Comparator functions to sort cards for each part
const COMPARATORS = [
  (h1, h2) => Hand.compare(h1, h2, 0),
  (h1, h2) => Hand.compare(h1, h2, 1),
];

/**
 * # [Advent of Code 2023 Day 7](https://adventofcode.com/2023/day/7)
 *
 * ## Required Capabilities
 *
 * - Parse input into hands with bid values
 * - Consider wild cards when determining hand type in part two
 * - Sort hands by type then card rank (treating `J` differently in each part)
 * - Compute a hand's score
 *
 * ## Determining Hand Type
 *
 * For determining the hand type, the actual ranks of the cards don't matter, only how many of each
 * rank there are. So we can group the cards by rank, then produce an array of the number of cards
 * in each group. For example, a full house would be `[ 3, 2 ]` (or `[ 2, 3 ]`; order doesn't
 * matter). The hand types can be detected by examining the values in this array. So we can write a
 * predicate to identify a hand type by passing in the array of group sizes. For example, in five
 * of a kind, there is only one group, so you can identify it with this predicate:
 *
 * ```js
 * groups => groups.length === 1
 * ```
 *
 * If we iterate the hand type predicates from strongest to weakest, later predicates can assume
 * that the input doesn't match any of the previous predicates. This simplifies later predicates.
 * For example, there are only two ways to split a hand of five cards into two groups: `[ 4, 1 ]`
 * (four of a kind) and `[ 3, 2 ]` (full house). We can indentify four of a kind by checking if the
 * array contains a `4`, since no other hand type can have a group of four. The full house
 * predicate only has to confirm that there are two groups, since if we're testing for full house,
 * four of a kind has already been ruled out, and therefore there can't be a group of four. The
 * last predicate (high card) will be a "catch all" predicate, matching anything that didn't match
 * the previous predicates.
 *
 * The table below shows the hand types, what the groups look like for a match, and the condition
 * that each predicate will test:
 *
 * |       Hand Type | Groups              | Condition             |
 * | --------------: | :------------------ | :-------------------- |
 * |  five of a kind | `[ 5 ]`             | `groups.length === 1` |
 * |  four of a kind | `[ 4, 1 ]`          | `groups.includes(4)`  |
 * |      full house | `[ 3, 2 ]`          | `groups.length === 2` |
 * | three of a kind | `[ 3, 1, 1 ]`       | `groups.includes(3)`  |
 * |        two pair | `[ 2, 2, 1 ]`       | `groups.length === 3` |
 * |            pair | `[ 2, 1, 1, 1 ]`    | `groups.length === 4` |
 * |       high card | `[ 1, 1, 1, 1, 1 ]` | `true`                |
 *
 * With the above array of predicates, a hand type can be represented as the index of the first
 * predicate that matched the hand, so we can detect the hand type with `Array.findIndex()`.
 *
 * ## Hand Type When Jokers Are Wild
 *
 * In part two, `J` represents jokers instead of jacks, and jokers are wild. So each hand will
 * actually have two types, one for each part. After computing the part one type, we iterate the
 * ranks (high to low, omitting `J`), and replace each instance of `J` in the original hand with
 * the current rank. We then compute the type of the resulting hand as above. If that type is
 * better or equal in strength to the part one type, we use that type instead for part two.
 * Otherwise, we use the part one type for part two.
 *
 * ## Sorting Hands
 *
 * To sort an array of hands, we first compare the hand types as described above. If the types for
 * two hands are the same, we then iterate the cards and compare them in order of rank. Note that
 * `J` is the weakest rank in part two.
 *
 * ## Computing a Hand's Score
 *
 * Once the hands are sorted from strongest to weakest, the score for the hand is simply its bid
 * times its (one-based) position in the sorted array.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const hands = split(input).map(line => new Hand(line));
  return [ 0, 1 ].map(part => hands.sort(COMPARATORS[part])
      .reduce((score, hand, i) => score + (i + 1) * hand.bid, 0)
  );
};

/**
 * Represents a hand of cards.
 */
class Hand {
  /**
   * Computes the hand type for each part of the puzzle. The returned array contains two integers,
   * each representing the sort order of the detected hand type for that part:
   *
   * 0. five of a kind
   * 1. four of a kind
   * 2. full house
   * 3. three of a kind
   * 4. two pair
   * 5. pair
   * 6. high card
   *
   * @param {string} cards - the cards, as a string like `'7K4JK'`
   * @returns {Array<number>} - the sort order of the detected hand type for each part
   */
  static computeTypes(cards) {
    const typeWithoutWild = HandType.detect(cards);
    const types = [ typeWithoutWild, typeWithoutWild ];

    if (cards.includes('J')) {
      let bestType = WILD_REPLACEMENTS.reduce((bestType, rank) => {
        const cards2 = cards.replaceAll('J', rank);
        const type = HandType.detect(cards2);
        return Math.min(bestType, type);
      }, Infinity);

      if (bestType <= typeWithoutWild) {
        types[1] = bestType;
      }
    }

    return types;
  }

  /**
   * Compares two hands for sorting, first by type, then by hand.
   *
   * @param {Hand} h1 - the first `Hand` to compare
   * @param {Hand} h2 - the second `Hand` to compare
   * @param {number} part - `0` for the first part of the puzzle, `1` for the second
   * @returns {number} - a comparison value as expected by `Array.sort()`
   */
  static compare(h1, h2, part) {
    const ranks = RANKS[part];
    let c = h2.types[part] - h1.types[part];

    for (let i = 0; c === 0 && i < h1.cards.length; i++) {
      c = ranks.indexOf(h2.cards[i]) - ranks.indexOf(h1.cards[i]);
    }

    return c;
  }

  #cards;
  #bid;
  #types;

  /**
   * Parses the given input line into a `Hand`.
   *
   * @param {*} line
   */
  constructor(line) {
    const [ cards, bid ] = line.split(' ');
    this.#cards = cards;
    this.#bid = parseInt(bid, 10);
    this.#types = Hand.computeTypes(this.#cards);
  }

  /**
   * @returns {string} - the cards in this `Hand`, as a string like `'7K4JK'`
   */
  get cards() {
    return this.#cards;
  }

  /**
   * @returns {number} - the bid for this `Hand`
   */
  get bid() {
    return this.#bid;
  }

  /**
   * @returns {Array<number>} - the sort order of the detected hand type for each part
   */
  get types() {
    return this.#types;
  }
}

/**
 * Given the cards in a hand, groups the cards by rank, then returns an array describing how many
 * cards are in each group. For example, `'K77KK'` (a full house) would return `[ 3, 2 ]`. (A
 * return value of `[ 2, 3 ]` would also constitute a full house.)
 *
 * @param {string} cards - the cards in this `Hand`, as a string like `'7K4JK'`
 * @returns {Array<number>} - the number of cards in each distinct rank in the hand
 */
const groupCards = cards => {
  const map = [ ...cards ].reduce((groups, card) => {
    groups.set(card, (groups.get(card) ?? 0) + 1);
    return groups;
  }, new Map());
  return [ ...map.values() ];
};
