const { add, lcm } = require('../math2');
const { split } = require('../util');

const MOON_REGEXP = /^<x=(?<x>-?\d+), y=(?<y>-?\d+), z=(?<z>-?\d+)>$/;
const AXIS_INDEXES = [ 0, 1, 2 ];

/**
 * The first part is pretty straightforward. I created an object which
 * represents the entire system, and has `step()` method for running a single
 * step of the simulation, and a `computeEnergy()` method to compute the answer
 * for part one.
 *
 * It would take forever to simulate enough steps to get the system back to its
 * initial state, but the key to the solution is to realize that the velocities
 * on each axis do not affect the other axes. So you can just compute the cycle
 * for each axis independently, and then find the least common multiple of the
 * three cycles to get the cycle for the whole system.
 *
 * To do this, I first capture the state of each axis of the system at the
 * start. (I do this by extracting the X position and velocity from each moon
 * and stringifying them, then repeating for the Y and Z axes.) Then, after
 * each step in the simulation, I capture the axis states again and compare
 * them against the original states. If an axis state matches, I've found the
 * cycle for that axis and record it. I continue simulating until the cycles
 * for all three axes are found.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, targetSteps = 1000) => {
  const system = parse(input);
  const startingAxisStates = system.getAxisStates();
  const axisCycles = new Array(3);
  let stepsTaken = 0, energyAfterTargetSteps, computedAxisCycles = 0;

  do {
    system.step();

    if (++stepsTaken === targetSteps) {
      energyAfterTargetSteps = system.computeEnergy();
    }

    const axisStates = system.getAxisStates();

    for (let i = 0; i < 3; i++) {
      if (axisCycles[i] === undefined && axisStates[i] === startingAxisStates[i]) {
        axisCycles[i] = stepsTaken;
        computedAxisCycles++;
      }
    }
  } while (stepsTaken < targetSteps || computedAxisCycles !== 3);

  let cycle = lcm(axisCycles[0], axisCycles[1]);
  cycle = lcm(cycle, axisCycles[2]);
  return [ energyAfterTargetSteps, cycle ];
};

/**
 * Produces an object representing the system, using the input to set the
 * initial positions of the moons.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the system object
 */
const parse = input => {
  const moons = split(input)
    .map(line => line.match(MOON_REGEXP).groups)
    .map(moon => ({
      pos: [
        parseInt(moon.x, 10),
        parseInt(moon.y, 10),
        parseInt(moon.z, 10),
      ],
      vel: [ 0, 0, 0 ],
    }));

  /**
   * Invokes the given callback function with each pair of moons in the system.
   *
   * @param {Function} fn - the callback function
   */
  const iteratePairs = fn => {
    for (let i = 0; i < moons.length; i++) {
      for (let j = i + 1; j < moons.length; j++) {
        fn(moons[i], moons[j]);
      }
    }
  };

  /**
   * Returns the state of one axis in the system. You must pass in the index of
   * the desired axis (`0` = x, `1` = y, `2` = z).
   *
   * @param {number} axisIndex - the index of the desired axis
   * @returns {string} - the axis state
   */
  const getAxisState = axisIndex => JSON.stringify(
    moons.map(moon => ({
      pos: moon.pos[axisIndex],
      vel: moon.vel[axisIndex],
    }))
  );

  /**
   * Computes the total energy for the given moon.
   *
   * @param {Object} moon - the moon
   * @returns {number} - the computed energy
   */
  const computeMoonEnergy = moon => {
    const potential = add(moon.pos.map(Math.abs));
    const kinetic = add(moon.vel.map(Math.abs));
    return potential * kinetic;
  };
  
  return {
    /**
     * Runs a single step of the simulation.
     */
    step: () => {
      // Apply gravity
      iteratePairs((moon1, moon2) => {
        for (let d = 0; d < 3; d++) {
          const delta = Math.sign(moon1.pos[d] - moon2.pos[d]);
          moon1.vel[d] -= delta;
          moon2.vel[d] += delta;
        }
      });

      // Apply velocity
      moons.forEach(moon => {
        for (let d = 0; d < 3; d++) {
          moon.pos[d] += moon.vel[d];
        }
      });
    },

    /**
     * Computes the total energy of the system.
     *
     * @returns {number} - the computed energy
     */
    computeEnergy: () => add(moons.map(computeMoonEnergy)),

    /**
     * Returns the state of each axis in the system.
     *
     * @returns {Array} - the axis states
     */
    getAxisStates: () => AXIS_INDEXES.map(getAxisState),
  }
};
