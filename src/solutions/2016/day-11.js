const { match, split } = require('../util');
const {
  getElevator, putElevator, putObject, getFloors, computeGoal,
  getPairId, normalize, debt, isMicrochip
} = require('./day-11.state');
const PriorityQueue = require('../priority-queue');

const OBJECTS_REGEXP = /(?<element>[a-z]+)(?:-compatible)? (?<type>generator|microchip)/gm;
const DIRECTIONS = [ -1, 1 ];

/**
 * # [Advent of Code 2016 Day 11](https://adventofcode.com/2016/day/11)
 *
 * ## Simplified Rule Description
 *
 * - There are four floors connected by an elevator.
 * - There are two types of objects: generators and microchips.
 * - Objects can be moved between floors via the elevator.
 * - The elevator starts at the bottom floor, and can only move one floor at a time.
 * - The elevator can only move if it carries exactly one or two objects.
 * - Each microchip is compatible with exactly one unique generator, identified by the element it
 *   uses to generate power. For example, the hydrogen microchip is only compatible with the
 *   hydrogen generator.
 * - A microchip will be fried if it is ever on the same floor as an incompatible generator without
 *   its compatible generator also on that floor.
 * - The objective is to move all objects to the top floor without frying any chips.
 * - The input describes each floor's contents in English, one sentence per line, starting with the
 *   first floor and each subsequent line describing the next floor up.
 * - Each input line is formatted as follows:
 *   ```txt
 *   The <ordinal> floor contains <list of objects|"nothing relevant">.`
 *   ```
 * - An object list is formatted as `<object>[<separator><object>[...]]`, where `<separator>` is one
 *   of `and`, `, `, or `, and`.
 * - Each object is formatted either as `a <element> generator` or `a <element>-compatible
 *   microchip`.
 * - For part two of the puzzle, two more generator/microchip pairs are added to the initial state
 *   at bottom floor.
 *
 * ## Improving Search Performance
 *
 * - Prune any search branch that reaches a state that we've seen before with the same or fewer
 *   steps.
 * - Don't move one object up a floor when it's possible to move two. Don't move two objects down a
 *   floor when it's possible to move only one.
 * - When the bottom floor becomes empty, we've effectively made our building shorter. Never move
 *   objects below the lowest non-empty floor.
 * - All chip/generator pairs are interchangable. For example, here is the initial state of the
 *   example given in part one:
 *   ```txt
 *   F4 .  .  .  .  .
 *   F3 .  .  .  LG .
 *   F2 .  HG .  .  .
 *   F1 E  .  HM .  LM
 *   ```
 *   Because chip/generator pairs are interchangable, the following state is equivalent:
 *   ```txt
 *   F4 .  .  .  .  .
 *   F3 .  .  .  HG .
 *   F2 .  LG .  .  .
 *   F1 E  .  LM .  HM
 *   ```
 *   The solution should not pursue a search branch past a state that is equivalent to one already
 *   pursued. We can do this by normalizing the representation of a state so that equivalent states
 *   are represented the same way.
 *
 * ## Implementation Details
 *
 * - From now on, we'll refer to floors as 0-indexed instead of 1-indexed to simplify working with
 *   the data. This means that the top floor is at index `3`.
 * - The problem explicitly states that there are four floors, and we will leverage this fact to
 *   represent the location of any object as two bits: `00`, `01`, `10`, or `11`.
 * - Objects will be assigned IDs as follows:
 *   - `0`: element 0's generator
 *   - `1`: element 0's microchip
 *   - `2`: element 1's generator
 *   - `3`: element 1's microchip
 *   - ...
 * - To reduce object instantiations and maximize the speed of the search, the state of the system
 *   is represented as a single integer, where each pair of bits represents the location of an
 *   object or the elevator. Starting with the least significant bits, the object locations are
 *   encoded in the following order: elevator, object 0, object 1, object 2, etc. So the example
 *   above could be encoded as follows:
 *   ```txt
 *   00 01 00 10 00
 *    │  │  │  │  └─ elevator on floor 0
 *    │  │  │  └──── object 0 on floor 2
 *    │  │  └─────── object 1 on floor 0
 *    │  └────────── object 2 on floor 1
 *    └───────────── object 3 on floor 0
 *   ```
 * - Search state consists of the state of the system itself and the number of steps taken to reach
 *   that state.
 * - To avoid duplicate work, system state will be normalized so that equivalent states are
 *   represented by the same number. The normalization process is as follows:
 *   1. Ignoring the elevator bits, break the state bits into four-bit chunks representing the
 *      locations of each pair of objects for an element. For example, the state above would be
 *      broken into the following two four-bit chunks: `0010` (element 0) and `0001` (element 1).
 *   2. Sort the chunks in ascending order. In the above example, the positions of the objects for
 *      element 0 would be swapped with the positions of the corresponding objects for element 1.
 *   3. Reassemble the state bits from the sorted chunks and restore the elevator bits. Thus, the
 *      original state `0001001000` is normalized as `0010000100`.
 * - The heuristic distance between a state and the goal state is approximated by the sum of the
 *   distance of each object from its goal position, called the state's "debt." This debt value is
 *   used to prioritize the search queue: lower debt states are explored before higher debt ones.
 *
 * The search algorithm:
 *
 * 1. Create a priority queue with the initial search state (the starting system state and zero
 *    steps).
 * 2. Create a `Map` to store the best number of steps to reach each state. Number of steps for
 *    states not present in the `Map` is considered to be `Infinity`.
 * 3. While the queue is not empty:
 *    1. Dequeue the state with the lowest debt value.
 *    2. If this state has already been seen with the same or fewer steps, skip it.
 *    3. Store the number of steps taken to reach this state.
 *    4. If we've reached to goal step, skip to the next queue item.
 *    5. Determine all possible moves from the elevator's current floor:
 *       - Elevator can move up or down (but not past the bottom or top floors).
 *       - Elevator could move one or two objects (but not more than what's on the current floor).
 *       - Prune branches that are unsafe (microchip present with an incompatible generator without
 *         its compatible generator), or that won't lead to optimal solutions as described in the
 *         "Improving Search Performance" section above.
 *       - Enqueue the resulting states.
 *  4. Retrive the number of steps to reach the goal state from the `Map`.
 *
 * A move is safe if the floor the elevator left and the floor it arrived at are both safe after the
 * move. A floor is safe if there are no generators on the floor, or all microchips on the floor are
 * paired with their generators.
 *
 * To facilitate testability, all the functions that can query or manipulate the state of the system
 * are encapsulated in a separate module, `day-11.state.js`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, onlyPart1) => {
  const { state, objectCount } = parse(input);

  if (onlyPart1) {
    return run(state, objectCount);
  }

  return [ 0, 4 ].map(
    extraObjects => run(state, objectCount + extraObjects)
  );
};

/**
 * Parses the puzzle input and produces an integer represeting the initial state. The returned
 * object has two properties:
 *
 * - `state: number`: The integer representing the system's initial state
 * - `objectCount: number`: The number of objects in the system
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the initial state data
 */
