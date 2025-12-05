const crypto = require('crypto');

const CELL_REGEXP = /[.|#]/gm;

/**
 * # [Advent of Code 2018 Day 18](https://adventofcode.com/2018/day/18)
 *
 * This variant of
 * [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
 * has three different cell types instead of the usual two. For this solution I
 * opted to store the cells in a one-dimensional array, and create a new one
 * at each step so that changes don't pollute the previous state while I'm in
 * the process of computing the next state. As long as you read the
 * instructions carefully, getting the answer to part one isn't too hard.
 *
 * The trick with part two is pretty much the same as the one for
 * [day 12](./day-12.js): We're asked for some computation that, if we took the
 * brute force path, would clearly take *far* too long to compute. This means
 * that there must be some other way to produce the value. If you watch what
 * the simulation does as you let it run, you can see that it eventually
 * reaches a stable cycle, where the same sequence of states is repeated over
 * and over. If we are able to recognize when the cycle starts, how long it
 * lasts, and the resource values for each minute of the cycle, we can produce
 * the resource value for any desired minute.
 *
 * To recognize when the cycle repeats, I compute a hash of the state for each
 * minute, and use it as a `Map` key. Under that key, I store the minute number
 * where that hash was generated. Eventually, the same hash will be generated,
 * and the fact that it's already in the `Map` is how I know that the cycle has
 * repeated. The number already stored under that hash is the minute that the
 * cycle began, and the difference between that minute and the current minute
 * is the cycle length.
 *
 * Armed with that information, and having stored the resource values for each
 * minute up through the end of the cycle, we now have everything we need to
 * produce the resource value for any desired minute:
 *
 * 1. Subtract the desired minute from the minute the cycle started.
 * 2. Divide by the cycle length and take the remainder.
 * 3. Add the remainder to the cycle start minute.
 * 4. Return the resource value I previously stored for that minute.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part to compute
 * @returns {Array|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  const getResourceValue = parse(input);
  const parts = [ 10, 1_000_000_000 ];

  if (part) {
    return getResourceValue(parts[part - 1]);
  }

  return parts.map(minutes => getResourceValue(minutes));
};

/**
 * Parses the input and returns a function that will return the resource value
 * for a given minute.
 *
 * @param {string} input - the puzzle input
 * @returns {Function} - the resource value function
 */
const parse = input => {
  const newlinePos = input.indexOf('\n');
  const width = input.substring(0, newlinePos).trim().length;
  let acres = [ ...input.matchAll(CELL_REGEXP) ].map(match => match[0]);
  const height = acres.length / width;
  let next, cycleStart, cycleLength;

  /**
   * Given the coordinates for an acre, returns the state of that acre in the
   * next minute.
   *
   * @param {number} r - the acre row
   * @param {number} c - the acre column
   */
  const computeNewState = (r, c) => {
    const rMin = Math.max(r - 1, 0);
    const rMax = Math.min(r + 1, height - 1);
    const cMin = Math.max(c - 1, 0);
    const cMax = Math.min(c + 1, width - 1);
    const neighbors = { '.': 0, '|': 0, '#': 0 };

    for (let nr = rMin; nr <= rMax; nr++) {
      for (let nc = cMin; nc <= cMax; nc++) {
        if (r !== nr || c !== nc) {
          neighbors[acres[nr * width + nc]]++;
        }
      }
    }

    const index = r * width + c;
    let newChr;

    switch (acres[index]) {
    case '.':
      newChr = neighbors['|'] >= 3 ? '|' : '.';
      break;

    case '|':
      newChr = neighbors['#'] >= 3 ? '#' : '|';
      break;

    case '#':
      newChr = neighbors['#'] >= 1 && neighbors['|'] >= 1 ? '#' : '.';
      break;

    default:
      throw new Error(`Invalid cell: ${acres[index]}`);
    }

    next[index] = newChr;
  };

  /**
   * Returns a hash representing the current state.
   *
   * @returns {string} - the hash
   */
  const computeHash = () => crypto.hash('md5', acres.join('\n'), 'base64');

  /**
   * Returns the current resource value.
   *
   * @returns {number} - the resource value
   */
  const computeResourceValue = () => {
    let trees = 0;
    let lumberyards = 0;

    for (let i = 0; i < acres.length; i++) {
      const chr = acres[i];

      if (chr === '|') {
        trees++;
      } else if (chr === '#') {
        lumberyards++;
      }
    }

    return trees * lumberyards;
  };

  /**
   * Runs the simulation until a cycle is detected.
   */
  const run = () => {
    do {
      next = new Array(acres.length);

      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          computeNewState(r, c);
        }
      }

      acres = next;
      const hash = computeHash();

      if (seen.has(hash)) {
        cycleStart = seen.get(hash);
        cycleLength = resourceValues.length - cycleStart;
        break;
      }

      seen.set(hash, resourceValues.length);
      resourceValues.push(computeResourceValue());
    } while (true);
  };

  const seen = new Map();
  seen.set(0, computeHash());
  const resourceValues = [ computeResourceValue() ];
  run();

  /**
   * Returns the resource value for a given minute.
   *
   * @param {number} - the minute
   * @returns {number} - the resource value at that minute
   */
  return minute => {
    if (minute < cycleStart) {
      return resourceValues[minute];
    }

    const index = (minute - cycleStart) % cycleLength + cycleStart;
    return resourceValues[index];
  };
};
