/**
 * # [Advent of Code 2023 Day 22](https://adventofcode.com/2023/day/22)
 *
 * ## Part One
 *
 * We need to be able to tell how far each brick will fall until it lands on another brick or the
 * ground. To do this, we need to compute each brick's profile on the XY plane. An easy way to do
 * this is to create a set representing the brick's profile, where each element is a string in the
 * form `x,y`. We can then iterate over the brick's cubes and add the XY coordinates of each one to
 * that set. Along with the brick's minimum and maximum Z coordinates, this is all the information
 * we need.
 *
 * We then divide the bricks into two groups: those that are falling, and those that are not.
 * Currently, the only ones not falling are those whose minimum Z coordinate is `1`. These are put
 * into a support `Map`, where the key is the brick in question and the value is an array of bricks
 * which support it. For bricks on the ground, this array is empty. The other bricks are put into
 * an array of falling bricks. The lower bricks will land before higher ones, so we will sort this
 * array by minimum Z coordinate, which will become a queue of bricks to process.
 *
 * For each brick taken from the falling queue, we check it against the supported bricks (those
 * that aren't falling) and see which ones are vertically aligned with it (meaning that they share
 * at least one square in their XY profiles). Of those, we determine which ones have the greatest
 * maximum Z coordinates; these are the ones that the falling brick will land on. We can then
 * compute how far the brick will fall, and shift its minimum and maximum Z coordinates
 * accordingly. Finally, the brick is added to the support `Map`, storing under it the bricks which
 * support it. We repeat this until all bricks have been added to the support `Map`.
 *
 * Now that we know which bricks are supported by which other bricks, we can determine which bricks
 * are safe. We add all bricks to a "safe" `Set`, then iterate the bricks and test them for safety.
 * We do this by iterating the other bricks and checking to see if this brick is its only
 * supporter; if so, then this brick is not safe and we remove it from the safe `Set`. Once this
 * process has been followed for all bricks, the number of bricks remaining in the safe `Set` is
 * the answer to part one.
 *
 * ## Part Two
 *
 * To solve part two, we need to compute for each brick how many other bricks would fall if it were
 * removed, and add those values together. For each one, we will perform a breadth-first search
 * through the bricks to identify which ones would fall. We start with a "frontier" of bricks to
 * search which contains only the brick to remove. We iterate the frontier, and for each brick in
 * it we delete that brick from the support `Map` and remove it from the supporters lists of the
 * other bricks in the map. If doing this causes a brick to lose its last supporter, that brick is
 * added to the next frontier. Once all bricks in the current frontier have been processed, the
 * next frontier becomes the current frontier, and the process repeats until the frontier is empty.
 * The number of bricks that were removed from the support map during this process (not including
 * the original removed brick) is the number of bricks that would fall. We repeat this for every
 * brick in the support map (making sure to clone the map each time so the computations don't
 * affect one another), and add the results together to get the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const bricks = parse(input);
  const supportMap = drop(bricks);
  return [ part1, part2 ].map(part => part(supportMap));
};

/**
 * Parse the puzzle input.
 *
 * @param {string} input - the puzzle input
 * @returns {Array<Brick>} - the parsed `Brick`s
 */
const parse = input => {
  const coords = [ ...input.matchAll(/\d+/g) ].map(match => parseInt(match[0], 10));
  const bricks = [];

  for (let i = 0; i < coords.length; i += 6) {
    const six = coords.slice(i, i + 6);
    bricks.push(new Brick(six));
  }

  return bricks;
};

/**
 * Drops all the `Brick`s until all of them are supported, and determines the supporting `Brick`s
 * for each `Brick`.
 *
 * @param {Array<Brick>} bricks - the `Brick`s to drop
 * @returns {Map<Brick, Array<Brick>>} - a `Map` of `Brick`s to their supporting `Brick`s
 */
const drop = bricks => {
  const supportMap = new Map();

  /**
   * Handles dropping an individual `Brick`.
   *
   * @param {Brick} brick - the `Brick` to drop
   */
  const dropOne = brick => {
    const { supporters, zMax } = [ ...supportMap.keys() ].reduce((acc, other) => {
      if (brick.verticallyAligned(other)) {
        // The other Brick is below the falling Brick
        if (other.zMax > acc.zMax) {
          // It's the highest one so far
          return {
            supporters: [ other ],
            zMax: other.zMax,
          };
        }

        if (other.zMax === acc.zMax) {
          // It's tied with the highest one so far
          acc.supporters.push(other);
        }
      }

      // It won't be a supporter for the falling Brick
      return acc;
    }, { supporters: [], zMax: 0 });
    // We've identified the supporters, if any
    // Drop the Brick and add it to the support Map
    brick.drop(brick.zMin - zMax - 1);
    supportMap.set(brick, supporters);
  };

  const falling = [];
  bricks.forEach(brick => {
    if (brick.zMin === 1) {
      // Brick is already on the ground
      supportMap.set(brick, []);
    } else {
      // Brick is falling
      falling.push(brick);
    }
  });

  // Process bricks from lowest to highest
  falling.sort((a, b) => b.zMin - a.zMin);

  while (falling.length) {
    dropOne(falling.pop());
  }

  return supportMap;
};

