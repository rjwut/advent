const { match } = require('../util');

const EVENT_REGEXP = /^\[1518-(?<month>\d\d)-(?<day>\d\d) (?<hour>\d\d):(?<minute>\d\d)\] (?:Guard #(?<id>\d+) )?(?<type>begins shift|falls asleep|wakes up)$/gm;
const EVENT_SORT = (a, b) => {
  if (a.month !== b.month) {
    return a.month - b.month;
  }

  if (a.day !== b.day) {
    return a.day - b.day;
  }

  if (a.hour !== b.hour) {
    return a.hour - b.hour;
  }

  return a.minute - b.minute;
};
const MINUTES_PER_HOUR = 60;

/**
 * # [Advent of Code 2018 Day 4](https://adventofcode.com/2018/day/4)
 *
 * Once again, a regular expression makes it easy to parse the data, this time
 * into an array of event objects. For each event, I extract the month, day,
 * hour, minute, guard ID (if present), and event type (one of `'begins
 * shift'`, `'falls asleep'`, or `'wakes up'`). The events are sorted by date
 * and time.
 *
 * I then iterate the events and compile a sleep profile for each guard. Each
 * profile has the following properties:
 *
 * - `id` (number): The ID of the guard
 * - `timeAsleep` (number): The total time the guard was asleep
 * - `minutes` (Array): An array of 60 elements corresponding to the minutes
 *   being tracked. Each element contains the number of times that the guard
 *   has been observed sleeping at that minute.
 *
 * As each event is encountered, I perform the following actions:
 *
 * - `'begins shift'`
 *   1. Note the current guard ID.
 * - `'falls asleep'`
 *   2. Note the current minute.
 * - `'wakes up'`
 *   1. Retrieve the profile for the current guard, creating a new profile if
 *      this is the first time we've seen them.
 *   2. Add the duration of the sleep to their `timeAsleep` property.
 *   3. Increment each element of the `minutes` array corresponding to the time
 *      span during which the guard was asleep.
 *
 * Both parts make use of `Array.reduce()` to examine the sleep profiles. Part
 * one asks us to determine which is the sleepiest guard (the one that has
 * spent the most total time asleep), then find the minute during which they
 * were most often asleep. I implemented the first part as
 * `getSleepiestGuard()`, which finds the guard with the highest `timeAsleep`
 * property and returns that object. The second part was implemented as
 * `getSleepiestMinute()`, where I pass in a guard and it finds the minute
 * during which they were most frequently asleep. Multiplying the ID of the
 * sleepiest guard with their sleepiest minute gives us the answer to part one.
 *
 * The guard from part one was the most frequently asleep, but is less
 * predictably asleep at any particular time. Part two wants us to find the
 * guard that was most frequently asleep at the same minute. For this, I
 * performed a `reduce()` on the guards, first getting the guard's sleepiest
 * minute (re-using `getSleepiestMinute()`), then noting how often the guard
 * was asleep at that minute. If that count is higher than the current worst
 * offender, that guard becomes the new worst offender, and I note their ID,
 * sleepiest minute, and how many times they were asleep at that minute. When
 * I'm done iterating, the current worst offender is the one we want. I then
 * just multiply their ID and their sleepiest minute to get the answer for part
 * two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const events = parse(input);
  const guards = compile(events);
  return [ part1, part2 ].map(fn => fn(guards));
};

/**
 * Parses the input in to an array of event objects in time order. Each event
 * has the following properties:
 *
 * - `month` (number): The month of the event
 * - `day` (number): The day of the event
 * - `hour` (number): The hour of the event
 * - `minute` (number): The minute of the event
 * - `id` (number|`undefined`): The ID of the guard (if present)
 * - `type` (string): The type of event (one of `'begins shift'`, `'falls
 *   asleep'`, or `'wakes up'`)
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the parsed events
 */
const parse = input => match(input, EVENT_REGEXP, {
  month: Number,
  day: Number,
  hour: Number,
  minute: Number,
  id: id => id === undefined ? undefined : Number(id),
}).sort(EVENT_SORT);

/**
 * Compiles the events into a sleep profile object for each guard:
 *
 * - `id` (number): The ID of the guard
 * - `timeAsleep` (number): The total time the guard was asleep
 * - `minutes` (Array): An array of 60 elements corresponding to the minutes
 *   being tracked. Each element contains the number of times that the guard
 *   has been observed sleeping at that minute.
 *
 * @param {Array} events - the events objects
 * @returns {Array} - the guard sleep profile objects
 */
const compile = events => {
  const guards = new Map();
  let guardId;
  let fellAsleepAt;
  let guard;

  for (const event of events) {
    switch (event.type) {
    case 'begins shift':
      guardId = event.id;
      break;

    case 'falls asleep':
      fellAsleepAt = event.minute;
      break;

    case 'wakes up':
      guard = guards.get(guardId);

      if (!guard) { // new guard
        guard = {
          id: guardId,
          timeAsleep: 0,
          minutes: new Array(MINUTES_PER_HOUR).fill(0),
        };
        guards.set(guardId, guard);
      }

      for (let minute = fellAsleepAt; minute < event.minute; minute++) {
        guard.minutes[minute]++;
      }

      guard.timeAsleep += event.minute - fellAsleepAt;
      break;

    default:
      throw new Error(`Unknown event type: ${event.type}`);
    }
  }

  return [ ...guards.values() ];
};

/**
 * Computes the solution for part one:
 *
 * 1. Determine the ID of the guard that spends the most time asleep.
 * 2. Determine which minute that guard is most often sleeping.
 * 3. Return the product of the two values.
 *
 * @param {Array} guards - the guard sleep profiles
 * @return {number} - the answer for part one
 */
const part1 = guards => {
  const sleepiestGuard = getSleepiestGuard(guards);
  const sleepiestMinute = getSleepiestMinute(sleepiestGuard);
  return sleepiestGuard.id * sleepiestMinute.minute;
};

/**
 * Computes the solution for part two, by performing the following for each
 * guard:
 *
 * 1. Determine the guard's sleepiest minute.
 * 2. Look up how many times they were asleep that minute.
 * 3. If that count is higher than the current worst offender, that guard
 *    becomes the new worst offender.
 *
 * The function then returns the product of the worst offender's ID and their
 * sleepiest minute.
 *
 * @param {Array} guards - the guard sleep profiles
 * @returns {number} - the answer for part two
 */
const part2 = guards => {
  const worstOffender = guards.reduce((worst, guard) => {
    const sleepiestMinute = getSleepiestMinute(guard);

    if (sleepiestMinute.asleepCount > worst.asleepCount) {
      return {
        id: guard.id,
        ...sleepiestMinute
      };
    }

    return worst;
  }, { asleepCount: -1 });
  return worstOffender.id * worstOffender.minute;
};

/**
 * Returns the sleep profile for the guard that spent the most total time
 * asleep.
 *
 * @param {Array} guards - the guard sleep profiles
 * @returns {Object} - the sleep profile for the sleepiest guard
 */
const getSleepiestGuard = guards => guards.reduce((sleepiest, guard) => {
  return guard.timeAsleep > sleepiest.timeAsleep ? guard : sleepiest;
}, { timeAsleep: -1 });

/**
 * Returns an object representing the minute that the given guard was most
 * often asleep:
 *
 * - `minute` (number): The minute that the guard was most often asleep
 * - `asleepCount` (number): The number of times the guard was asleep at that
 *   minute
 *
 * @param {Object} guard - the guard's sleep profile
 * @returns {Object} - an object representing the minute they were most often
 * asleep
 */
const getSleepiestMinute = guard => guard.minutes.reduce(
  (worst, asleepCount, minute) => asleepCount > worst.asleepCount ? { asleepCount, minute } : worst,
  { asleepCount: -1 }
);
