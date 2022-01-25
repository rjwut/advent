const CLAIM_REGEXP = /^#(?<id>\d+) @ (?<x>\d+),(?<y>\d+): (?<w>\d+)x(?<h>\d+)$/gm;

/**
 * # [Advent of Code 2018 Day 3](https://adventofcode.com/2018/day/3)
 *
 * ## Algorithm
 *
 * Part one asks us to find the intersections of all the claims, then compute
 * the area of the union of those intersections. To simplify the discussion of
 * the algorithm, I will use only three claims in one dimension rather than
 * two. Here they are, each shown separately:
 * 
 * ```txt
 *       Claim A  ----AAAAAAAAAAAA-------  size = 12
 *       Claim B  --------BBBBBBBBBB-----  size = 10
 *       Claim C  -----------CCCCCCCC----  size = 8
 * Intersections  --------XXXXXXXXXX-----  size = 10
 * ```
 *
 * The answer we want is the size of the section of the line that is covered by
 * at least two claims, which is 10. First, let's find the intersections of
 * each pair of claims, and see where that gets us:
 *
 * ```txt
 * A and B  --------DDDDDDDD-------  size = 8
 * A and C  -----------EEEEE-------  size = 5
 * B and C  -----------FFFFFFF-----  size = 7
 * ```
 *
 * Just adding these up gives us 20, which is too large. That's because these
 * intersections themselves intersect, and these secondary intersections are
 * getting counted more than once. This is where the idea of negation comes in:
 * we can "cancel" out a duplicate secondary intersection by creating a new
 * segment that has the same width, but we apply an opposite sign to it. Let's
 * start with intersections `D` and `E`:
 *
 * ```txt
 * A and B  --------DDDDDDDD-------  size = 8
 * A and C  -----------EEEEE-------  size = 5
 * D and E  -----------GGGGG-------  size = -5
 * ```
 *
 * Intersection `E` is completely contained by intersection `D`, so the
 * secondary intersection between the two is the same size as `E`. We'll call
 * this new segment `G`, and negate its size. Adding these three together gives
 * us 8, which is the correct length of the union of `D` and `E`.
 *
 * Now let's add `F` to the mix:
 *
 * ```txt
 * A and B  --------DDDDDDDD-------  size = 8
 * A and C  -----------EEEEE-------  size = 5
 * D and E  -----------GGGGG-------  size = -5
 * B and C  -----------FFFFFFF-----  size = 7
 * D and F  -----------HHHHH-------  size = -5
 * E and F  -----------IIIII-------  size = -5
 * G and F  -----------JJJJJ-------  size = 5
 * ```
 *
 * When we add the new segment `F`, we have to first find the secondary
 * intersections it has with all the previous segments and cancel them out:
 *
 * - The secondary intersection of `D` and `F` is represented by `H`. It is
 *   negative because `D` is positive.
 * - The secondary intersection of `E` and `F` is represented by `I`. Since `E`
 *   is positive, `I` is also negative.
 * - The secondary intersection of `G` and `F` is represented by `J`. Unlike
 *   `D` and `E`, `G` is negative, so `J` will be _positive_ to cancel out that
 *   portion of `G`.
 *
 * Now, if we add up all of these sizes, we get 10, which is the correct
 * answer!
 *
 * There is an optimization we can do to reduce the number of computations we
 * have to perform. Note that when we added `G` to the list, it was the exact
 * opposite of `E`: they covered the same part of the line, but had opposite
 * coefficients. In this case, they would annihilate each other, so we could
 * remove both `E` and `G` from the list entirely:
 *
 * ```txt
 * A and B  --------DDDDDDDD-------  size = 8
 * ```
 *
 * Then when we add `F`, we only have to worry about its secondary intersection
 * with `D`:
 *
 * ```txt
 * A and B  --------DDDDDDDD-------  size = 8
 * B and C  -----------FFFFFFF-----  size = 7
 * D and F  -----------HHHHH-------  size = -5
 * ```
 *
 * Adding up those sizes still gives us 10, but less work!
 *
 * Part two is actually much simpler: we just want the ID of the one claim that
 * doesn't overlap with any other. As we go about computing intersections for
 * part one, we can mark each claim involved as overlapping. Then when we're
 * done with part one, part two is simply a matter of finding the one claim
 * that wasn't marked.
 *
 * ## Implementation
 *
 * I defined a `Rectangle` class that knows how to compute its area, and can
 * produce a new `Rectangle` out of its intersection with another `Rectangle`.
 * I can also specify an area coefficient, which will always be `1` for the
 * claims, but can be `1` or `-1` for the intersections.
 *
 * I also created a `Claim` class that extends `Rectangle`; it stores the claim
 * ID and can accept a `RegExp` match as its constructor argument. In this way
 * I can easily parse the input into an array of `Claims`.
 *
 * For part one, I first compute all the intersections between the `Claim`s,
 * which I store in a new array. Each time I find an intersection, I mark the
 * two `Claim`s involved as overlapping. I then create another array called
 * `aggregate` to which I add the intersections one at a time. As I add each
 * intersection, I compute the secondary intersections it has with the
 * `Rectangle`s that are already in `aggregate`, and add those to `aggregate`
 * with opposite area coefficients. Once all the intersections are added, I
 * simply add up the areas of all the `Rectangle`s in `aggregate`, positive or
 * negative, and I have the answer.
 *
 * As mentioned above, part two becomes trivial: just `find()` the one `Claim`
 * that hasn't been marked as overlapping, and return its ID.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const claims = parse(input);
  return [ part1(claims), part2(claims) ];
};

/**
 * Parses the input into an array of `Claim` objects.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the `Claim`s
 */
