// Possible directions and their opposites
const OPPOSITES = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

/**
 * A class that builds a map of the ship as rooms are explored and can be queried.
 */
class ShipMap {
  #map;

  constructor() {
    this.#map = new Map();
  }

  /**
   * Retrieves the `Room` with the given name.
   *
   * @param {string} name - the `Room` name
   * @returns {Room|undefined} - the `Room`, if it exists
   */
  get(name) {
    return this.#map.get(name);
  }

  /**
   * Updates the map if needed to reflect the `Room` we just entered. Note that the `prevRoomName`
   * and `direction` parameters are optional in order to support adding the room we start in to the
   * `ShipMap`.
   *
   * @param {string} roomName - the name of the `Room` we entered
   * @param {string[]} exits - the exit directions from the `Room` we entered
   * @param {string} [prevRoomName] - the name of the `Room` we just left
   * @param {string} [direction] - the direction we travelled to enter this `Room`
   * @returns {Room} - the `Room` we entered
   */
  enteredRoom(name, exits, prevRoomName, direction) {
    let room = this.#map.get(name);

    if (!room) {
      room = new Room(name);
      this.#map.set(name, room);
    }

    for (const exit of exits) {
      if (!room.hasExit(exit)) {
        room.setExit(exit, null);
      }
    }

    if (prevRoomName) {
      const prevRoom = this.#map.get(prevRoomName);

      if (!prevRoom) {
        throw new Error(`Unknown room: ${prevRoomName}`);
      }

      // assert exits exist
      const oppositeDirection = OPPOSITES[direction];
      room.getExit(oppositeDirection);

      if (!prevRoom.getExit(direction)) {
        prevRoom.setExit(direction, room);
        room.setExit(oppositeDirection, prevRoom);
      }
    }

    return room;
  }

  /**
   * Computes the path from the named `Room` to the nearest `Room` that fulfills the given
   * predicate. The predicate receives a reference to the `Room` object to check.
   *
   * @param {string} startName - the name of the `Room` to start from
   * @param {Function} predicate - the predicate
   * @returns {string[]|null} - the sequence of directions to travel to get to the target `Room`, or
   * `null` if no path was found
   */
  path(startName, predicate) {
    const start = this.get(startName);

    if (!start) {
      throw new Error(`Unknown room: ${startName}`);
    }

    const queue = [ { room: start, path: [], visited: [] } ];

    do {
      const { room, path, visited } = queue.shift();

      if (predicate(room)) {
        return path;
      }

      for (const [ direction, adjRoom ] of room) {
        if (adjRoom && !visited.includes(adjRoom)) {
          queue.push({
            room: adjRoom,
            path: [...path, direction],
            visited: [...visited, adjRoom],
          });
        }
      }
    } while (queue.length);

    return null;
  }
}

/**
 * An individual room on the ship.
 */
class Room {
  #name;
  #exits;

  /**
   * Creates a new `Room` with the given name. The `Room` starts with no exits.
   *
   * @param {string} name - the name of the new `Room`
   */
  constructor(name) {
    this.#name = name;
    this.#exits = new Map();
  }

  /**
   * @returns {string} - the name of this `Room`
   */
  get name() {
    return this.#name;
  }

  /**
   * @param {string} direction - the direction to check
   * @returns {boolean} - whether there is an exit in the given direction
   */
  hasExit(direction) {
    return this.#exits.has(direction);
  }

  /**
   * Retrieves the `Room` that is connected to the exit in the given direction from this `Room`.
   *
   * @param {string} direction - the direction to check
   * @returns {Room|null} - the connected `Room`, or `null` if it is unknown
   * @throws {Error} - if there is no exit in the given direction
   */
  getExit(direction) {
    if (!this.#exits.has(direction)) {
      throw new Error(`${this.#name} has no exit to the ${direction}`);
    }

    return this.#exits.get(direction);
  }

  /**
   * Sets an exit in this `Room`.
   *
   * @param {string} direction - the direction to set the exit in
   * @param {Room|null} room - the `Room` connected to this exit, or `null` if unknown
   */
  setExit(direction, room) {
    this.#exits.set(direction, room);
  }

  /**
   * Retrieves the directions of known exits from this `Room` that lead to unknown locations.
   *
   * @return {string[]} - the directions of unknown exits
   */
  getUnknownExits() {
    return this.#exits.entries()
      .filter(([ , room ]) => room === null)
      .map(([ direction ]) => direction)
      .toArray();
  }

  /**
   * Iterates the exits from this `Room`.
   *
   * @returns {Iterator<string, Room|null>} - an iterator over the exits
   */
  [Symbol.iterator]() {
    return this.#exits[Symbol.iterator]();
  }
}

module.exports = ShipMap;
