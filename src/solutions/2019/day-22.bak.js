const { split } = require('../util');

const DEFAULT_SIZE = 10_007;
const INSTRUCTIONS = [
  {
    key: 'deal into new stack',
    fn: deck => deck.reverse(),
  },
  {
    key: 'cut',
    fn: (deck, n) => [ ...deck.slice(n), ...deck.slice(0, n) ],
  },
  {
    key: 'deal with increment',
    fn: (deck, n) => {
      const newDeck = new Array(deck.length);
      let j = 0;
      deck.forEach(card => {
        newDeck[j] = card;
        j = (j + n) % deck.length;
      });
      return newDeck;
    },
  },
];
const CARD_TO_FIND = 2019;

/**
 * # [Advent of Code 2019 Day 22](https://adventofcode.com/2019/day/22)
 *
 * The instruction list can be simplified, because some instructions can be
 * combined into a single instruction, and others can be reordered in order to
 * put instructions adjacent to each other to allow combining:
 * 
 * ```txt
 * Before                 After
 * ---------------------  ------------------------------------
 * deal into new stack    (nothing)
 * deal into new stack
 *
 * cut x                  cut (x + y) % length
 * cut y
 *
 * deal with increment x  deal with increment (x * y) % length
 * deal with increment y
 *
 * deal into new stack    cut length - x
 * cut x                  deal into new stack
 *
 * cut x                  deal with increment y
 * deal with increment y  cut (x * y) % length
 *
 * deal into new stack    deal with increment x
 * deal with increment x  cut count + 1 - x
 *                        deal into new stack
 * ```
 *
 * Some instructions can be reordered, as well:
 *
 * - A **deal into new stack** instruction followed by a **cut `x`**
 *   instruction can be
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, options) => {
  options = {
    return: 'answers',
    simplify: true,
    size: DEFAULT_SIZE,
    ...options,
  };
  let instructions = parse(input);

  if (options.simplify) {
    simplify(instructions, options.size);
  }

  if (options.return === 'deck') {
    const deck = createDeck(options.size);
    return execute(deck, instructions);
  }

  return [ part1(instructions, options.size), undefined ];
};

const part1 = (instructions, size) => {
  let deck = createDeck(size);
  deck = execute(deck, instructions);
  return deck.indexOf(CARD_TO_FIND);
};

const parse = input => {
  return split(input).map(line => {
    const instruction = INSTRUCTIONS.find(i => line.startsWith(i.key));

    if (!instruction) {
      throw new Error(`Unknown instruction: ${line}`);
    }

    let arg;

    if (line !== instruction.key) {
      // We have an argument
      arg = parseInt(line.substring(instruction.key.length + 1), 10);
    }

    return {
      key: instruction.key,
      fn: instruction.fn,
      arg,
    };
  });
};

const simplify = (instructions, size) => {
  let changed;

  do {
    changed = combine(instructions, size);

    if (!changed) {
      changed = rearrange(instructions, size);
    }
  } while (changed);
};

const combine = (instructions, size) => {
  let changed = false;

  for (let i = instructions.length - 2; i >= 0; i--) {
    const i0 = instructions[i];
    const i1 = instructions[i + 1];

    if (i0.key !== i1.key) {
      continue;
    }

    if (i0.key === 'deal into new stack') {
      instructions.splice(i, 2);
      i--;
      changed = true;
    } else if (i0.key === 'cut') {
      i0.arg += (i0.arg + i1.arg) % size;
      instructions.splice(i + 1, 1);
      changed = true;
    } else if (i0.key === 'deal with increment') {
      i0.arg = (i0.arg * i1.arg) % size;
      instructions.splice(i + 1, 1);
      changed = true;
    }
  }

  return changed;
};

const rearrange = (instructions, size) => {
  const limit = instructions.length - 2;
  let changed;

  for (let i = 0; i < limit; i++) {
    const i0 = instructions[i];
    const i1 = instructions[i + 1];
    const i2 = instructions[i + 2];

    if (i0.key !== i2.key) {
      continue;
    }

    if (i0.key === 'deal into new stack' && i1.key === 'cut') {
      i1.arg = (size - i1.arg) % size;
      const temp = i1;
      instructions[i + 1] = i0;
      instructions[i] = temp;
      changed = true;
    } else if (i0.key === 'cut' && i1.key === 'deal with increment') {
      i0.arg = (i0.arg * i1.arg) % size;
      const temp = i0;
      instructions[i] = i1;
      instructions[i + 1] = temp;
      changed = true;
    }
  }

  return changed;
};

const createDeck = size => {
  const deck = new Array(size);

  for (let i = 0; i < size; i++) {
    deck[i] = i;
  }

  return deck;
};

const execute = (deck, instructions) => {
  return instructions.reduce((d, instruction) => {
    return instruction.fn(d, instruction.arg);
  }, deck);
};
