const InfiniteGrid = require('../infinite-grid');

const INPUT_REGEXP = /depth: (?<depth>\d+)\s+target: (?<x>\d+),(?<y>\d+)/;
const DIRECTIONS = [
  [  0, -1 ],
  [  1,  0 ],
  [  0,  1 ],
  [ -1,  0 ],
];
const TRANSITIONS = {
  '022': 1,
  '011': 2,
  '122': 0,
  '100': 2,
  '211': 0,
  '200': 1,
};
const MOVE_COST = 1;
const SWITCH_COST = 7;

/**
 * # [Advent of Code 2018 Day 22](https://adventofcode.com/2018/day/22)
 *
 * Since both parts of the puzzle require computation of geologic indexes and
 * region types, I'm storing that data in a separate object that can be reused
 * between the two parts. I'm using my `InfiniteGrid` class because it can
 * expand easily on demand. I've wrapped the grid in a simple API that performs
 * and caches the calculations for us. The region types and the tool states are
 * represented by integers:
 *
 * | Integer | Region type | Tool state    |
 * | ------: | :---------- | :------------ |
 * |       0 | rocky       | neither       |
 * |       1 | wet         | torch         |
 * |       2 | narrow      | climbing gear |
 *
 * Note that the integer that represents a region type is the same integer that
 * represents the tool state that is forbidden in that type.
 *
 * For part one, we only need to iterate all the cells in the rectangle
 * described in the problem, and add together the integers representing their
 * region types. The result is the answer.
 *
 * Our good friend
 * [Dijkstra](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
 * comes to pay us another visit in part two. This time, we have an additional
 * wrinkle that the nodes have requirements with regards to what tool can be
 * equipped there. For each room, there are two possible tool states. We will
 * handle this by treating each room as two separate rooms, one for each of the
 * possible tool states for that room. So our grid for part two will have
 * _three_ dimensions rather than two, `x`, `y`, and `t` (tool state). I
 * created a separate `InfiniteGrid` instance to track the pathfinding data. In
 * this case, our cost function is time rather than distance: travelling to a
 * region that requires a tool change costs eight minutes, while travelling to
 * a region don't requires costs only one.
 *
 * One small modification to the algorithm for this scenario is that we don't
 * create a `Set` of all unvisited nodes right at the start, since the cave
 * system is theoretically infinite and we don't know where we will end up
 * along the way. Instead, our `Set` starts out empty and we add unvisited
 * nodes to it as we encounter them. This is arguably better anyway since
 * nodes that aren't adjacent to any visited nodes are going to have `Infinity`
 * for their `distance` values, so we don't want to consider them yet.
 *
 * When travelling from one region to another, you must make sure that whatever
 * tool you have equipped is valid for both regions. Suppose you are in a wet
 * region with the climbing gear equipped, and you are considering three
 * different adjacent regions to move to next: one rocky, one narrow, and one
 * wet:
 *
 * - You can enter a rocky region with the climbing gear or the torch, but your
 *   current wet region doesn't allow a torch, so if you move there, your only
 *   choice is to keep the climbing gear equipped.
 * - The narrow region requires either the torch or nothing equipped. Again,
 *   since you can't equip the torch while still in the wet region, you are
 *   required to unequip the climbing gear before moving into the narrow
 *   region.
 * - Moving into another wet region would seem to offer you more choices: you
 *   can keep your climbing gear equipped, or put it away first. However, the
 *   latter is never advantageous, since once you get to the new region you may
 *   have to change again, whereas there is no penalty to waiting to change
 *   equipment until you are forced to do so.
 *
 * The rules are, therefore:
 *
 * - When moving between regions of the same type, never change equipment.
 * - When moving between regions of different types, you won't have a choice;
 *   you will either be forced to change equipment, or forced to keep it.
 *
 * There are exactly six scenarios where you will be required to change
 * equipment; in all others, you should keep the same equipment:
 *
 * | Current state        | Next region | Change              |
 * | -------------------- | ----------- | ------------------- |
 * | rocky, climbing gear | narrow      | equip torch         |
 * | rocky, torch         | wet         | equip climbing gear |
 * | wet, climbing gear   | narrow      | unequip             |
 * | wet, unequipped      | rocky       | equip climbing gear |
 * | narrow, torch        | wet         | unequip             |
 * | narrow, unequipped   | rocky       | equip torch         |
 *
 * To make these easy to look up quickly, I encoded these into an object where
 * the keys are strings of three concatenated integers representing the current
 * region type, the current equipment state, and the next region type, and the
 * value is the new equipment state:
 *
 * ```js
 * {
 *   '022': 1,
 *   '011': 2,
 *   '122': 0,
 *   '100': 2,
 *   '211': 0,
 *   '200': 1,
 * }
 * ```
 *
 * When creating edges between nodes in the three-dimensional grid, I create
 * the key as described above and look it up in the above object. If the key
 * exists, the edge connects to the node for that region with the tool state
 * indicated by that property value. Otherwise, it connects to the node that
 * has the same tool state as the current node.
 *
 * There is one exception to all this: the target region. If we've arrived
 * there, we don't want to leave, but if we arrive with the climbing gear
 * equipped, we want to switch to the torch. So the node for the target region
 * with the torch equipped has no edges leaving it, while the one for the
 * target region with the climbing gear equipped has just one edge leading to
 * the one with the torch equipped.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const caveData = parse(input);
  return [ part1, part2 ].map(fn => fn(caveData));
};

/**
 * Parses the input into an object that can be used to look up region data.
 * It also provides the coordinates of the target node.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the cave data API
 */
