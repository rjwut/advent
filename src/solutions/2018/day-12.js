const BooleanInfiniteGrid = require('../boolean-infinite-grid');
const { match } = require('../util');

const RULE_REGEXP = /^(?<input>[.#]{5}) => (?<output>[.#])$/gm;
const TIME_TARGETS = [ 20, 50_000_000_000 ];

/**
 * # [Advent of Code 2018 Day 12](https://adventofcode.com/2018/day/12)
 *
 * Part one is straightforward enough. My `BooleanInfiniteGrid` class makes
 * storing and iterating the plants easy. To apply the rules, I simply every
 * pot within two of the current bounds, then for each of those pots, I build
 * a "pattern" including the two pots on each side. I use that pattern to look
 * up the rule to determine whether the pot should have a plant in it for the
 * next generation. I just do this for 20 generations, then do a sparse
 * iteration of the grid and sum the coordinates to get part one's answer.
 *
 * For part two, we obviously can't simulate 50,000,000,000 generations in any
 * sort of reasonable amount of time. This means that there must be some point
 * at which the value of a particular generation can be computed without
 * actually running the simulation to that point. If you continue running the
 * simulation, you eventually hit an equilibrium point, where the "pattern" of
 * all the plants stabilizes, and it just shifts position with each generation.
 * (For my input, that happens after 126 generations.) It's easy to detect when
 * this happens: simply generate a string of the plant pattern, starting with
 * the leftmost plant and ending with the rightmost one. Then compare that
 * pattern against the one from the previous generation. If they match, you've
 * reached equilibrium.
 *
 * Once we've found the equilibrium point, we note the value difference between
 * that equilibrium point and the previous one. We can then compute the value
 * at any future point in time by computing the time difference between that
 * time and the equilibrium time, multiplying it by the value difference, and
 * adding that to the value at the equilibrium point.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part number to return
 * @returns {Array|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  const firstNewLineIndex = input.indexOf('\n');
  const initialState = input.substring(15, firstNewLineIndex).trim();
  const rules = match(input, RULE_REGEXP)
    .reduce((rules, rule) => {
      rules[rule.input] = rule.output;
      return rules;
    }, {});
  const simulateUntil = buildSimulation(initialState, rules);

  if (part) {
    return simulateUntil(TIME_TARGETS[part - 1]);
  }

  return TIME_TARGETS.map(time => simulateUntil(time));
};

/**
 * Returns a function that will run the simulation for the given initial state
 * and ruleset.
 *
 * @param {string} initialState - the state of the plants at `t=0`
 * @param {Object} rules - the rule dictionary
 * @returns {Function} - the simulation runner
 */
const buildSimulation = (initialState, rules) => {
  let current = new BooleanInfiniteGrid();
  let time = 0;
  let fingerprint = {};

  for (let x = 0; x < initialState.length; x++) {
    current.put([ x ], initialState.charAt(x) === '#');
  }

  /**
   * Returns a five-character string representing the pattern centered on the
   * plant at position `x`.
   *
   * @param {number} x - the X coordinate of the pattern center
   * @returns {string} - the pattern string
   */
  const getPatternAt = x => {
    let pattern = '';
    current.forEachNear([ x ], (_nearCoord, hasPlant) => {
      pattern += hasPlant ? '#' : '.';
    }, { distance: 2 });
    return pattern;
  };

  /**
   * Advances the simulation by one step.
   *
   * @returns {Object} - the object returned by `getFingerprint()` after the
   * step
   */
  const step = () => {
    const next = new BooleanInfiniteGrid();
    current.forEach((coord) => {
      const pattern = getPatternAt(coord[0]);
      const output = rules[pattern] ?? '.';
      next.put(coord, output === '#');
    }, { margin: 2 })
    current = next;
    time++;
    return getFingerprint();
  };

  /**
   * Returns an object that represents a "fingerprint" of the current state of
   * the simulation. It has two properties:
   *
   * - `pattern` (string): The pattern of all the plants
   * - `value` (number): The sum of all pot numbers with plants
   *
   * @returns {Object} - the fingerprint object
   */
  const getFingerprint = () => {
    const bounds = current.getBounds()[0];
    const width = bounds.max - bounds.min + 1;
    let pattern = new Array(width).fill('.');
    let value = 0;
    current.forEachSparse(([ coord ]) => {
      pattern[coord - bounds.min] = '#';
      value += coord;
    });
    return { pattern: pattern.join(''), value };
  };

  /**
   * Runs the simulation and returns the sum of the pots at the indicated time.
   * It actually only runs the simulation until it reaches equilibrium, then
   * simply projects the plant value at the requested time.
   *
   * @param {number} targetTime - the time index to run to
   * @returns {number} - the sum of the pots at that time
   */
  return targetTime => {
    while(!fingerprint.equilibrium && time < targetTime) {
      const nextFingerprint = step();

      if (fingerprint.pattern === nextFingerprint.pattern) {
        nextFingerprint.equilibrium = true;
        nextFingerprint.valueDiff = nextFingerprint.value - fingerprint.value;
      }

      fingerprint = nextFingerprint;
    }

    if (time === targetTime) {
      return fingerprint.value;
    }

    return fingerprint.value + (targetTime - time) * fingerprint.valueDiff;
  };
};
