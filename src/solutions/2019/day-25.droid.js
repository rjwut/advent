const parse = require('./day-25.parser');
const ShipMap = require('./day-25.map');
const Inventory = require('./day-25.inventory');

const DIRECTIONS = new Set([ 'north', 'south', 'east', 'west' ]);

/**
 * This class provides the API for the droid. It contains the "smarts" that knows how to explore the
 * ship, collect the needed items, and get past security to reach Santa.
 *
 * The droid API exposes two simple methods:
 *
 * - `consume()`: Responsible for interpreting output from the Intcode computer and determining what
 *   the next command should be.
 * - `getCode()`: Returns the code (when we have it).
 *
 * Each time `consume()` is invoked, it feeds the output to the parser module to get an array of
 * events, which it then uses to determine what the next command(s) should be. These commands are
 * added to the command queue. Then it takes the next command from the queue and returns it.
 *
 * The queue may be empty when it tries to get the next command. This can happen in one of two
 * scenarios:
 *
 * - The droid has obtained the code; no more commands are needed.
 * - The droid doesn't know what else to do; this is a bug if it happens.
 *
 * ## Events
 *
 * Here is how the droid responds to each event:
 *
 * ### `codeReceived`
 *
 * We have the code! Store it and don't send any more commands.
 *
 * ### `exitsListed`
 *
 * Note the possible exits from the room. This is used later by the exploration algorithm.
 *
 * ### `itemDropped`
 *
 * Remove the item from the inventory.
 *
 * ### `itemsListed`
 *
 * If we're in the exploration phase, filter the list to only include items which are safe to pick
 * up, then give the commands to pick them up.
 *
 * ### `itemTaken`
 *
 * Add the item to the inventory.
 *
 * ### `prompt`
 *
 * Note that we're able to issue a command. If we already have commands in the command queue, do
 * nothing. Otherwise, determine the next course of action based on the current phase. (See the
 * **Phases** section below.)
 *
 * ### `rejected`
 *
 * The other events handle this adequately, so the droid ignores this event.
 *
 * ### `roomEntered`
 *
 * Note the name of the room. This is used later by the exploration algorithm. Also, if the name of
 * the room is "Pressure-Sensitive Floor", note the direction we travelled in; this is the command
 * we need to issue when we want to try to get past security.
 *
 * ## Phases
 *
 * When the droid has executed all the commands in its command queue, it needs to decide what to do
 * next. This decision is based on the current phase.
 *
 * ### Phase 1: Exploration
 *
 * GOAL: Collect all eight safed items and discover the location of the security checkpoint.
 *
 * 1. Is the goal met? If so, go to phase 2.
 * 2. Check whether the current room has any exits that go to an unknown location. If so, enqueue a
 *    move command in that direction.
 * 3. Find the path to the nearest room with an exit that goes to an unknown location. Enqueue that
 *    path into the command queue.
 *
 * ### Phase 2: Go to Security
 *
 * GOAL: Move the droid to the security checkpoint.
 *
 * 1. Find the path to the security checkpoint. Enqueue that path into the command queue.
 *
 * ### Phase 3: Get Past Security
 *
 * GOAL: Find the correct combination of items that allows the droid to get past security and reach
 * Santa.
 *
 * 1. Determine what the next item is to take or drop to try the next combination and enqueue that
 *    action.
 * 2. Enqueue the movement command that will attempt to pass security. If this succeeds, the
 *    `codeReceived` event will fire. Otherwise, the `rejected` event will fire.
 *
 * @returns {Object} - the droid API
 */
class Droid {
  #map;
  #inventory;
  #phase;
  #commandQueue;
  #currentRoom;
  #nextRoom;
  #lastDirection;
  #permutation;
  #code;
  #readyForCommand;
  #securityDirection;
  #eventHandlers;

