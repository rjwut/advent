const NUMERIC_SORT = (a, b) => a - b;

module.exports = {

/**
 * Returns the floor the elevator is on in the current state.
 *
 * @param {number} state - the current state
 * @returns {number} - the elevator floor
 */
getElevator: state => state & 3,

/**
 * Mutates the given state to put the elevator on the named floor.
 *
 * @param {number} state - the current state
 * @returns {number} - the floor to put the elevator on
 * @returns {number} - the mutated state
 */
putElevator: (state, floor) => (state & ~3) | floor,

/**
 * Mutates the given state to put the named id on the specified floor.
 *
 * @param {number} state - the current state
 * @param {number} id - the ID of the object to move
 * @param {number} floor - the floor to put the object on
 * @returns {number} - the mutated state
 */
putObject: (state, id, floor) => {
  const shift = (id + 1) * 2;
  return (state & ~(3 << shift)) | (floor << shift);
},

/**
 * Builds an array that shows what floor each object is on. Each element is an array that represents
 * the floor at that index. Each subarry contains the IDs of the objects on that floor.
 *
 * @param {number} state - the state to build the array from
 * @param {number} objectCount - the number of objects in the system
 * @returns {number[][]} - the described array
 */
getFloors: (state, objectCount) => {
  const floors = []

  for (let i = 0; i < 4; i++) {
    floors[i] = [];
  }

  for (let i = 0; i < objectCount; i++) {
    const floor = getObject(state, i);
    floors[floor].push(i);
  }

  return floors;
},

/**
 * Determines whether the object with the given ID is a microchip.
 *
 * @param {number} id - the object ID
 * @returns {number} - `true` if the object is a microchip, `false` if it is a generator
 */
isMicrochip: id => (id & 1) === 1,

/**
 * Determines the "pair" object for the named object; i.e. the corresponding generator for a
 * microchip, or vice versa.
 *
 * @param {number} id - the object ID
 * @returns {number} - the ID of the pair object
 */
getPairId: id => id ^ 1,

/**
 * Normalizes the given state so that equivalent states are always represented by the same value.
 *
 * @param {number} state - the state to normalize
 * @param {number} objectCount - the number of objects in the system
 * @returns {number} - the normalized state
 */
normalize: (state, objectCount) => {
  const chunks = [];
  const elementCount = objectCount >>> 1;

  for (let element = 0; element < elementCount; element++) {
    const shift = element * 4 + 2;
    chunks.push((state & (15 << shift)) >>> shift);
  }

  chunks.sort(NUMERIC_SORT);
  state &= 3;
  chunks.forEach((chunk, element) => {
    state |= chunk << (element * 4 + 2);
  });
  return state;
},

/**
 * Computes the given state's "debt," meaning the aggregate distance of each object from the goal
 * floor.
 *
 * @param {number} state - the state to compute debt for
 * @param {number} objectCount - the number of objects in the system
 * @returns {number} - the computed debt
 */
debt: (state, objectCount) => {
  let debt = 0;

  for (let i = 0; i < objectCount; i++) {
    const floor = getObject(state, i);
    debt += 3 - floor;
  }

  return debt;
},

/**
 * Determines the goal state for the system with the given number of objects.
 *
 * @param {number} objectCount - the number of objects in the system
 * @returns {number} - the goal state
 */
computeGoal: objectCount => 2 ** (objectCount * 2 + 2) - 1,

};

/**
 * Returns the floor the named object is on in the current state.
 *
 * @param {number} state - the current state
 * @param {number} id - the object ID
 * @returns {number} - the floor the object is on
 */
const getObject = (state, id) => {
  const shift = (id + 1) * 2;
  return (state & (3 << shift)) >>> shift;
};
