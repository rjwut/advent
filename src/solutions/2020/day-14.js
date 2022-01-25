const { add } = require('../math2');
const { split } = require('../util');

const INTEGER_SIZE = 36;
const WRITE_REGEXP = /^mem\[(?<address>\d+)\] = (?<value>\d+)$/;

/**
 * # [Advent of Code 2020 Day 14](https://adventofcode.com/2020/day/14)
 *
 * Since the numeric values and addresses in this puzzle are 36 bits, and
 * JavaScript's number type is 32 bits, we'll be using `BigInt`s for them.
 *
 * The mask strings provided in the input are interpreted completely
 * differently in each part of the puzzle. The `parseMask()` function returns
 * an object with two methods, `part1()` and `part2()`, the handle the masking
 * behavior for each part.
 *
 * ## Part 1
 *
 * In this part, implemented by `executor1()`, values are written into memory
 * after being processed through the mask, where each bit is processed as
 * follows:
 *
 * - `0` or `1`: Overwrite the original value bit with this bit.
 * - `X`: Leave the original value bit unchanged.
 *
 * To handle this, we'll split the mask into two separate masks: the first will
 * be used to select only the bits that are not overridden, and the second will
 * be all `0`s except for the `1`s in the mask. To perform the desired masking
 * functionality, we `AND` the original value with the first mask, then `OR` it
 * with the second. For example, the example mask would be split like this:
 *
 * ```
 * Original mask: XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X
 *  Split mask 1: 111111111111111111111111111110111101
 *  Split mask 2: 000000000000000000000000000001000000
 * ```
 *
 * Applying the mask to a value of 11 would look like this:
 *
 * ```
 *     000000000000000000000000000000001011 (decimal 11)
 * AND 111111111111111111111111111110111101 (mask 1)
 * ----------------------------------------
 *     000000000000000000000000000000001001
 *  OR 000000000000000000000000000001000000 (mask 2)
 * ----------------------------------------
 *     000000000000000000000000000001001001 (decimal 73)
 * ```
 *
 * ## Part Two
 *
 * Part two, implemented by `executor2()`, writes the unchanged values against
 * masked _addresses_, and each bit is processed as follows:
 *
 * - `0`: Leave the original address bit unchanged.
 * - `1`: Overwrite the original address bit with `1`.
 * - `X`: Wildcard; addresses with either bit at this position will be updated.
 *
 * This means that one instruction can write the same value to _multiple_
 * addresses. We deal with this by first converting the original address to a
 * _wildcarded_ address, where we apply the mask rules and leave the `X`s in
 * place, as shown in the puzzle description. Then, in the `writer2()`
 * function, we use recursion to build every possible address that matches that
 * pattern, and write the value to each of those addresses.
 *
 * ## Putting It All Together
 *
 * It should be noted that the mask in the example for part one will take a
 * long time to process for part two (and we're given no answer for it,
 * anyway), so our module accepts a second argument: which part we want to
 * run. If we specify that argument, only the answer for that part is returned;
 * otherwise, we return the usual array with both parts. This lets the testing
 * module use separate example data for each part.
 *
 * After parsing the input and delegating to the executor for each part, the
 * return value is an object representing the memory for the docking program.
 * Then we just sum all the property values to produce the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const instructions = parseInstructions(input);
  const parts = [ executor1, executor2 ]

  if (typeof part === 'number') {
    return solve(instructions, parts[part - 1])
  }

  return parts.map(fn => solve(instructions, fn))
};

/**
 * Solves a part of the puzzle using the given function to execute the
 * instructions.
 *
 * @param {Array} instructions - the parsed instructions
 * @param {Function} executor - the executor function for this part of the
 * puzzle
 * @returns {number} - the puzzle answer
 */
const solve = (instructions, executor) => {
  const memory = executor(instructions);
  return add(Object.values(memory));
};

