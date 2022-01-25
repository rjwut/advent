const { lcm } = require('../math2');
const { split } = require('../util');

/**
 * # [Advent of Code 2020 Day 13](https://adventofcode.com/2020/day/13)
 *
 * Part one is easy: For each bus, simply divide the current time by the bus
 * interval, round up, then multiply by the interval. The bus that produces the
 * smallest resulting time value will be the next one to arrive. The puzzle
 * solution is that bus's ID times the number of minutes you have to wait for
 * that bus (the difference between the next time it arrives and the current
 * time).
 *
 * Part two asks you to find the earliest time `t` where each bus arrives at
 * `t + i`, where `i` is the bus's index in the array (zero-based). A bus whose
 * ID is replaced with an `x` may be ignored, but they still occupy an index
 * slot. The brute force solution, where we just iterate `t` until all the
 * schedules line up, would be prohibitively expensive. But there are some
 * ideas that can reduce the expense:
 * 
 * Idea #1: Since the buses have regular intervals, the solution can only fall
 * on values that align with them, so we don't have to test every value for
 * `t`. We can cut down the solution space to search by only checking values
 * for `t` where `(t - i) % n === 0`, where `n` is the largest bus ID and `i`
 * is the index of that bus. This is far fewer values to check, but still way
 * too many.
 * 
 * Idea #2: The interval over which any two busses' schedules line up will be
 * their least common multiple. (In this case, they're prime, so you can just
 * multiply them together, but I used LCM to make a more robust solution.) So
 * we can break the problem down by first finding the point where two busses'
 * schedules align. After that, we only have to check values on an interval of
 * the LCM of those two busses' IDs. Once the third one lines up, the new
 * interval is the LCM of the current interval and the third bus's ID. Each
 * time we align another bus, our interval increases, continually shrinking the
 * problem space, reducing it enough that the computation is now small enough
 * to calculate quickly.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const schedule = parse(input);
  return [ part1, part2 ].map(fn => fn(schedule))
};

/**
 * Parses the schedule data from the puzzle input. This object has these
 * properties:
 * - `startTime` (number): The earliest time you could depart.
 * - `ids` (array): The IDs of the buses (which indicate their departure
 *   interval).
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the schedule object
 */
 const parse = input => {
  const lines = split(input);
  return {
    startTime: parseInt(lines[0], 10),
    ids: lines[1].split(',')
      .map(id => id === 'x' ? null : parseInt(id, 10)),
  };
}

/**
 * Given the schedule data, solves part 1 of the puzzle.
 *
 * @param {Object} schedule - the schedule object
 * @returns {number} - the answer to part 1
 */
const part1 = schedule => {
  if (schedule.startTime === -1) {
    return;
  }

  const ids = schedule.ids.filter(id => id);
  let time = schedule.startTime;
  const earliest = ids.reduce((earliest, id) => {
    const nextTime = Math.ceil(time / id) * id;

    if (!earliest || nextTime < earliest.time) {
      return { id, time: nextTime };
    }

    return earliest;
  }, null);
  return (earliest.time - schedule.startTime) * earliest.id;
};

/**
 * Given the schedule data, solves part 2 of the puzzle.
 *
 * @param {Object} schedule - the schedule object
 * @returns {number} - the answer to part 2
 */
const part2 = schedule => {
  let time = 0, interval;
  schedule.ids.forEach((id, i) => {
    if (!id) {
      return
    }

    if (!time) {
      time = id;
      interval = id;
    }

    
    while ((time + i) % id !== 0) {
      time += interval;
    }

    interval = lcm(interval, id);
  }, null);

  return time;
};
