const { match } = require('../util');
const { add } = require('../math2');

const REGEXP = /^Valve (?<id>\w+) has flow rate=(?<flowRate>\d+); tunnels? leads? to valves? (?<adjacent>.+)$/gm;
const START_VALVE_ID = 'AA';

/**
 * # [Advent of Code 2022 Day 16](https://adventofcode.com/2022/day/16)
 *
 * Instead of working directly from the graph of the tunnels, you can produce an optimized graph
 * that omits all zero flow rate valves (except the start location), and where all the nodes are
 * connected to each other with edges that give the travel distance between them. (The exception is
 * the starting location, which is a zero flow rate valve; there's no reason to stop there again
 * once you leave it, so the edges connected to it are one-way). This speeds up the search by not
 * requiring you to simulate every step.
 *
 * Our optimized graph is stored in a `Map` of `Map`s, where the keys are valve IDs. You call
 * `get()` on the main `Map` with the valve ID where you're currently located, which returns
 * another `Map`. You then call `get()` on that `Map`, passing in the destination valve ID, to get
 * the distance between those valves. We build this graph by performing a breadth-first "flood
 * fill" of the graph from the start valve, and from each valve with a non-zero flow rate, storing
 * the distance as each valve is encountered during the fill.
 *
 * Finding the optimal path given the list of valves to open involves a similar search process.
 * With each step, I open the valve at my current location (except at the start), then branch on
 * the list of valves still left to open. With each branch, I check to make sure that I can reach
 * the valve and open it in time to have any effect on the pressure released, and skip it if I
 * can't. Otherwise, I compute the state of the simulation upon reaching the valve and push that
 * onto the stack. If I can't push anything onto the stack from this state, it means there's
 * nothing more I can do: either all the tasked valves are open, or I will run out of time before
 * I can open the next one. In that case, I'll just compute how much more pressure will be released
 * between now and when the time is up, and add that to the total amount of pressure released.
 *
 * For part two, we find all the different ways to divide the valves into two groups, ignoring ones
 * that don't divide the work evenly or which are duplicates (since both you and the elephant have
 * the same start location and are considered equivalent workers). For each scenario, we run the
 * same search we did on part one for both yourself and the elephant, and add the released pressure
 * from each. The scenario that produces the best sum is the one we want.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const graph = parse(input);
  const start = graph.get(START_VALVE_ID);
  const toOpen = [ ...graph.values()].filter(valve => valve.flowRate);
  const pathMap = buildPathMap(graph);
  const part1 = findOptimalPath(start, toOpen, pathMap, 30);
  const scenarios = divideWork(toOpen);
  const part2 = findOptimalDivision(start, scenarios, pathMap);
  return [ part1, part2 ];
};

/**
 * Parse the input into a graph, which is a `Map` containing `Valve`s keyed on their IDs.
 *
 * @param {string} input - the puzzle input
 * @returns {Map<string, Valve>} - the graph
 */
const parse = input => match(input, REGEXP, record => new Valve(record))
  .reduce((map, valve) => {
    map.set(valve.id, valve);
    return map;
  }, new Map());

/**
 * Builds an optimized graph giving the distances between any two non-zero flow rate valves, or
 * between one of those and the start. The optimized graph is a `Map` of `Map`s, where you `get()`
 * with the start ID, then `get()` with the target ID on the returned graph to get the distance.
 *
 * @param {Map<string, Valve} graph - the graph as produced by `parse()`
 * @returns {Map<string, Map<string, number>>} - the optimized graph
 */
const buildPathMap = graph => [ ...graph.values() ].reduce(
  (pathMap, valve) => {
    pathMap.set(valve.id, buildPathMapFrom(graph, valve));
    return pathMap;
  },
  new Map()
);

/**
 * Builds a single "sub-`Map`" as part of the graph returned by `buildPathMap()`.
 *
 * @param {Map<string, Valve} graph - the graph as produced by `parse()`
 * @param {Valve} valve - the start `Valve` for the sub-`Map`
 * @returns {Map<string, number>} - the sub-`Map`
 */
const buildPathMapFrom = (graph, valve) => {
  const pathMap = new Map();
  const queue = [ { valve, steps: 0 } ];
  const visited = new Set();

  do {
    const entry = queue.shift();

    if (entry.steps && !visited.has(entry.valve.id)) {
      visited.add(entry.valve.id);

      if (entry.valve.flowRate) {
        // Only allow destinations that have a non-zero flow rate.
        pathMap.set(entry.valve.id, entry.steps);
      }
    }

    const newSteps = entry.steps + 1;
    entry.valve.tunnels.filter(
      id => !visited.has(id)
    ).forEach(
      id => {
        queue.push({
          valve: graph.get(id),
          steps: newSteps,
        });
      }
    );
  } while (queue.length);

  return pathMap;
};

