const { EventEmitter } = require('events');
const { match } = require('../util');
const { lcm } = require('../math2');

const CONNECTION_REGEXP = /^(?<type>[&%])?(?<name>[a-z]+) -> (?<targets>.+)$/gm;
const ACTIVATION_MODULE = 'rx';

/**
 * # [Advent of Code 2023 Day 20](https://adventofcode.com/2023/day/20)
 *
 * Part one requires us to implement the module network described in the puzzle. There's no
 * additional challenge to it yet; that's for part two. Here the challenge is simply to ensure that
 * our implementation is correct.
 *
 * I created a `Module` class that extends `EventEmitter`. I send a pulse to a `Module` by calling
 * its `onPulseReceived()` method, and a `Module` sends a pulse be emitting a `pulse` event.
 * `Module` in turn has several subclasses: `FlipFlopModule`, `ConjunctionModule`,
 * `BroadcastModule`, and `ActivationModule`. The last one is special: it's the only module in the
 * network that never emits pulses itself. (In other words, it never appears on the left side of
 * the `->` in the input.) This module will be important in part two. `ActivationModule` does
 * nothing when it receives a pulse; all the others behave as described in the puzzle.
 *
 * With these modules implemented, I created another class called `System` which represents the
 * entire module network. It is responsible for:
 *
 * 1. Assembing the module network
 * 2. Allowing me to push the button that starts the pulse propagation
 * 3. Propagate pulses through the network
 * 4. Counting button pushes, low pulses, and high pulses
 * 5. Detecting when we should stop pushing the button
 * 6. Computing the answer after we stop pushing the button
 *
 * It's important to note that pulses are to be processed in the order they were emitted. Suppose
 * that module `a` emits a pulse, which is received by modules `b` and `c`. If in response `b`
 * emits a pulse to module `d`, we have to process the pulse received by module `c` before the one
 * received by `d`. This means that we must not process pulses immediately as they are emitted. I
 * made it so that the `System` instance registers itself as a listener for the `pulse` event
 * emitted by each module and stores them in a queue, and I only send pulses when they arrive at
 * the front of the queue.
 *
 * Pressing the button does the following:
 *
 * 1. Increments the button push count.
 * 2. Sends a low pulse to the `broadcast` module and increments the low pulse count.
 * 3. While the pulse queue is not empty, dequeue a pulse and send it to its targets.
 *
 * Both parts of the puzzle require us to push the button until a certain condition is reached. I
 * created a `pushTheButton()` method that accepts a predicate function called `until` that returns
 * `true` when I should stop pressing the button. For part one, `until` simply checks whether the
 * button has been pressed 1000 times yet.
 *
 * At this point, we have enough built out to solve part one. Push the button 1000 times, then
 * retrieve the low and high pulse counts and multiply them together to get the answer.
 *
 * Now we're ready to tackle part two. It takes too long to solve by pushing the button until `rx`
 * gets a low pulse. It can only be solved by examining the topology of the devices, which permits
 * us to note the following:
 *
 * - As previously mentioned, the activation device (`rx`), has only one input.
 * - This input comes from a conjunction module I'll refer to as the gatekeeper.
 * - The gatekeeper has several inputs.
 * - Each of the gatekeeper's inputs emits a low pulse shortly after emitting a high pulse.
 * - The gatekeeper inputs emit high pulses on a predictable cycle, which is a different length for
 *   each input.
 *
 * So `rx` will only receive a low pulse when the gatekeeper receives a high pulse from one of its
 * inputs while all its other inputs also most recently sent high pulses. This means that if we can
 * compute the cycle length for each of the gatekeeper's inputs, we can determine how many button
 * presses are required by computing the least common multiple of those cycle lengths.
 *
 * I updated my code so that the `System` instance can give a reference to the gatekeeper. I also
 * updated the `ConjunctionModule` class so it emits a `firstHigh` event when it receives a high
 * pulse for the first time from each of its inputs. Each time `firstHigh` is emitted, I note the
 * number of times the button has been pressed. Once I've received a `firstHigh` event for each of
 * the gatekeeper's inputs, I stop pressing the button, and compute the least common multiple of
 * the collected button press counts. This is the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, part) => {
  const system = new System(input);

  /**
   * Simply pushes the button 1000 times and reports the product of the number of low and high
   * pulses emitted.
   *
   * @returns {number} - the answer to part one
   */
  const part1 = () => {
    system.pushTheButton(() => system.buttonPresses === 1000);
    return system.pulseProduct;
  };

  // The example inputs don't have an `rx` module, so we can't solve part two for them.
  if (part === 0) {
    return part1();
  }

  /**
   * Pushes the button until the gatekeeper module has received a high pulse from each of its
   * inputs, noting the number of button presses required each time. Once this has happened for all
   * the gatekeeper inputs, it computes the least common multiple of the button press counts, which
   * is the answer to part two.
   *
   * @returns {number} - the answer to part two
   */
  const part2 = () => {
    system.reset();
    const highTimes = new Map();
    const inputCount = system.gatekeeper.inputCount;
    system.gatekeeper.addListener('firstHigh', inputName => {
      highTimes.set(inputName, system.buttonPresses);
    });
    system.pushTheButton(() => highTimes.size === inputCount);
    const times = [ ...highTimes.values() ];
    return times.reduce((answer, time) => lcm(answer, time), 1);
  };

  return [ part1, part2 ].map(fn => fn());
};

