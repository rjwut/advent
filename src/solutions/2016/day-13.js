const DIRECTIONS = [
  [  0, -1 ],
  [  1,  0 ],
  [  0,  1 ],
  [ -1,  0 ],
];

/**
 * # [Advent of Code 2016 Day 13](https://adventofcode.com/2016/day/13)
 *
 * Both parts of the problem can be solve with a single pass using a
 * breadth-first search. Because you can't move diagonally, the minimum
 * possible answer is 68 (the Manhattan distance from [1, 1] to [31, 39]). This
 * is larger than 50, so we will find the answer to part two before part one.
 * Thus, we continue the search until we reach [31, 39], and as we go, any cell
 * we encounter that hasn't already been visited gets added to the count for
 * part two as long as we haven't passed 50 steps yet.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, targetCoords = [ 31, 39 ]) => {
  const favoriteNumber = parseInt(input.trim(), 10);
  const targetKey = targetCoords.join(',');
  const neighborCache = new Map();

  /**
   * Returns the keys for all cells adjacent to the given one that are open.
   *
   * @param {string} key - the key for the cell to check
   * @returns {Array} - the keys for the adjacent open cells
   */
  const getNeighbors = key => {
    let neighbors = neighborCache.get(key);

    if (!neighbors) {
      const coords = key.split(',').map(Number);
      neighbors = DIRECTIONS
        .map(deltas => coords.map((coord, i) => coord + deltas[i]))
        .filter(coords => isOpen(coords, favoriteNumber))
        .map(coords => coords.join(','));
      neighborCache.set(key, neighbors);
    }

    return neighbors;
  };

  /**
   * Determines whether the cell at the given coordinates is open. This also
   * serves as our boundary check, since it returns `false` for any cell where
   * a coordinate is less than 0.
   *
   * @param {number} param0.x - the X coordinate
   * @param {number} param0.y - the Y coordinate
   * @returns {boolean} - whether the indicated cell is open
   */
  const isOpen = ([ x, y ]) => {
    return x >= 0 && y >= 0 &&
      (x * x + 3 * x + 2 * x * y + y + y * y + favoriteNumber)
      .toString(2)
      .split('')
      .filter(c => c === '1')
      .length % 2 === 0;
  };

  /**
   * Performs the breadth-first search. The return value is an array containing
   * answers for parts one and two.
   *
   * @returns {Array} - the answers to the puzzle
   */
  const search = () => {
    let stepsToTarget, withinFifty = 1;
    const seen = new Set([ '1,1' ]);
    const queue = [ { key: '1,1', steps: 0 } ];

    do {
      const { key, steps } = queue.shift();
      const nextSteps = steps + 1;
      // Don't bother with neighbors we've already seen.
      const nextKeys = getNeighbors(key).filter(nextKey => !seen.has(nextKey));

      if (nextSteps <= 50) {
        // We haven't passed 50 steps yet, so the neighbors are part of the
        // answer for part two.
        withinFifty += nextKeys.length;
      }

      nextKeys.forEach(nextKey => {
        seen.add(nextKey);

        if (nextKey === targetKey) {
          stepsToTarget = nextSteps; // Found the target cell!
        }

        queue.push({ key: nextKey, steps: nextSteps });
      })
    } while (!stepsToTarget);

    return [ stepsToTarget, withinFifty ];
  };

  return search();
};
