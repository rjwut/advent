const { manhattanDistance } = require('../math2');
const { match } = require('../util');

const NANOBOT_REGEXP = /pos=<(?<x>-?\d+),(?<y>-?\d+),(?<z>-?\d+)>, r=(?<r>\d+)/gm;
const ORIGIN = [ 0, 0, 0 ];
const CUBE_SORT = (a, b) => {
  if (a.intersections === b.intersections) {
    return b.distance - a.distance;
  }

  return a.intersections - b.intersections;
};

/**
 * # [Advent of Code 2018 Day 23](https://adventofcode.com/2018/day/23)
 *
 * Part one is simple: find the nanobot in the list with the largest range,
 * then compute how many nanobots are in range of that nanobots. A point is in
 * range of a nanobot if the Manhattan distance between the nanobot and the
 * point is less than or equal to the range of the nanobot.
 *
 * Part two is more tricky. The coordinate range is far too large to test each
 * point individually, but we can narrow it down by dividing it into
 * progressively smaller cubes, and sorting the cubes by how good a candidate
 * each one is. A cube is better than another cube if it intersects more
 * nanobot ranges, or if there is a tie, if the Manhattan distance between the
 * origin and its nearest vertex is less. As we continue splitting the cubes
 * smaller and smaller, we preferentially pursue the best cubes. Once we get
 * down to a unit cube, we keep track of that as the best unit cube found so
 * far. From then on, any cube that is inferior to the best known unit cube is
 * discarded, which allows us to eliminate large chunks of the coordinate
 * range. Any time we find a unit cube that's better than the best one we've
 * found, that becomes the new best unit cube.
 *
 * Note that while the cube with the most intersections is the most likely to
 * contain the desired point, we might find later that it doesn't. For example,
 * a cube may have far more intersections with ranges than any of the other
 * seven, but when we drill down into it we find that the ranges don't actually
 * intersect with one another. So we can't just always choose the best cube and
 * be guaranteed to find the correct point. To deal with this, we keep all the
 * cubes in a stack, pushing them in order so that the best cube is at the top
 * of the stack. This ensures that we always pursue the best cube first, but
 * that the others are kept around in case that one doesn't pan out.
 *
 * The algorithm is, then:
 *
 * 1. Find a cube where the center is at the origin and the length of the sides
 *    is a power of two that completely contains the ranges of all nanobots.
 * 2. Insert that cube into a stack.
 * 3. Create a variable to track the best unit cube found so far. Initialize it
 *    to a "cube" that has `-1` intersections.
 * 4. Loop while the stack is not empty:
 *    1. Remove the top entry from the stack.
 *    2. Cut the cube in half in each dimension to produce eight equally-sized
 *       sub-cubes.
 *    3. Sort the sub-cubes from worst to best.
 *    5. If the sub-cubes are unit cubes (the length of their sides is `1`):
 *       1. Compare the best sub-cube against the current best unit cube. If
 *          it's better, promote it to the best unit cube.
 *       2. Ignore the remaining sub-cubes and continue with the stack loop.
 *    6. Iterate the sub-cubes:
 *       1. If this sub-cube is worse than the best unit cube found so far,
 *          skip it.
 *       2. Push the sub-cube onto the stack.
 * 5. The Manhattan distance from the origin to the best unit cube is the
 *    answer.
 *
 * A nanobot's range is a
 * [regular octahedron](https://mathworld.wolfram.com/RegularOctahedron.html)
 * that is aligned with the coordinate axes. We need to be able to tell if this
 * intersects with a cube. To simplify illustration, I'll demonstrate in 2D,
 * which can easily be extrapolated to 3D. The 2D equivalent is to determine
 * whether a diamond intersects with a square. In each diagram, the `a`s
 * represent the diamond, the `b`s the square, and the `X`s show the
 * intersection between the two.
 *
 * Scenario #1:
 * 
 * ```txt
 * ......a..bbbbbbb
 * .....aaa.bbbbbbb
 * ....aaaaabbbbbbb
 * ...aaaaaaXbbbbbb
 * ..aaaaaaaXXbbbbb
 * ...aaaaaaXbbbbbb
 * ....aaaaabbbbbbb
 * .....aaa........
 * ......a.........
 * ```
 * 
 * One or more of the diamond's vertices are inside the square. This is easy
 * enough to figure out: if all the vertex's coordinates fall within the
 * corresponding coordinate range of the square, it's inside.
 *
 * Scenario #2:
 *
 * ```txt
 * ....a.......
 * ...aaa......
 * ..aaaaa.....
 * .aaaaaaa....
 * aaaaaaaaa...
 * .aaaaaXXb...
 * ..aaaaXbb...
 * ...aaabbb...
 * ....a.......
 * ```
 *
 * Here, all the diamond's vertices are outside the square, but one of the
 * square's vertices is inside the diamond. You can check whether a point is
 * inside the diamond by checking whether the Manhattan distance between the
 * point and the diamond's center is less than or equal to the distance from
 * the diamond's center to one of its vertices (the nanobot's range). If so,
 * the point is inside the diamond.
 *
 * Scenario #3:
 *
 * ```txt
 * .....a.....
 * .bbbXXXbbb.
 * .bbXXXXXbb.
 * .bXXXXXXXb.
 * .XXXXXXXXX.
 * aXXXXXXXXXa
 * .XXXXXXXXX.
 * .bXXXXXXXb.
 * .bbXXXXXbb.
 * .bbbXXXbbb.
 * .....a.....
 * ```
 *
 * In this case, the vertices of both shapes are outside of the other. However,
 * the center of one or both will neccessarily be inside the other, so by
 * including the centers in our checks, we can cover this case, too.
 *
 * So our test to see if a cube and a nanobot range intersect is: If any vertex
 * or the center of either volume is located within the other volume, they
 * intersect; otherwise, they don't.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const nanobots = match(input, NANOBOT_REGEXP, groups => new Nanobot(groups));
  return [ part1(nanobots), part2(nanobots) ];
};

/**
 * Computes the number of nanobots in range of the nanobot with the largest
 * range (the answer to part one).
 *
 * @param {Array} nanobots - the nanobots
 * @returns {number} - the answer to part one
 */