/**
 * Represents the entire module network.
 */
class System {
  #modules;
  #button;
  #gatekeeper;
  #counts;
  #pulseQueue;

  /**
   * Builds the module network.
   *
   * @param {string} input - the puzzle input describing the network
   */
  constructor(input) {
    this.#modules = new Map();
    this.#parse(input);
    this.reset();
  }

  /**
   * @returns {number} - the product of the number of low and high pulses emitted
   */
  get pulseProduct() {
    return this.#counts.high * this.#counts.low;
  }

  /**
   * @returns {number} - the number of times the button has been pressed
   */
  get buttonPresses() {
    return this.#counts.buttonPresses;
  }

  /**
   * @returns {ConjuctionModule} - the "gatekeeper" module, which controls when the
   * `ActivationModule` receives a low pulse
   */
  get gatekeeper() {
    return this.#gatekeeper;
  }

  /**
   * Presses the button repeatedly until the given predicate is satisfied.
   *
   * @param {Function} until - a predicate function that returns `true` when we should stop
   * pressing the button
   */
  pushTheButton(until) {
    do {
      this.#counts.buttonPresses++;
      this.#pulseQueue.push({ sender: this.#button, high: false });

      do {
        this.#next();
      } while (this.#pulseQueue.length);
    } while (!until());
  }

  /**
   * Returns the system and all modules within it to its initial state.
   */
  reset() {
    this.#pulseQueue = [];
    this.#counts = { buttonPresses: 0, low: 0, high: 0 };
    this.#modules.forEach(mod => mod.reset());
  }

  /**
   * Builds and connects all the modules.
   *
   * @param {string} input - the puzzle input describing the network
   */
  #parse(input) {
    const connections = new Map();

    // Parse the input and create all the modules
    match(input, CONNECTION_REGEXP).forEach(({ type, name, targets }) => {
      let mod;

      if (type === '%') {
        mod = new FlipFlopModule(name);
      } else if (type === '&') {
        mod = new ConjunctionModule(name);
      } else {
        mod = new BroadcastModule();
      }

      mod.addListener('pulse', high => {
        this.#pulseQueue.push({ sender: mod, high });
      });
      this.#modules.set(name, mod);
      connections.set(mod, targets.split(', '));
    });

    // Connect the modules
    connections.forEach((targets, sourceMod) => {
      targets.forEach(targetName => {
        let targetMod = this.#modules.get(targetName);

        if (!targetMod) {
          // Module never sends any pulses; this is the activation module
          targetMod = new ActivationModule();
          this.#modules.set(targetName, targetMod);
        }

        targetMod.onConnectedInput(sourceMod);
        sourceMod.onConnectedOutput(targetMod);
      })
    });

    // Create the button module and connect it to the broadcaster
    this.#button = new Module('button');
    const broadcaster = this.#modules.get('broadcaster');
    this.#button.onConnectedOutput(broadcaster);
    this.#modules.set('button', this.#button);

    // Get a reference to the gatekeeper
    this.#gatekeeper = this.#modules.get(ACTIVATION_MODULE).gatekeeper;
  }

  /**
   * Dequeues a pulse and processes it.
   */
  #next() {
    const { sender, high } = this.#pulseQueue.shift();
    this.#counts[high ? 'high' : 'low'] += sender.targets.length;
    sender.targets.forEach(target => {
      target.onPulseReceived(sender, high);
    });
  }
}

/**
 * The base class for the modules.
 */
class Module extends EventEmitter {
  #name;
  #targets;

  /**
   * @param {string} name - the name of this module
   */
  constructor(name) {
    super();
    this.#name = name;
    this.#targets = [];
  }

