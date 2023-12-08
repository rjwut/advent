const { match } = require('../util');
const { lcm } = require('../math2');

const LINE_REGEXP = /^(?<id>.{3}) = \((?<left>.{3}), (?<right>.{3})\)$/gm;

/**
 * # [Advent of Code 2023 Day 8](https://adventofcode.com/2023/day/8)
 *
 * I stored the nodes in a `Map` keyed by the node ID, which each node containing the names of the
 * nodes to the left and right of it. I also created a `Simulation` class to traverse the nodes,
 * invoking a callback function on each step. This function gets the current node ID and the step
 * index, and returns a boolean indicating whether to continue the simulation. Each step looks like
 * this:
 *
 * 1. Invoke the callback function with the current node ID and step index. If it returns `false`,
 *    stop the simulation.
 * 2. Get the current node and instruction.
 * 3. Update the current node according to the instruction.
 * 4. Increment the step index.
 *
 * For part 1, the callback function simply checks if the current node ID is `ZZZ`, and if so, sets
 * the current step index as the answer.
 *
 * For part 2, the ghosts move in very long cycles of varying lengths, stopping at exactly one end
 * node on the path every `n` steps (the cycle length). (The puzzle description doesn't say this;
 * we have to discover it by examining when we encounter exits as the ghosts move.) We run the
 * simulation for each starting ghost position. The callback function checks if the current node ID
 * ends with `Z`, and if so, sets the cycle length for that ghost equal to the current step index.
 *
 * Once we have the cycle lengths for each ghost, we find the least common multiple of all the the
 * cycle lengths, which is the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const simulation = new Simulation(input);

  if (part !== undefined) {
    return parts[part](simulation);
  }

  return parts.map(part => part(simulation));
};

/**
 * @param {Simulation} simulation - the `Simulation` object
 * @returns {number} - the answer to part 1
 */
const part1 = simulation => {
  let steps = 0;
  const onBeforeStep = (pos, step) => {
    if (pos === 'ZZZ') {
      steps = step;
      return false;
    }

    return true;
  }
  simulation.run('AAA', onBeforeStep);
  return steps;
}

/**
 * @param {Simulation} simulation - the `Simulation` object
 * @returns {number} - the answer to part 1
 */
const part2 = simulation => {
  const starts = [ ...simulation.nodes.keys() ].filter(id => id.endsWith('A'));
  const cycles = starts.map(start => {
    let cycleLength;

    const onBeforeStep = (pos, step) => {
      if (pos.endsWith('Z')) {
        cycleLength = step;
        return false;
      }

      return true;
    };
    simulation.run(start, onBeforeStep);
    return cycleLength;
  });
  return cycles.reduce((answer, length) => lcm(answer, length));
}

const parts = [ part1, part2 ];

/**
 * Simulates traversing the nodes.
 */
class Simulation {
  /**
   * Parses the input and stores the results in this object.
   *
   * @param {string} input - the puzzle input
   */
  constructor (input) {
    this.instructions = input.substring(0, input.indexOf('\n')).trim();
    this.nodes = match(input, LINE_REGEXP)
      .reduce((nodes, node) => {
        nodes.set(node.id, { L: node.left, R: node.right });
        return nodes;
      }, new Map());
  }

  /**
   * Performs a single simulation run. The provided callback function is invoked before each step.
   * It receives two arguments: the current node ID and the step index. It should return a boolean:
   * `true` to continue the simulation, or `false` to stop it.
   *
   * @param {string} start - the name of the node to start at
   * @param {Function} onBeforeStep - the callback function
   */
  run(start, onBeforeStep) {
    let pos = start;
    let step = 0;

    while (onBeforeStep(pos, step)) {
      const instruction = this.instructions[step % this.instructions.length];
      const node = this.nodes.get(pos);
      pos = node[instruction];
      step++;
    }
  }
}
