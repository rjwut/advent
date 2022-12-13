const IntcodeVm = require('./intcode');

const NETWORK_SIZE = 50;

/**
 * # [Advent of Code 2019 Day 23](https://adventofcode.com/2019/day/23)
 *
 * Each computer on the network is represented by an object with three
 * properties:
 *
 * - `api`: The `api` property of the Intcode computer (to send input and run
 *   the program).
 * - `state`: The `state` property of the Intcode computer (to read output).
 * - `inputQueue`: An array of packets waiting to be input into the computer.
 *   Each packet is represented by a two-element array.
 *
 * The function which builds and runs the network receives the Intcode program
 * to run on each computer, and an object which represents the NAT. It is the
 * NAT object which reports the answer to each part. The implementation of the
 * NAT object is the part that differs between part one and part two. See the
 * `part1()` and `part2()` methods for details about the two NAT
 * implementations.
 *
 * The network loop looks like this:
 *
 * 1. For each computer:
 *    1. If the computer has no output, continue to the next computer.
 *    2. Read the first value as the destination address.
 *    3. Combine the second and third values into a packet.
 *    4. If the destination address is 255, pass the packet to
 *       `nat.onPacket()`. If `nat.onPacket()` returns a value, that is the
 *       puzzle answer.
 *    5. If the destination address is not 255, push the packet onto the input
 *       queue for the computer at the address specified by the first value.
 *    6. Go back to step 1 for this computer.
 * 2. If no computer attempted to send a packet to the NAT, invoke
 *    `nat.onIdle()`, passing in a function which will pass along the argument
 *    to the computer at address `0`. If `nat.onIdle()` returns a value, that
 *    is the puzzle answer.
 * 3. For each computer:
 *    1. If the computer's input queue is empty, input a `-1` into the Intcode
 *       interpreter.
 *    2. If the computer's input queue is not empty, take a packet from the
 *       queue, and input its two values into the Intcode interpreter.
 * 4. Go back to step 1 of the network loop.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  return [ part1, part2 ].map(fn => fn(input));
};

/**
 * Computes the answer to part one. The NAT implementation for this part is as
 * follows:
 *
 * - `nat.onPacket()` simply returns the `Y` value of the received packet.
 * - `nat.onIdle()` does nothing and should never be invoked.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the puzzle answer
 */
const part1 = input => runNetwork(input, {
  onPacket: packet => {
    return packet[1];
  },
  onIdle: () => {},
});

/**
 * Computes the answer to part two. The NAT implementation for this part is as
 * follows:
 *
 * - `nat.onPacket()` stores the given packet into a `lastPacket` variable.
 * - `nat.onIdle()` checks to see if we have a stored `lastPacket`. If we do,
 *   and its `Y` value is the same as the `Y` value from the last time
 *   `nat.onIdle()` was called, it returns that `Y` value. Otherwise, it passes
 *   `lastPacket` to the function passed into `nat.onIdle()`, and stores its
 *   `Y` value to compare against the next time `nat.onIdle()` is called.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the puzzle answer
 */
const part2 = input => {
  let lastPacket = null;
  let prevY = null;
  return runNetwork(input, {
    onPacket: packet => {
      lastPacket = packet;
    },
    onIdle: sendTo0 => {
      if (lastPacket) {
        if (prevY === lastPacket[1]) {
          return prevY;
        }

        sendTo0(lastPacket);
        prevY = lastPacket[1];
      }
    },
  });
};

/**
 * Runs the network until the given object representing the NAT reports that an
 * answer has been found. The NAT object is notified when events occur. It has
 * two methods:
 *
 * - `onPacket()`: Invoked when a packet is to be sent to the NAT.
 * - `onIdle()`: Invoked when the network is idle. It will be passed a function
 *   which can be invoked to send a packet to the computer at address `0`.
 *
 * @param {string} program - the Intcode program to run on each computer
 * @param {Object} nat - the NAT object
 * @returns {number} - the answer reported by the NAT object
 */
const runNetwork = (program, nat) => {
  let network;

  /**
   * Creates the network, consisting of 50 Intcode computers, each running the
   * same program. Each computer also has an input queue to store packets which
   * are waiting to be input into the interpreter.
   */
  const buildNetwork = () => {
    network = new Array(NETWORK_SIZE);

    for (let address = 0; address < NETWORK_SIZE; address++) {
      const vm = new IntcodeVm();
      vm.load(program);
      vm.enqueueInput(address);
      vm.run();
      network[address] = { vm, inputQueue: [] };
    }
  };

  /**
   * A function that is passed to the NAT's `onIdle()` method to allow it to
   * send a packet to the computer at address `0`.
   *
   * @param {Array} packet - the packet to send
   */
  const sendTo0 = packet => {
    network[0].inputQueue.push(packet);
  };

  /**
   * Reads packets from the output queues of the computers in the network, and
   * passes them to the corresponding computers' input queues. This function
   * also notifies the NAT object when a packet is sent to address `255`, and
   * when the network is idle.
   *
   * @returns {number|undefined} - any answer reported by the NAT
   */
  const readPackets = () => {
    let idle = true;

    for (const computer of network) {
      while (computer.vm.outputLength) {
        idle = false;
        const recipient = computer.vm.dequeueOutput();
        const payload = [ computer.vm.dequeueOutput(), computer.vm.dequeueOutput() ];

        if (recipient === 255) {
          const result = nat.onPacket(payload);

          if (result !== undefined) {
            return result;
          }
        } else {
          network[recipient].inputQueue.push(payload);
        }
      }
    }

    return idle ? nat.onIdle(sendTo0) : undefined;
  };

  /**
   * Feeds the next packet into each computer that has any packets waiting in
   * its input queue. If there are no waiting packets, the computer receives
   * `-1` for its input instead.
   */
  const writePackets = () => {
    network.forEach(computer => {
      if (computer.inputQueue.length) {
        const packet = computer.inputQueue.shift();
        computer.vm.enqueueInput(packet[0]);
        computer.vm.enqueueInput(packet[1]);
      } else {
        computer.vm.enqueueInput(-1);
      }

      computer.vm.run();
    });
  };

  /**
   * Continuously loops, passing packets through the network, until the NAT
   * reports an answer.
   *
   * @returns {number} - the answer reported by the NAT
   */
  const run = () => {
    do {
      const answer = readPackets();

      if (answer !== undefined) {
        return answer;
      }

      writePackets();
    } while (true);
  };

  buildNetwork();
  return run();
};