const parse = input => {
  // Parse each line into an array of objects describing the items
  const floors = [];
  let elements = new Set();
  split(input).forEach(line => {
    const floor = [];
    const objects = match(line, OBJECTS_REGEXP);
    objects.forEach(object => {
      elements.add(object.element);
      floor.push(object);
    });
    floors.push(floor);
  });

  // Convert that to a state value
  elements = [ ...elements.values() ];
  const objectCount = elements.length * 2;
  let state = 0;
  floors.forEach((objects, floorIndex) => {
    objects.forEach(({ element, type }) => {
      const elementIndex = elements.indexOf(element);
      const typeIndex = type === 'generator' ? 0 : 1;
      const id = elementIndex * 2 + typeIndex;
      state = putObject(state, id, floorIndex);
    });
  });
  state = normalize(state, objectCount);
  return { state, objectCount: elements.length * 2 };
};

/**
 * Perform a priority search to find the optimal solution.
 *
 * @param {number} initialState - the initial problem state
 * @param {number} objectCount - the number of objects in the system
 * @returns {number} - the minimum number of steps to reach the goal state
 */
const run = (initialState, objectCount) => {
  const goal = computeGoal(objectCount);
  const queue = new PriorityQueue((a, b) => debt(a.state) - debt(b.state));
  queue.enqueue({ state: initialState, steps: 0 });
  const best = new Map();

  do {
    const { state, steps } = queue.dequeue();
    const bestSteps = best.get(state) ?? Infinity;

    if (steps >= bestSteps) {
      continue; // We've already seen a better solution than this one
    }

    best.set(state, steps);

    if (state === goal) {
      // Everything's on the top floor!
      continue;
    }

    // Retrieve the objects on the elevator's current floor
    const fromFloorIndex = getElevator(state);
    const floors = getFloors(state, objectCount);
    const lowestNonEmptyFloor = floors.findIndex(floor => floor.length);
    const fromFloor = floors[fromFloorIndex];
    const newSteps = steps + 1;

    // Try the two directions the elevator can go
    for (const dir of DIRECTIONS) {
      const toFloorIndex = fromFloorIndex + dir;

      if (toFloorIndex === -1 || toFloorIndex === 4 || toFloorIndex < lowestNonEmptyFloor) {
        // Don't leave the building or move objects below the lowest non-empty floor
        continue;
      }

      // Discover all safe moves, divide them into moving one object or two objects
      const toFloor = floors[toFloorIndex];
      const singles = [], doubles = [];

      for (let i = 0; i < fromFloor.length; i++) {
        const id1 = fromFloor[i];

        if (moveIsSafe(fromFloor, toFloor, id1)) {
          // Object is safe to move alone
          singles.push([id1]);
        }

        for (let j = i + 1; j < fromFloor.length; j++) {
          const id2 = fromFloor[j];

          if (moveIsSafe(fromFloor, toFloor, id1, id2)) {
            // Both objects are safe to move together
            doubles.push([id1, id2]);
          }
        }
      }

      let moves;

      if (dir === 1) {
        // Moving up; don't move one when we can move two
        moves = doubles.length ? doubles : singles;
      } else {
        // Moving down; don't move two when we can move one
        moves = singles.length ? singles : doubles;
      }

      for (const move of moves) {
        // Compute the resulting state of this move
        let newState = state;
        newState = putElevator(newState, toFloorIndex);

        for (const id of move) {
          newState = putObject(newState, id, toFloorIndex);
        }

        // Normalize and enqueue this state
        newState = normalize(newState, objectCount);
        queue.enqueue({ state: newState, steps: newSteps });
      }
    }
  } while (queue.size);

  return best.get(goal);
};

