const { match, split } = require('../util');
const aStar = require('../a-star');

const OBJECTS_REGEXP = /(?<element>[a-z]+)(?:-compatible)? (?<type>generator|microchip)/gm;
const DIRECTIONS = [ -1, 1 ];

/**
 * # [Advent of Code 2016 Day 11](https://adventofcode.com/2016/day/11)
 *
 * Simplified rule description:
 *
 * - There are four floors, labeled 1 to 4, connected by an elevator.
 * - There are two types of objects: generators and microchips.
 * - Objects can be moved between floors via the elevator.
 * - You and the elevator start at floor 1, and can only move one floor at a
 *   time.
 * - The elevator can only move if it carries you and at least one object. It
 *   can carry no more than two objects in addition to you.
 * - Each microchip is compatible with exactly one unique generator, identified
 *   by the element it uses to generate power.
 * - A microchip is fried if it is ever present on the same floor as an
 *   incompatible generator, unless its compatible generator is also present on
 *   the same floor.
 * - Objects in the elevator are considered to be on the floor the elevator is
 *   on.
 * - The objective is to move all objects to floor 4.
 *
 * Observations:
 * 
 * All chip/generator pairs are interchangable. This means, for example, that
 * the following two states are equivalent:
 *
 * ```
 * F4 .  .  .  .  .     F4 .  .  .  .  . 
 * F3 .  .  .  LG .     F3 .  .  .  HG . 
 * F2 .  HG .  .  .     F2 .  LG .  .  . 
 * F1 E  .  HM .  LM    F1 E  .  LM .  HM
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
 *   character is a letter assigned to the element, and the second is `'g'` for
 *   "generator" or `'m'` for "microchip".
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
 *   algorithm will treat them as the same node.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const startState = parse(input);
  const steps = run(startState);
  return [ steps, undefined ];
};

const parse = input => {
  const normalizer = new ElementNormalizer();
  const state = split(input)
    .map(
      floor => match(floor, OBJECTS_REGEXP)
        .map(object => {
          let { element, type } = object;
          element = normalizer.normalize(element);
          return element + type[0];
        })
    );
  state.floor = 0;
  return state;
};

const run = startState => {
  const stateCache = new Map();

  const getState = key => {
    let state = stateCache.get(key);

    if (!state) {
      const parts = key.split(':');
      state = parts[0].split('/').map(floor => floor.split(','));
      state.floor = parseInt(parts[1], 10);
      stateCache.set(key, state);
    }

    return state;
  };

  const cacheState = state => {
    normalizeState(state);
    const key = state.map(floor => floor.join()).join('/') + ':' + state.floor;
    stateCache.set(key, state);
    return key;
  }

  const getNextStateKeys = stateKey => {
    const state = getState(stateKey);
    const nextStates = [];
    const firstNonEmptyFloor = state.findIndex(floor => floor.length > 0);
    permuteObjectsToMove(state[state.floor]).forEach(objectsToMove => {
      const currentFloor = state[state.floor].filter(obj => !objectsToMove.includes(obj));  
      DIRECTIONS.forEach(direction => {
        const nextFloorIndex = state.floor + direction;
    
        if (nextFloorIndex >= firstNonEmptyFloor && nextFloorIndex < state.length) {
          const nextFloor = [ ...state[nextFloorIndex], ...objectsToMove ];
  
          if (!isFloorValid(nextFloor)) {
            return;
          }
  
          const stateClone = new Array(state.length);
    
          for (let i = 0; i < state.length; i++) {
            let newFloor;
  
            if (i === state.floor) {
              newFloor = [ ...currentFloor ];
            } else if (i === nextFloorIndex) {
              newFloor = nextFloor;
            } else {
              newFloor = state[i];
            }
    
            stateClone[i] = newFloor;
          }
  
          stateClone.floor = nextFloorIndex;
          nextStates.push({
            state: stateClone,
            count: objectsToMove.length,
            direction,
          });
        }
      });
    });
    const canMoveTwoUp = nextStates.some(({ count, direction }) => count === 2 && direction === 1);
    const canMoveOneDown = !canMoveTwoUp && nextStates.some(({ count, direction }) => count === 1 && direction === -1);
    return nextStates.filter(({ count, direction }) => {
      return !(
        canMoveTwoUp && count === 1 && direction === 1 ||
        canMoveOneDown && count === 2 && direction === -1
      );
    }).map(({ state }) => cacheState(state));
  };

  const startStateKey = cacheState(startState);
  const topFloor = startState.length - 1;
  const endStateRegExp = new RegExp(`^${'/'.repeat(topFloor)}[a-z,]+:${topFloor}$`);
  const endPredicate = stateKey => endStateRegExp.test(stateKey);
  const getEdges = stateStr => getNextStateKeys(stateStr).map(stateKey => ({ node: stateKey }))
  const result = aStar(startStateKey, endPredicate, getEdges, heuristic);
  return result.path.length - 1;
};

const permuteObjectsToMove = floor => {
  const permutations = [];

  for (let i = 0; i < floor.length; i++) {
    const obj0 = floor[i];

    for (let j = i; j < floor.length; j++) {
      const obj1 = floor[j];
      const objectsToMove = [ obj0 ];

      if (obj0 !== obj1) {
        objectsToMove.push(obj1);
      }

      permutations.push(objectsToMove);
    }
  }

  return permutations;
};

const isFloorValid = floor => {
  // Separate objects into generators and microchips.
  const types = floor.reduce((types, object) => {
    types[object[1]].push(object[0]);
    return types;
  }, { g: [], m: [] });
  // Check that each microchip is safe.
  return types.m.every(chipType => types.g.length === 0 || types.g.includes(chipType));
};

const heuristic = key => {
  const floors = key.substring(0, key.indexOf(':')).split('/');
  const topFloor = floors.length - 1;
  return floors.map(floor => floor.split(',').length)
    .reduce((score, floor, i) => score + (topFloor - i) * floor, 0);
};

const normalizeState = state => {
  const normalizer = new ElementNormalizer();
  state.forEach(floor => {
    floor.forEach((object, i) => {
      floor[i] = normalizer.normalize(object[0]) + object[1];
    });
    floor.sort();
  });
};

class ElementNormalizer {
  #map = new Map();

  normalize(element) {
    let normalized = this.#map.get(element);

    if (!normalized) {
      normalized = String.fromCharCode(this.#map.size + 97);
      this.#map.set(element, normalized);
    }

    return normalized;
  }
}
