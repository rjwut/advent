/**
 * # [Advent of Code 2024 Day 19](https://adventofcode.com/2024/day/19)
 *
 * To parse the input, we break it on the double newlines. The first part is the list of towels, and
 * the second part is the list of desired patterns. We can turn them to arrays by splitting the
 * first on `', '` and the second on newlines.
 *
 * Solving part two also solves part one: if we can calculate the number of unique permutations of
 * towels that produce each desired pattern, part one's answer is simply to count how many of those
 * counts is not `0`, while part two's answer is to sum all of them.
 *
 * The search space with the real input is too large for a normal breadth-first search. However, we
 * can drastically reduce it by noticing that some combinations of towels produce the same
 * intermediate result. Let's use the first desired pattern in the example input to illustrate: the
 * pattern `brwrr` starts with `br`, and there are two combinations of towels that can produce that:
 * `b` + `r` or `br`. So after we've discovered those two patterns, instead of treating them as two
 * separate search branches, we can combine them into one branch with a count of `2`. This way, as
 * we search, we can combine many branches into one, reducing the search space.
 *
 * To do this, instead of using a typical queue, we will use a `Map`, where the key is the part of
 * the pattern that has been built so far in the search, and under each key is the count of how many
 * search branches have produced that part of the pattern. We start with an empty string and a count
 * of `1`. For each loop, we iterate over the contents of the `Map` and for each partial pattern, we
 * search through the list of available towels to find which ones can go next. Each one we find is a
 * branch that inherits the count of the parent branch. So if we have a branch with a count of `3`,
 * and we find four possible towels that could be added, that turns into four branches, each with a
 * count of `3`, which is equivalent to 12 branches in a normal breadth-first search.
 *
 * If we find a towel that completes the pattern, instead of creating new search branches, we simply
 * increase our count of found permutations by that branch's count. We continue this until all
 * branches have been exhausted. The result is the total number of towel permutations that can
 * create that pattern. We repeat this for all patterns, giving us the data required to compute the
 * answers to parts one and two as described above.
 *
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const [ towelsStr, patternsStr ] = input
    .replaceAll('/r', '')
    .split('\n\n');
  const towels = towelsStr.split(', ');
  const patterns = patternsStr.split('\n');
  const results = patterns.map(pattern => countPermutations(pattern, towels));
  return [
    results.filter(Boolean).length,
    results.reduce((acc, curr) => acc + curr, 0),
  ];
};

/**
 * Calculates the total number of permutations of towels that can produce the given pattern.
 *
 * @param {string} pattern - the desired pattern
 * @param {string[]} towels - the available towels
 * @returns {number} - the number of possible permutations
 */
const countPermutations = (pattern, towels) => {
  const branches = new Map([ [ '', 1 ] ]);
  let permutations = 0;

  do {
    const entries = [ ...branches.entries() ];
    branches.clear();
    entries.forEach(([ soFar, count ]) => {
      const remaining = pattern.substring(soFar.length);
      towels.filter(towel => remaining.startsWith(towel))
      .forEach(towel => {
        const nextSoFar = soFar + towel;

        if (nextSoFar.length === pattern.length) {
          permutations += count;
        } else {
          const existing = branches.get(nextSoFar) ?? 0;
          branches.set(nextSoFar, existing + count);
        }
      });
    });
  } while (branches.size);

  return permutations;
};
