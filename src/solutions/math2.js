/**
 * Math utility functions
 */
const Math2 = {
  /**
   * Returns the sum of the numbers in the given array, or `0` if the array is
   * empty. Supports numbers or `bigint`s.
   *
   * @param {Array} terms - the numbers to add together
   * @returns {number|BigInt} - the sum
   */
  add: terms => terms.reduce(
    (sum, value) => sum + value,
    typeof terms[0] === 'bigint' ? 0n : 0
  ),

  /**
   * Returns the greatest common divisor of the two arguments.
   *
   * @param {number} a - an integer
   * @param {number} b - another integer
   * @returns {number} - the greatest common divisor
   */
  gcd: (a, b) => b ? Math2.gcd(b, a % b) : Math.abs(a),

  /**
   * Determines whether `n` is prime.
   *
   * @param {number} n - the number to test
   * @returns {boolean} - whether `n` is prime
   */
  isPrime: n => {
    const limit = Math.sqrt(n);

    for (let i = 2; i <= limit; i++) {
      if (n % i === 0) {
        return false;
      }
    }

    return true;
  },

  /**
   * Returns the least common multiple of the two arguments.
   *
   * @param {number} a - an integer
   * @param {number} b - another integer
   * @returns {number} - the least common multiple
   */
  lcm: (a, b) => (a * b) / Math2.gcd(a, b),

  /**
   * Returns the Manhattan distance between the two given points in
   * n-dimensional space, where each coordinate is an array with n elements. If
   * only one point is given, it will compute its distance from the origin.
   *
   * @param {Array} coords1 - the first coordinates
   * @param {Array} [coords2] - the second coordinates
   * @returns {number} - the computed distance
   */
  manhattanDistance: (coords1, coords2) => {
    if (coords2 === undefined) {
      coords2 = new Array(coords1.length);
      coords2.fill(0);
    } else if (coords1.length !== coords2.length) {
      throw new Error('Coordinates must have the same number of dimensions');
    }

    let distance = 0;

    for (let i = 0; i < coords1.length; i++) {
      distance += Math.abs(coords1[i] - coords2[i]);
    }

    return distance;
  },
  /**
   * Returns the maximum value in the given array, which must contain at least
   * one value. This function will work even on large arrays where `Math.max()`
   * fails.
   *
   * @param {Array} terms - the numbers to search
   * @returns {number} - the maximum
   */
  max: terms => terms.reduce((max, value) => max > value ? max : value),

   /**
    * Returns the minimum value in the given array, which must contain at least
    * one value. This function will work even on large arrays where `Math.min()`
    * fails.
    *
    * @param {Array} terms - the numbers to search
    * @returns {number} - the minimum
    */
  min: terms => terms.reduce((min, value) => min < value ? min : value),

  /**
   * Returns the product of the numbers in the given array, or `1` if the array
   * is empty. Supports numbers or `BigInt`s.
   *
   * @param {Array} terms - the numbers to multiply together
   * @returns {number} - the product
   */
  multiply: terms => terms.reduce(
    (product, value) => product * value,
    typeof terms[0] === 'bigint' ? 1n : 1
  ),
};

module.exports = Math2;