  /**
   * @returns {string} - the name of this module
   */
  get name() {
    return this.#name;
  }

  /**
   * @returns {Array<Module>} - the modules that receive pulses from this module
   */
  get targets() {
    return this.#targets;
  }

  /**
   * Invoked when this module is connected to another module's output. The base implementation does
   * nothing.
   *
   * @param {Module} _mod - the module being connected to this module's input
   */
  onConnectedInput(_mod) {
    // do nothing
  }

  /**
   * Invoked this module is connected to another module's input.
   *
   * @param {Module} mod - the module being connected to this module's output
   */
  onConnectedOutput(mod) {
    this.#targets.push(mod);
  }

  /**
   * Invoked when this module receives a pulse. The base implementation does nothing.
   *
   * @param {Module} _sender - the module that sent the pulse
   * @param {boolean} _high - `true` if the pulse is high, `false` if it's low
   */
  onPulseReceived(_sender, _high) {
    // do nothing
  }

  /**
   * Resets this module to its initial state. The base implementation does nothing.
   */
  reset() {
    // do nothing
  }
}

/**
 * The `ActivationModule` is the only module in the network that never emits pulses. We use it to
 * get a reference to the gatekeeper module.
 */
class ActivationModule extends Module {
  #gatekeeper;

  constructor(name) {
    super(name);
  }

  /**
   * @returns {ConjunctionModule} - the gatekeeper module, this module's only input
   */
  get gatekeeper() {
    return this.#gatekeeper;
  }

  /**
   * Invoked when this module is connected to the gatekeeper module
   *
   * @param {ConjunctionModule} mod - the gatekeeper module
   */
  onConnectedInput(mod) {
    this.#gatekeeper = mod;
  }
}

/**
 * Implements the flip-flop module described in the puzzle.
 */
class FlipFlopModule extends Module {
  #state;

  /**
   * @param {string} name - the name of this module
   */
  constructor(name) {
    super(name);
    this.#state = false;
  }

  /**
   * Emits a pulse if `high` is `false`, according to the rules described in the puzzle.
   *
   * @param {Module} _sender - the module that sent the pulse
   * @param {boolean} high - `true` if the pulse is high, `false` if it's low
   */
  onPulseReceived(_sender, high) {
    if (!high) {
      this.#state = !this.#state;
      this.emit('pulse', this.#state);
    }
  }

  /**
   * Resets this module to its initial state.
   */
  reset() {
    this.#state = false;
  }
}

/**
 * Implements the conjunction module described in the puzzle.
 */
class ConjunctionModule extends Module {
  #inputs;

  /**
   * @param {string} name - the name of this module
   */
  constructor(name) {
    super(name);
    this.#inputs = new Map();
  }

  /**
   * @returns {number} - the number of inputs this module has
   */
  get inputCount() {
    return this.#inputs.size;
  }

  /**
   * Invoked when this module is connected to another module's output.
   *
   * @param {Module} mod - the module being connected to this module's input
   */
  onConnectedInput(mod) {
    this.#inputs.set(mod.name, { lastPulseWasHigh: false, foundCycle: false });
  }

  /**
   * Invoked when this module receives a pulse. If this is the first time this module has received
   * a high pulse from this sender, it emits a `firstHigh` event, identifying the sender of the
   * pulse.
   *
   * @param {Module} sender - the module that sent the pulse
   * @param {boolean} high - `true` if the pulse is high, `false` if it's low
   */
  onPulseReceived(sender, high) {
    const input = this.#inputs.get(sender.name);
    input.lastPulseWasHigh = high;

    if (!input.foundCycle && high) {
      input.foundCycle = true;
      this.emit('firstHigh', sender.name);
    }

    const allHigh = [ ...this.#inputs.values() ].every(({ lastPulseWasHigh }) => lastPulseWasHigh);
    this.emit('pulse', !allHigh);
  }

  /**
   * Resets this module to its initial state.
   */
  reset() {
    this.#inputs.forEach((_, name) => {
      this.#inputs.set(name, { lastPulseWasHigh: false, received: null });
    });
  }
}

/**
 * Implements the broadcast module described in the puzzle.
 */
class BroadcastModule extends Module {
  constructor() {
    super('broadcaster');
  }

  /**
   * Invoked when this module receives a pulse. It repeat the pulse to each of its outputs.
   *
   * @param {Module} _sender - the module that sent the pulse
   * @param {boolean} high - `true` if the pulse is high, `false` if it's low
   */
  onPulseReceived(_sender, high) {
    this.emit('pulse', high);
  }
}
