const { group, match, split } = require('../util');
const aStar = require('../a-star');

const OBJECTS_REGEXP = /(?<element>[a-z]+)(?:-compatible)? (?<type>generator|microchip)/gm;

/**
 * # [Advent of Code 2016 Day 11](https://adventofcode.com/2016/day/11)
 *
 * Simplified rule description:
 *
 * - There are four floors connected by an elevator.
 * - There are two types of objects: generators and microchips.
 * - Objects can be moved between floors via the elevator.
 * - You and the elevator start at the bottom floor, and can only move one
 *   floor at a time.
 * - The elevator can only move if it carries you and at least one object. It
 *   can carry no more than two objects in addition to you.
 * - Each microchip is compatible with exactly one unique generator, identified
 *   by the element it uses to generate power.
 * - A microchip is fried if it is ever present on the same floor as an
 *   incompatible generator while its compatible generator is not present.
 * - Objects in the elevator are considered to be on the floor the elevator is
 *   on.
 * - The objective is to move all objects to the top floor.
 *
 * Observations:
 * 
 * All chip/generator pairs are interchangable. This means, for example, that
 * the following two states are equivalent:
 *
 * ```
 * 3 .  .  .  .  .   |  3 .  .  .  .  . 
 * 2 .  .  .  gl .   |  2 .  .  .  gh . 
 * 1 .  gh .  .  .   |  1 .  gl .  .  . 
 * 0 E  .  mh .  ml  |  0 E  .  ml .  mh
 * ```
 *
 * Implementation details:
 *
 * - Although the problem explicitly states there are four floors, my parser
 *   would work for any number of floors. It assumes, however, that they are
 *   listed in order. It also makes no assumptions about what possible elements
 *   might appear.
 * - I treat the problem space as a graph: each potential state is a node, and
 *   the edges connect states that can be reached with a single move. I can
 *   then solve the problem with an A* search, using the sum of each object's
 *   distance from the top floor as the heuristic.
 * - Objects are converted to unique two-character codes, where the first
 *   character is the type (either `g` for generator or `m` for microchip) and
 *   the second is a letter assigned to the element.
 * - When a new state is generated, it is normalized so that the letters are
 *   assigned to elements in the order in which they are encountered as the
 *   floors are iterated. The codes on each floor are also sorted. This ensures
 *   that equivalent states can be identified because their normalized states
 *   will be identical.
 * - Each state has a string representation, which is simply the list of floors
 *   separated by slashes, with the objects on each floor separated by commas.
 *   At the end is a colon followed by the index of the elevator's current
 *   floor. This string representation is what represents a node to the A*
 *   algorithm. Since equivalent states translated to identical strings, the A*
 *   algorithm will treat them as the same node, reducing the search space.
 *
 * The example scenario given in the puzzle text becomes impossible with the
 * additional objects on the ground floor in part two, so it isn't tested.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const startState = parse(input);
  const steps1 = run(startState);
  startState.amendGroundFloor('gelerium', 'melerium', 'gdilithium', 'mdilithium');
  const steps2 = run(startState);
  return [ steps1, steps2 ];
};

/**
 * Parses the puzzle input and produces a `State` object representing it.
 *
 * @param {string} input - the puzzle input
 * @returns {State} - the beginning status
 */
const parse = input => new State(
  split(input).map(
    floor => match(floor, OBJECTS_REGEXP)
      .map(object => {
        let { element, type } = object;
        return new Item(type[0] + element);
      })
  ), 0
);

/**
 * Finds the solution given the starting state.
 *
 * @param {State} startState - the starting state
 * @returns {number} - the number of moves required
 */
