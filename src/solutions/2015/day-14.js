const { match } = require('../util');

const REGEXP = /^(?<name>\w+) can fly (?<distance>\d+) km\/s for (?<flyTime>\d+) seconds, but then must rest for (?<restTime>\d+) seconds\.$/gm;
const DEFAULT_TIME_LIMIT = 2503;

/**
 * # [Advent of Code 2015 Day 14](https://adventofcode.com/2015/day/14)
 *
 * It's possible to mathematically determine the answer to part one without
 * actually simulating the race. However, part two will require you to simulate
 * it anyway, so I don't bother. Parsing the input is easy using a `RegExp` and
 * my existing `match()` utility function. The time limit used by the example
 * is different than the real one, so the desired time limit is an optional
 * argument used by the test code.
 *
 * During the simulation, each reindeer is represented by a state object that
 * tracks the total distance flown, whether it's currently flying or resting,
 * how much longer it will continue flying/resting before switching, and its
 * current score. Each reindeer's status object is updated each tick. At the
 * end of the race, we extract the property we're interested in (the distance
 * for part one, and the score for part two) for each reindeer and find the
 * greatest one for the answer.
 *
 * One thing can trip you up in part two: For each tick, if there is a tie for
 * the lead, all the reindeer involved in the tie get a point, so your code
 * can't assume that only one point is being granted per second.
 *
 * @param {string} input - the puzzle input
 * @param {number} [timeLimit=2503] - the number of seconds the reindeer race
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, timeLimit = DEFAULT_TIME_LIMIT) => {
  const reindeer = match(input, REGEXP, {
    distance: Number,
    flyTime: Number,
    restTime: Number,
  });
  const state = simulate(reindeer, timeLimit);
  const part1 = Math.max(...state.map(reindeer => reindeer.distance));
  const part2 = Math.max(...state.map(reindeer => reindeer.score));
  return [ part1, part2 ];
};

/**
 * Simulate the race and return the results.
 *
 * The `reindeer` array contains objects with the following schema:
 *
 * - `name` (`string`): The reindeer's name
 * - `distance` (`number`): The distance the reindeer can fly before having to
 *   rest
 * - `flyTime` (`number`): How many seconds the reindeer can fly
 * - `restTime` (`number`): How many seconds the reindeer must rest after
 *   flying
 *
 * The function returns an array of objects with the following object schema:
 *
 * - `reindeer` (`Object`): Reference to a reindeer object from the `reindeer`
 *   input array
 * - `distance` (`number`): The total distance flown
 * - `flying` (`boolean`): Whether the reindeer is currently flying
 * - `timeLeft` (`number`): How much longer the reindeer will fly/rest
 * - `score` (`number`): The reindeer's score
 *
 * @param {Array<Object>} reindeer - the reindeer to race
 * @param {number} timeLimit - how long the race is in seconds
 * @returns {Array<Object>} - the results of the race
 */
const simulate = (reindeer, timeLimit) => {
  // Create initial state
  const state = reindeer.map(reindeer => ({
    reindeer,
    distance: 0,
    flying: true,
    timeLeft: reindeer.flyTime,
    score: 0,
  }));

  // Run the simulation
  for (let t = 0; t < timeLimit; t++) {
    for (const entry of state) {
      if (entry.flying) {
        // Distance only increases while flying
        entry.distance += entry.reindeer.distance;
      }

      entry.timeLeft--;

      if (entry.timeLeft === 0) {
        // Switch between flying and resting
        entry.flying = !entry.flying;
        entry.timeLeft = entry.reindeer[entry.flying ? 'flyTime' : 'restTime'];
      }
    }

    // Determine who is in the lead
    const lead = state.reduce(
      (lead, entry) => {
        if (entry.distance > lead.distance) { // new leader
          return { entries: [ entry ], distance: entry.distance };
        }

        if (entry.distance === lead.distance) { // tie for the lead
          lead.entries.push(entry);
        }

        return lead;
      },
      { distance: -Infinity }
    );

    // Give a point to all leaders
    lead.entries.forEach(entry => entry.score++);
  }

  return state;
};
