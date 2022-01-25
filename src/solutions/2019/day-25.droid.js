const parse = require('./day-25.parser');
const buildMap = require('./day-25.map');
const buildInventory = require('./day-25.inventory');

const DIRECTIONS = new Set([ 'north', 'south', 'east', 'west' ]);

/**
 * This module exports a function which returns an object that provides the API
 * for the droid. It contains the "smarts" that knows how to explore the ship,
 * collect the needed items, and get past security to reach Santa.
 *
 * The droid API exposes two simple methods:
 *
 * - `consume()`: Responsible for interpreting output from the Intcode
 *   computer and determining what the next command should be.
 * - `getCode()`: Returns the code (when we have it).
 *
 * Each time `consume()` is invoked, it feeds the output to the parser module
 * to get an array of events, which it then uses to determine what the next
 * command(s) should be. These commands are added to the command queue. Then it
 * takes the next command from the queue and returns it.
 *
 * The queue may be empty when it tries to get the next command. This can
 * happen in one of two scenarios:
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
 * Note the possible exits from the room. This is used later by the exploration
 * algorithm.
 *
 * ### `itemDropped`
 *
 * Remove the item from the inventory.
 *
 * ### `itemsListed`
 *
 * If we're in the exploration phase, filter the list to only include items
 * which are safe to pick up, then give the commands to pick them up.
 *
 * ### `itemTaken`
 *
 * Add the item to the inventory.
 *
 * ### `prompt`
 *
 * Note that we're able to issue a command. If we already have commands in the
 * command queue, do nothing. Otherwise, determine the next course of action
 * based on the current phase. (See the **Phases** section below.)
 *
 * ### `rejected`
 *
 * The other events handle this adequately, so the droid ignores this event.
 *
 * ### `roomEntered`
 *
 * Note the name of the room. This is used later by the exploration algorithm.
 * Also, if the name of the room is "Pressure-Sensitive Floor", note the
 * direction we travelled in; this is the command we need to issue when we want
 * to try to get past security.
 *
 * ## Phases
 *
 * When the droid has executed all the commands in its command queue, it needs
 * to decide what to do next. This decision is based on the current phase.
 *
 * ### Phase 1: Exploration
 *
 * 1. Check whether we have collected all eight safe items and discovered the
 *    location of the security checkpoint. If so, go to phase 2.
 * 2. Check whether the current room has any exits that go to an unknown
 *    location. If so, enqueue a move command in that direction.
 * 3. Ask the `map` module to find the path to the nearest room with an exit
 *    that goes to an unknown location. Enqueue that path into the command
 *    queue.
 *
 * ### Phase 2: Go to Security
 *
 * 1. Ask the `map` module to find the path to the security checkpoint. Enqueue
 *    that path into the command queue.
 *
 * ### Phase 3: Get Past Security
 *
 * This phase requires us to try different combinations of items held by the
 * droid to have the correct weight to get past security.
 *
 * 1. Ask the `inventory` module what commands would be needed to ensure that
 *    the droid is holding the correct items for this attempt. If any commands
 *    are returned, enqueue them into the command queue.
 * 2. If step one generated no commands, enqueue the movement command that will
 *    attempt to pass security. If this succeeds, the `codeReceived` event will
 *    fire. Otherwise, the `rejected` event will fire.
 *
 * @returns {Object} - the droid API
 */