/**
 * Determines whether this move is safe.
 *
 * @param {number[]} fromFloor - the IDs of the objects on the floor the elevator is leaving
 * @param {number[]} toFloor - the IDs of the objects on the floor the elevator is going to
 * @param  {...number} toMove - the IDs of the objects being moved (should be in `fromFloor`)
 * @returns {boolean} - `true` if the move is safe; `false` otherwise
 */
const moveIsSafe = (fromFloor, toFloor, ...toMove) => {
  fromFloor = fromFloor.filter(id => !toMove.includes(id));
  toFloor = toFloor.concat(toMove);
  return floorIsSafe(fromFloor) && floorIsSafe(toFloor);
};

/**
 * Determines whether having the given objects on the same floor would be safe.
 *
 * @param {number[]} floor - the IDs of the objects on the floor
 * @returns {boolean} - `true` if this scenario is safe; `false` otherwise
 */
const floorIsSafe = floor => {
  const unpairedMicrochips = new Set();
  const generators = new Set();

  floor.forEach(id => {
    const pairId = getPairId(id);

    if (isMicrochip(id)) {
      if (generators.has(pairId)) {
        return;
      }

      unpairedMicrochips.add(id);
    } else {
      generators.add(id);
      unpairedMicrochips.delete(pairId);
    }
  });

  return unpairedMicrochips.size === 0 || generators.size === 0;
};
