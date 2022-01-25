const PriorityQueue = require('../priority-queue');
const { group, match } = require('../util');

const ID_SORT = (a, b) => a.id.charCodeAt(0) - b.id.charCodeAt(0);
const FINISH_SORT = (a, b) => a.doneAt - b.doneAt;

const REQ_REGEXP = /^Step (?<before>\w) must be finished before step (?<after>\w) can begin\.$/gm;
const DEFAULT_OPTIONS = {
  workerCount: 5,
  baseTime: 60,
};

/**
 * # [Advent of Code 2018 Day 7](https://adventofcode.com/2018/day/7)
 *
 * As usual, the input is easily parsed with a simple regular expression,
 * resulting in an array of rules that declare a `before` step which must be
 * completed before the `after` step can be performed. These are then processed
 * into an array of step objects, each with an `id` and `prereqs` array stating
 * which steps must be completed before this step can start.
 *
 * For both parts of this puzzle, I make use of a `PriorityQueue`, which sorts
 * elements on insertion by a priority comparator function. The comparator
 * accepts two elements, and returns a negative number if the first element has
 * higher priority, a positive number if the second element has higher
 * priority, and `0` if they have equal priority.
 *
 * ## Part One
 *
 * This part just asks us to put the steps in the order they can be completed
 * by one individual, sorting alphabetically by step ID if more than one step
 * is ready when it's time to do the next one. Before I start the execution
 * loop, I create three data structures:
 *
 * - A `notReady` array, populated with all the steps
 * - A `ready` `PriorityQueue`, initially empty, which sorts by step ID
 * - A `done` array, initially empty
 *
 * The execution loop looks like this:
 *
 * 1. Split the steps in `notReady` into two arrays: steps that are ready now
 *    and steps that aren't.
 * 2. Enqueue all the steps that are ready into the `ready` queue; replace the
 *    `notReady` array with the remaining steps.
 * 3. Dequeue one step from `ready`, and push its ID into `done`.
 * 4. Repeat until `done` is as long as the original steps array.
 *
 * Concatenating `done` produces the answer for part one.
 *
 * ## Part Two
 *
 * We're now told how to compute the time each task will take, given five
 * workers, and asked to compute how long it will take to complete all the
 * steps. We use all the same data structures as in part one, but with an
 * additional `inProgress` `PriorityQueue` that sorts steps by the time that
 * they will be completed (with the addition of a `doneAt` property on the step
 * at the time it is started). We also set up `time` and `idle` variables to
 * track the current time and the number of idle workers, respectively.
 *
 * The execution loop for part two is like this:
 *
 * 1. While the `inProgress` queue is not empty:
 *    1. Check to see if the `doneAt` property on the next step to dequeue is
 *       equal to `time`. If not, break this loop and continue on to step 2 of
 *       the execution loop.
 *    2. Dequeue the next step from `inProgress`.
 *    3. Push the step's ID into `done`.
 *    4. Increment `idle`.
 * 2. As in part one, split the `notReady` steps into two arrays: steps that
 *    are now ready, and steps that aren't. Enqueue all the steps that are
 *    ready into the `ready` queue, and replace `notReady` with the remaining
 *    steps.
 * 3. While `idle` is greater than `0`, and `ready` is not empty:
 *    1. Dequeue a step from `ready`.
 *    2. Calculate the time when the step will be completed and store it in the
 *       the step's `doneAt` property.
 *    3. Enqueue the step into `inProgress`.
 *    4. Decrement `idle`.
 * 4. If `inProgress` is not empty, set `time` to the time that the next step
 *    will complete.
 * 5. Repeat until `inProgress` is empty.
 *
 * The answer to part two is the value stored in `time` when the loop ends.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, options) => {
  options = {
    ...DEFAULT_OPTIONS,
    ...options
  }
  const steps = parse(input);
  return [ part1, part2 ].map(fn => fn(steps, options));
};

/**
 * Computes the order in which the steps must be completed if performed by one
 * worker.
 *
 * @param {Array} steps - the steps to be completed
 * @returns {string} - the concatenated step IDs, in completion order
 */
const part1 = steps => {
  let notReady = [ ...steps ];
  const ready = new PriorityQueue(ID_SORT);
  const done = [];

  /**
   * Determines whether the given step is ready.
   *
   * @param {Object} step - the step to check
   * @returns {boolean} - `true` if it's ready; `false` otherwise
   */
  const isReady = step => step.prereqs.every(prereq => done.includes(prereq));

  do {
    const groups = group(notReady, isReady);
    notReady = groups.get(false) ?? [];
    ready.enqueueAll(groups.get(true) ?? []);
    done.push(ready.dequeue().id);
  } while (done.length < steps.length);

  return done.join('');
};

/**
 * Computes the amount of time it would take for some number of workers to
 * complete all the steps. The `options` object can have the following
 * properties:
 *
 * - `baseTime` (number): The base amount of time each step takes to complete.
 *   Each task will take an additional amount of time based on its ID.
 * - `workerCount` (number): The number of workers
 *
 * @param {Array} steps - the steps to be completed
 * @param {Object} options - the options for the computation
 * @returns {number} - the elapsed time when the steps are completed
 */
const part2 = (steps, options) => {
  let notReady = [ ...steps ];
  const ready = new PriorityQueue(ID_SORT);
  const inProgress = new PriorityQueue(FINISH_SORT);
  let time = 0;
  let idle = options.workerCount;
  let done = [];

  /**
   * Determines whether the given step is ready.
   *
   * @param {Object} step - the step to check
   * @returns {boolean} - `true` if it's ready; `false` otherwise
   */
  const isReady = step => step.prereqs.every(prereq => done.includes(prereq));

  /**
   * Determines whether the step's completion time has arrived.
   *
   * @param {Object} step - the step to check
   * @returns {boolean} - `true` if `doneAt` equals `time`; `false` otherwise
   */
  const isDone = step => step.doneAt === time;

  do {
    let step;

    // Dequeue any completed steps.
    while ((step = inProgress.dequeueIf(isDone))) {
      done.push(step.id);
      idle++;
    }

    // Figure out which steps are now ready.
    const groups = group(notReady, isReady);
    notReady = groups.get(false) ?? [];
    ready.enqueueAll(groups.get(true) ?? []);

    // Assign idle workers to any available steps.
    while (idle > 0 && !ready.empty) {
      step = ready.dequeue();
      step.doneAt = time + step.id.charCodeAt(0) - 64 + options.baseTime;
      inProgress.enqueue(step);
      idle--;
    }

    // Advance time to when the next step will be complete.
    if (!inProgress.empty) {
      time = inProgress.peek().doneAt;
    }
  } while (!inProgress.empty);

  return time;
};

/**
 * Parses the puzzle input into step objects. Each object has these properties:
 *
 * - `id` (string): The step's ID
 * - `prereqs` (Array): The IDs of the steps that must be completed before this
 *   step can be started
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the step objects
 */
const parse = input => {
  const steps = match(input, REQ_REGEXP)
    .reduce((steps, rule) => {
      let step = steps.get(rule.after);

      if (!step) {
        step = { id: rule.after, prereqs: [] };
        steps.set(rule.after, step);
      }

      step.prereqs.push(rule.before);
      step = steps.get(rule.before);

      if (!step) {
        step = { id: rule.before, prereqs: [] };
        steps.set(rule.before, step);
      }

      return steps;
    }, new Map());
  return [ ...steps.values() ];
};