module.exports = () => {
  const map = buildMap();
  const inventory = buildInventory();
  let phase = 1;
  let commandQueue = [];
  let currentRoom;
  let nextRoom;
  let lastDirection;
  let permutation = 255;
  let code;
  let readyForCommand;
  let securityDirection;

  /**
   * Consumes output from the Intcode computer and returns the next command to
   * execute, if any.
   *
   * @param {string} output - the output from the Intcode computer
   * @returns {string|undefined} - the next command to execute, if any
   */
  const consume = output => {
    readyForCommand = false;
    // Process events
    parse(output).forEach(event => {
      let commands = EVENT_HANDLERS[event.type](event.arg);

      if (!commands) {
        return;
      }

      if (typeof commands === 'string') {
        commands = [ commands ];
      }

      commands.forEach(command => {
        // Event resulted in one or more commands; enqueue them
        commandQueue.push(command);
      });
    });

    if (code) {
      return; // We have Santa's code!
    }

    if (!readyForCommand) {
      // We didn't get a command prompt, so we must have messed up.
      // This should never happen.
      throw new Error(`Mission failed: ${output}`);
    }

    if (!commandQueue.length) {
      // The droid doesn't know what else to do. This should never happen.
      throw new Error('Droid gives up');
    }

    const command = commandQueue.shift();
    lastDirection = DIRECTIONS.has(command) ? command : undefined;
    nextRoom = undefined;
    return command;
  };

  /**
   * Invoked when we get the code from Santa. Stores it for later retrieval.
   *
   * @param {string} arg - the code
   */
  const codeReceived = arg => {
    code = arg;
  };

  /**
   * We just entered a room. Store the name for use by the exploration
   * algorithm. Also note the direction we came from if the name is
   * "Pressure-Sensitive Floor", since that's the direction we'll use to try to
   * get past security.
   *
   * @param {string} name - the name of the room we just entered
   */
  const roomEntered = name => {
    if (nextRoom) {
      // We moved rooms already this turn; this means we were kicked out of
      // security.
      nextRoom = undefined;
      return;
    }

    nextRoom = { name };

    if (!securityDirection && name === 'Pressure-Sensitive Floor') {
      securityDirection = lastDirection;
    }
  };

  /**
   * Store the exits from the room for use by the exploration algorithm.
   *
   * @param {string} list - the list of exits from the room
   */
  const exitsListed = list => {
    if (nextRoom) {
      nextRoom.exits = parseList(list);
    }
  };

  /**
   * If we're in the exploration phase, filter the list of items to only those
   * that are safe to pick up, then give a `take` command for each one. (In
   * practice, there will be at most one item, since the only time we'd find
   * more than one in a room is during the attempts to get past security.)
   *
   * @param {string} list - the list of items in the room 
   * @returns {Array|undefined} - the commands to issue, if any
   */
  const itemsListed = list => {
    if (phase === 1) {
      return parseList(list)
        .filter(item => inventory.isSafe(item))
        .map(item => `take ${item}`);
    }
  };

  /**
   * We're ready to give a command. If we already have commands in the queue,
   * we don't need to add more, so do nothing. Otherwise, delegate to
   * `explore()`, `goToSecurity()` or `prepareToEnterSecurity()`, depending on
   * the current phase.
   *
   * @returns {string|Array|undefined} - the next command(s) to execute, if any
   */
  const prompt = () => {
    if (nextRoom) {
      // We moved, so update the map.
      currentRoom = map.enteredRoom(
        nextRoom.name,
        nextRoom.exits,
        currentRoom?.name,
        lastDirection,
      );
    }

    readyForCommand = true;

    if (commandQueue.length) {
      return;
    }

    if (phase === 1) {
      return explore();
    }

    if (phase === 2) {
      return goToSecurity();
    }

    return prepareToEnterSecurity();
  };

  /**
   * We got kicked out of security. The droid's response to the `prompt` event
   * already handles this case, so we don't need to do anything here.
   */
  const rejected = () => {
    // do nothing
  };

  /**
   * Update the inventory with the item that was dropped.
   *
   * @param {string} item - the item
   */
  const itemDropped = item => {
    inventory.drop(item);
  };

  /**
   * Update the inventory with the item that was taken.
   *
   * @param {string} item - the item
   */
  const itemTaken = item => {
    inventory.take(item);
  };

  /**
   * Parses a string "bullet list" into an array.
   *
   * @param {string} list - the list as a string
   * @returns {Array} - the list as an array
   */
  const parseList = list => {
    return list.trim().split('\n').map(line => line.substring(2))
  };

  /**
   * Determines whether we need to continue exploring (we still need to collect
   * items, or haven't found the security checkpoint yet). If not, we move on
   * to phase two (`goToSecurity()`). Otherwise, find the nearest exit that
   * leads to an unknown location, and return the commands to go there.
   *
   * @returns {string|Array} - the next command(s) to execute
   */
  const explore = () => {
    if (inventory.foundAllSafeItems() && map.get('Security Checkpoint')) {
      // We're done exploring!
      phase = 2;
      return goToSecurity();
    }``

    // Is there an unknown exit in this room?
    const unknownExits = getUnknownExits(currentRoom);

    if (unknownExits.length) {
      return unknownExits[0];
    }

    // Nope, so find the nearest room that does have one.
    const path = map.path(
      currentRoom.name,
      room => getUnknownExits(room).length
    );

    if (!path) {
      throw new Error('Can\'t find an unknown exit');
    }

    return path;
  };

  /**
   * We've finished exploring, so navigate to the security checkpoint. Once
   * we're there, we go to the next phase (`prepareToEnterSecurity()`).
   *
   * @returns {string|Array} - the next command(s) to execute
   */
  const goToSecurity = () => {
    if (currentRoom.name === 'Security Checkpoint') {
      phase = 3;
      return prepareToEnterSecurity();
    }

    const path = map.path(
      currentRoom.name,
      room => room.name === 'Security Checkpoint'
    );

    if (!path) {
      throw new Error('Can\'t find Security Checkpoint');
    }

    return path;
  };

  /**
   * Check to see if our current inventory has the combination of items that we
   * want for this attempt. If not, take and/or drop items as needed.
   * Otherwise, delegate to `tryToEnterSecurity()`.
   *
   * @returns {string|Array} - the next command(s) to execute
   */
  const prepareToEnterSecurity = () => {
    const commands = inventory.permutation(permutation);

    if (commands.length) {
      return commands;
    }

    return tryToEnterSecurity();
  };

  /**
   * We're holding the correct items for this attempt, so move through the door
   * to try to get past security. If we don't already know what direction that
   * is, it will be the only unknown exit in the current room.
   *
   * @returns {string} - the next command to execute
   */
  const tryToEnterSecurity = () => {
    permutation--;

    if (!securityDirection) {
      securityDirection = Object.entries(currentRoom.exits)
        .find(([ _, room ]) => !room)[0];
    }

    return securityDirection;
  };

  /**
   * Returns the unknown exits for the given room, if any.
   *
   * @param {Object} room - the room
   * @returns {Array} - the unknown exits
   */
  const getUnknownExits = room => [ ...Object.entries(room.exits) ]
    .filter(([ _, adjRoom ]) => !adjRoom)
    .map(([ direction ]) => direction);

  const EVENT_HANDLERS = {
    codeReceived,
    itemDropped,
    roomEntered,
    exitsListed,
    itemsListed,
    prompt,
    rejected,
    itemTaken,
  };

  return {
    consume,

    /**
     * Returns the code we got from Santa.
     *
     * @returns {string|undefined} - the code, if we have it
     */
    getCode: () => code,
  };
};
