const { max, min, multiply } = require('../math2');

/**
 * # [Advent of Code 2020 Day 23](https://adventofcode.com/2020/day/23)
 *
 * This day's puzzle is another game implementation, but it's harder than the
 * previous day's. A critical realization is that we only navigate the list
 * clockwise, so each cup only needs to know which cup is directly clockwise
 * from it. My initial approach was to create a
 * [singly-linked](https://en.wikipedia.org/wiki/Linked_list)
 * [circular buffer](https://en.wikipedia.org/wiki/Circular_buffer):
 *
 * ```txt
 * ────┐  ┌─────────┐  ┌─────────┐  ┌────
 * ... │  │ value=3 │  │ value=8 │  │ ...
 *   ─────→  next ─────→  next ─────→
 * ────┘  └─────────┘  └─────────┘  └────
 * ```
 *
 * This worked fine for part one, but the seeking behavior required made it too
 * inefficient for part two. Instead, I modeled the circular buffer with an
 * array, where each cup is represented by the element in the array at the
 * index which matches the cup's label, and the value stored there is the label
 * of the cup directly clockwise of that cup. Here's how the example list of
 * `389125467` would be stored in this structure:
 *
 * ```txt
 * index:   0   1   2   3   4   5   6   7   8   9
 *        ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
 * value: │   │ 2 │ 5 │ 8 │ 6 │ 4 │ 7 │ 3 │ 9 │ 1 │
 *        └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
 * ```
 *
 * This array is called `lookup`. So the label that comes after the label `x`
 * in the list is found with `lookup[x]`.
 * 
 * To move cups to another part of the list, assuming:
 *
 * - the current cup is called `current`
 * - the last cup to be moved is called `lastValue`
 * - the cup after which they will be moved is called `destination`
 *
 * ...the move is done as follows:
 *
 * 1. Set `lookup[current]` to be the first cup after the cups to be moved.
 * 2. Set `lookup[destination]` to be the first cup to be moved.
 * 3. Set `lookup[lastValue]` to be the cup that was after `destination`'
 *    before the move.
 *
 * The answer for part one is simply the concatenation of all the cups after
 * cup 1 in their final state after 100 rounds, in clockwise order. For part
 * two, you take the labels of the two cups immediately clockwise of cup 1,
 * multiply them together, and return the product.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const values = parse(input);
  return [ rules1, rules2 ].map(rules => {
    rules.buildInitialState(values);
    const list = buildCircularList(values);
    list.min = min(values);
    list.max = max(values);
    let current = values[0];

    for (let i = 0; i < rules.numberOfMoves; i++) {
      current = move(current, list);
    }

    return rules.getFinalValue(list);
  });
};

/**
 * Parses the input as individual digits.
 *
 * @param {string} input - the puzzle input
 * @returns {Array}
 */
const parse = input => [ ...input ].map(value => parseInt(value, 10));

/**
 * The game rules for part 1:
 * - Only the cups named in the input.
 * - 100 moves
 * - Puzzle answer is all the cup labels after cup 1 concatenated together.
 */
const rules1 = {
  buildInitialState: () => {},
  numberOfMoves: 100,
  getFinalValue: list => {
    const finalArray = list.toArray(1);
    return finalArray.slice(1).join('');
  }
};

/**
 * The game rules for part 2:
 * - All the cups named in the input, plus all higher labels up to and
 *   including 1,000,000.
 * - 10,000,000 moves
 * - Puzzle answer is the labels of the two cups after cup 1 multiplied
 *   together.
 */
const rules2 = {
  buildInitialState: values => {
    const max = Math.max(...values);

    for (let i = max + 1; i <= 1000000; i++) {
      values.push(i);
    }
  },
  numberOfMoves: 10000000,
  getFinalValue: list => multiply(list.getNextValues(1, 2)),
};

/**
 * Executes a single move.
 *
 * @param {number} currentValue - the label of the current cup
 * @param {Object} list - the list object
 * @returns {number} - the label of the next cup
 */
const move = (currentValue, list) => {
  // Step 1: Get the next three cups in the list.
  const toBeMoved = list.getNextValues(currentValue, 3);

  // Step 2: Select a destination cup:
  // 1. Subtract one from the current cup's label.
  // 2. If the value is included in the list of the cups to be moved, go to
  //    step 1.
  // 3. If the value is less than the lowest cup label, wrap around to the
  //    highest cup label.
  let destination = currentValue;

  do {
    destination--;

    if (destination < list.min) {
      destination = list.max;
    }
  } while (toBeMoved.includes(destination));

  // Step 3: Move the three cups immediately after the destination cup, in the
  // same order as they were in when they were removed.
  list.moveNext(currentValue, 3, destination);

  // Step 4: Set the new current cup to be the cup immediately after the
  // current cup.
  return list.getNext(currentValue);
};

/**
 * Builds an object that represents the circular buffer of cups and exposes an
 * API to inspect and manipulate it.
 *
 * @param {Array} values - the values to include in the list
 * @returns {Object} - the list API
 */
const buildCircularList = values => {
  const lookup = new Array(values.length + 1);
  values.forEach((value, i) => {
    let next = values[i === values.length - 1 ? 0 : i + 1];
    lookup[value] = next;
  });
  return {
    /**
     * Returns the value immediately following the current one in the list.
     * @param {number} value - the current value
     * @returns {number} - the next value
     */
    getNext: value => lookup[value],

    /**
     * Returns the specified number of values that immediately follow the
     * given value.
     * @param {number} current - the value found before the desired values 
     * @param {number} numberOfValues - how many values to return
     * @returns {Array}
     */
    getNextValues: (current, numberOfValues) => {
      const nextValues = [];

      for (let i = 0; i < numberOfValues; i++) {
        current = lookup[current];
        nextValues.push(current);
      }

      return nextValues;
    },

    /**
     * Moves the given number of values after the current value so that they
     * are found after the destination value.
     * @param {number} current - the value found before the values to move
     * @param {number} numberOfValuesToMove - how many values to move
     * @param {number} destination - the value that will be found before the
     * moved values after they are moved
     */
    moveNext: (current, numberOfValuesToMove, destination) => {
      let firstMoved = lookup[current];
      let lastMoved = current;

      for (let i = 0; i < numberOfValuesToMove; i++) {
        lastMoved = lookup[lastMoved];
      }

      let afterRemoved = lookup[lastMoved];
      lookup[current] = afterRemoved;
      let afterInserted = lookup[destination];
      lookup[destination] = firstMoved;
      lookup[lastMoved] = afterInserted;
    },

    /**
     * Returns the entire list as an array, starting with the named value.
     * @param {number} startValue - the first value to list
     * @returns {Array}
     */
    toArray: startValue => {
      let array = [];
      let value = startValue;

      do {
        array.push(value);
        value = lookup[value];
      } while (value !== startValue);

      return array;
    },
  };
};