const part1 = nanobots => {
  const strongest = nanobots.reduce((strongest, bot) => (strongest.range > bot.range ? strongest : bot));
  return nanobots.reduce((count, bot) => {
    return count + (strongest.inRange(bot.coords) ? 1 : 0);
  }, 0);
};

/**
 * Computes the Manhattan distance between the origin and the point that is in
 * range of the most nanobots (the answer to part two).
 *
 * @param {Array} nanobots - the nanobots
 * @returns {number} - the answer to part two
 */
const part2 = nanobots => {
  const startingCube = findStartingCube(nanobots);
  const stack = [ startingCube ];
  let bestUnitCube = { intersections: -1 };

  do {
    const cube = stack.pop();
    const subcubes = cube.split(nanobots);
    subcubes.sort(CUBE_SORT);

    if (cube.size === 2) {
      // The sub-cubes are unit cubes
      const bestSubcube = subcubes[subcubes.length - 1];

      if (CUBE_SORT(bestSubcube, bestUnitCube) > 0) {
        bestUnitCube = bestSubcube;
      }
    } else {
      // The sub-cubes are larger than unit cubes
      subcubes.forEach(subcube => {
        if (CUBE_SORT(subcube, bestUnitCube) > 0) {
          stack.push(subcube);
        }
      });
    }
  } while (stack.length);

  return bestUnitCube.distance;
};

/**
 * Returns the smallest cube that:
 *
 * - is centered on the origin
 * - has sides whose lengths are a power of 2
 * - completely contains the ranges of all nanobots
 *
 * @param {Array} nanobots - the nanobots
 * @returns {Object} - the containing cube
 */
const findStartingCube = nanobots => {
  const magnitude = computeRangeMangitude(nanobots);
  let halfSize = 1;

  do {
    halfSize *= 2;
  } while (halfSize < magnitude);

  return new Cube([ -halfSize, -halfSize, -halfSize ], halfSize * 2);
};

/**
 * Finds the largest absolute coordinate value of any vertex of any nanobot's
 * range.
 *
 * @param {Array} nanobots - the nanobots
 * @returns {number} - the largest absolute coordinate value of any nanobot's
 * vertices
 */
const computeRangeMangitude = nanobots => nanobots.reduce((max1, bot) => {
  return Math.max(max1, bot.vertices.reduce((max2, vertex) => {
    return Math.max(max2, vertex.reduce((max3, coord) => {
      return Math.max(max3, Math.abs(coord));
    }, 0));
  }, 0));
}, 0);

/**
 * Represents a single nanobot.
 */
class Nanobot {
  coords;
  range;
  vertices;

  /**
   * Creates a new `Nanobot` based on the groups captured by the `RegExp`
   * match. We eager compute the positions of the vertices because we use them
   * to determine the size of the starting cube.
   *
   * @param {Object} groups - the `RegExp` match groups
   */
  constructor(groups) {
    this.coords = [ Number(groups.x), Number(groups.y), Number(groups.z) ];
    const [ x, y, z ] = this.coords;
    this.range = Number(groups.r);
    this.vertices = [
      [ x - this.range, y, z ],
      [ x + this.range, y, z ],
      [ x, y - this.range, z ],
      [ x, y + this.range, z ],
      [ x, y, z - this.range ],
      [ x, y, z + this.range ],
    ];
  }

  /**
   * Determines whether the given point is in this nanobot's range.
   *
   * @param {Array} point - the point to check
   * @returns {boolean} - `true` if it's in range; `false` otherwise
   */
  inRange(point) {
    return manhattanDistance(point, this.coords) <= this.range;
  }
}

/**
 * A 3D volume that we use to find intersections with nanobots.
 */
