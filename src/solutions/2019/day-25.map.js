// Possible directions and their opposites
const OPPOSITES = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

/**
 * Responsible for keeping track of the map and pathfinding.
 *
 * @returns {Object} - the map API
 */
module.exports = () => {
  const map = new Map();

  return {
    /**
     * Returns the room with the given name. Rooms have the following properties:
     *
     * - `name` (string): The name of the room
     * - `exits` (Object): The available exits from the room; with adjacent
     *   rooms keyed under their corresponding exit direction
     *
     * @param {string} roomName - the name of the room 
     * @returns {Object|undefined} - the room object, if it exists
     */
    get: roomName => map.get(roomName),

    /**
     * Updates the map if needed to reflect the room we just entered.
     *
     * @param {string} roomName - the name of the room we entered
     * @param {Array} exits - the exits from the room we entered
     * @param {string} [prevRoomName] - the name of the room we just left
     * @param {string} [direction] - the direction we travelled to enter this
     * room
     * @returns {Object} - the object representing the room we entered
     */
    enteredRoom: (roomName, exits, prevRoomName, direction) => {
      let room = map.get(roomName);

      if (!room) {
        room = {
          name: roomName,
          exits: Object.fromEntries(exits.map(exit => [ exit, null ])),
        };
        map.set(roomName, room);
      }

      if (prevRoomName) {
        const prevRoom = map.get(prevRoomName);

        if (!prevRoom) {
          throw new Error(`Unknown room: ${prevRoomName}`);
        }

        if (!(direction in prevRoom.exits)) {
          throw new Error(`${prevRoomName} does not have an exit to ${direction}`);
        }

        const oppositeDirection = OPPOSITES[direction];

        if (!(oppositeDirection in room.exits)) {
          throw new Error(`${roomName} does not have an exit to ${oppositeDirection}`);
        }

        if (!prevRoom.exits[direction]) {
          prevRoom.exits[direction] = room;
          room.exits[oppositeDirection] = prevRoom;
        }
      }

      return room;
    },

    /**
     * Computes the path from the named room to the nearest room that fulfills
     * the given predicate. The predicate receives a reference to the room
     * object to check.
     *
     * @param {string} startName - the name of the room to start from
     * @param {Function} predicate - the predicate
     * @returns {Array|null} - the sequence of directions to travel to get to
     * the target room, or `null` if no path was found
     */
    path: (startName, predicate) => {
      const start = map.get(startName);

      if (!start) {
        throw new Error(`Unknown room: ${startName}`);
      }

      const queue = [ { room: start, path: [], visited: [] } ];

      do {
        const { room, path, visited } = queue.shift();

        if (predicate(room)) {
          return path;
        }

        for (const [ direction, adjRoom ] of Object.entries(room.exits)) {
          if (adjRoom && !visited.includes(adjRoom)) {
            queue.push({
              room: adjRoom,
              path: [ ...path, direction ],
              visited: [ ...visited, adjRoom ],
            });
          }
        }
      } while (queue.length);

      return null;
    },
  };
};
