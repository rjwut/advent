/**
 * A customized
 * [Dijkstra's algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
 * implementation for pathfinding on the `Battlefield`. This function finds the
 * best path from a `Unit`s current position to any of the given squares. The
 * customizations include:
 *
 * - When comparing a search path against the tentative path for a square, ties
 *   are broken using the reading order position of the first step square for
 *   the path. This way, when the path eventually reaches a target square, it
 *   has already eliminated previous paths that went through a less desirable
 *   first step square.
 * - During the search, I keep track of the best path to any target square
 *   found so far ("best" considering all three factors). Any time a search
 *   path's length exceeds the length of the best path so far, I abandon that
 *   search branch.
 * - Rather than keep a set of unvisited squares, I keep all the data about
 *   each square in a single object, which I store in an array indexed by
 *   reading order position. By referring to squares by their reading order
 *   position index, it's easy to perform reading order sorts.
 * - For each square, I keep track of the first step square used to reach it.
 *   When I have to tiebreak paths, I already have the information needed.
 * - Since `Unit`s have to update their path continuously, I really only need
 *   to return the `Unit`'s next step. So for each square during pathfinding, I
 *   only need to keep track of the number of steps and the first step square,
 *   not the entire path.
 *
 * @param {Battlefield} battlefield - the `Battlefield` object to search
 * @param {Unit} unit - the `Unit` that is moving
 * @param {Array} squares - the target squares's coordinates
 * @returns {Object} - the coordinates of the square that represents the first
 * step on the best path
 */
module.exports = (battlefield, unit, squares) => {
  const adjacencyDeltas = [ -battlefield.width, -1, 1, battlefield.width ];
  const cellData = new Array(battlefield.width * battlefield.height);

  for (let i = 0; i < cellData.length; i++) {
    cellData[i] = { index: i, steps: Infinity, visited: false };
  }

  /**
   * Computes the reading order index for a given square.
   *
   * @param {number} r - the row
   * @param {number} c - the column
   * @returns {number} - the reading order index
   */
  const computeIndex = (r, c) => r * battlefield.width + c;

  /**
   * Comparator for cell data, sorting first on number of steps, then on the
   * reading order index for the first step square (`via`).
   *
   * @param {Object} a - the data for the first cell
   * @param {Object} b - the data for the second cell 
   * @returns {number} - the comparison result
   */
  const cellDataSort = (a, b) => {
    let diff = a.steps - b.steps;

    if (diff === 0) {
      diff = a.via - b.via;
    }

    return diff;
  };

  const squareIndexes = new Set(
    squares.map(square => computeIndex(square.r, square.c))
  );
  let best = { steps: Infinity };
  let index = computeIndex(unit.r, unit.c);
  cellData[index].steps = 0;

  do {
    const current = cellData[index];
    const steps = current.steps + 1;

    // Don't keep searching this path if it's already too long.
    if (steps < best.steps) {
      // Examine adjacent squares.
      for (const delta of adjacencyDeltas) {
        const adjIndex = index + delta;
        const adjData = cellData[adjIndex];

        if (adjData.visited) {
          continue;
        }

        const r = Math.floor(adjIndex / battlefield.width);
        const c = adjIndex % battlefield.width;
        const chr = battlefield.get(r, c);

        if (chr !== '.') {
          // Don't path through walls or other units.
          adjData.visited = true;
          continue;
        }

        const newData = {
          steps,
          via: current.steps === 0 ? adjIndex : current.via,
        };
        const diff = cellDataSort(newData, adjData);

        if (diff < 0) {
          // We've found a better path to this square.
          adjData.steps = steps;
          adjData.via = newData.via;

          if (squareIndexes.has(adjIndex) && cellDataSort(adjData, best) < 0) {
            // It's a target square, and it's the best path to any target
            // square so far.
            best = adjData;
          }
        }
      }
    }

    current.visited = true;
    // What square should we visit next?
    index = cellData.reduce((next, cell) => {
      if (!cell.visited && cell.steps < Infinity && cellDataSort(cell, next) < 0) {
        return cell;
      }

      return next;
    }, { steps: Infinity, index: -1 }).index;
  } while (index !== -1);

  if (best.steps === Infinity) {
    // We couldn't find a path to any target square.
    return null;
  }

  // Return the first step on the path.
  const bestIndex = best.via;
  return {
    r: Math.floor(bestIndex / battlefield.width),
    c: bestIndex % battlefield.width,
  };
};
