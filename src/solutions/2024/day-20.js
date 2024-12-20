const SimpleGrid = require('../simple-grid');
const dijkstra =  require('../dijkstra');

const DIRECTIONS = [
  { dr: -1, dc:  0 },
  { dr:  0, dc: -1 },
  { dr:  1, dc:  0 },
  { dr:  0, dc:  1 },
];

/**
 * # [Advent of Code 2024 Day 20](https://adventofcode.com/2024/day/20)
 *
 * Something that's easy to miss in reading the puzzle text is that the input is not a maze, but
 * rather one, long, twisting path. This means that every cell that isn't a wall is part of that
 * track, and any potential cheat path is simply an alternate route between two points along the
 * track. Thus, if we create an array of the coordinates of the cells along the track in order from
 * start to finish, any cheat path can be described by the indices of the start and end points in
 * that array.
 *
 * There are some characteristics of effective cheat paths that can help us narrow down our search
 * space:
 *
 * - It must start at a place earlier on the track than the end; in other words, the start index
 *   must be less than the end index.
 * - The cheat path must be at least 100 picoseconds faster than the track between the same two
 *   points.
 * - Since the minimum time to pass through one wall cell is two picoseconds, the cheat path's start
 *   and end points must be at least 102 picoseconds apart along the track. Therefore, we need not
 *   consider any start and end index combinations that are less than that amount apart.
 *
 * The algorithm, then, is as follows:
 *
 * 1. Produce an array called `track` with the coordinates of every cell along the track from start
 *    to finish. [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) feels
 *    like overkill since there's only one possible non-cheating path, but it will work fine for our
 *    purpose.
 * 2. Set `tMaxCheat` to the maximum amount of time we're allowed to be in cheat mode (`2` for part
 *    one, `20` for part two).
 * 3. Set `cheatCount` to `0`.
 * 4. Iterate `start` from `0` to `track.length - 102`.
 *    1. Iterate `end` from `start + 102` to `track.length`.
 *       1. Set `tFair` to `end - start`. This is the time to traverse between those two points
 *          along the track.
 *       2. Look up the coordinates of those two points in `track` and set `tCheat` to the Manhattan
 *          distance between them. This is the time to traverse the cheat path between those two
 *          points.
 *       3. If `tCheat` is greater than `tMaxCheat`, skip to the next iteration.
 *       4. If `tFair - tCheat` is less than or equal to `100`, increment `cheatCount`.
 * 5. When all iteration is complete, the value of `cheatCount` is our answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, minCheatThreshold = 100) => {
  const grid = new SimpleGrid({ data: input });
  const track = buildTrackLookup(grid);
  return [ 2, 20 ].map(
    cheatTime => findEffectiveCheats(track, cheatTime, minCheatThreshold)
  );
};

/**
 * Produces an array of the coordinates of every cell along the track from start to finish.
 *
 * @param {SimpleGrid} grid - the `SimpleGrid` containing the track
 * @returns {number[][]} - the array of coordinates
 */
const buildTrackLookup = grid => {
  // Use Dijkstra's algorithm to find the path
  const start = grid.coordsOf('S');
  const end = grid.coordsOf('E');
  const edgeFn = ({ r, c }) => {
    const edges = [];
    DIRECTIONS.forEach(({ dr, dc }) => {
      const nr = r + dr;
      const nc = c + dc;

      if (grid.inBounds(nr, nc) && grid.get(nr, nc) !== '#') {
        edges.push({ node: { r: nr, c: nc } });
      }
    });
    return edges;
  };
  const goal = `${end.r},${end.c}`;
  const keyFn = ({ r, c }) => `${r},${c}`;
  const nodes = dijkstra(start, edgeFn, { goal, keyFn });

  // Retrieve the end node from the results and navigate the path backwards to build the array of
  // path coordinates.
  const path = [];
  let key = goal;

  do {
    path.unshift(key.split(',').map(Number));
    key = nodes.get(key).prev;
  } while (key);

  return path;
};

/**
 * Count the number of cheat paths that require no more than `cheatTime` picoseconds to traverse and
 * which save at least `minCheatThreshold` picoseconds over the time along the track.
 *
 * @param {number[][]} track - the array of coordinates of the track from start to finish
 * @param {number} cheatTime - the maximum allowed cheat mode time
 * @param {number} minCheatThreshold - the minimum time saved by a cheat path for it to be counted
 * @returns {number} - the count of qualifying cheat paths
 */
const findEffectiveCheats = (track, cheatTime, minCheatThreshold) => {
  let cheatCount = 0;
  const startLimit = track.length - minCheatThreshold + 2;

  // Iterate potential cheat path start points
  for (let start = 0; start < startLimit; start++) {
    // Iterate potential cheat path end points
    for (let end = start + minCheatThreshold + 2; end < track.length; end++) {
      // Compute traversal times for fair and cheat paths
      const tFair = end - start;
      const [ r0, c0 ] = track[start];
      const [ r1, c1 ] = track[end];
      const tCheat = Math.abs(r1 - r0) + Math.abs(c1 - c0);

      if (tCheat > cheatTime) {
        continue; // Not enough cheat mode time for this path
      }

      if (tFair - tCheat >= minCheatThreshold) {
        cheatCount++; // Found a qualifying cheat path
      }
    }
  }

  return cheatCount;
};