class Cube {
  coords;
  size;
  #halfSize;
  #distance;
  #center;
  #vertices;

  /**
   * Creates a new `Cube` with the indicated size whose vertex with the
   * smallest coordinates is at `coords`. If `nanobots` is specified, we'll
   * also count how many intersections with nanobot ranges it has.
   *
   * @param {Array} coords - the vertex that anchors this `Cube`
   * @param {number} size - the length of this `Cube`'s sides
   * @param {Array} [nanobots] - the nanobots to check for intersections 
   */
  constructor(coords, size, nanobots) {
    this.coords = coords;
    this.size = size;

    if (size > 1) {
      this.#halfSize = size / 2;
    }

    if (nanobots) {
      this.#countIntersections(nanobots);
    }
  }

  /**
   * Returns the Manhattan distance between the origin and this `Cube`'s
   * closest vertex. This is lazily computed on demand and memoized.
   *
   * @returns {number} - the distance
   */
  get distance() {
    if (this.#distance === undefined) {
      if (this.size === 1) {
        this.#distance = manhattanDistance(this.coords, ORIGIN);
      } else {
        this.#distance = this.#vertices.reduce((distance, vertex) => {
          const vertexDistance = manhattanDistance(vertex, ORIGIN);
          return Math.min(distance, vertexDistance);
        });
      }
    }

    return this.#distance;
  }

  /**
   * Returns the center of this `Cube`. This is lazily computed on demand and
   * memoized.
   */
  get center() {
    if (!this.#center) {
      if (this.size === 1) {
        this.#center = this.coords;
      } else {
        this.#center = this.coords.map(coord => coord + this.#halfSize - 1);
      }
    }

    return this.#center;
  }

  /**
   * Returns a list of this `Cube`'s vertices. This is lazily computed on
   * demand and memoized.
   */
  get vertices() {
    if (!this.#vertices) {
      const [ x, y, z ] = this.coords;
      const size = this.size - 1;
      this.#vertices = [
        this.coords,
        [ x + size, y, z ],
        [ x, y + size, z ],
        [ x, y, z + size ],
        [ x + size, y + size, z ],
        [ x + size, y, z + size ],
        [ x, y + size, z + size ],
        [ x + size, y + size, z + size ],
      ];
    }

    return this.#vertices;
  }

  /**
   * Determines whether the given point is contained by this `Cube`.
   *
   * @param {Array} point - the point to check
   * @returns {boolean} - `true` if it's inside the `Cube`; `false` otherwise
   */
  contains(point) {
    return point.every((coord, i) => {
      return coord >= this.coords[i] && coord < this.coords[i] + this.size;
    });
  }

  /**
   * Splits this `Cube` into eight smaller `Cube`s of equal size. Each of these
   * `Cube`s will compute their intersections with the ranges of the given
   * `Nanobot`s.
   *
   * @param {Array} nanobots - the `Nanobot`s to check for intersections
   * @returns {Array} - the eight `Cube`s
   */
  split(nanobots) {
    const [ x, y, z ] = this.coords;
    return [
      new Cube([ x, y, z ], this.#halfSize, nanobots),
      new Cube([ x + this.#halfSize, y, z ], this.#halfSize, nanobots),
      new Cube([ x, y + this.#halfSize, z ], this.#halfSize, nanobots),
      new Cube([ x + this.#halfSize, y + this.#halfSize, z ], this.#halfSize, nanobots),
      new Cube([ x, y, z + this.#halfSize ], this.#halfSize, nanobots),
      new Cube([ x + this.#halfSize, y, z + this.#halfSize ], this.#halfSize, nanobots),
      new Cube([ x, y + this.#halfSize, z + this.#halfSize ], this.#halfSize, nanobots),
      new Cube([ x + this.#halfSize, y + this.#halfSize, z + this.#halfSize ], this.#halfSize, nanobots),
    ];
  }

  /**
   * Counts the number of intersections this `Cube` has with the ranges of the
   * given `Nanobot`s, and stores the result in `this.intersections`.
   *
   * @param {Array} nanobots - the `Nanobot`s to check for intersections
   */
  #countIntersections(nanobots) {
    this.intersections = nanobots.reduce((count, nanobot) => count + (this.#intersects(nanobot) ? 1 : 0), 0);
  }

  /**
   * Determines whether this `Cube` intersects with the given `Nanobot`'s
   * range.
   *
   * @param {Nanobot} nanobot - the `Nanobot` to check
   * @returns {boolean} - `true` if they intersect; `false` otherwise
   */
  #intersects(nanobot) {
    if (this.size === 1) {
      return nanobot.inRange(this.coords);
    }

    if (this.contains(nanobot.coords)) {
      return true;
    }

    if (nanobot.inRange(this.center)) {
      return true;
    }
  
    if (nanobot.vertices.some(vertex => this.contains(vertex))) {
      return true;
    }
  
    return this.vertices.some(vertex => nanobot.inRange(vertex));
  }
}
