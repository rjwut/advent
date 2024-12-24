const { match } = require('../util');

const INITIAL_WIRES_REGEXP = /^(?<wire>.+): (?<bit>[01])$/gm;
const GATES_REGEXP = /^(?<input0>.+) (?<operator>AND|OR|XOR) (?<input1>.+) -> (?<output>.+)$/gm;
const OPERATIONS = {
  AND: bits => bits[0] & bits[1],
  OR:  bits => bits[0] | bits[1],
  XOR: bits => bits[0] ^ bits[1],
};

/**
 * # [Advent of Code 2024 Day 24](https://adventofcode.com/2024/day/24)
 *
 * ## Part 1
 *
 * After parsing the input with regular expressions, we end up with a list of gates and the names
 * and values of some of the wires (specifically, the "input" wires into the system). We want to
 * find the values of the "output" wires once the inputs have propagated through the system. There's
 * a pretty straightforward way to solve this:
 *
 * 1. Create an array of unsolved gates; put all known gates into it.
 * 2. Create a map of known wires; put all input wires into it.
 * 3. While there are unsolved gates:
 *    1. Filter the unsolved gates to find those where both inputs are known wires.
 *    2. For each of those gates:
 *       1. Determine the gate's output value.
 *       2. Add the output wire with its value to the known wires.
 *
 * Once all gates have been solved, the known wires map will contain the values of all wires; filter
 * that to the `z` wires, sort them so that `z00` is last, and concatenate their values to get the
 * binary value of the output. Passing that into `parseInt()` with a radix of 2 will give us the
 * answer.
 *
 * ## Part 2
 *
 * The system described by the input is actually a (defective)
 * [ripple-carry adder](https://en.wikipedia.org/wiki/Adder_(electronics)). We can analyze the gates
 * described in the input and compare them against how an adder is supposed to be wired to find the
 * swapped outputs. We don't have to identify which wires must be swapped with each other; it is
 * enough simply to know which ones are wrong. We can make certain observations about how adders are
 * supposed to be wired and compare them with the system described in our input to find swapped
 * outputs.
 *
 * First, I'll describe some terms I use in describing the solution:
 *
 * - An "input gate" is a gate whose inputs are connected to an `x` wire and a `y` wire for a bit.
 *   Input gates are either `XOR` or `AND`
 * - A carry gates is an `XOR` or `AND` gate which is not an input gate. They are not present in bit
 *   `0`.
 *
 * Observations:
 *
 * - Since only outputs are swapped, we can be confident that we won't have any input gates that are
 *   cross-wired to multiple input bits.
 * - The input `XOR` gate attached to `x00` and `y00` must output to `z00`.
 * - All other input `XOR` gates must _not_ output to a `z` wire.
 * - The input `AND` gate attached to `x00` and `y00` must not output to any `z` wire.
 * - All gates that output to a `z` wire must be `XOR` gates, except for the one that outputs to
 *   `z45` (the final carry bit).
 * - Carry `XOR` gates must output to a `z` wire.
 * - Each input `XOR` gate (except in bit 0) must output to a carry `XOR` gate, which in turn
 *   outputs to the `z` wire for that bit.
 * - All `AND` gates (except in bit 0) must output to an `OR` gate.
 *
 * Gates found to violate these rules are added to a `Set` of bad gates. The set is mapped to
 * produce an array of output wires, which is then sorted and concatenated to produce the answer to
 * part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const { gates, wires } = parse(input);
  const parts = [ part1, part2 ];

  if (part !== undefined) {
    return parts[part - 1](gates, wires);
  }

  return [ part1, part2 ].map(part => part(gates, wires));
};

/**
 * Parses the input to produce an array of gates and a map of wires names and values. Each gate is
 * an object with the following properties:
 *
 * - `input: string[]`: Contains the names of the two input wires
 * - `operation: string`: One of: `'AND'`, `'OR'`, or `'XOR'`
 * - `output: string`: The name of the output wire
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsed gates and wires
 */
