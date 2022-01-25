const HEX = {
  '0': '0000',
  '1': '0001',
  '2': '0010',
  '3': '0011',
  '4': '0100',
  '5': '0101',
  '6': '0110',
  '7': '0111',
  '8': '1000',
  '9': '1001',
  'A': '1010',
  'B': '1011',
  'C': '1100',
  'D': '1101',
  'E': '1110',
  'F': '1111',
};
const TYPE_LITERAL = 4;
const EVALUATORS = [
  /**
   * Type `0`: Sum
   *
   * Computes the sum of the subpackets.
   *
   * @param {Object} packet - the packet to evaluate
   * @returns {number} - the computed value
   */
  packet => packet.subpackets.reduce((sum, subpacket) => {
    return sum + evaluatePacket(subpacket);
  }, 0),
  /**
   * Type `1`: Product
   *
   * Computes the product of the subpackets.
   *
   * @param {Object} packet - the packet to evaluate
   * @returns {number} - the computed value
   */
  packet => packet.subpackets.reduce((product, subpacket) => {
    return product * evaluatePacket(subpacket);
  }, 1),
  /**
   * Type `2`: Minimum
   *
   * Returns the minimum value of the subpackets.
   *
   * @param {Object} packet - the packet to evaluate
   * @returns {number} - the computed value
   */
  packet => packet.subpackets.reduce((min, subpacket) => {
    return Math.min(min, evaluatePacket(subpacket));
  }, Infinity),
  /**
   * Type `3`: Maximum
   *
   * Returns the maximum value of the subpackets.
   *
   * @param {Object} packet - the packet to evaluate
   * @returns {number} - the computed value
   */
  packet => packet.subpackets.reduce((max, subpacket) => {
    return Math.max(max, evaluatePacket(subpacket));
  }, -Infinity),
  /**
   * Type `4`: Literal
   *
   * Returns the packet's value. This packet type has no subpackets.
   *
   * @param {Object} packet - the packet to evaluate
   * @returns {number} - the literal value
   */
  packet => packet.value,
  /**
   * Type `5`: Greater than
   *
   * Returns `1` if `subpackets[0] > subpackets[1]`, `0` otherwise.
   *
   * @param {Object} packet - the packet to evaluate
   * @returns {number} - the computed value
   */
  packet => {
    const a = evaluatePacket(packet.subpackets[0]);
    const b = evaluatePacket(packet.subpackets[1]);
    return a > b ? 1 : 0;
  },
  /**
   * Type `6`: Less than
   *
   * Returns `1` if `subpackets[0] < subpackets[1]`, `0` otherwise.
   *
   * @param {Object} packet - the packet to evaluate
   * @returns {number} - the computed value
   */
  packet => {
    const a = evaluatePacket(packet.subpackets[0]);
    const b = evaluatePacket(packet.subpackets[1]);
    return a < b ? 1 : 0;
  },
  /**
   * Type `6`: Equal to
   *
   * Returns `1` if `subpackets[0] === subpackets[1]`, `0` otherwise.
   *
   * @param {Object} packet - the packet to evaluate
   * @returns {number} - the computed value
   */
  packet => {
    const a = evaluatePacket(packet.subpackets[0]);
    const b = evaluatePacket(packet.subpackets[1]);
    return a === b ? 1 : 0;
  },
];

/**
 * # [Advent of Code 2021 Day 16](https://adventofcode.com/2021/day/16)
 *
 * Part one is basically testing that you can correctly parse the packets into
 * a tree. Part two has you evaluating that tree to produce a computed value.
 *
 * My parsing strategy is as follows:
 *
 * - Split the hex string into characters, then convert each character into the
 *   corresponding bit sequence as desecribed in the puzzle to produce a string
 *   of bits.
 * - I wrap the string of bits in an object that is responsible for keeping
 *   track of the current offset position as I read the bits. This object is
 *   described in the documentation for `bitsReader()`.
 * - I then wrote methods that can accept this bits object and perform various
 *   parsing tasks: `parsePacket()`, `parseLiteral()`, and `parseOperator()`.
 *   (See the documentation for each of these methods for more details.)
 * - With those methods implemented, I can just pass the bits object to
 *   `parsePacket()` to read the root packet and all of its subpackets.
 *
 * To produce the answer for part one, I simply recursively walk the packet
 * tree and sum all the version numbers.
 *
 * To evaluate the tree to get the answer for part two, I created an
 * `evaluatePacket()` function that looks at the packet's type ID and delegates
 * to an evaluator function. These functions are stored in the `EVALUATORS`
 * array, indexed under their type IDs for easy lookup. Each function accepts
 * the packet and returns its computed value. For literal packets, this just
 * returns its value. For operator packets, it recurses through the subpackets
 * and delegates back to `evaluatePacket()` for each one.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, returnPacket) => {
  const bits = hexToReader(input);
  const packet = parsePacket(bits);

  if (returnPacket) {
    return packet;
  }

  return [ sumVersions([ packet ]), evaluatePacket(packet) ];
};

/**
 * Converts the given hex string to a bits reader object.
 *
 * @param {string} hex - the puzzle input
 * @returns {Object} - the bits reader object
 */
