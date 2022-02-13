const { split } = require('../util');

/**
 * Comparator for part one: Prefer the stronger bridge.
 *
 * @param {Array} best - the current best bridge
 * @param {Array} current - the bridge currently being considered
 * @returns {Array} - the better of the two bridges
 */
const STRONGER = (best, current) => current.strength > best.strength ? current : best;

/**
 * Comparator for part two: Prefer the longer bridge, then the stronger if
 * they're the same length.
 *
 * @param {Array} best - the current best bridge
 * @param {Array} current - the bridge currently being considered
 * @returns {Array} - the better of the two bridges
 */
const LONGER_THEN_STRONGER = (best, current) => {
  if (best.length === current.length) {
    return STRONGER(best, current);
  }

  return best.length > current.length ? best : current;
};
const COMPARATORS = [ STRONGER, LONGER_THEN_STRONGER ];

/**
 * # [Advent of Code 2017 Day 24](https://adventofcode.com/2017/day/24)
 *
 * The aspect of the puzzle that differs between the two parts is the
 * comparator that determines which bridge is better. In part one, stronger
 * bridges are preferred. In part two, longer bridges are preferred, falling
 * back on stronger bridges if the lengths are equal. I wrote two comparator
 * functions, one for each part, each of which accepts the current best bridge
 * and the bridge currently being considered, and returns the one that is
 * preferred for that part of the puzzle.
 *
 * Both parts of the puzzle can be solved in a single search, keeping track of
 * the best bridge for each part as we go. I'm using a depth-first search,
 * although a breadth-first search would work just as well. One thing that we
 * can do to speed it up a little is to note that for both parts, adding a
 * component to a bridge will always make the bridge better, so we don't need
 * to evaluate any bridge until we find that we can't add more components to
 * it.
 *
 * Algorithm:
 *
 * 1. Parse the input into a list of components.
 * 2. Create an array which stores the current best bridge for each part.
 *    Initialize it with fake bridges that have zero length and strength.
 * 3. Create a stack containing a single entry which starts with a zero-length
 *    bridge, all components available to be used, and an end port of 0.
 * 4. While the stack is not empty:
 *    1. Pop the top entry from the stack.
 *    2. Filter all unused components by those with a matching end port.
 *    3. If no unused components matched, compute the strength of this bridge,
 *       then compare it against the current best bridge for each part. If it's
 *       better, it becomes the new best.
 *    4. If any unused components matched, for each matched component, push a
 *       new entry onto the stack which adds that component to the bridge,
 *       removes it from the list of unused components, and updates the end
 *       port to the component's other port.
 * 5. Return the strength of the best bridge for each part.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  // Parse the input into a list of components
  const components = split(input).map(
    line => {
      const component = line.split('/').map(n => parseInt(n, 10))
      component.value = component[0] + component[1];
      return component;
    }
  );

  // Prepare for the search
  const best = [ { strength: 0 }, { strength: 0, length: 0 } ];
  const stack = [ { bridge: [], unused: components, end: 0 } ];

  // Search loop
  do {
    const { bridge, unused, end } = stack.pop();
    const usable = unused.filter(component => component.some(port => port === end));

    if (usable.length) {
      // We found more components to add to the bridge
      usable.forEach(component => {
        const newUnused = [ ...unused ];
        newUnused.splice(newUnused.indexOf(component), 1);
        const matchingPortIndex = component.findIndex(port => port === end);
        stack.push({
          bridge: [ ...bridge, component ],
          unused: newUnused,
          end: component[matchingPortIndex === 0 ? 1 : 0],
        });
      });
    } else {
      // No more components we can add; compare this bridge against the best
      // for each part
      bridge.strength = bridge.reduce((strength, component) => strength + component.value, 0);
      best.forEach((partBest, i) => {
        best[i] = COMPARATORS[i](partBest, bridge);
      });
    }
  } while (stack.length);

  // Return the strength of each best bridge
  return best.map(bridge => bridge.strength);
};
