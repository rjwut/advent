const { split } = require('../util');
const { add, multiply } = require('../math2');

const GROUP_SORT = (g1, g2) => {
  let c = g1.count - g2.count;

  if (c === 0) {
    c = g1.qe - g2.qe;
  }

  return c;
};

/**
 * # [Advent of Code 2015 Day 24](https://adventofcode.com/2015/day/24)
 *
 * The basic algorithm is as follows, where `n` is the desired number of groups
 * (three in part one, four in part two):
 *
 * 1. Compute the total weight of all packages, then divide by `n` to get the
 *    target weight for each group (`wg`).
 * 2. Find all possible groupings of packages that result in groups whose
 *    weight equals `wg`. This is accomplished by iterating the packages from
 *    largest to smallest, trying each one in turn as a member of a possible
 *    group, then recursing (or, in my implementation, simulating recursion
 *    with a queue) to find additional group members until the group is the
 *    target size. Any package in the list that would put the group over the
 *    target size is skipped.
 * 3. Sort the list of possible groups first by increasing number of packages,
 *    then by increasing quantum entanglement to break ties.
 * 4. Find the first group in the list that can result in `n` groups of unique
 *    packages. This is implemented as follows:
 *    1. Iterate the groups in the list.
 *    2. Filter the list for those groups that have no packages that are in the
 *       selected group.
 *    3. If the filtered list is empty, continue to the next loop.
 *    3. If `n` is `2`, return the selected group.
 *    4. Otherwise, recurse with the filtered list as the new list of groups
 *       and `n - 1` for `n` and return the result.
 * 5. The group returned from the above procedure is Santa's compartment, so
 *    its quantum entanglement value is the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const weights = split(input, { parseInt: true }).reverse();
  const totalWeight = add(weights);
  return [ 3, 4 ].map(groupCount => {
    const groupWeight = totalWeight / groupCount;
    const groups = findGroups(weights, groupWeight).sort(GROUP_SORT);
    const bestGroup = findBestGroup(groups, groupCount);
    return bestGroup.qe;
  });
};

/**
 * Finds all possible groups of packages whose combined weights equal
 * `groupWeight`.
 *
 * @param {Array<number>} weights - the weights of the packages, in descending
 * order
 * @param {number} groupWeight - the target group weight
 * @returns {Array<Group>} - the possible groups
 */
const findGroups = (weights, groupWeight) => {
  const groups = [];
  const stack = [ { group: [], weightLeft: groupWeight, startIndex: 0 }];

  do {
    const { group, weightLeft, startIndex } = stack.pop();
    let i;
    for (i = startIndex; weights[i] > weightLeft; i++);

    for (let j = i; j < weights.length; j++) {
      const weight = weights[j];
      const newGroup = [ ...group, weight ];

      if (weight === weightLeft) {
        groups.push(new Group(newGroup));
      } else {
        stack.push({
          group: newGroup,
          weightLeft: weightLeft - weight,
          startIndex: j + 1,
        });
      }
    }
  } while (stack.length);

  return groups;
};

/**
 * Finds the group that can be Santa's compartment. This is implemented
 * by iterating the list of groups, and for each group, filtering the list to
 * contain only those groups that share no packages with the selected group,
 * then recursing until `groupCount` groups are selected. If this is
 * successful, the selected group in the outermost loop is Santa's compartment.
 *
 * @param {Array<Group>} groups - the possible groups
 * @param {number} groupCount - the target number of groups
 * @returns {Group} - Santa's compartment (or one of the other compartments in
 * recursions)
 */
const findBestGroup = (groups, groupCount) => {
  for (const group of groups) {
    const rest = groups.filter(curGroup => group.overlaps(curGroup));

    if (rest.length) {
      return groupCount === 2 ? group : findBestGroup(rest, groupCount - 1);
    }
  }

  return null;
};

/**
 * A possible group of packages that has the target weight.
 */
class Group {
  #weights;
  #qe;

  /**
   * Creates a new `Group` containing the packages that have the named weights.
   *
   * @param {Array<number>} weights - the package weights
   */
  constructor(weights) {
    this.#weights = weights;
    this.#qe = multiply(weights);
  }

  /**
   * @returns {number} - the number of packages in this `Group`
   */
  get count() {
    return this.#weights.length;
  }

  /**
   * @returns {number} - the `Group`'s quantum entanglement value
   */
  get qe() {
    return this.#qe;
  }

  /**
   * Determines whether the package with the given weight is in this `Group`.
   *
   * @param {number} weight - the weight of the desired package
   * @returns {boolean} - whether the package is in this `Group`
   */
  includes(weight) {
    return this.#weights.includes(weight);
  }

  /**
   * Determines whether this `Group` has any packages in common with the given
   * `Group`.
   *
   * @param {Group} that - the other `Group`
   * @returns {boolean} - whether any packages belong to both groups
   */
  overlaps(that) {
    return this.#weights.some(weight => that.includes(weight));
  }
}
