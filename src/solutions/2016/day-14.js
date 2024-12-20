const crypto = require('crypto');

const REGEXP = /(.)\1{2,}/;

/**
 * # [Advent of Code 2016 Day 14](https://adventofcode.com/2016/day/14)
 *
 * After having a slower implementation for quite some time, I eventually revisited this solution
 * and improved it. It's still slower than I'd like (about 33 seconds on my machine), but a cursory
 * Google search indicates that MD5 hashing in Node
 * [is known to be slow](https://stackoverflow.com/questions/28845659/expected-performance-of-md5-calculation-in-javascript).
 * It may be possible to compensate for this by resorting to worker threads, but I'm adequately
 * convinced that my implementation would be fast if the performance of Node's MD5 implementation
 * were on par with that of other languages. As it is, the performance of my solution has been
 * improved by more than 5×, so I'm content to leave it as is.
 *
 * There are several things that can trip you up with this puzzle:
 *
 * - The puzzle states that potential keys contain a "triplet," a substring of three consective
 *   repetitions of the same character. There can actually be more than three in a row for it to
 *   count; it doesn't have to be exactly three.
 * - Potential keys may have _more than one_ triplet in them, but only the first one found in the
 *   string counts for this purpose.
 * - A hash is only verified as a key when one of the following 1000 hashes (not including the
 *   potential key itself) contains a quint (a substring of five consecutive repetitions of the
 *   same) where the repeated character is the same as the one in the potential key's triplet. For
 *   example, if the potential key's triplet is `aaa`, a quint of `aaaaa` would have to be found in
 *   the next 1000 hashes to confirm it as a key.
 * - The verifying quints won't be in the same order as the keys they verify, and in fact the same
 *   quint can verify more than one key.
 * - There may be more keys between a found key and the hash containing the quint that verifies it;
 *   don't skip them.
 * - We want the key that is 64th when the verified keys are in hash index order, _not_ the order in
 *   which they were verified.
 *
 * As my solution iterates index values, it tracks the following information:
 *
 * - The current index.
 * - A `Map` that stores the indices of unverified keys. The map contains sixteen entries, one for
 *   each hex digit, and the value stored under each key is an array of indices of unverified keys
 *   whose triplet repeats that hex digit. This makes it easy to retrieve the indices of the keys
 *   a discovered quint verifies. Note that any indices that are more than 1000 less than the index
 *   of the hash with the quint are _not_ verified.
 * - An array of verified key indices.
 * - The index of the most recently discovered unverified key.
 *
 * Algorithm:
 *
 * 1. Iterate indices, starting with 0. Initially, we don't know the iteration limit; we will set
 *    that later.
 *    1. Generate the hash as describe in the puzzle. For part one, the hash operation is only
 *       applied once. For part two, it is applied 2017 times.
 *    2. Check the hash for a triplet; skip to the next index if one isn't found.
 *    3. Store this as the index of the most recently discovered unverified key.
 *    4. If the triplet is actually a quint:
 *       1. Get the list of unverified key indexes for the quint's hex digit.
 *       2. Filter out any indexes that are too old (more than 1000 less than the current index).
 *       3. Add the remaining indices to the array of verified key indices.
 *       4. If the 64th verified key has been discovered, set the iteration limit to be 1000 greater
 *          than the index of the most recently discovered unverified key. This is because quints
 *          are not discovered in the same order as the keys they verify, so we need check for any
 *          keys that may not have been verified yet, since they might have lower indices than this
 *          one.
 *       5. Clear the list of unverified key indices for this hex digit.
 *    5. Add the index of this potential key to the unverified key indices.
 * 2. Upon reaching the iteration limit, we are guaranteed to have discovered the 64th key, though
 *    it may not be the most recent one we verified. Sort the verified key indices, then return the
 *    64th one.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const salt = input.trim();
  return [ 1, 2017 ].map(stretch => findKeys(salt, stretch));
};

/**
 * Find the 64th key in the sequence of hashes generated from the given salt.
 *
 * @param {string} salt - the salt string
 * @param {number} stretch - the number of times to apply the hash function
 * @returns {number} - the index of the 64th key
 */
const findKeys = (salt, stretch) => {
  let index = -1;
  const unverifiedKeyIndices = new Map();
  let verifiedKeyIndices = [];
  let latestUnverifiedKeyIndex;
  let limit = Infinity;

  // Initialize the Map of unverified key indices
  for (let i = 0; i < 16; i++) {
    unverifiedKeyIndices.set(i.toString(16), []);
  }

  do {
    // Generate the hash
    let hash = salt + ++index;

    for (let i = 0; i < stretch; i++) {
      hash = crypto.createHash('md5')
        .update(hash)
        .digest('hex');
    }

    // Check for a triplet
    const match = hash.match(REGEXP);

    if (!match) {
      continue;
    }

    const [ matchStr, nibble ] = match;
    latestUnverifiedKeyIndex = index;
    let unverifiedKeyIndicesForTriplet = unverifiedKeyIndices.get(nibble);

    if (matchStr.length > 4) {
      // We've actually found a quint; check for keys that it would verify
      const oldestIndex = index - 1000;
      const unexpiredTriplets = unverifiedKeyIndicesForTriplet.filter(
        tripleIndex => tripleIndex >= oldestIndex
      );

      for (const tripletIndex of unexpiredTriplets) {
        // We've got a verified key!
        verifiedKeyIndices.push(tripletIndex);

        if (verifiedKeyIndices.length === 64) {
          // We've verified 64 keys, but there might be more with lower indices because their
          // verifying quints might occur later, so keep searching until we've processed 1000 hashes
          // after the last unverified key.
          limit = latestUnverifiedKeyIndex + 1000;
        }
      }

      // All the previously unverified keys we'd stored for this hex digit are either now verified
      // or too old; clear the list.
      unverifiedKeyIndicesForTriplet = [];
      unverifiedKeyIndices.set(nibble, unverifiedKeyIndicesForTriplet);
    }

    // Remember this triplet for future verification.
    unverifiedKeyIndicesForTriplet.push(index);
  } while (index < limit);

  // Sort the verified key indices and return the 64th one.
  return verifiedKeyIndices.sort((a, b) => a - b)[63];
};
