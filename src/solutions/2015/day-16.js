const { match } = require('../util');

const EQUAL = (value, target) => value === target;
const GREATER_THAN = (value, target) => value > target;
const LESS_THAN = (value, target) => value < target;
const PROFILE = {
  children:    { target: 3, comparator: EQUAL        },
  cats:        { target: 7, comparator: GREATER_THAN },
  samoyeds:    { target: 2, comparator: EQUAL        },
  pomeranians: { target: 3, comparator: LESS_THAN    },
  akitas:      { target: 0, comparator: EQUAL        },
  vizslas:     { target: 0, comparator: EQUAL        },
  goldfish:    { target: 5, comparator: LESS_THAN    },
  trees:       { target: 3, comparator: GREATER_THAN },
  cars:        { target: 2, comparator: EQUAL        },
  perfumes:    { target: 1, comparator: EQUAL        },
};
const REGEXP = /^Sue (?<id>\d+): (?<properties>.+)$/gm;
const PREDICATES = [
  ({ key, value }) => PROFILE[key].target === value,
  ({ key, value }) => {
    const property = PROFILE[key];
    return property.comparator(value, property.target);
  },
];

/**
 * # [Advent of Code 2015 Day 16](https://adventofcode.com/2015/day/16)
 *
 * In part one, we have to compare each Sue against the profile identified
 * by the MFCSAM. If any property of a prospective Sue does not match the
 * MFCSAM's profile, it is not the Sue we're looking for. In part one, each
 * property value must match the corresponding one from the profile exactly.
 * In part two, four properties are either greater than or less than a target
 * value, while the rest are still equal.
 *
 * I created a `PROFILE` object that represents this information. Each property
 * of the `PROFILE` corresponds to a property of the target Sue, and the value
 * of that property is an object that gives the `target` value and a
 * `comparator` function, one of `EQUAL`, `LESS_THAN`, or `GREATER_THAN`.
 *
 * I also created two predicate functions, one for each part, that will return
 * `true` if the given property matches the profile, or `false` if it does not.
 * For part one, the predicate ignores the specified `comparator` function for
 * the property and just checks whether the values are equal, while part two
 * uses the `comparator` function to evaluate it.
 *
 * With that in place, for each part I simply iterate the input Sues, then
 * iterate the specified properties on that Sue, feeding each one into the
 * predicate. If every property for a Sue matches the predicate, that Sue is
 * the correct one, and I return her number as the puzzle answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const sues = parse(input);
  return PREDICATES.map(
    predicate => sues.find(
      sue => sue.properties.every(predicate)
    ).id
  );
};

/**
 * Parses the input and returns an array of Sue objects, which have the
 * following properties:
 *
 * - `id` (`number`): This Sue's number
 * - `properties` (`Array<Object>`): The known properties for this Sue:
 *   - `key` (`string`): The name of the property
 *   - `value` (`number`): The property value
 *
 * @param {string} input - the puzzle input
 * @returns {Array<Object>} - the Sue objects
 */
const parse = input => match(input, REGEXP, {
  id: Number,
  properties: props => props.split(', ').map(propStr => {
    const parts = propStr.split(': ');
    return { key: parts[0], value: parseInt(parts[1], 10) };
  })
});
