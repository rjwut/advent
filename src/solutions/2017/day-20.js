const { add } = require('../math2');
const { group, match } = require('../util');

const PARTICLE_REGEXP = /^p=<(?<px>-?\d+),(?<py>-?\d+),(?<pz>-?\d+)>, v=<(?<vx>-?\d+),(?<vy>-?\d+),(?<vz>-?\d+)>, a=<(?<ax>-?\d+),(?<ay>-?\d+),(?<az>-?\d+)>$/gm;
const COMPONENTS = [ 'a', 'v', 'p' ];
const WAIT_FOR_COLLISIONS = 5;

/**
 * # [Advent of Code 2017 Day 20](https://adventofcode.com/2017/day/20)
 *
 * In part one, the phrase "in the long term" is key to solving the puzzle.
 * While you can simulate the particles (and will have to in step two), it's
 * easier to just realize that at T approaches infinity, acceleration trumps
 * velocity, and velocity trumps position. Any particle with a higher absolute
 * acceleration will eventually be further from the origin than a particle with
 * a lower absolute acceleration. If tied on acceleration, a particle with a
 * higher absolute velocity will eventually be futher from the origin than a
 * particle with lower absolute velocity. If also tied on velocity, the
 * particle that is closer to the origin will remain closer. So sort the
 * particles by absolute acceleration, then by absolute velocity, and finally
 * by absolute position. The ID of the lowest-sorted one is the answer to part
 * one.
 *
 * For part two, you have to have some way to detect that there will be no more
 * collisions. Originally, I was being clever and checked to see if any
 * particles were capable of moving toward each other to potentially have a
 * future collision. However, experimentation showed that after the first
 * collision, all remaining collisions happened no more than two ticks apart.
 * I wasn't sure whether this would be true for every possible input, so I
 * bumped that threshold up to five.
 *
 * For both parts, the position, velocity, and acceleration of each particle is
 * represented as arrays with three integer elements. This facilitates writing
 * code that can operate on any component of a particle, and iterate through
 * the dimensions with ease.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - the part to solve
 * @returns {Array|number} - the puzzle answer(s)
 */
module.exports = (input, part) => {
  const particles = parse(input);
  const parts = [ part1, part2 ];

  if (part) {
    return parts[part - 1](particles);
  }

  return parts.map(fn => fn(particles));
};

/**
 * Parses the input into an array of particle objects:
 *
 * - `id` (number): The particle's ID
 * - `p` (Array): The particle's position
 * - `v` (Array): The particle's velocity
 * - `a` (Array): The particle's acceleration
 *
 * The position, velocity, and acceleration are represented as arrays with
 * three integer elements, representing the X, Y, and Z dimensions.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the particle objects
 */
const parse = input => {
  return match(input, PARTICLE_REGEXP, (particle, id) => ({
    id,
    p: [ Number(particle.px), Number(particle.py), Number(particle.pz) ],
    v: [ Number(particle.vx), Number(particle.vy), Number(particle.vz) ],
    a: [ Number(particle.ax), Number(particle.ay), Number(particle.az) ],
  }));
};

/**
 * Determines the ID of the particle that will be closest to the origin long
 * term (the answer to part one).
 *
 * @param {Array} particles - the particles
 * @returns {number} - the ID of the closest particle
 */
const part1 = particles => {
  particles.sort(particleComparatorPart1);
  return particles[0].id;
};

/**
 * Determines how many particles are left after all collisions have occurred.
 *
 * @param {Array} particles - the particles
 * @returns {number} - the number of remaining particles
 */
const part2 = particles => {
  let tick = 0, lastCollisionTick = Infinity;

  do {
    // Move all particles
    tick++;
    particles.forEach(particle => {
      applyComponent(particle, 'a', 'v');
      applyComponent(particle, 'v', 'p');
    });

    // Group particles by their current positions and remove those that collided
    const groups = group(particles, particleToPositionKey);
    const collisions = [ ...groups.values() ].filter(group => group.length > 1);

    if (collisions.length > 0) {
      for (const collision of collisions) {
        collision.forEach(particle => {
          const index = particles.indexOf(particle);
          particles.splice(index, 1);
        });
      }

      lastCollisionTick = tick;
    }
  } while (tick - lastCollisionTick !== WAIT_FOR_COLLISIONS);

  return particles.length;
};

/**
 * Computes the absolute sum of the given component for a particle.
 *
 * @param {Object} particle - the particle to compute the absolute sum for
 * @param {string} component - one of `'a'`, `'v'`, or `'p'`
 * @returns {number} - the absolute sum of the given component
 */
const computeAbsoluteSum = (particle, component) => {
  return add(particle[component].map(coord => Math.abs(coord)));
};

/**
 * Comparator function that sorts particles according to part one's criteria.
 *
 * @param {Object} a - the first particle
 * @param {Object} b - the second particle
 * @returns {number} - the comparison result
 */
const particleComparatorPart1 = (a, b) => {
  let c;

  for (const component of COMPONENTS) {
    c = computeAbsoluteSum(a, component) - computeAbsoluteSum(b, component);

    if (c !== 0) {
      return c;
    }
  }

  return c;
};

/**
 * Applies the `from` component of the particle to its `to` component. For
 * example, if `from` is `'a'` and `to` is `'v'`, then the acceleration values
 * will be added to the corresponding velocity values.
 *
 * @param {Object} particle - the particle to update
 * @param {string} from - the component to apply from (`'a'` or `'v'`)
 * @param {string} to - the component to apply to (`'v'` or `'p'`)
 */
const applyComponent = (particle, from, to) => {
  particle[to].forEach((coord, i) => {
    particle[to][i] = coord + particle[from][i];
  });
};

/**
 * Returns a string representing the given particle's current position.
 *
 * @param {Object} particle - the particle
 * @returns {string} - the position key
 */
const particleToPositionKey = particle => particle.p.join();
