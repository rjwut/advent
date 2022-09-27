const { split } = require('../util');

const ELEMENT_REGEXP = /[A-Z][a-z]?/g;

/**
 * # [Advent of Code 2015 Day 19](https://adventofcode.com/2015/day/19)
 *
 * We should note that every "element" in our input starts with an uppercase
 * letter and is either one or two characters long. If it's two characters
 * long, the second letter is always lowercase. This means that there cannot be
 * any ambiguity about the elements in any given molecular string: If a
 * character is uppercase, it's always the only or left character in the
 * element, and if it's lowercase, it's always the right character.
 *
 * So to extract the elements from a molecule string, we can use the regular
 * expression `/[A-Z][a-z]?/g`. (Since the `?` quantifier is greedy by default,
 * it will always "grab" the lowercase letter if it's present, which is the
 * behavior we want here.)
 *
 * Once we've done that, part one is easy:
 *
 * 1. Create a empty `Set` for the output molecules.
 * 2. Iterate the replacement rules:
 *    1. Iterate the appearances of the input element in the target molecule.
 *    2. Replace that instance of the input element with the output element
 *       to create an output molecule.
 *    3. Add the output molecule to the `Set`.
 * 4. Return the size of the `Set`.
 *
 * Solving part two efficiently requires some inspection of the input:
 *
 * - Every replacement rule replaces a single element with two or more
 *   elements.
 * - The exceptions are the electron replacement rules, which always replace
 *   the lone electron with exactly two elements.
 * - There are special elements that I call "anchors": `Rn`, `Y`, and `Ar`.
 *   - Anchors cannot be replaced once they appear.
 *   - Anchors never appear adjacent to one another.
 *   - `Rn` and `Ar` always appear together, and only once each in any
 *     molecule that has them.
 *   - In any molecule in which they appear, `Rn` is always the second element
 *     and `Ar` is the last one.
 *   - Between `Rn` and `Ar`, there will be one, three, or five elements.
 *     - When there are three elements between them, the middle one is a `Y`.
 *     - When there are five elements between them, three elements are
 *       separated by two `Y` elements.
 * - If a replacement contains no anchors, it always replaces one element with
 *   two elements.
 *
 * The table below gives the possible replacement patterns given the above
 * observations, along with the increase the number of elements that the
 * pattern causes. A `?` means any (non-anchor) element may appear there.
 *
 * | Pattern           | Increase |
 * |-------------------|---------:|
 * | `? => ??`         |        1 |
 * | `? => ?Rn?Ar`     |        3 |
 * | `? => ?Rn?Y?Ar`   |        5 |
 * | `? => ?Rn?Y?Y?Ar` |        7 |
 *
 * Suppose for the moment that we only had the `? => ??` pattern. In that case,
 * we could only grow the molecule one element at a time, so if the molecule
 * had `n` elements, it would require `n - 1` replacements to generate it. (We
 * subtract one because the initial replacement of `e` takes us from zero
 * elements to two with only one replacement.)
 *
 * Because anchors can never be replaced, we know exactly how many times a
 * replacement other than `? => ??` occurred: it's simply the number of times
 * `Rn` and `Ar` appear in the target molecule. (You can just count `Rn`, since
 * `Ar` always appears with it.) And each time it happens, it adds two elements
 * to the total increase, meaning we reduce the number of steps required by
 * two. (We'll get to the effect of `Y` in a moment). So our formula to compute
 * the number of steps is now `n - 2 * _Rn_ - 1`.
 *
 * Now let's consider the patterns with `Y` in them. Each time `Y` occurs, we
 * increase by another two elements, on top of the two from `Rn`/`Ar`. This
 * means we save another two steps for each `Y` encountered. So the number of
 * steps it takes to get to the target molecule is `2 * (Rn + Y) - 1`.
 *
 * So to solve part two, we simply count the number of times the `Rn` or `Y`
 * elements appear in the molecule and plug that into the formula.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { molecule, rules } = parse(input);
  return [ part1, part2 ].map(part => part(molecule, rules));
};

/**
 * Parses the puzzle input. The output is an object with two properties:
 *
 * - `molecule` (`Array<string>`): The elements in the target molecule
 * - `rules` (`Array<Object>`): The replacement rules, where each rule is an
 *   object with two properties:
 *   - `input` (`string`): The element being replaced
 *   - `output` (`Array<string>`): The replacement elements
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - parsing results as described above
 */
const parse = input => {
  const lines = split(input);
  const molecule = parseMolecule(lines[lines.length - 1]);
  const rules = lines.slice(0, lines.length - 1)
    .map(line => {
      const parts = line.split(' => ');
      return { input: parts[0], output: parseMolecule(parts[1]) };
    });
  return { molecule, rules };
};

/**
 * Solves part one of the puzzle.
 *
 * @param {Array<string>} molecule - the starting molecule
 * @param {Array<Object>} rules - the replacement rules
 * @returns {number} - the number of possible unique molecules after one
 * replacement
 */
const part1 = (molecule, rules) => {
  const outputs = new Set();
  rules.forEach(rule => {
    findAllIndexes(molecule, rule.input)
    .forEach(index => {
      outputs.add(
        [
          ...molecule.slice(0, index),
          ...rule.output,
          ...molecule.slice(index + 1),
        ].join('')
      );
    });
  });
  return outputs.size;
};

/**
 * Solves part two of the puzzle.
 *
 * @param {Array<string>} molecule - the target molecule
 * @param {Array<Object>} rules - the replacement rules
 * @returns {number} - the number of replacements required to go from `e` to
 * the target molecule
 */
const part2 = molecule => {
  const anchors = molecule
    .map(element => (element === 'Rn' || element === 'Y') ? 1 : 0)
    .reduce((sum, value) => sum + value, 0);
  return molecule.length - anchors * 2 - 1;
};

/**
 * Splits a string describing a molecule into an array of elements.
 *
 * @param {string} molecule - the molecule string
 * @returns {Array<string>} - the elements in the molecule
 */
const parseMolecule = molecule => [ ...molecule.matchAll(ELEMENT_REGEXP) ]
 .map(el => el[0]);

/**
 * Returns all indexes where the named element occurs in the given molecule.
 *
 * @param {Array<string>} molecule - the molecule to search
 * @param {string} element - the element to find
 * @returns {Array<number>} - the located indexes
 */
const findAllIndexes = (molecule, element) => {
  const indexes = [];
  let index = 0;

  do {
    index = molecule.indexOf(element, index);

    if (index !== -1) {
      indexes.push(index++);
    }
  } while (index !== -1);

  return indexes;
};
