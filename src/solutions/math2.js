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
   * Returns all factors of `n`.
   *
   * @param {number} n - the number to factor
   * @returns {Array<number>} - the factors of `n`
   */
  factor: n => {
    const limit = Math.floor(Math.sqrt(n));
    const factors = [];

    for (let i = limit; i > 1; i--) {
      if (n % i === 0) {
        factors.unshift(i);
        const other = n / i;

        if (i !== other) {
          factors.push(other);
        }
      }
    }

    factors.unshift(1);

    if (n > 1) {
      factors.push(n);
    }

    return factors;
  },

  /**
   * Returns the greatest common divisor of the two arguments.
   *
   * @param {number|bigint} a - an integer
   * @param {number|bigint} b - another integer
   * @returns {number|bigint} - the greatest common divisor
   */
  gcd: (a, b) => b ? Math2.gcd(b, a % b) : Math.abs(a),

  /**
   * Determines whether `n` is prime.
   *
   * @param {number} n - the number to test
   * @returns {boolean} - whether `n` is prime
   */
  isPrime: n => {
    if (n < 2) {
      return false;
    }

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
   * Computes `n mod m`. This is different than the `%` operator in the case of
   * negative numbers, e.g. `-8 % 7 = -1`, but `mod(-8, 7) = 6`.
   *
   * @param {number} n - the divisor
   * @param {number} m - the modulus
   * @returns {number} - the residue
   */
  mod: (n, m) => {
    const zero = typeof n === 'bigint' ? 0n : 0;
    const remainder = n % m;
    return remainder + (remainder < zero ? m : zero);
  },

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

  /**
   * Computes the area of a simple (non-self-intersecting) polygon, optionally specifying the width
   * of the edges, which can be included or excluded from the area.
   *
   * @param {Array<Array<number>>} vertices - an array of vertices, each of which is an array of
   * two coordinate values
   * @param {number} [width=0] - the width of the polygon's edges; a positive value includes the
   * edges in the polygon's area, while a negative value excludes them
   * @returns {number} - the polygon's area
   * @see https://en.wikipedia.org/wiki/Shoelace_formula
   */
  polygonArea: (vertices, width = 0) => {
    let perimeter = 0;
    let area = 0;

    for (let i = 0; i < vertices.length; i++) {
      const n0 = i;
      const n1 = (i + 1) % vertices.length;
      const x0 = vertices[n0][0];
      const y0 = vertices[n0][1];
      const x1 = vertices[n1][0];
      const y1 = vertices[n1][1];
      perimeter += Math.abs(x0 - x1) + Math.abs(y0 - y1);
      area += x0 * y1 - x1 * y0;
    }

    return Math.abs(area * 0.5) + width * (perimeter / 2 + 1);
  },
};

module.exports = Math2;