/**
 * Computes how many `Brick`s are "safe" (i.e. not the sole supporter of any other `Brick`s).
 *
 * @param {Map<Brick, Array<Brick>>} supportMap - the support `Map`
 * @returns {number} - the number of safe `Brick`s
 */
const part1 = supportMap => {
  // Start with all of them safe
  const safe = new Set(supportMap.keys());
  [ ...supportMap.values() ].forEach(supporters => {
    if (supporters.length === 1) {
      // This `Brick` is another `Brick`'s sole supporter; it's not safe
      safe.delete(supporters[0]);
    }
  });
  return safe.size;
};

/**
 * Computes the answer to part two (the number of `Brick`s that would fall if each one were
 * removed separately).
 *
 * @param {Map<Brick, Array<Brick>>} supportMap - the support `Map`
 * @returns {number} - the answer to part two
 */
const part2 = supportMap => [ ...supportMap.keys() ].reduce(
  (acc, brickToZap) => acc + countFallingIfRemoved(supportMap, brickToZap),
  0
);

/**
 * Computes the number of `Brick`s that would fall if the indicated `Brick` were removed.
 *
 * @param {Map<Brick, Array<Brick>>} supportMap - the support `Map`
 * @param {Brick} brickToRemove - the `Brick` to remove
 * @returns
 */
const countFallingIfRemoved = (supportMap, brickToRemove) => {
  // Make sure our changes here don't propagate to later computations
  const clonedMap = cloneSupportMap(supportMap);
  let frontier = [ brickToRemove ];

  do {
    const newFrontier = [];
    frontier.forEach(falling => {
      clonedMap.delete(falling);
      [ ...clonedMap.entries() ].forEach(([ brick, supporters ]) => {
        const index = supporters.indexOf(falling);

        if (index !== -1) {
          // Delete the removed Brick from the supporters list
          supporters.splice(index, 1);

          if (!supporters.length) {
            // This Brick has lost its last supporter; it will fall
            newFrontier.push(brick);
          }
        }
      });
      frontier = newFrontier;
    });
  } while (frontier.length);

  // The number of bricks that would fall is the number of bricks that were removed from the
  // support map, minus the one we removed to start with.
  return supportMap.size - clonedMap.size - 1;
};

/**
 * Creates a clone of the support `Map`.
 *
 * @param {Map<Brick, Array<Brick>>} supportMap - the `Map` to clone
 * @returns {Map<Brick, Array<Brick>>} - the clone
 */
const cloneSupportMap = supportMap => new Map(
  [ ...supportMap.entries() ].map(([ brick, supporters ]) => [ brick, [ ...supporters ] ])
);

/**
 * Represents a single brick in the simulation.
 */
class Brick {
  /**
   * Creates the `Brick` from the given coordinates parsed from the input.
   *
   * @param {Array<number>} param0 - the coordinates
   */
  constructor([ x0, y0, z0, x1, y1, z1 ]) {
    // Determine Z coordinate range
    this.zMin = Math.min(z0, z1);
    this.zMax = Math.max(z0, z1);

    // Compute this Brick's profile on the XY plane
    this.profile = new Set();
    const pos = [ x0, y0 ];
    this.profile.add(pos.join(','));
    const delta = [ Math.sign(x1 - x0), Math.sign(y1 - y0) ];

    while (pos[0] !== x1 || pos[1] !== y1) {
      pos[0] += delta[0];
      pos[1] += delta[1];
      this.profile.add(pos.join(','));
    }
  }

  /**
   * Determines whether this `Brick` is vertically aligned with the given `Brick` (i.e. their XY
   * profiles overlap).
   *
   * @param {Brick} that - the other `Brick`
   * @returns {boolean} - `true` if the `Brick`s are vertically aligned, `false` otherwise
   */
  verticallyAligned(that) {
    const intersection = [];
    this.profile.forEach(square => {
      if (that.profile.has(square)) {
        intersection.push(square);
      }
    });
    return !!intersection.length;
  }

  /**
   * Drops this `Brick` the indicated distance.
   *
   * @param {number} distance - the distance to drop
   */
  drop(distance) {
    this.zMin -= distance;
    this.zMax -= distance;
  }
}