const parse = input => [ ...input.matchAll(CLAIM_REGEXP) ]
  .map(match => new Claim(match));

/**
 * Computes the total area of the union of all the `Claim`s' intersections.
 *
 * @param {Array} claims - the `Claim`s 
 * @returns {number} - the answer to part one
 */
const part1 = claims => {
  // Find all the intersections
  const intersections = [];
  const limit = claims.length - 1;

  for (let i = 0; i < limit; i++) {
    const claim0 = claims[i];

    for (let j = i + 1; j < claims.length; j++) {
      const claim1 = claims[j];
      const intersection = claim0.intersection(claim1);

      if (intersection) {
        intersections.push(intersection);
        claim0.overlaps = true;
        claim1.overlaps = true;
      }
    }
  }

  // Compute the area of the union of all the intersections
  const aggregate = [];

  for (let intersection0 of intersections) {
    const limit = aggregate.length;

    for (let i = 0; i < limit; i++) {
      const intersection1 = aggregate[i];
      const intersection2 = intersection0.intersection(
        intersection1,
        -Math.sign(intersection1.area)
      );

      if (intersection2) {
        // TODO Maybe save work by noticing opposites?
        aggregate.push(intersection2);
      }
    }

    aggregate.push(intersection0);
  }

  return aggregate.reduce(
    (area, intersection) => area + intersection.area,
    0
  );
};

/**
 * Returns the ID of the one `Claim` that doesn't intersect with any other.
 *
 * @param {Array} claims - the `Claim`s 
 * @returns {number} - the answer to part two
 */
const part2 = claims => claims.find(claim => !claim.overlaps).id;

/**
 * Represents a rectangular area on the cloth.
 */
class Rectangle {
  #x0;
  #y0;
  #x1;
  #y1;
  #area;

  /**
   * Make a new `Rectangle` with the given bounds. When queried for its area,
   * the actual area will be multiplied by the `areaCoefficient`.
   *
   * @param {number} x0 - the minimum X coordinate
   * @param {number} y0 - the minimum Y coordinate
   * @param {number} x1 - the maximum X coordinate
   * @param {number} y1 - the maximum Y coordinate
   * @param {number} [areaCoefficient=1] - the area coefficient
   */
  constructor(x0, y0, x1, y1, areaCoefficient = 1) {
    this.#x0 = x0;
    this.#y0 = y0;
    this.#x1 = x1;
    this.#y1 = y1;
    this.#area = (x1 - x0 + 1) * (y1 - y0 + 1) * areaCoefficient;
  }

  /**
   * Returns the minimum X coordinate.
   *
   * @return {number} - min X
   */
  get x0() {
    return this.#x0;
  }

  /**
   * Returns the minimum Y coordinate.
   *
   * @return {number} - min Y
   */
   get y0() {
    return this.#y0;
  }

  /**
   * Returns the maximum X coordinate.
   *
   * @return {number} - max X
   */
   get x1() {
    return this.#x1;
  }

  /**
   * Returns the maximum Y coordinate.
   *
   * @return {number} - max Y
   */
   get y1() {
    return this.#y1;
  }

  /**
   * Returns the area of the `Rectangle`. Note that this is the true area
   * multiplied by the `areaCoefficient`.
   *
   * @return {number} - the area
   */
  get area() {
    return this.#area;
  }

  /**
   * Returns a new `Rectangle` representing the intersection between this
   * `Rectangle` and another `Rectangle`. If there is no intersection, this
   * method returns `null`. The `areaCoefficient` argument will be the area
   * coefficient of the new `Rectangle`.
   *
   * @param {Rectangle} that - the other `Rectangle`
   * @param {Rectangle} areaCoefficient - the area coefficient to use
   * @returns {Rectangle|null} - the intersection, or `null` if there is none
   */
  intersection(that, areaCoefficient = 1) {
    const x0max = Math.max(this.x0, that.x0);
    const x1min = Math.min(this.x1, that.x1);
    const y0max = Math.max(this.y0, that.y0);
    const y1min = Math.min(this.y1, that.y1);

    if (x0max <= x1min && y0max <= y1min) {
      return new Rectangle(
        x0max,
        y0max,
        x1min,
        y1min,
        areaCoefficient,
      );
    }

    return null;
  }

  /**
   * Returns whether this `Rectangle` is the exact opposite of the given
   * `Rectangle`: they cover the exact same range of coordinates but have
   * opposite coefficients.
   *
   * @param {Rectangle} that - the other `Rectangle`
   * @returns {boolean} - `true` if they're opposites; `false` otherwise
   */
  opposites(that) {
    return this.x0 === that.x0 && this.x1 === that.x1 &&
      this.y0 === that.y0 && this.y1 === that.y1 && this.area === -that.area;
  }
}

/**
 * `Rectangle` subclass representing a claim on the fabric.
 */
class Claim extends Rectangle {
  #id;
  overlaps = false;

  /**
   * Constructs a new `Claim` from a `RegExp` match.
   *
   * @param {Array} match - a single match against `CLAIM_REGEXP`
   */
  constructor(match) {
    const x = parseInt(match.groups.x, 10)
    const y = parseInt(match.groups.y, 10)
    const w = parseInt(match.groups.w, 10)
    const h = parseInt(match.groups.h, 10)
    super(x, y, x + w - 1, y + h - 1);
    this.#id = parseInt(match.groups.id, 10);
  }

  /**
   * The `Claim`'s ID.
   *
   * @return {number} - the ID
   */
  get id() {
    return this.#id;
  }
}