const parse = input => {
  const match = input.match(INPUT_REGEXP);
  const depth = parseInt(match.groups.depth, 10);
  const target = [ parseInt(match.groups.x, 10), parseInt(match.groups.y, 10) ];
  const grid = new InfiniteGrid();

  /**
   * Returns an object representing a region in the cave system. If the region
   * does not yet exist in the grid, it will be created. Each region object has
   * the following properties:
   *
   * - `erosionLevel` (number): The erosion level for this region
   * - `type` (number): The region type: `0` for rocky, `1` for wet, and `2`
   *    for narrow
   *
   * @param {Array} coords - the coordinates of the region
   * @returns {Object} - the region data object
   */
  const get = coords => {
    let region = grid.get(coords);
    const [ x, y ] = coords;

    if (!region) {
      let geologicIndex;

      if (x === target[0] && y === target[1]) {
        geologicIndex = 0;
      } else if (x === 0) {
        geologicIndex = y === 0 ? 0 : y * 48271;
      } else {
        if (y === 0) {
          geologicIndex = x * 16807;
        } else {
          const left = get([ x - 1, y ]);
          const up = get([ x, y - 1 ]);
          geologicIndex = left.erosionLevel * up.erosionLevel;
        }
      }
  
      const erosionLevel = (geologicIndex + depth) % 20183;
      const type = erosionLevel % 3;
      region = { erosionLevel, type };
      grid.put(coords, region);
    }

    return region;
  };

  return {
    get,
    target,
  };
};

/**
 * Computes the answer to part one. 
 *
 * @param {Object} caveData - the cave data API
 * @returns {number} - the total risk level for the described area
 */
const part1 = caveData => {
  const [ tx, ty ] = caveData.target;
  let sum = 0;

  for (let x = 0; x <= tx; x++) {
    for (let y = 0; y <= ty; y++) {
      sum += caveData.get([ x, y ]).type;
    }
  }

  return sum;
};

/**
 * Computes the answer to part two. If this returns `Infinity`, there's a bug,
 * because no path to the target was found.
 *
 * @param {Object} caveData - the cave data API
 * @returns {number} - the fastest possible time to reach the target
 */
