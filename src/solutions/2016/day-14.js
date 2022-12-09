const crypto = require('crypto');

const KEY_TARGET = 64;

/**
 * # [Advent of Code 2016 Day 14](https://adventofcode.com/2016/day/14)
 *
 * I brute forced this one. It's definitely slow. I could try to speed it up. I probably won't.
 *
 * My solution works by taking the specified salt and a number indicating how far to stretch the
 * keys, and producing a "key finder" function. Each time the key finder function is called, it
 * produces the index of the next key. I just run it 64 times to produce the answer.
 *
 * The key finder function has several helper functions:
 *
 * - `analyzeNextHash()`: Computes the next hash, then delegates to `analyzeHash()`.
 * - `analyzeHash()`: Searches the hash for triples (the same character repeated three times
 *   consecutively). If it finds any, it then checks to see if any are also quints (the same
 *   character repeated five times consecutively). It then returns the first character found to be
 *   part of a triple, and all characters that are part of quints.
 * - `findTriples()`: Runs `analyzeNextHash()` until triples are found, or if an index is
 *   specified, until that index is reached. Found triples are cached for inspection by the key
 *   finder.
 *
 * The key finder follows this algorithm:
 *
 * 1. If the triple cache is empty, run `findTriples()`.
 * 2. Take the next triple from the cache, then check the other cached triples for quints up to
 *    1001 positions after the offset. If we run out of cached triples before we reach the end of
 *    the search range, call `findTriples()` to generate more.
 * 3. If we find a quint that is the same character as the first triple we consumed, return the
 *    triple's index.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  return [ 1, 2017 ].map(stretch => seekKey(input, stretch));
};

/**
 * Finds the 64th key that matches the target criteria.
 *
 * @param {string} salt - the salt to use
 * @param {number} stretch - how far to stretch the keys
 * @returns {number} - the index of the 64th key
 */
const seekKey = (salt, stretch) => {
  const keyFinder = buildKeyFinder(salt, stretch);
  let lastKeyIndex;

  for (let i = 0; i < KEY_TARGET; i++) {
    lastKeyIndex = keyFinder();
  }

  return lastKeyIndex;
};

/**
 * Returns a function that will return the index of the next key each time it
 * is invoked.
 *
 * @param {string} salt - the salt to use
 * @param {number} stretch - how far to stretch the keys
 * @returns {Function} - the key finder function
 */
const buildKeyFinder = (salt, stretch) => {
  const triples = [];
  let index = 0;

  /**
   * Computes the next hash and returns an object described by the
   * results of analyzing it.
   *
   * @returns {Object} - the analysis
   */
  const analyzeNextHash = () => {
    let hash = salt + index++;

    for (let i = 0; i < stretch; i++) {
      const hashAlgo = crypto.createHash('md5');
      hashAlgo.update(hash);
      hash = hashAlgo.digest('hex');
    }

    return analyzeHash(hash);
  };

  /**
   * Computes hashes until it finds the next triple, or if `until` is
   * specified, until that index is reached. Each triple found is pushed onto
   * the `triples` array.
   *
   * @param {number} [until] - the index to stop at
   */
  const findTriples = until => {
    do {
      const result = analyzeNextHash();

      if (result.firstTriple) {
        result.index = index - 1;
        triples.push(result);

        if (until === undefined) {
          break;
        }
      }
    } while (until && index < until);
  };

  /**
   * Returns the index of the next key.
   *
   * @returns {number} - the next key's index
   */
  return () => {
    do {
      // If we have no triples handy, find the next one.
      while (!triples.length) {
        findTriples();
      }

      // Take the next triple, then scan for quints.
      const triple = triples.shift();
      const target = triple.index + 1001;

      for (const otherResult of triples) {
        if (otherResult.quints.includes(triple.firstTriple)) {
          return triple.index;
        }
      }

      if (!triples.length || triples[triples.length - 1].index < target) {
        // We've run out of cached triples to check for a quint, but we're not
        // done searching yet. See if there are any more in the search range.
        let nextIndex = triples.length;
        findTriples(target);

        // Check the found triples for the quint.
        for (let i = nextIndex; i < triples.length; i++) {
          const otherResult = triples[i];

          if (otherResult.quints.includes(triple.firstTriple)) {
            return triple.index;
          }
        }
      }
    } while (true);
  };
};

/**
 * Returns an object that describes the given hash:
 *
 * - `quints` (array): All characters that can be found five times
 *   consecutively in the hash.
 * - `firstTriple` (string|undefined): The first character that can be found
 *   three times consecutively in the hash.
 *
 * @param {*} hash
 * @returns
 */
const analyzeHash = hash => {
  const quints = new Set();
  let firstTriple;
  let run = { char: '\0', count: 0 };

  for (let i = 0; i < hash.length; i++) {
    const chr = hash[i];

    if (chr === run.char) {
      run.count++;

      if (run.count === 3 && !firstTriple) {
        firstTriple = chr;
      } else if (run.count === 5) {
        quints.add(chr);
      }
    } else {
      run = { char: chr, count: 1 };
    }
  }

  return { hash, quints: [ ...quints ], firstTriple };
};
