const { match, split } = require('../util');
const { add, multiply } = require('../math2');

const BLUEPRINT_REGEXP = /Each (?<output>\w+?) robot costs (?<cost>.+?)\./g;

/**
 * # [Advent of Code 2022 Day 19](https://adventofcode.com/2022/day/19)
 *
 * To keep the search time reasonable, I used a depth first search with the following rules:
 *
 * - At each branch, select the next robot to be built. The choices are subject to the following
 *   restrictions:
 *   - Don't choose a robot that requires a resource that we're not currently mining.
 *   - Don't choose a robot when we already have as many of that robot as the maximum amount of
 *     the corresponding resource to build any robot. For example, if the most amount of ore
 *     required to build any robot is five, don't build an ore robot if we already have five of
 *     them.
 *   - Don't choose a robot that can't be built in time for it to produce anything.
 * - Always fast-forward time to the next choice to be made, or to the end of the time limit if
 *   there are no more choices.
 * - Track the earliest time a geode is mined on any branch; prune branches that don't produce a
 *   geode by that time.
 * - Compute the theoretical maximum number of geodes that could possibly be produced (assuming
 *   that a geode robot is produced every turn from that moment until the time limit). Prune any
 *   branch where that number of geodes is less than the current best.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  let blueprints = split(input).map(line => new Blueprint(line));
  const part1 = add(blueprints.map(blueprint => blueprint.simulate(24) * blueprint.id));
  blueprints = blueprints.slice(0, 3);
  const part2 = multiply(blueprints.map(blueprint => blueprint.simulate(32)));
  return [ part1, part2 ];
};

/**
 * A single blueprint parsed from the input.
 */
class Blueprint {
  #id;
  #costs;
  #maxes;

  /**
   * Creates a `Blueprint` from a line of input.
   *
   * @param {string} line - the input line
   */
  constructor(line) {
    this.#id = Number(line.substring(10, line.indexOf(':')));
    this.#costs = new Map();
    this.#maxes = new Map();
    match(line, BLUEPRINT_REGEXP).forEach(record => {
      const cost = record.cost.split(' and ')
        .map(item => {
          let [ qty, resource ] = item.split(' ');
          qty = parseInt(qty, 10);
          this.#maxes.set(resource, Math.max(this.#maxes.get(resource) ?? 0, qty));
          return { qty, resource };
        });
      this.#costs.set(record.output, cost);
      this.#maxes.set('geode', Infinity);
    });
  }

  /**
   * @returns {number} - the `Blueprint` ID
   */
  get id() {
    return this.#id;
  }

  /**
   * Returns the maximum amount of the named resource required to build any robot.
   *
   * @param {string} resource - the resource
   * @returns {number} - the maximum amount of that resource required
   */
  getMaxRequired(resource) {
    return this.#maxes.get(resource);
  }

  /**
   * Determines the maximum number of geodes that can be produced within the time limit using this
   * `Blueprint`.
   *
   * @param {number} timeLimit - the time limit
   * @returns {number} - the maximum number of geodes produced
   */
  simulate(timeLimit) {
    let stack = [
      {
        time: 0,
        resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
        robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
        firstGeodeTime: null,
      },
    ];

    let mostGeodes = 0, fastestTimeToFirstGeode = Infinity;

    do {
      let { time, resources, robots, firstGeodeTime } = stack.pop();

      // Project best case geode production, assuming one geode robot built per minute from now
      // until the time limit. If projected production is less than the geodes produced by the best
      // completed branch so far, prune this branch.
      const timeLeft = timeLimit - time;
      const projectedGeodes = resources.geode + timeLeft * robots.geode + ((timeLeft - 1) * timeLeft) / 2;

      if (projectedGeodes < mostGeodes) {
        continue;
      }

      let buyChoices = this.#timeToBuy(resources, robots);

      // Don't build robots we can't build in time for them to produce anything.
      buyChoices = buyChoices.filter(({ delay }) => {
        return time + delay + 1 <= timeLimit;
      });

      if (buyChoices.length) {
        buyChoices.forEach(({ robotType, delay }) => {
          if (!robots.geode && robotType === 'geode') {
            // We're building our first geode robot, which means this branch will produce its first
            // geode at `time = delay + 2`.
            firstGeodeTime = time + delay + 2;

            if (fastestTimeToFirstGeode > firstGeodeTime) {
              // New fastest time to first geode!
              fastestTimeToFirstGeode = firstGeodeTime;
            } else if (fastestTimeToFirstGeode < firstGeodeTime) {
              // Didn't produce a geode fast enough; prune this branch.
              return;
            }
          }

          // Wait until we have enough resources to build this robot, plus one more minute for the
          // time to build it.
          const newResources = this.#wait(resources, robots, delay + 1);

          // Now pay the required resources and build the robot.
          this.#buy(newResources, robotType);
          const newRobots = {
            ...robots,
            [robotType]: robots[robotType] + 1,
          };

          // Enqueue the new state.
          const newTime = time + delay + 1;
          stack.push({
            time: newTime,
            resources: newResources,
            robots: newRobots,
            firstGeodeTime,
          });
        });
      } else {
        // We can't build anything in time for it to produce anything. Just mine resources until
        // the time runs out, then compute the quality level.
        const timeLeft = timeLimit - time;
        const newResources = this.#wait(resources, robots, timeLeft);

        if (mostGeodes < newResources.geode) {
          mostGeodes = Math.max(mostGeodes, newResources.geode);
        }
      }
    } while (stack.length);

    return mostGeodes;
  }

  /**
   * Determines how long we'd have to mine before we'd have enough resources to buy each type of
   * robot, assuming the current mining rate. Omit any robot types for which we're not mining a
   * required resource, or where we already have enough of them. Returns an array containing an
   * object for each robot that can be built, with the following properties:
   *
   * - `robotType` (`string`): The type of robot
   * - `delay` (`number`): The number of minutes we'd have to wait to have enough resources to
   *   build this robot
   *
   * @param {Object} resources - the resources on hand
   * @param {Object} robots - the robot inventory
   * @returns {Array<Object>} - the results
   */
  #timeToBuy(resources, robots) {
    const buyable = [];
    this.#costs.forEach((cost, robotType) => {
      if (this.#maxes.get(robotType) === robots[robotType]) {
        return; // We already have enough of this robot; don't make more.
      }

      let delay = 0;

      for (const { qty, resource } of cost) {
        const robotCount = robots[resource];

        if (!robotCount) {
          return; // We're not mining a required resource, so we can't buy it yet.
        }

        const qtyToMine = Math.max(qty - resources[resource], 0);
        delay = Math.max(delay, Math.ceil(qtyToMine / robotCount));
      }

      buyable.push({ robotType, delay });
    });
    return buyable;
  }

  /**
   * Returns the new state of our resources after waiting the given amount of time, assuming no
   * changes in our robot count.
   *
   * @param {Object} resources - the resources on hand
   * @param {Object} robots - the robot inventory
   * @param {number} timeToWait - the number of minutes to wait
   * @returns {Object} - the updated resources
   */
  #wait(resources, robots, timeToWait) {
    return Object.fromEntries(
      Object.entries(resources).map(
        ([ resource, qty ]) => [ resource, qty + timeToWait * robots[resource] ]
      )
    );
  }

  /**
   * Deducts the cost of construction for the named robot type from our resources.
   *
   * @param {Object} resources - the resources on hand
   * @param {string} robotType - the type of robot to build
   */
  #buy(resources, robotType) {
    this.#costs.get(robotType).forEach(({ qty, resource }) => {
      resources[resource] -= qty;
    });
  }
}
