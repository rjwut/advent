const { match, permute } = require('../util');

const REGEXP = /^(?<subject>\w+) would (?<dir>gain|lose) (?<delta>\d+) happiness units by sitting next to (?<neighbor>\w+)\.$/gm;

/**
 * # [Advent of Code 2015 Day 13](https://adventofcode.com/2015/day/13)
 *
 * As usual, parsing the input is the first concern. It's easy enough to create
 * a `RegExp` that can parse each line, then I can just use the `match()`
 * function from my utility module to extract them all. With each entry, I
 * stick the two mentioned names into a `Set`, then concatentate them together
 * to form a `Map` key I can use to store the happiness deltas. Note that for
 * each pairing, there will be two keys: one for how happy person A is to sit
 * next to person B, and one for how happy person B is to sit next to person A.
 * (The feelings may not be mutual!) When this is done, we'll have a graph of
 * the relationships between all the people, with the `Set` containing the
 * peoples' names (the nodes), and the `Map` representing the edges.
 *
 * Next, we need every possible arrangement of people around the table. This is
 * easily done with the `permute()` function in my utility module.
 *
 * Third, we compute the total happiness of the table for each permutation. For
 * that, we simply add up the happiness deltas of of each individual, which can
 * be computed by looking up the edges representing their relationship with
 * their two neighbors and adding the two values together.
 *
 * Finally, we find the largest total happiness number in the list. That will
 * be the answer to part one.
 *
 * Part two asks you to add yourself to the table, assuming that you feel
 * neutral toward everyone and everyone feels neutral toward you. I made two
 * small changes to accomodate this. The first is obvious: add `'me'` to the
 * list of names. The second was to make it so that if a `Map` lookup for an
 * edge fails, I just return `0` for that happiness delta. With those two
 * changes, I just run the calculation again and get the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { nodes, edges } = parse(input);
  const part1 = computeMaxHappiness(nodes, edges);
  nodes.add('me');
  const part2 = computeMaxHappiness(nodes, edges);
  return [ part1, part2 ];
};

/**
 * Produce a graph of the relationships described in the input. The returned
 * object has two properties:
 *
 * - `nodes`: A `Set<string>` containing the names of the people at the table.
 * - `edges`: A `Map<string, number>` containing the happiness of each person
 *   when seated next to each other person, where the `Map` key is a string in
 *   the form `<subject>-<neighbor>`.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the relationship graph
 */
const parse = input => {
  const nodes = new Set();
  const edges = match(input, REGEXP).reduce((edges, edge) => {
    nodes.add(edge.subject);
    nodes.add(edge.neighbor);
    edges.set(
      `${edge.subject}-${edge.neighbor}`,
      (edge.dir === 'gain' ? 1 : -1) * Number(edge.delta)
    );
    return edges;
  }, new Map());
  return { nodes, edges };
};

/**
 * Computes the maximum possible happiness from any permutation of people
 * described in this graph.
 *
 * @param {Set<string>} nodes - the names of the people at the table
 * @param {Map<string, number>} edges - the relationship graph edges
 * @returns {number} - the maximum possible happiness
 */
const computeMaxHappiness = (nodes, edges) => permute([ ...nodes ])
  .map(table => computeHappinessForTable(table, edges))
  .reduce((max, cur) => Math.max(max, cur), -Infinity);

/**
 * Computes the happiness of a given permutation of people at the table.
 *
 * @param {Array<string>} table - the order in which people are seated
 * @param {Map<string, number>} edges - the relationship graph edges
 * @returns {number} - how happy that table is
 */
const computeHappinessForTable = (table, edges) => table.reduce(
  (happiness, name, i) => happiness + getHappinessForSubject(name, i, table, edges),
  0
);

/**
 * Computes the happiness of a single subject at the table.
 *
 * @param {string} name - the name of the subject
 * @param {number} i - the subject's seating index
 * @param {Array<string>} table - the order in which people are seated
 * @param {Map<string, number>} edges - the relationship graph edges
 * @returns {number} - how happy that person is
 */
const getHappinessForSubject = (name, i, table, edges) => {
  const index1 = (i + table.length - 1) % table.length;
  const index2 = (i + 1) % table.length;
  const happiness1 = edges.get(`${name}-${table[index1]}`) ?? 0;
  const happiness2 = edges.get(`${name}-${table[index2]}`) ?? 0;
  return happiness1 + happiness2;
};