const run = startState => {
  const stateCache = new Map();
  const prefix = '/'.repeat(startState.floorCount - 1);

  /**
   * Returns whether the given `State` key represents the goal `State`.
   *
   * @param {string} stateKey - the key to test
   * @returns {boolean} - whether it's the goal `State`
   */
  const endPredicate = stateKey => stateKey.startsWith(prefix);

  /**
   * Returns objects representing the edges of the graph connected to the node
   * represented by the given `State` key.
   *
   * @param {string} stateStr - the key for the `State`
   * @returns {Array<Object>} - the edges
   */
  const getEdges = stateStr => getNextStateKeys(stateStr).map(stateKey => ({ node: stateKey }));

  /**
   * Returns the `State` object corresponding to the given key. The `State`
   * objects are cached and re-used.
   *
   * @param {string} stateKey - the string key representing the state
   * @returns {State} - the corresponding state object
   */
  const getState = stateKey => {
    let state = stateCache.get(stateKey);

    if (!state) {
      state = new State(stateKey);
      stateCache.set(stateKey, state);
    }

    return state;
  };

  /**
   * Caches the given `State` object.
   *
   * @param {State} state - the `State` object to cache
   * @returns {string} - the key under which the object was cached
   */
  const cacheState = state => {
    const stateKey = state.toString();
    stateCache.set(stateKey, state);
    return stateKey;
  }

  /**
   * Determines what `State` keys are adjacent to the given `State` key.
   *
   * @param {string} stateKey - the key for the current `State`
   * @returns {Array<string>} - the keys for the adjacent `State`s
   */
  const getNextStateKeys = stateKey => getState(stateKey).possibleMoves().map(cacheState);

  /**
   * Returns the heuristic cost for the given `State` key. States that are
   * closer to the goal state will return lower heuristic costs.
   *
   * @param {string} key - the `State` key to evaluate
   * @returns {number} - the heuristic cost
   */
  const heuristic = key => {
    const floors = key.substring(0, key.indexOf(':')).split('/');
    const topFloor = floors.length - 1;
    return floors.map(floor => floor.split(',').length)
      .reduce((score, floor, i) => score + (topFloor - i) * floor, 0);
  };

  const startStateKey = cacheState(startState);
  const result = aStar(startStateKey, endPredicate, getEdges, heuristic);
  return result ? result.path.length - 1 : undefined;
};

/**
 * Represents a puzzle state.
 */
class State {
  #floors;
  #elevator;
  #key;