const part2 = caveData => {
  const grid = new InfiniteGrid();

  /**
   * Retrieves a node for the given three-dimensional coordinates, where the
   * dimensions are X, Y, and current tool. Each region has two possible tools
   * which could be equipped, so there can be two nodes in this 3D grid for
   * each region. If the node in question does not currently exist, it will be
   * created and addedto the grid. Each node has the following properties:
   *
   * - `coords` (Array): The coordinates of the node
   * - `info` (Object): A reference to the region object as retrieved from
   *   `caveData`
   * - `time` (number): The fastest time we have found so far to get to this
   *   node
   * - `visited (boolean): Whether this node has been visited yet
   *
   * @param {Array} coords - the node coordinates
   * @returns {Object} - the node
   */
  const get = coords => {
    let node = grid.get(coords);

    if (!node) {
      node = {
        coords,
        info: caveData.get(coords.slice(0, 2)),
        time: Infinity,
        visited: false,
      };
      grid.put(coords, node);
      node.adjacentCoords = getAdjacentCoords(node);
    }

    return node;
  };

  /**
   * Returns an array containing the coordinates of all nodes which are
   * adjacent to the given one. For each entry in the returned array, if the
   * last coordinate does not match that of the current node, it indicates that
   * a tool change is required for this move.
   *
   * Note that every node will have exactly the same number of adjacent nodes
   * as the corresponding regions, except two:
   *
   * - The node corresponding to the target region with the torch equipped will
   *   have no adjacent nodes, because this is the end node, and we don't want
   *   to leave it.
   * - The node corresponding to the target region with the climbing gear
   *   equipped has exactly one adjacent node, corresponding to staying in the
   *   same region but switching to the torch.
   *
   * @param {Object} node - the node you are querying
   * @returns {Array} - the coordinates of the adjacent nodes
   */
  const getAdjacentCoords = node => {
    const [ x, y, t ] = node.coords;
    let adjacent;

    if (x === caveData.target[0] && y === caveData.target[1]) {
      // We're at the target region. If the climbing gear's equipped, switch to
      // the torch. Otherwise, don't leave.
      adjacent = t === 2 ? [ [ x, y, 1 ] ] : [];
    } else {
      // Figure out what tool should be used for entering the next region, and
      // build the coordinates for the corresponding node.
      adjacent = DIRECTIONS.reduce((adjacent, dir) => {
        const nx = x + dir[0];
        const ny = y + dir[1];
  
        if (nx >= 0 && ny >= 0) {
          const adjacentInfo = caveData.get([ nx, ny ]);
          const transitionKey = String(node.info.type) + String(t) + String(adjacentInfo.type);
          const tool = transitionKey in TRANSITIONS ? TRANSITIONS[transitionKey] : t;
          adjacent.push([ nx, ny, tool ]);
        }
  
        return adjacent;
      }, []);
    }

    return adjacent;
  };

  // Begin Dijkstra's algorithm
  const target = get([ ...caveData.target, 1 ]);
  let current = get([ 0, 0, 1 ]);
  current.time = 0;
  const toVisit = new Set();

  do {
    if (current.time < target.time) {
      // If there's only one edge for this node, it's the one where we're
      // at the target and we're switching to the torch. In that case, we only
      // incur the cost of switching equipment, not the movement cost.
      const moveCost = current.adjacentCoords.length === 1 ? 0 : MOVE_COST;
      current.adjacentCoords.forEach(adjacentCoords => {
        const adjacent = get(adjacentCoords);
  
        if (adjacent.visited) {
          return;
        }

        toVisit.add(adjacent);
        const switchCost = current.coords[2] === adjacent.coords[2] ? 0 : SWITCH_COST;
        const newTime = current.time + moveCost + switchCost;
  
        if (newTime < adjacent.time) {
          adjacent.time = newTime;
        }
      });
    }

    current.visited = true;
    toVisit.delete(current);
    current = [ ...toVisit ].reduce((next, node) => {
      if (node.visited) {
        toVisit.delete(node);
        return next;
      }

      return node.time < next.time ? node : next;
    }, { time: Infinity });
  } while (current.time !== Infinity);

  return target.time;
};