/**
 * Finds the optimal path for opening all the given valves.
 *
 * @param {Valve} start - the `Valve` to start at
 * @param {Set<Valve>} toOpen - the `Valve`s to open
 * @param {Map<string, Map<string, number>>} pathMap - the optimized graph
 * @param {number} maxTime - the time allowed
 * @returns {number} - the pressure released within the allotted time on the optimal path
 */
const findOptimalPath = (start, toOpen, pathMap, maxTime) => {
  const stack = [ {
    location: start,
    ppm: 0,
    toOpen: new Set(toOpen),
    released: 0,
    time: 0,
  } ];
  let best = 0;

  const done = ({ released }) => {
    if (released > best) {
      best = released;
    }
  };

  do {
    // The `toOpen` `Set` in the state contains only closed valves that have non-zero flow rates
    // which are assigned to this worker. Since we've already computed the distance between each of
    // these valves and between them and the start valve, we don't need to simulate the
    // intermediate steps; we can instead just jump straight to the next valve we want to open.
    let state = stack.pop();

    if (state.toOpen.has(state.location)) {
      // Open this valve
      state.toOpen.delete(state.location);
      state.released += state.ppm;
      state.ppm += state.location.flowRate;
      state.time++;
    }

    let deadEnd = true;

    // Branch on next destination valve
    for (let destination of state.toOpen) {
      const steps = pathMap.get(state.location.id).get(destination.id);

      if (state.time + steps > maxTime - 2) {
        // We must arrive at the valve with at least two seconds left on the clock in order for it
        // to make any difference (one second to open it, and one to allow some pressure to be
        // released). If there's not enough time left, skip this valve.
        continue;
      }

      stack.push({
        location: destination,
        ppm: state.ppm,
        toOpen: new Set(state.toOpen),
        released: state.released + steps * state.ppm,
        time: state.time + steps,
      });
      deadEnd = false;
    }

    if (deadEnd) {
      // Either all assigned valves are open, or we don't have enough time left to do anything
      // productive. Fast forward to the end of the simulation.
      state.released += state.ppm * (maxTime - state.time);
      done(state);
      continue;
    }
  } while (stack.length);

  return best;
};

/**
 * Divides the given array of `Valve`s into two sub-arrays, where each has an equal number of
 * `Valve`s (plus or minus one) and there are no duplicates where the two sub-lists are simply
 * switched.
 *
 * @param {Array<Valve>} - the `Valve`s
 * @returns {Array<Array<Valves>>} - the two sub-arrays
 */
const divideWork = valves => {
  const half = Math.floor(valves.length / 2);
  const stack = [ { unassigned: valves, taken: [] } ];
  const scenarios = [];

  do {
    const { unassigned, taken } = stack.pop();
    let entry = {
      unassigned: [ ...unassigned ],
      taken,
    };

    // Assign to other worker
    const valve = entry.unassigned.pop();

    if (entry.taken.length + entry.unassigned.length === half) {
      scenarios.push([ ...entry.taken, ...entry.unassigned ]);
    } else {
      stack.push(entry);
    }

    // Assign to this worker
    entry = {
      unassigned: entry.unassigned,
      taken: [ ...taken, valve ],
    };

    if (entry.taken.length === half) {
      scenarios.push(entry.taken);
    } else if (entry.taken.length + entry.unassigned.length === half) {
      scenarios.push([ ...entry.taken, ...entry.unassigned]);
    } else {
      stack.push(entry);
    }
  } while (stack.length);

  return scenarios.map(taken => {
    const untaken = valves.filter(valve => !taken.includes(valve));
    return [ taken, untaken ];
  });
};

/**
 * Tries all the work division scenarios and finds the one that produces the most released
 * pressure. Each scenario is an array containing two arrays of `Valve` objects, giving the
 * assigned `Valve`s for each worker. The evaluation of each task list is delegated to
 * `findOptimalPath()`.
 *
 * @param {Valve} start - the start `Valve`
 * @param {Array<Array<Array<Valve>>>} scenarios - the list of scenarios
 * @param {Map<string, Map<string, number>>} pathMap - the optimized graph
 * @returns {number} - the most released pressure of any scenario
 */
const findOptimalDivision = (start, scenarios, pathMap) => {
  let best = 0;
  scenarios.forEach(scenario => {
    const released = add(scenario.map(toOpen => findOptimalPath(start, toOpen, pathMap, 26)));

    if (released > best) {
      best = released;
    }
  });
  return best;
};

/**
 * Represents a single valve parsed from the input.
 */
class Valve {
  id;
  flowRate;
  tunnels;

  /**
   * Creates a new `Valve`.
   * @param {Object} matchObj - the match object from the `RegExp`
   */
  constructor(matchObj) {
    this.id = matchObj.id;
    this.flowRate = Number(matchObj.flowRate);
    this.tunnels = matchObj.adjacent.split(', ');
  }
}