  constructor() {
    this.#map = new ShipMap();
    this.#inventory = new Inventory();
    this.#phase = 1;
    this.#commandQueue = [];
    this.#permutation = 0;
    this.#eventHandlers = new Map([
      [ 'codeReceived', arg => this.#codeReceived(arg) ],
      [ 'itemDropped', item => this.#itemDropped(item) ],
      [ 'roomEntered', name => this.#roomEntered(name) ],
      [ 'exitsListed', list => this.#exitsListed(list) ],
      [ 'itemsListed', list => this.#itemsListed(list) ],
      [ 'prompt', () => this.#prompt() ],
      [ 'itemTaken', item => this.#itemTaken(item) ],
    ]);
  }

  /**
   * @returns {string|undefined} - the code, if we have it
   */
  get code() {
    return this.#code;
  }

  /**
   * @returns {Inventory} - the droid's inventory
   */
  get inventory() {
    return this.#inventory;
  }

  /**
   * @returns {ShipMap} - the droid's map of the ship
   */
  get map() {
    return this.#map;
  }

  /**
   * Consumes output from the Intcode computer and returns the next command to execute, if any.
   *
   * @param {string} output - the output from the Intcode computer
   * @returns {string|undefined} - the next command to execute, if any
   */
  consume(output) {
    this.#readyForCommand = false;

    // Process events
    parse(output).forEach(event => {
      let commands = this.#eventHandlers.get(event.type)?.(event.arg);

      if (!commands) {
        return;
      }

      if (typeof commands === 'string') {
        commands = [commands];
      }

      commands.forEach(command => {
        // Event resulted in one or more commands; enqueue them
        this.#commandQueue.push(command);
      });
    });

    if (this.#code) {
      return; // We have Santa's code!
    }

    if (!this.#readyForCommand) {
      // We didn't get a command prompt, so we must have messed up.
      // This should never happen.
      throw new Error(`Mission failed: ${output}`);
    }

    if (!this.#commandQueue.length) {
      // The droid doesn't know what else to do. This should never happen.
      throw new Error('Droid gives up');
    }

    const command = this.#commandQueue.shift();
    this.#lastDirection = DIRECTIONS.has(command) ? command : undefined;
    this.#nextRoom = undefined;
    return command;
  }

  /**
   * Invoked when we get the code from Santa. Stores it for later retrieval.
   *
   * @param {string} arg - the code
   */
  #codeReceived(arg) {
    this.#code = arg;
  }

  /**
   * We just entered a room. Store the name for use by the exploration algorithm. Also note the
   * direction we moved if the name is "Pressure-Sensitive Floor", since that's the direction we'll
   * use to try to get past security.
   *
   * @param {string} name - the name of the room we just entered
   */
  #roomEntered(name) {
    if (this.#nextRoom) {
      // We moved rooms already this turn; this means we were kicked out of security.
      this.#nextRoom = undefined;
      return;
    }

    this.#nextRoom = { name };

    if (!this.#securityDirection && name === 'Pressure-Sensitive Floor') {
      this.#securityDirection = this.#lastDirection;
    }
  }

  /**
   * Store the exits from the room for use by the exploration algorithm.
   *
   * @param {string} list - the list of exits from the room
   */
  #exitsListed(list) {
    if (this.#nextRoom) {
      this.#nextRoom.exits = parseList(list);
    }
  }

  /**
   * If we're in the exploration phase, filter the list of items to only those that are safe to pick
   * up, then give a `take` command for each one. (In practice, there will be at most one item,
   * since the only time we'd find more than one in a room is during the attempts to get past
   * security.)
   *
   * @param {string} list - the list of items in the room
   * @returns {Array|undefined} - the commands to issue, if any
   */
  #itemsListed(list) {
    if (this.#phase === 1) {
      return parseList(list)
        .filter(item => this.#inventory.isSafe(item))
        .map(item => `take ${item}`);
    }
  }

  /**
   * We're ready to give a command. If we already have commands in the queue, we don't need to add
   * more, so do nothing. Otherwise, delegate to `#explore()`, `#goToSecurity()` or
   * `#prepareToEnterSecurity()`, depending on the current phase.
   *
   * @returns {string|string[]|undefined} - the next command(s) to execute, if any
   */
  #prompt() {
    if (this.#nextRoom) {
      // We moved, so update the map.
      this.#currentRoom = this.#map.enteredRoom(
        this.#nextRoom.name,
        this.#nextRoom.exits,
        this.#currentRoom?.name,
        this.#lastDirection,
      );
    }

    this.#readyForCommand = true;

    if (this.#commandQueue.length) {
      return;
    }

    if (this.#phase === 1) {
      return this.#explore();
    }

    if (this.#phase === 2) {
      return this.#goToSecurity();
    }

    return this.#prepareToEnterSecurity();
  }

  /**
   * Update the inventory with the item that was dropped.
   *
   * @param {string} item - the item
   */
  #itemDropped(item) {
    this.#inventory.drop(item);
  }

  /**
   * Update the inventory with the item that was taken.
   *
   * @param {string} item - the item
   */
  #itemTaken(item) {
    this.#inventory.take(item);
  }

  /**
   * Determines whether we need to continue exploring (we still need to collect items, or haven't
   * found the security checkpoint yet). If not, we move on to phase two (`goToSecurity()`).
   * Otherwise, find the nearest exit that leads to an unknown location, and return the commands to
   * go there.
   *
   * @returns {string|string[]} - the next command(s) to execute
   */
  #explore() {
    if (this.#inventory.foundAllSafeItems() && this.#map.get('Security Checkpoint')) {
      // We're done exploring!
      this.#phase = 2;
      return this.#goToSecurity();
    }

    // Is there an unknown exit in this room?
    const unknownExits = this.#currentRoom.getUnknownExits();

    if (unknownExits.length) {
      return unknownExits[0];
    }

    // Nope, so find the nearest room that does have one.
    const path = this.#map.path(
      this.#currentRoom.name,
      room => room.getUnknownExits().length
    );

    if (!path) {
      throw new Error('Can\'t find an unknown exit');
    }

    return path;
  }

  /**
   * We've finished exploring, so navigate to the security checkpoint. Once we're there, we go to
   * the next phase (`#prepareToEnterSecurity()`).
   *
   * @returns {string|string[]} - the next command(s) to execute
   */
  #goToSecurity() {
    if (this.#currentRoom.name === 'Security Checkpoint') {
      this.#phase = 3;
      return this.#prepareToEnterSecurity();
    }

    const path = this.#map.path(
      this.#currentRoom.name,
      room => room.name === 'Security Checkpoint'
    );

    if (!path) {
      throw new Error('Can\'t find Security Checkpoint');
    }

    return path;
  }

  /**
   * If this isn't our first attempt to get past security in phase 3, take or drop an item as needed
   * to try the next combination of items. Then attempt to get past security.
   *
   * @returns {string[]} - the next command(s) to execute
   */
  #prepareToEnterSecurity() {
    const commands = [];
    const takeOrDrop = this.#inventory.permutation(this.#permutation++);

    if (takeOrDrop) {
      commands.push(takeOrDrop);
    }

    if (!this.#securityDirection) {
      this.#securityDirection = this.#currentRoom.getUnknownExits()[0];
    }

    commands.push(this.#securityDirection);
    return commands;
  }
}

/**
 * Parses a string "bullet list" into an array.
 *
 * @param {string} list - the list as a string
 * @returns {string[]} - the list as an array
 */
const parseList = list => list.trim().split('\n').map(line => line.substring(2));

module.exports = Droid;
