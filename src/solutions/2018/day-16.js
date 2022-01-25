const { split } = require('../util');

const OPERATIONS = Object.values(require('./elfcode').operations);
const BEFORE_AND_AFTER_REGEXP = /^.+:\s+\[(\d+), (\d+), (\d+), (\d+)\]$/;

/**
 * # [Advent of Code 2018 Day 16](https://adventofcode.com/2018/day/16)
 *
 * Our solution must have the following three capabilities:
 *
 * 1. Determine which operations match a given sample.
 * 2. Deduce which opcode corresponds to which operation.
 * 3. Use the results of the deduction to run a program.
 *
 * The first step is easy: For each sample, we take the "before" register
 * values from the sample, run them through each operation using the arguments
 * specified in the sample instruction, and then compare the results against
 * the "after" register values from the sample. Each operation where they match
 * is a candidate for the opcode in the instruction.
 *
 * This is enough for part one: Do this for all the samples, and count how many
 * had at least three operation matches.
 *
 * The deduction step is not much more difficult. After we have analyzed each
 * sample as described above, we create an array of unsolved opcodes. Each one
 * starts with all sixteen operations as possible matches. We then iterate over
 * the samples, and compute the intersection of the possible operations for
 * each sample and the possible operations for the corresponding unsolved
 * opcode entry. This becomes the new set of possible operations for that
 * opcode.
 *
 * Once we've done this for all the samples, we will have at least one opcode
 * where the set of possible operations contains only one entry. That opcode is
 * now solved, so we remove it from the list of unsolved opcodes, look up the
 * corresponding operation implementation, and match them in our solved opcodes
 * table. That operation is now not a possible match for any of the remaining
 * unsolved opcodes, so we remove it as a candidate from each. We repeath this
 * procedure until all opcodes have been solved.
 *
 * Now that they're all solved, we can run the program. We start with our four
 * registers all set to zero. Then we just iterate each instruction, use
 * the opcode to look up the corresponding operation, and run that operation on
 * the registers (passing in the arguments from the instruction). When all the
 * instructions have been executed, register `0` contains the answer to part
 * two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
const solver = input => {
  const { samples, program } = parse(input);
  samples.forEach(analyzeSample);
  return [ part1(samples), part2(samples, program) ];
};

/**
 * Parses the input into a set of samples and a program. The returned object
 * has the following properties:
 *
 * - `samples' (`Array`): An array of sample objects:
 *   - `before` (`Array`): The register values before the instruction
 *   - `instruction` (`Array`): An opcode and three arguments
 *   - `after` (`Array`): The register values after the instruction
 * - `program` (`Array`): An array of instructions, where each is an array
 *   containing an opcode and three arguments
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsed input
 */
const parse = input => {
  let samples = split(input, { group: true })
  const program = samples[samples.length - 1].map(line => line.split(' ').map(Number));
  samples.splice(samples.length - 3, 3);
  samples = samples.map(parseSample);
  return { samples, program };
};

/**
 * Computes the answer to part one.
 *
 * @param {Array} samples - the sample objects
 * @returns {number} - the answer to part one
 */
const part1 = samples => samples.reduce(
  (count, sample) => count + (sample.analysis.size > 2 ? 1 : 0), 0
);

/**
 * Computes the answer to part two (the value in register `0` after the program
 * has been run).
 *
 * @param {Array} samples - the sample objects
 * @param {Array} program - the program instructions
 * @returns {number} - the answer to part two
 */
const part2 = (samples, program) => {
  const opcodeTable = deduceOpcodes(samples);
  const regs = run(program, opcodeTable);
  return regs[0];
};

