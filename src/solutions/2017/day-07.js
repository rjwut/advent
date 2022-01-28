const { group, match } = require('../util');

const PROGRAM_REGEXP = /^(?<name>\w+)\s\((?<weight>\d+)\)(?:\s->\s(?<above>.+))?$/gm;

/**
 * # [Advent of Code 2017 Day 7](https://adventofcode.com/2017/day/7)
 *
 * For both parts of the problem, we need to organize the programs into a tree.
 * Once that's been done, the answer to part one is simply the name of the root
 * node. Part two will use that tree structure to find the tower whose weight
 * is wrong and determine what the correct weight should be.
 *
 * Parsing is done with a regular expression that extracts the name and weight
 * of each program, and the list of any programs above it. Each one is then
 * put into a `Map` so that they can be looked up by name. Then I iterate the
 * programs and, for each one that has any programs above it, I convert the
 * list of program names into a list of actual program objects. On each
 * program object in `above`, I set its `below` property to the "parent"
 * program so that the tree relationships are bi-directional.
 *
 * Once that's done, the tree is built, but I don't know which program is the
 * root. I can find it by taking the first program in the list and following
 * its `below` property until I reach one that doesn't have a `below` property.
 * That one is the root, and its name is the answer to part one.
 *
 * The next step is to compute to the _total_ weight of each program (the
 * weight of that program plus all the programs above it on the tree). This is
 * easily done with the recursive `computeTotalWeight` function. It simply sums
 * its own weight plus the return values of `computeTotalWeight()` for each of
 * the programs above it, sets that sum on its `total` property, and returns
 * it.
 *
 * Finally, we need to identify the tower that is the incorrect weight. This
 * is also done recursively in the `getCorrectWeight()` function. Given a
 * program, it groups the programs above it by total weight. If this results in
 * exactly one group, then the programs above it are balanced and the function
 * returns `null`. If there are two groups, then the program that is alone in
 * its group is unbalanced. However, we don't know whether that program itself
 * is the problem, or one of the programs above it. So we recurse on that
 * program and inspect its return value. If it returns something other than
 * `null`, then one of the programs above it was the problem, and we just
 * return the value that was computed for it. Otherwise, this program is the
 * one that's wrong. We can then compute the correct weight by subtracting its
 * total weight from the correct total weight (that of any program from the
 * other group), and adding that difference to the weight of the incorrectly
 * weighted program. That's our answer for part two, so we return that result
 * so that it gets passed back up the recursion chain.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const tower = parse(input);
  computeTotalWeight(tower);
  return [ tower.name, getCorrectWeight(tower) ];
};

/**
 * Parses the input, builds it into a tree representing the tower, and returns
 * the root program. Each program is an object with the following properties:
 *
 * - `name` (string): the name of the program
 * - `weight` (number): the weight of the program
 * - `above` (Array): the list of programs above this one
 * - `below` (Object): the program below this one (omitted if this is the root)
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the root program
 */
const parse = input => {
  const programs = match(input, PROGRAM_REGEXP, {
    weight: Number,
    above: str => str ? str.split(', ') : [],
  });

  // Build a Map so we can look up programs by name
  const map = programs.reduce((map, program) => {
    map.set(program.name, program);
    return map;
  }, new Map());

  // Create bidirectional links between programs
  for (const program of programs) {
    program.above = program.above.map(name => {
      const aboveProgram = map.get(name);
      aboveProgram.below = program;
      return aboveProgram;
    });
  }

  // Find the root
  let first = programs[0];

  while (first.below) {
    first = first.below;
  }

  return first;
};

/**
 * Recursively determines the total weight of the given program (its weight
 * plus the weight of all the programs above it). This weight is stored on the
 * program under `total` and returned.
 *
 * @param {Object} program - the program whose total weight is to be computed
 * @returns {number} - the computed total weight
 */
const computeTotalWeight = program => {
  let total = program.weight;

  for (const subProgram of program.above) {
    total += computeTotalWeight(subProgram);
  }

  program.total = total;
  return total;
};

/**
 * Returns the correct weight for the one program above this one in the tower
 * that is the wrong weight. If all the programs above this one are balanced,
 * this function returns `null`.
 *
 * @param {Object} program - the program to start from in the tree
 * @returns 
 */
const getCorrectWeight = program => {
  // Group the programs by total weight
  const groups = group(program.above, program => program.total);

  if (groups.size === 1) {
    // They're all the same weight; this program is balanced
    return null;
  }

  // Find the program that's unbalanced
  const entries = [ ...groups.entries() ];
  const incorrectWeightIndex = entries.findIndex(([ , list ]) => list.length === 1);
  const unbalancedProgram = entries[incorrectWeightIndex][1][0];

  // Is it this one that's the problem, or one of the ones above it?
  let correctWeight = getCorrectWeight(unbalancedProgram);

  if (correctWeight === null) {
    // It's this one; compute the correct weight.
    const incorrectTotalWeight = entries[incorrectWeightIndex][0];
    const correctWeightIndex = incorrectWeightIndex === 0 ? 1 : 0;
    const correctTotalWeight = entries[correctWeightIndex][0];
    const diff = correctTotalWeight - incorrectTotalWeight;
    correctWeight = unbalancedProgram.weight + diff;
  }

  return correctWeight;
};
