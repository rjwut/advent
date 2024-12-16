const SimpleGrid = require('../simple-grid');

const DIRECTIONS = [
  { dr: -1, dc:  0 }, // north
  { dr:  0, dc:  1 }, // east
  { dr:  1, dc:  0 }, // south
  { dr:  0, dc: -1 }, // west
];
const TURNS = [ 1, 3 ];

/**
 * # [Advent of Code 2024 Day 16](https://adventofcode.com/2024/day/16)
 *
 * Originally, I solved part one using the
 * [A* search algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm), but with part two's
 * requirement that _all_ paths that reach the end with the same score be included in the solution,
 * I had to rework my solution. Observations:
 *
 * - The state at any point in the search must consider not only the current position, but also
 *   orientation.
 * - A "move" (advancing from one step to another) can be either a step forward or a turn.
 * - A turn is a 90-degree rotation in either direction.
 * - There is no reason to turn twice in a row; every turn is always followed by a forward step.
 * - We don't need to consider turns that cause us to face a wall.
 * - Since turns cost 1000, we can prune any branch that would turn when it would put us over the
 *   best exit score seen so far.
 * - We can prune any search branch that reaches a previously-seen state (position _and_
 *   orientation) with a higher score. However, we _cannot_ prune a branch that reaches it with the
 *   same score, as this represents an alternative path to the same state, and we must consider
 *   _all_ paths that reach the exit with the same lowest score.
 * - As we search, every state must keep a reference to its previous state, so that we can trace the
 *   states backward to find all the tiles on the path.
 * - The exit may be approached from more than one direction, so there can be more than one state
 *   that represents arriving at the exit with the lowest score.
 * - Once we've found all of our optimal paths, the score for any of those paths is the answer to
 *   part one.
 * - Next we must count the tiles visited by those paths. Since there will be many tiles that will
 *   be visited by more than one path, we must store them in a `Set` to avoid counting any one tile
 *   more than once. The size of the `Set` is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const maze = new SimpleGrid({ data: input });
  const paths = exploreMaze(maze);

  // Count the tiles visited by any path
  const tiles = new Set();
  paths.forEach(path => {
    let entry = path;

    do {
      tiles.add(`${entry.pos.r},${entry.pos.c}`);
      entry = entry.prev;
    } while (entry);
  });
  return [ paths[0].score, tiles.size ];
};

/**
 * Finds all optimal paths through the maze.
 *
 * @param {SimpleGrid} maze - the maze to explore
 * @returns {Object[]} - an array of objects representing the final states of all optimal paths
 */
const exploreMaze = maze => {
  const start = maze.coordsOf('S');
  const stack = [ { pos: start, dirIndex: 1, score: 0, prev: null } ];
  const best = new Map();
  const exitStates = [];
  let bestEndScore = Infinity;

  do {
    const entry = stack.pop();
    const key = `${entry.pos.r},${entry.pos.c},${entry.dirIndex}`;
    const bestSoFar = best.get(key) ?? Infinity;

    if (entry.score > bestSoFar) {
      continue; // We've seen this state with a lower score; prune this branch
    }

    best.set(key, entry.score);

    // Try going straight
    let dir = DIRECTIONS[entry.dirIndex];
    const nextPos = { r: entry.pos.r + dir.dr, c: entry.pos.c + dir.dc };
    const chr = maze.get(nextPos.r, nextPos.c);

    if (chr !== '#') {
      // No wall; we can move here.
      const next = {
        pos: nextPos,
        dirIndex: entry.dirIndex,
        score: entry.score + 1,
        prev: entry,
      };

      if (chr === 'E') {
        // We've found a state that reaches the exit!
        if (next.score <= bestEndScore) {
          // ...and its score is at least as good as the best we've seen!
          if (next.score < bestEndScore) {
            // No, it's better! Forget the previous exit states.
            exitStates.length = 0;
            bestEndScore = next.score;
          }

          // Remember this state as representing a potential optimal path.
          exitStates.push(next);
        }
      } else {
        // Not at the exit yet; add this new state to the stack.
        stack.push(next);
      }
    }

    // What about turning?
    const nextScore = entry.score + 1000;

    if (nextScore < bestEndScore && entry.score - (entry.prev?.score ?? 0) !== 1000) {
      // Turning won't put us over the best score, and we didn't turn last time.
      TURNS.forEach(turn => {
        const nextDirIndex = (entry.dirIndex + turn) % 4;
        dir = DIRECTIONS[nextDirIndex];

        if (maze.get(entry.pos.r + dir.dr, entry.pos.c + dir.dc) !== '#') {
          // The turn doesn't make us face a wall; add this new state to the stack.
          stack.push({
            pos: entry.pos,
            dirIndex: nextDirIndex,
            score: nextScore,
            prev: entry,
          });
        }
      });
    }
  } while (stack.length);

  // Return all the exit states we found.
  return exitStates;
};