/**
 * Parses a sample. The input is expected to be an array of three strings in
 * the following format:
 *
 * ```txt
 * Before: [3, 2, 1, 1]
 * 9 2 1 2
 * After:  [3, 2, 2, 1]
 * ```
 *
 * The above input would be parsed into the object below:
 *
 * ```json
 * {
 *   "before": [ 3, 2, 1, 1 ],
 *   "instruction": [ 9, 2, 1, 2 ],
 *   "after": [ 3, 2, 2, 1 ]
 * }
 * ```
 * 
 * @param {Array} lines - the input lines
 * @returns {Object} - the scenario object
 */
 const parseSample = lines => {
  const before = lines[0].match(BEFORE_AND_AFTER_REGEXP).slice(1).map(Number);
  const instruction = lines[1].split(' ').map(Number);
  const after = lines[2].match(BEFORE_AND_AFTER_REGEXP).slice(1).map(Number);
  return { before, instruction, after };
};

/**
 * Determines which instructions could match the given sample. Those
 * instructions are put into a `Set` and stored under the sample's `analysis`
 * property.
 *
 * @param {Object} sample - the sample object
 */
const analyzeSample = sample => {
  sample.analysis = OPERATIONS.reduce((set, op) => {
    const regs = [ ...sample.before ]
    op.fn(regs, sample.instruction.slice(1));

    if (regs.every((v, i) => v === sample.after[i])) {
      set.add(op.id);
    }

    return set;
  }, new Set());
};

/**
 * Deduces which opcode corresponds to which operation. The input is an array
 * of analyzed samples. The output is an operation lookup table: an array where
 * the index is the opcode and the value is the corresponding operation object
 * in the `OPERATIONS` array.
 *
 * @param {Array} samples - the analyzed sample objects
 * @returns {Array} - the operation lookup table
 */
const deduceOpcodes = samples => {
  // Create our initial unsolved opcodes list
  const ids = OPERATIONS.map(op => op.id);
  const unsolved = new Array(OPERATIONS.length);

  for (let i = 0; i < OPERATIONS.length; i++) {
    unsolved[i] = {
      opcode: i,
      ids: new Set(ids),
    };
  }

  // Reduce each opcode's possible operations to the intersection of all the
  // possible operations from each sample that uses that opcode.
  for (let sample of samples) {
    const opcodeObj = unsolved[sample.instruction[0]];
    opcodeObj.ids = intersection(opcodeObj.ids, sample.analysis);
  }

  const solved = new Array(OPERATIONS.length);

  while (unsolved.length) {
    // Find an opcode that has only one possible operation.
    const solvedIndex = unsolved.findIndex(opcode => opcode.ids.size === 1);

    if (solvedIndex === -1) {
      throw new Error('Could not deduce opcodes'); // shouldn't happen
    }

    // Match the opcode and operation in the solved opcodes table.
    const solvedObj = unsolved.splice(solvedIndex, 1)[0];
    const solvedId = [ ...solvedObj.ids ][0];
    solved[solvedObj.opcode] = OPERATIONS.find(op => op.id === solvedId);

    // That operation is taken; remove it as a possibility from the remaining
    // unsolved opcodes.
    unsolved.forEach(unsolvedObj => {
      unsolvedObj.ids.delete(solvedId);
    });
  }

  return solved;
};

/**
 * Runs the program using the opcode lookup table we built.
 *
 * @param {Array} program - the program instructions
 * @param {Array} opcodeTable - the opcode lookup table
 * @returns {Array} - the register values after the program has been run
 */
const run = (program, opcodeTable) => {
  const regs = [ 0, 0, 0, 0 ];

  for (const instruction of program) {
    const operation = opcodeTable[instruction[0]];
    operation.fn(regs, instruction.slice(1));
  }

  return regs;
};

/**
 * Returns a `Set` containing only those values found in both of the input
 * `Set`s.
 *
 * @param {Set} set1 - the first `Set`
 * @param {Set} set2 - the second `Set`
 * @returns {Set} - the intersection of the two `Set`s
 */
const intersection = (set1, set2) => new Set(
  [ ...set1 ].filter(x => set2.has(x))
);

/**
 * Provide testing access to the sample analysis functionality.
 *
 * @param {Array} input - the lines for a sample
 * @returns {Object} - the resulting sample object
 */
solver.analyzeSample = input => {
  const sample = parseSample(input);
  analyzeSample(sample);
  return sample;
};

module.exports = solver;
