const { split } = require('../util');
const { add } = require('../math2');

/**
 * # [Advent of Code 2023 Day 12](https://adventofcode.com/2023/day/12)
 *
 * The challenge with this puzzle is avoiding combinatorial explosion. If you attempt to simply
 * try every possible combination and then test each one against the rules to see if it matches,
 * the search space is too large to explore. You have to reduce it by:
 *
 * - Pruning branches that can't possibly lead to a solution, and
 * - Not exploring duplicate branches
 *
 * Each line of input describes a pattern that must be matched and a rule that describes how many
 * groups of consecutive damaged springs there are, and how many springs are in each group. I
 * performed the search by iterating the springs one at a time, branching each time I encountered a
 * `?`, one for `.` and one for `#`. Each branch kept track of three pieces of data:
 *
 * 1. Which group of damaged springs it's on
 * 2. The length of the current run of damaged springs
 * 3. Whether the most recent spring was damaged or not
 *
 * Since it's possible for the above pieces of data to be identical across multiple branches, I
 * only kept unique branches in memory and tracked how many copies of each there were.
 *
 * There are several scenarios where a branch could be pruned:
 *
 * - If the current character is `#`, prune if the branch has already fulfilled all runs, or the
 *   last character was the end of a run.
 * - If the current character is `.`, prune if the branch was in the middle of an incomplete run.
 * - If the current character is `?`, split the branch into two branches, one for `.` and one for
 *   `#`, then follow the pruning rules outlined above for each branch.
 *
 * Once all the springs have been processed, the answer is all the remaining branches that have
 * fulfilled the rules.
 *
 * Here's a walkthrough of the search with the second example line:
 *
 * ```txt
 * .??..??...?##. 1,1,3
 * ```
 *
 * We start at index `0` in the pattern with a single branch, showing that we haven't started the
 * run for the first group yet:
 *
 * 1. `group=-1, runLength=0, last='.'`
 *
 * ## `i = 0 -> .`
 *
 * One branch isn't currently on a run, so we just advance to the next character.
 *
 * 1. `group=-1, runLength=0, last='.'`
 *
 * ## `i = 1 -> ?`
 *
 * We create two branches, one for `.` and one for `#`. The `.` branch is unchanged from the one we
 * branched from, but the `#` starts the first group's run:
 *
 * 1. `group=-1, runLength=0, last='.'`
 * 2. `group=0, runLength=1, last='#'`
 *
 * ## `i = 2 -> ?`
 *
 * Both of our branches split, making a total of four branches. However, one of the four gets
 * pruned beacuse it would create a run of `2`, and the rules say that the first group's length is
 * `1`. The remaining three branches are:
 *
 * 1. `group=-1, runLength=0, last='.'` (no groups started)
 * 2. `group=0, runLength=1, last='#'` (first group started)
 * 3. `group=0, runLength=1, last='.'` (first group complete)
 *
 * ## `i = 3 -> .`
 *
 * No branches get pruned, but by ending branch #2's run, it now becomes identical to branch #3, so
 * we can merge them:
 *
 * 1. `group=-1, runLength=0, last='.'`
 * 2. `group=0, runLength=1, last='.'` (x2)
 *
 * ## `i = 4 -> .`
 *
 * The next one is also `.`. The branches are unchanged.
 *
 * 1. `group=-1, runLength=0, last='.'`
 * 2. `group=0, runLength=1, last='.'` (x2)
 *
 * ## `i = 5 -> ?`
 *
 * Our branches split again:
 *
 * 1. `group=-1, runLength=0, last='.'`
 * 2. `group=0, runLength=1, last='#'`
 * 3. `group=0, runLength=1, last='.'` (x2)
 * 4. `group=1, runLength=1, last='#'` (x2)
 *
 * ## `i = 6 -> ?`
 *
 * All of these branches split again. This one's a bit more complicated, so let me illustrate with
 * a diagram:
 *
 * ```txt
 * 1. group=-1, runLength=0, last='.'
 *     ├─ group=-1, runLength=0, last='.'
 *     └─ group=0, runLength=1, last='#'
 * 2. group=0, runLength=1, last='#'
 *     ├─ group=0, runLength=1, last='.'
 *     └─ group=0, runLength=2, last='#' (pruned)
 * 3. group=0, runLength=1, last='.' (x2)
 *     ├─ group=0, runLength=1, last='.' (x2)
 *     └─ group=1, runLength=1, last='#' (x2)
 * 4. group=1, runLength=1, last='#' (x2)
 *     ├─ group=1, runLength=1, last='.' (x2)
 *     └─ group=1, runLength=2, last='#' (x2) (pruned)
 * ```
 *
 * Of the twelve resulting branches, three get pruned because the produce groups that are too long.
 * The `.` sub-branches of branches #2 and #3 are duplicates, as well. The remaining branches are:
 *
 * 1. `group=-1, runLength=0, last='.'`
 * 2. `group=0, runLength=1, last='#'`
 * 3. `group=0, runLength=1, last='.'` (x3)
 * 4. `group=1, runLength=1, last='#'` (x2)
 * 5. `group=1, runLength=1, last='.'` (x2)
 *
 * ## `i = 8 -> .`
 *
 * This terminates the runs of branches #2 and #4. This results in more duplication, which we'll
 * consolidate:
 *
 * 1. `group=-1, runLength=0, last='.'`
 * 2. `group=0, runLength=1, last='.'` (x4)
 * 3. `group=1, runLength=1, last='.'` (x4)
 *
 * ## `i = 9 -> ., i = 10 -> .`
 *
 * No changes to our branches for the next two springs.
 *
 * ## `i = 11 -> ?`
 *
 * Time to split the branches:
 *
 * 1. `group=-1, runLength=0, last='.'`
 * 2. `group=0, runLength=1, last='#'`
 * 3. `group=0, runLength=1, last='.'` (x4)
 * 4. `group=1, runLength=1, last='#'` (x4)
 * 5. `group=1, runLength=1, last='.'` (x4)
 * 6. `group=2, runLength=1, last='#'` (x4)
 *
 * There is no new duplication this time around.
 *
 * ## `i = 12 -> #`
 *
 * Every branch that was on a run continues it, while the other branches start new runs. Branches
 * #2 and #4 get pruned because their groups are already at full length. Our branches now look like
 * this:
 *
 * 1. `group=0, runLength=1, last='#'`
 * 2. `group=1, runLength=1, last='#'` (x4)
 * 3. `group=2, runLength=1, last='#'` (x4)
 * 4. `group=2, runLength=2, last='#'` (x4)
 *
 * ## `i = 13 -> #`
 *
 * The runs continue. Branches #1 and #2 get pruned for runs that are too long. For the first time
 * since the start, all our branches are working on the same group:
 *
 * 1. `group=2, runLength=2, last='#'` (x4)
 * 2. `group=2, runLength=3, last='#'` (x4)
 *
 * ## `i = 14 -> .`
 *
 * All runs end. Branch #1 gets pruned for ending a run prematurely, so all we're left with are the
 * four copies of branch #2.
 *
 * 1. `group=2, runLength=3, last='.'` (x4)
 *
 * ## Cleanup
 *
 * Now that we've processed the entire pattern, we prune any branches left that haven't completed
 * all the groups. In this case, we have four copies of a single distinct branch, and it
 * successfully completed the groups, so we don't prune any. In the end, we have a total of four
 * branches, so that is our answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const foldedSprings = parse(input);
  const unfoldedSprings = unfold(foldedSprings);
  return [ foldedSprings, unfoldedSprings ].map(springs => {
    const counts = springs.map(springLine => {
      const { pattern, rules } = springLine;
      return countPermutations(pattern, rules);
    });
    return add(counts);
  });
};

/**
 * Counts all spring configurations that match the given pattern and rules.
 *
 * @param {string} pattern - the pattern to match
 * @param {Array<number>} rules - the number of consecutive damaged springs in each group
 * @returns {number} - the number of configurations that match
 */