/**
 * Parses the input instructions and returns an array of objects representing
 * those instructions. Each object has a single mask array and an array of
 * objects representing memory writes using that mask.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the parsed instructions
 */
 const parseInstructions = input => {
  const instructions = [];
  let curMaskGroup;
  split(input).forEach(line => {
    if (line.startsWith('mask = ')) {
      curMaskGroup = {
        mask: parseMask(line.substring(7)),
        updates: []
      };
      instructions.push(curMaskGroup);
    } else {
      const match = line.match(WRITE_REGEXP).groups;
      curMaskGroup.updates.push({
        address: BigInt(match.address),
        value: BigInt(match.value),
      });
    }
  });
  return instructions;
};

/**
 * Converts the string representation of the mask to an object, containing
 * methods to perform masking for the puzzle solutions.
 *
 * @param {string} str - the string representation of the mask
 * @returns {Object} - the mask functions
 */
 const parseMask = str => {
  const decomposed = {
    part1: {
      and: [],
      or:  [],
    },
  };
  [ ...str ].forEach(chr => {
    if (chr === 'X') {
      decomposed.part1.and.push('1');      
      decomposed.part1.or.push('0');
    } else {
      decomposed.part1.and.push('0');
      decomposed.part1.or.push(chr);
    }
  });
  decomposed.part1.and = BigInt('0b' + decomposed.part1.and.join(''));
  decomposed.part1.or = BigInt('0b' + decomposed.part1.or.join(''));
  return {
    /**
     * Masks the given value according to the part 1 rules.
     * @param {bigint} value - the value to mask
     * @returns {bigint} - the masked value
     */
    part1: value => (value & decomposed.part1.and) | decomposed.part1.or,
    /**
     * Masks the given address according to the part 2 rules.
     * @param {bigint} address - the address to mask
     * @returns {string} - the wildcarded address string generated by the mask
     */
    part2: address => {
      const addressStr = toBits(address);
      return [ ...addressStr ].map((chr, i) => {
        const maskChar = str.charAt(i);
        return maskChar === '0' ? chr : maskChar;
      }).join('');
    },
  };
};

/**
 * Executes the given instructions according to the rules for part one and
 * returns the resulting memory structure.
 *
 * @param {Array} instructions - the parsed instructions
 * @returns {Object} - the resulting data in memory
 */
const executor1 = instructions => {
  const memory = {};
  instructions.forEach(group => {
    group.updates.forEach(update => {
      memory[update.address.toString()] = group.mask.part1(update.value);
    });
  });
  return memory;
};

/**
 * Executes the given instructions according to the rules for part two and
 * returns the resulting memory structure.
 *
 * @param {Array} instructions - the parsed instructions
 * @returns {Object} - the resulting data in memory
 */
const executor2 = instructions => {
  const memory = {};
  instructions.forEach(group => {
    group.updates.forEach(update => {
      const wildcardedAddress = group.mask.part2(update.address);
      writer2(memory, wildcardedAddress, update.value);
    });
  });
  return memory;
};

/**
 * Writes the given value to all memory addresses identified by the given
 * wildcarded address string.
 *
 * @param {Object} memory - the object storing memory values 
 * @param {string} wildcardedAddress - the addresses to write to, represented
 * in binary, with `X` in place of each floating bit
 * @param {bigint} value - the value to write at each address
 * @param {string} [partialAddress=''] - used during recursion to track the
 * address currently being built
 */
const writer2 = (memory, wildcardedAddress, value, partialAddress = '') => {
  const nextX = wildcardedAddress.indexOf('X', partialAddress.length);
  const limit = nextX === -1 ? wildcardedAddress.length : nextX; 
  partialAddress += wildcardedAddress.substring(partialAddress.length, limit);

  if (nextX !== -1) {
    writer2(memory, wildcardedAddress, value, partialAddress + '0');
    writer2(memory, wildcardedAddress, value, partialAddress + '1');
  }

  if (partialAddress.length === wildcardedAddress.length) {
    memory[partialAddress] = value;
  }
};

/**
 * Returns a 36-bit binary string representation of the given bigint.
 *
 * @param {bigint} value - the value to convert
 * @returns {string} - the value as a 36-bit binary number
 */
const toBits = value => {
  const str = value.toString(2);
  return '0'.repeat(INTEGER_SIZE - str.length) + str;
};
