const ITERATIONS_1 = 40;
const ITERATIONS_2 = 50;

/**
 * # [Advent of Code 2015 Day 10](https://adventofcode.com/2015/day/10)
 *
 * This is a pretty straightforward solution. It saves some time by not
 * re-computing the first 40 values in part two, but simply continuing to
 * compute values until it gets to 50 passes.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solver = input => {
  let value = input.trim();
  const answers = [];

  for (let i = 0; i < ITERATIONS_2; i++) {
    value = lookAndSayOnce(value);
    if (i + 1 === ITERATIONS_1) {
      answers[0] = value.length;
    }
  }

  answers[1] = value.length;
  return answers;
};

/**
 * Performs a single look-and-say pass.
 *
 * @param {string} input - the input value for the pass
 * @returns {string} - the output value for the pass
 */
const lookAndSayOnce = input => {
  const runs = [];
  let lastChr, runLength = 0;
  [ ...input ].forEach(chr => {
    if (chr !== lastChr && runLength) {
      runs.push(String(runLength), lastChr);
      runLength = 0;
    }

    runLength++;
    lastChr = chr;
  });
  runs.push(String(runLength), lastChr);
  return runs.join('');
};

solver.lookAndSayOnce = lookAndSayOnce;
module.exports = solver;