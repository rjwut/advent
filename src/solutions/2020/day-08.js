const { split } = require('../util');

/**
 * The available operations for the program.
 */
const OPERATIONS = {
  /**
   * Adjusts the value in the accumulator by `arg`, then moves to the next
   * instruction.
   * @param {Object} state - the virtual machine state 
   * @param {number} arg - the amount by which to adjust the accumulator 
   */
  acc: (state, arg) => {
    state.accumulator += arg;
    state.pointer++;
  },

  /**
   * Moves the instruction pointer by `arg`.
   * @param {Object} state - the virtual machine state 
   * @param {number} arg - the amount by which to adjust the instruction
   * pointer 
   */
  jmp: (state, arg) => {
    state.pointer += arg;
  },

  /**
   * Do nothing except move to the next instruction.
   * @param {Object} state - the virtual machine state 
   */
   nop: state => {
    state.pointer++;
  },
};

/**
 * # [Advent of Code 2020 Day 8](https://adventofcode.com/2020/day/8)
 *
 * I loved this one! We'll store the instruction pointer and the accumulator in
 * an object that represents the state of the virtual machine. We will also
 * create some functions that represent the three supported operations.
 *
 * First we parse the input program and convert it to an array of instructions.
 * Each instruction is an object which has an op code (one of `acc`, `jmp`,
 * `nop`), an operation (the function that corresponds to the op code), and an
 * argument (the numeric argument in the instruction).
 *
 * Both parts of the program require us to detect when we have entered an
 * endless loop. Part two requires us to change one instruction to make it so
 * that the program terminates normally (attempts to execute the non-existent
 * instruction after the last one), so we have to be able to handle both
 * situations when running our program. To detect an infinite loop, we simply
 * keep a `Set` of the indexes of all the instructions we have encountered, and
 * check it before we execute an instruction; if the index is already in the
 * `Set`, we've looped.
 *
 * I made a `run()` function that accepts the program (array of instruction
 * objects) and runs it until it either loops or terminates normally, then
 * returns an object that gives the current state of the virtual machine, plus
 * a property that indicates whether the program terminated normally or not.
 * That gives us enough to answer part one, which asks us to give the value of
 * the accumulator as soon as the program loops.
 *
 * Part two tells us that changing exactly one `jmp` to `nop` or `nop` to
 * `jmp` will result in the program terminating normally; we have to discover
 * which instruction to change, and return the value of the accumulator when
 * that program terminates. To do this, we can simply iterate the program
 * instructions and look for `jmp` or `nop` instructions. For each one, we
 * clone the program and replace that instruction, then run the program and
 * check to see if it terminated normally. If so, the accumulator value is our
 * answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const program = parse(input);
  return [ runAsIs(program), fixLoop(program) ];
};

/**
 * Parses the program source in the input into an array of instructions. Each
 * instruction is an object with three properties:
 * - `opCode` (string): The name of the operation as given in the source.
 * - `operation` (function): A function which executes the instruction. It
 *   expects two parameters: an object representing the state of the virtual
 *   machine, and the numeric argument from that line of the source code.
 * - `arg` (number): The numeric argument for the operation.
 *
 * @param {string} input - the program source
 * @returns {Array} - the program instructions
 */
const parse = input => split(input)
  .map(line => {
    const parts = line.split(' ');
    return {
      opCode: parts[0],
      operation: OPERATIONS[parts[0]],
      arg: parseInt(parts[1], 10),
    };
  });

/**
 * Runs the program without alterations, then returns the value of the
 * accumulator.
 *
 * @param {Array} program - the program instructions
 * @returns {number} - the accumulator value
 */
const runAsIs = program => run(program).accumulator;

/**
 * Repairs the program as indicated in the puzzle (by replacing a `jmp` with a
 * `nop` or vice-versa) so that it terminates normally, then returns the value
 * of the accumulator.
 *
 * @param {Array} program - the program instructions
 * @returns {number} - the accumulator value
 */
const fixLoop = program => {
  for (let i = 0; i < program.length; i++) {
    const instruction = program[i];

    if (instruction.opCode === 'acc') {
      continue;
    }

    const newOpCode = instruction.opCode === 'nop' ? 'jmp' : 'nop';
    const alteredProgram = [ ...program ];
    alteredProgram[i] = {
      opCode: newOpCode,
      operation: OPERATIONS[newOpCode],
      arg: instruction.arg,
    };
    const state = run(alteredProgram);

    if (state.terminatedNormally) {
      return state.accumulator;
    }
  }
};

/**
 * Runs this program until it terminates normally or an infinite loop is
 * detected, then returns the virtual machine state, which has three
 * properties:
 * - `accumulator` (number)
 * - `pointer` (number)
 * - `terminatedNormally` (boolean)
 * @param {Array} program - the program instructions
 * @returns {Object} - the virtual machine state when execution stops
 */
const run = program => {
  const state = {
    accumulator: 0,
    pointer: 0,
    terminatedNormally: false,
  };
  const visited = new Set();

  do {
    if (visited.has(state.pointer)) {
      return state;
    }

    visited.add(state.pointer);
    const instruction = program[state.pointer];
    instruction.operation(state, instruction.arg);

    if (state.pointer === program.length) {
      state.terminatedNormally = true;
      return state;
    }
  } while(true);
};