const countPermutations = (pattern, rules) => {
  // How to handle each of the three possible characters in the pattern. Each handler function
  // accepts a branch object and returns an array of the resulting branch objects.
  const Handlers = {
    '.': branch => {
      // Normal spring:
      // - Prune any branch that ended prematurely
      if (branch.group === -1 || branch.runLength === rules[branch.group]) {
        return [ { group: branch.group, runLength: branch.runLength, last: '.' } ];
      }

      return [];
    },
    '#': branch => {
      // Damaged spring:
      // - Prune branches that:
      //   - ...are still on runs that are already at full length
      //   - ...have already fulfilled all runs
      // - Propagate all other branches:
      //   - If still on a run, add one to its length
      //   - Otherwise, start a new run
      if (branch.last === '#') {
        // Still on a run
        if (branch.runLength !== rules[branch.group]) {
          // Run isn't already at full length; lengthen by one
          return [ { group: branch.group, runLength: branch.runLength + 1, last: '#' } ];
        }
      } else {
        // Starting a new run
        let group = branch.group + 1;

        if (group !== rules.length) {
          return [ { group, runLength: 1, last: '#' } ];
        }
      }

      return [];
    },
    '?': branch => {
      // Unknown spring:
      // - If still on a run:
      //   - If run is already at full length, assume `.`.
      //   - Otherwise, assume `#`.
      // - If not on a run:
      //   - If all runs are fulfilled, assume `.`.
      //   - Otherwise, create two branches, one for `.` and one for `#`.
      const nextBranches = [];

      if (branch.last === '#') {
        // Still on a run
        const last = branch.runLength === rules[branch.group] ? '.' : '#';
        const runLength = branch.runLength + (last === '#' ? 1 : 0);
        nextBranches.push({ group: branch.group, runLength, last });
      } else {
        // Not currently on a run
        nextBranches.push({ group: branch.group, runLength: branch.runLength, last: '.' });
        const group = branch.group + 1;

        if (group !== rules.length) {
          // There are more runs, so add a branch that starts a new one
          nextBranches.push({ group, runLength: 1, last: '#' });
        }
      }

      return nextBranches;
    },
  };

  // Set up our branch store. Each distinct branch is identified with a key, which is just the
  // group, run length, and last character joined with commas. These are then stored in a `Map` so
  // that we can identify duplicates. The values in the `Map` are objects which contain the branch
  // object and a count of how many copies of that distinct branch we have.
  const toKey = ({ group, runLength, last }) => `${group},${runLength},${last}`;
  const startBranch = { group: -1, runLength: 0, last: '.' };
  let branches = new Map();
  branches.set(toKey(startBranch), { branch: startBranch, count: 1 });

  // Iterate the characters in the pattern. Branches can be propagated, pruned, split, or merged as
  // we go.
  for (let i = 0; i < pattern.length; i++) {
    const nextBranches = new Map();
    const handler = Handlers[pattern[i]];
    [ ...branches.values() ].forEach(({ branch, count }) => {
      handler(branch).forEach(b => {
        const key = toKey(b);
        const nextCount = (nextBranches.get(key)?.count ?? 0) + count;
        nextBranches.set(key, { branch: b, count: nextCount });
      });
    });
    branches = nextBranches;
  }

  // Prune any branches that haven't fulfilled all runs; then sum the counts of the remaining
  // branches
  return [ ...branches.values() ].reduce(
    (acc, { branch, count }) => {
      const { group, runLength } = branch;
      return acc + (group === rules.length - 1 && runLength === rules[group] ? count : 0);
    }, 0
  );
};

/**
 * Parse the puzzle input. The returned object has the following properties:
 *
 * - `pattern: string` - the spring pattern to match
 * - `rules: Array<number>` - the number of consecutive damaged springs in each group
 *
 * @param {string} input - the puzzle input
 * @returns {Array<Object>} - the parsed input
 */
const parse = input => {
  return split(input).map(line => {
    const [ pattern, rulesPart ] = line.split(' ');
    const rules = rulesPart.split(',').map(Number);
    return { pattern, rules };
  });
};

/**
 * Performs the unfold operation for part two.
 *
 * @param {Array<Object>} springs - the folded springs, as returned by `parse()`
 * @returns {Array<Object>} - the unfolded springs
 */
const unfold = springs => springs.map(({ pattern, rules }) => {
  const newPattern = new Array(5).fill(pattern).join('?');
  const newRules = new Array(5).fill(rules).flat();
  return { pattern: newPattern, rules: newRules };
});