const hexToReader = hex => {
  return bitsReader([ ...hex ].map(c => HEX[c]).join(''));
};

/**
 * Sums the versions for the given array of packets (and all their subpackets).
 *
 * @param {Array} packets - the packets whose versions should be summed
 * @returns {number} - the computed sum
 */
const sumVersions = packets => {
  return packets.reduce((sum, packet) => {
    sum += packet.version;

    if ('subpackets' in packet) {
      sum += sumVersions(packet.subpackets);
    }

    return sum;
  }, 0);
};

/**
 * Wraps the given bits string into an object that tracks the read offset,
 * making it easy to read bits. The supported methods are:
 *
 * - `get(<bitCount>)`: Returns the next `bitCount` bits as a string.
 * - `getInt(<bitCount>)`: Returns the next `bitCount` bits as an integer.
 * - `hasMore()`: Returns `true` if there are more bits to read, `false`
 *   otherwise.
 *
 * @param {string} bits - the bits to be read
 * @returns {Object} - the bits reader object
 */
const bitsReader = bits => {
  let offset = 0;
  const reader = {
    get: bitCount => {
      const substr = bits.substring(offset, offset + bitCount);
      offset += bitCount;
      return substr;
    },
    getInt: bitCount => parseInt(reader.get(bitCount), 2),
    hasMore: () => bits.length - offset > 0,
  };
  return reader;
};

/**
 * Reads a single packet from the bits reader object. This reads the packet's
 * version and type ID, then delegates the rest of the parsing to
 * `parseLiteral()` or `parseOperator()`. Any bits that may come after the
 * packet are left unread.
 *
 * Packet objects have the following properties:
 *
 * - `version` (number)
 * - `typeId` (number)
 * - `value` (number, literal packets only)
 * - `subpackets` (array, operator packets only)
 *
 * @param {Object} reader - the bits reader object
 * @returns {Object} - the parsed packet
 */
const parsePacket = reader => {
  const packet = {
    version: reader.getInt(3),
    typeId: reader.getInt(3),
  }

  if (packet.typeId === TYPE_LITERAL) {
    packet.value = parseLiteral(reader);
  } else {
    packet.subpackets = parseOperator(reader);
  }

  return packet;
};

/**
 * Reads and returns a literal value from the bits reader. Assumes that the
 * version and type ID have already been read.
 *
 * @param {Object} reader - the bits reader object
 * @returns {number} - the literal value
 */
const parseLiteral = reader => {
  let binary = [];
  let lastChunk = false;

  do {
    const chunk = reader.get(5);
    lastChunk = chunk.charAt(0) === '0';
    binary.push(chunk.substring(1));
  } while (!lastChunk);

  return parseInt(binary.join(''), 2);
};

/**
 * Reads and returns an array of subpackets from the bits reader. Assumes that
 * the version and type ID of the superpacket have already been read.
 *
 * - If the length type ID is `0` (subpackets length in bits), it reads off
 *   that many bits, wraps them in a new bits reader, and then repeatedly
 *   delegates to `parsePacket()` with the new reader until it runs out of
 *   bits.
 * - If the length type ID is `1` (subpackets length in packets), it loops that
 *   many times, delegating to `parsePacket()` in each loop.
 *
 * @param {Object} reader - the bits reader object
 * @returns {Array} - the parsed subpackets
 */
const parseOperator = reader => {
  const subpackets = [];

  if (reader.getInt(1)) { // length type ID === 1
    const numberOfSubpackets = reader.getInt(11);

    for (let i = 0; i < numberOfSubpackets; i++) {
      subpackets.push(parsePacket(reader));
    }
  } else {
    const subpacketsLength = reader.getInt(15);
    const subpacketsReader = bitsReader(reader.get(subpacketsLength));

    while (subpacketsReader.hasMore()) {
      subpackets.push(parsePacket(subpacketsReader));
    }
  }

  return subpackets;
};

/**
 * Evalutes the given packet and returns its computed value. This delegates to
 * the corresponding entry in the `EVALUATORS` array.
 *
 * @param {Object} packet - the parsed packet object
 * @returns {number} - the computed value
 */
const evaluatePacket = packet => EVALUATORS[packet.typeId](packet);