const parse = input => {
  const wires = match(input, INITIAL_WIRES_REGEXP)
    .reduce((acc, { wire, bit }) => {
      acc.set(wire, parseInt(bit, 10));
      return acc;
    }, new Map());
  const gates = match(input, GATES_REGEXP);
  gates.forEach(gate => {
    // Put inputs into an array
    gate.input = [ gate.input0, gate.input1 ];
    delete gate.input0;
    delete gate.input1;

    if (gate.input[0].startsWith('y') || gate.input[1].startsWith('x')) {
      // If a gate has an x wire input, make it element 0;
      // if it has a y wire input, make it element 1
      const temp = gate.input[0];
      gate.input[0] = gate.input[1];
      gate.input[1] = temp;
    }
  });
  return { gates, wires };
};

/**
 * Solves part one.
 *
 * @param {Object[]} gates - the gates
 * @param {Map<string, number>} wires - the wires
 * @returns {number} - the defective adder's output
 */
const part1 = (gates, wires) => {
  gates = [ ...gates ];

  // Propagate values through the system until all gates are solved
  do {
    gates
      .filter(gate => wires.has(gate.input[0]) && wires.has(gate.input[1]))
      .forEach(gate => {
        const { input, operator, output } = gate;
        const bits = input.map(wire => wires.get(wire));
        wires.set(output, OPERATIONS[operator](bits));
        const gateIndex = gates.indexOf(gate);
        gates.splice(gateIndex, 1);
      });
  } while (gates.length);

  wires = [ ...wires.entries() ].filter(([ wire ]) => wire.startsWith('z'));
  return parseInt(
    wires.sort((a, b) => -a[0].localeCompare(b[0]))
      .map(([ , bit ]) => bit)
      .join(''),
    2
  );
};

/**
 * Solves part two.
 *
 * @param {Object[]} gates - the gates
 * @returns {string} - the list of swapped outputs
 */
const part2 = gates => {
  const inputXorGates = new Array(45);
  const badGates = new Set();

  // Locate the input gates
  gates.filter(gate => gate.input[0].startsWith('x') && gate.input[1].startsWith('y'))
  .forEach(gate => {
    // Note the bit to which this gate corresponds
    gate.bit = parseInt(gate.input[0].slice(1), 10);


    if (gate.bit === 0) {
      // This gate is part of the initial half adder
      if (gate.operator === 'XOR') {
        // It's the XOR gate
        inputXorGates[0] = gate;

        if (gate.output !== 'z00') {
          // Must output to z00
          badGates.add(gate);
        }
      } else {
        // It's the AND gate
        if (gate.output.startsWith('z')) {
          // Must not output to a z wire
          badGates.add(gate);
        }
      }
    } else {
      // This gate is part of a full adder
      if (gate.output.startsWith('z')) {
        // Must not output to a z wire
        badGates.add(gate);
      } else if (gate.operator === 'XOR') {
        // It's the XOR gate
        inputXorGates[gate.bit] = gate;
      }
    }
  });

  // All gates that output to a z wire must be XOR (except z45)
  gates.filter(gate => gate.output.startsWith('z') && gate.output !== 'z45' && gate.operator !== 'XOR')
    .forEach(gate => badGates.add(gate));

  // Iterate all bits except 0
  for (let bit = 1; bit < 45; bit++) {
    // Find the carry XOR gate that is connected to the input gate for this bit
    const inputXor = inputXorGates[bit];
    const carryXor = gates.find(g => g.operator === 'XOR' && g.input.includes(inputXor.output));

    if (!carryXor) {
      // Input XOR gate must output to a carry XOR gate
      badGates.add(inputXor);
    } else if (!carryXor.output.startsWith('z')) {
      // Carry XOR gates must output to a z wire
      badGates.add(carryXor);
    }
  }

  // All AND gates (except for bit 0) must output to an OR gate
  const orInputs = gates.filter(gate => gate.operator === 'OR').map(gate => gate.input).flat();
  gates.filter(gate => gate.operator === 'AND' && gate.input[0] !== 'x00' && !orInputs.includes(gate.output))
    .forEach(gate => badGates.add(gate));

  // We've found the bad gates; get their outputs, the sort and concatentate them
  return [ ...badGates ].map(gate => gate.output).sort().join(',');
};