  /**
   * Creates a new `State` object.
   *
   * @param {Array<Item>|string} arg0 - the array representing the floors, or
   * the `State` key to "hydrate"
   * @param {number} [arg1] - the index of the floor where the elevator is
   * located (ignored if `arg0` is a string)
   */
  constructor(arg0, arg1) {
    if (typeof arg0 === 'string') {
      // Hydrate from string
      this.#key = arg0;
      const [ floorsPart, elevatorPart ] = arg0.split(':');
      this.#floors = floorsPart.split('/').map(
        floorStr => floorStr.split(',').map(
          key => new Item(key)
        )
      );
      this.#elevator = parseInt(elevatorPart);
    } else {
      this.#floors = arg0;
      this.#elevator = arg1;
      this.#normalize();
    }
  }

  /**
   * @returns {number} - the number of floors in the building
   */
  get floorCount() {
    return this.#floors.length;
  }

  /**
   * Adds `Item`s for the given keys to the ground floor (needed for part two).
   *
   * @param  {...string} itemKeys - the keys for the `Item`s to add
   */
  amendGroundFloor(...itemKeys) {
    const floor = this.#floors[0];
    itemKeys.forEach(key => {
      floor.push(new Item(key));
    });
    this.#normalize();
  }

  /**
   * Determines the possible next `State`s from the current one.
   *
   * @returns {Array<State>} - the next `State`s
   */
  possibleMoves() {
    const toFloors = [];

    if (this.#elevator < this.#floors.length - 1) {
      toFloors.push(this.#elevator + 1);
    }

    if (this.#elevator > 0) {
      toFloors.push(this.#elevator - 1);
    }

    const fromFloor = this.#floors[this.#elevator];
    const newStates = [];
    toFloors.filter(
      floorIndex => floorIndex >= 0 && floorIndex < this.#floors.length
    ).forEach(toIndex => {
      fromFloor.forEach((item1, i) => {
        for (let j = i; j < fromFloor.length; j++) {
          const newState = this.#move(toIndex, i === j ? [ item1 ] : [ item1, fromFloor[j] ]);

          if (newState) {
            newStates.push(newState);
          }
        }
      });
    });
    return newStates;
  }

  /**
   * Returns a string key representing this `State`.
   * @returns 
   */
  toString() {
    return this.#key;
  }

  /**
   * Creates a new `State` that reflects moving the indicated item(s). If the
   * move is unsafe, `move()` will return `null`.
   *
   * @param {number} toIndex - the index of the floor to which the `Item`s are
   * to be moved
   * @param {Array<Item>} item - the item(s) to move
   * @returns {State|null} - the new `State`, nor null if the move is unsafe
   */
  #move(toIndex, items) {
    const fromFloor = this.#floors[this.#elevator].filter(item => !items.includes(item));
    const toFloor = [ ...this.#floors[toIndex], ...items ];

    if (isSafe(fromFloor) && isSafe(toFloor)) {
      const floors = this.#floors.map((floor, i) => {
        if (i === this.#elevator) {
          return fromFloor;
        }

        if (i === toIndex) {
          return toFloor;
        }

        return [ ...floor ];
      });
      return new State(floors, toIndex);
    }
  }

  /**
   * Because item pairs are interchangeable, `State`s where the elements of
   * item pairs are switched represent the same logical state. This method will
   * rename the elements so that the string keys that represent equivalent
   * `State`s will be identical.
   */
  #normalize() {
    const map = new Map();
    const floors = this.#floors.map(
      floor => floor.map(
        item => {
          let normalized = map.get(item.element);

          if (!normalized) {
            normalized = String.fromCharCode(map.size + 97);
            map.set(item.element, normalized);
          }

          return new Item(item.type + normalized);
        }
      ).sort(Item.comparator)
    );
    this.#floors = floors;
    this.#key = this.#floors.map(
      floor => floor.map(item => item.toString()).join(',')
    ).join('/') + ':' + this.#elevator;
  }
}

/**
 * Represents an item (a generator or microchip).
 */
class Item {
  /**
   * Sorts `Item`s by their keys to ensure that equivalent `State`s can be
   * correctly identified without being affected by the order of the `Item`s on
   * the floors.
   *
   * @param {Item} i1 - the first `Item`
   * @param {Item} i2 - the second `Item`
   * @returns {number} - value as needed by `Array.prototype.sort()`.
   */
  static comparator(i1, i2) {
    const i1Key = i1.toString();
    const i2Key = i2.toString();
    return i1Key === i2Key ? 0 : (i1Key < i2Key ? -1 : 1);
  }

  #key;

  /**
   * Creates a new `Item` from its key.
   *
   * @param {string} key - the `Item` key
   */
  constructor(key) {
    this.#key = key;
  }

  /**
   * @returns {string} - `'g'` for a generator or `'m'` for a microchip
   */
  get type() {
    return this.#key[0];
  }

  /**
   * @returns {string} - the `Item`'s element
   */
  get element() {
    return this.#key.substring(1);
  }

  /**
   * Returns the `Item`'s key.
   *
   * @returns {string} - the key
   */
  toString() {
    return this.#key;
  }
}

/**
 * Returns `false` if any microchips would be fried with the given floor
 * configuration; `true` otherwise.
 *
 * @param {Array<Item>} floor - the floor configuration to test
 * @returns {boolean} - whether the floor configuration is safe
 */
const isSafe = floor => {
  const groups = group(floor, item => item.type);
  const microchips = groups.get('m') ?? [];
  const generators = groups.get('g') ?? [];
  return microchips.every(microchip => {
    const compatible = generators.find(generator => generator.element === microchip.element);
    const incompatible = generators.find(generator => generator.element !== microchip.element);
    return compatible || !incompatible;
  })
};
