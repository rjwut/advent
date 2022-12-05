const INSTRUCTION_REGEXP = /^move (?<count>\d+) from (?<from>\d+) to (?<to>\d+)$/;

/**
 * # [Advent of Code 2022 Day 5](https://adventofcode.com/2022/day/5)
 *
 * Parsing the input was the most annoying part of this puzzle, particularly the stacks diagram.
 * My existing parsing utility function worked against me here, as it would trim each line of the
 * input, messing up the columns of the stacks diagram!
 *
 * I located the blank line and split the input into two arrays of lines. For the stacks diagram, I
 * first determined how many columns there were by grabbing the last number in the last line of the
 * diagram, then trimming that line off. I then created an array of arrays to represent the stacks.
 *
 * For each line of the stack diagram, I iterated the stacks and checked the character at index
 * `stackIndex * 4 + 1`. If it wasn't a space, I pushed that character onto the bottom of the
 * stack. Iterating all the stacks and lines this way populated the stack arrays.
 *
 * The instructions were parsed by simply applying a `RegExp` to each line and converting the
 * captured numbers to integers.
 *
 * The two parts of the puzzle differed in how they moved crates between stacks: part one moved
 * crates one at a time, while part two moved all the crates in any given instruction at once. I
 * encoded these two movement methods in separate functions, then created an
 * `executeInstructions()` function which accepted a move function in the arguments to actually
 * perform each move. The move for part one was implemented by `pop()`ping each crate from the
 * source stack and `push()`ing it to the target stack. The part two move function used `splice()`
 * to grab all the crates at once from the source stack and append them to the target stack.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { stacks, instructions } = parse(input);
  return [ move1, move2 ].map(moveFn => {
    const clone = cloneStacks(stacks);
    executeInstructions(clone, instructions, moveFn);
    return clone.map(stack => stack[stack.length - 1]).join('');
  });
};

/**
 * Parse the input. The returned object has two properties:
 *
 * - `stacks` (`Array<Array<string>>`): Represents each stack of crates
 * - `instructions` (`Object`): The instructions for moving the crates:
 *   - `count` (`number`): The number of crates to move
 *   - `from` (`number`): The stack number to move crates from
 *   - `to` (`number`): The stack number to move crates to
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsed input
 */
const parse = input => {
  const lines = input.replaceAll('\r', '').split('\n');
  const blankIndex = lines.indexOf('');
  return {
    stacks: parseStacks(lines.slice(0, blankIndex)),
    instructions: parseInstructions(lines.slice(blankIndex + 1)),
  };
};

/**
 * Parses the stacks diagram in the input.
 *
 * @param {Array<string>} lines - the input lines for the stack diagram
 * @returns {Array<Array<string>>} - the stack arrays
 */
const parseStacks = lines => {
  const indexes = lines[lines.length - 1].trim();
  const stackCount = parseInt(indexes.substring(indexes.lastIndexOf(' ') + 1), 10);
  const stacks = new Array(stackCount);

  for (let i = 0; i < stackCount; i++) {
    stacks[i] = [];
  }

  lines = lines.slice(0, lines.length - 1);
  lines.forEach(line => {
    for (let i = 0; i < stackCount; i++) {
      const chr = line.charAt(i * 4 + 1);

      if (chr !== ' ') {
        stacks[i].unshift(chr);
      }
    }
  });
  return stacks;
};

/**
 * Parses the crate moving instructions.
 *
 * @param {Array<string>} lines - the input lines for the instructions
 * @returns {Array<Object>} - the instructions
 */
const parseInstructions = lines => lines.map(line => line.trim())
  .filter(line => line)
  .map(line => {
    const instruction = line.match(INSTRUCTION_REGEXP).groups;
    [ 'count', 'from', 'to' ].forEach(key => instruction[key] = parseInt(instruction[key]));
    return instruction;
  });

/**
 * Clones the given stacks array.
 *
 * @param {Array<Array<string>>} stacks - the stacks array
 * @returns {Array<Array<string>>} - the clone
 */
const cloneStacks = stacks => stacks.map(stack => [ ...stack ]);

/**
 * Runs the instructions on the given stacks. Actual execution of each move is delegated to the
 * given `moveFn` function.
 *
 * @param {Array<Array<string>>} stacks - the stacks to run the instructions on
 * @param {Array<Object>} instructions - the instructions to execute
 * @param {Function} moveFn - the function that actually performs a move
 */
const executeInstructions = (stacks, instructions, moveFn) => {
  instructions.forEach(({ count, from, to }) => {
    from = stacks[from - 1];
    to = stacks[to - 1];
    moveFn(count, from, to);
  });
};

/**
 * Performs a move instruction for part one.
 *
 * @param {number} count - the number of crates to move
 * @param {Array<string>} from - the stack from which to move crates
 * @param {Array<string>} to - the stack to which to move crates
 */
const move1 = (count, from, to) => {
  for (let i = 0; i < count; i++) {
    to.push(from.pop());
  }
};

/**
 * Performs a move instruction for part two.
 *
 * @param {number} count - the number of crates to move
 * @param {Array<string>} from - the stack from which to move crates
 * @param {Array<string>} to - the stack to which to move crates
 */
const move2 = (count, from, to) => {
  to.splice(to.length, 0, ...from.splice(from.length - count));
};
