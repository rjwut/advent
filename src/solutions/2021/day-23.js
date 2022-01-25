const AMPHIPOD_REGEXP = /A|B|C|D/g;
const HALLWAY_BLOCKERS = [
  { A: [ 1 ], B: [ 1, 2 ], C: [ 1, 2, 3 ], D: [ 1, 2, 3, 4 ] },
  { A: [], B: [ 2 ], C: [ 2, 3 ], D: [ 2, 3, 4 ] },
  { A: [], B: [], C: [ 3 ], D: [ 3, 4 ] },
  { A: [ 2 ], B: [], C: [], D: [ 4 ] },
  { A: [ 2, 3 ], B: [ 3 ], C: [], D: [] },
  { A: [ 2, 3, 4 ], B: [ 3, 4 ], C: [ 4 ], D: [] },
  { A: [ 2, 3, 4, 5 ], B: [ 3, 4, 5 ], C: [ 4, 5 ], D: [ 5 ] },
];
const ROOM_BLOCKERS = {
  A: { B: [ 2 ], C: [ 2, 3 ], D: [ 2, 3, 4 ] },
  B: { A: [ 2 ], C: [ 3 ], D: [ 3, 4 ] },
  C: { A: [ 2, 3 ], B: [ 3 ], D: [ 4 ] },
  D: { A: [ 2, 3, 4 ], B: [ 3, 4 ], C: [ 4 ] },
};
const HALLWAY_DISTANCES = [
  { A: 3, B: 5, C: 7, D: 9 },
  { A: 2, B: 4, C: 6, D: 8 },
  { A: 2, B: 2, C: 4, D: 6 },
  { A: 4, B: 2, C: 2, D: 4 },
  { A: 6, B: 4, C: 2, D: 2 },
  { A: 8, B: 6, C: 4, D: 2 },
  { A: 9, B: 7, C: 5, D: 3 },
];
const ROOM_DISTANCES = {
  A: { B: 4, C: 6, D: 8 },
  B: { A: 4, C: 4, D: 6 },
  C: { A: 6, C: 4, D: 4 },
  D: { A: 8, B: 6, C: 4 },
};
const COSTS = { A: 1, B: 10, C: 100, D: 1000 };
const INSERTED_LINES = '  #D#C#B#A#\n  #D#B#A#C#';

/**
 * # [Advent of Code 2021 Day 23](https://adventofcode.com/2021/day/23)
 *
 * What I ended up doing is probably a little more complex than it would have
 * been if I had used a graph instead. I modeled the burrow as an object with
 * three properties:
 * 
 * - `hallways`: An array of seven elements, containing either the letter of an
 *   amphipod or `null` if the hallway node is empty.
 * - `rooms`: An object with four properties, `A`, `B`, `C`, and `D`, each of
 *   which contains an array of the amphipods in that room. The zeroeth element
 *   of the array corresponds to the amphipod which is closest to the hallway.
 *   Amphipods are `shift()`ed from the array when they leave the room and
 *   `unshift()`ed when they enter.
 * - `roomSize`: The number of amphipods each room can hold.
 *
 * Note that the amphipods cannot stop at four of the 11 hallway nodes, so the
 * burrow model doesn't allocate any storage for them. I also created several
 * constants to aid in movement computations:
 *
 * - `HALLWAY_BLOCKERS`: Used to look up which hallway nodes are found between
 *   a given hallway node and a room.
 * - `ROOM_BLOCKERS`: Used to look up which hallway nodes are found between two
 *   rooms.
 * - `HALLWAY_DISTANCES`: Used to look up the distance between a hallway node
 *   and a room.
 * - `ROOM_DISTANCES`: Used to look up the distance between two rooms.
 * - `COSTS`: Used to look up the movement cost for a given amphipod.
 *
 * I created a stack used to store current states of burrow navigation. Each
 * state object has the following properties:
 *
 * - `burrow`: The burrow object.
 * - `moves`: An array of moves that have been taken to reach this state:
 *   - `from.type` and `to.type`: The type of node that the amphipod is moving
 *     from/to. Can be either `'hallway'` or `'room'`.
 *   - `from.room` and `to.room`: The room that the amphipod is moving from/to.
 *     Only preset if `from.type` is `'room'`.
 *   - `from.index` and `to.index`: The index of the hallway node that the
 *     amphipod that is moving from/to. Only preset if `from.type` is
 *     `'hallway'`.
 *   - `cost`: The cost of the move.
 * - `cost`: The total cost of the moves in the `moves` array.
 *
 * The stack is initially populated with the initial state of the burrow, an
 * empty move list, and zero cost. I also have a variable to keep track of the
 * best solution so far; it is initially set to an object with a cost of
 * `Infinity`. The solution object is the same as the state object, but without
 * the `burrow` property.
 *
 * While the stack is not empty, I perform the following steps:
 *
 * 1. Pop the top state off the stack.
 * 2. Get the list of moves to consider (see `getMoves()`).
 * 3. Iterate the moves:
 *    1. Clone the burrow and apply the move to it.
 *    2. Check to see if all the rooms are full and contain only the correct
 *       amphipods. If so, compare its cost against the best solution so far,
 *       and replace it if it's better.
 *    3. If we haven't reached the end state yet, push the new state onto the
 *       stack.
 *
 * Once the best solution is found, its cost is the puzzle answer.
 *
 * For part two, we insert two additional lines into the puzzle input. The
 * algorithm is the same, but `roomSize` is now `4` instead of `2`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  input = input.trim();
  return [ part1(input, 2), part2(input, 4) ];
};

/**
 * Solves part one of the puzzle.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the puzzle solution
 */
const part1 = input => solve(input);

/**
 * Solves part two of the puzzle.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the puzzle solution
 */
const part2 = input => {
  const lines = input.split('\n');
  lines.splice(3, 0, INSERTED_LINES);
  return solve(lines.join('\n'));
};

/**
 * Receives the puzzle input (after modification for part two) and finds the
 * solution with the lowest cost.
 *
 * @param {string} input - the puzzle input
 * @returns {number} - the cost of the best solution
 * @throws {Error} - if no solution is found
 */
const solve = input => {
  const burrow = buildBurrow(input);
  const stack = [ { burrow, moves: [], cost: 0 } ];
  let solution = { cost: Infinity };

  while (stack.length) {
    const state = stack.pop();
    getMoves(state.burrow).forEach(move => {
      const clone = performMove(state.burrow, move);
      const newState = {
        moves: [ ...state.moves, move ],
        cost: state.cost + move.cost
      };

      if (atTargetState(clone) && newState.cost < solution.cost) {
        solution = newState;
      } else {
        newState.burrow = clone;
        stack.push(newState);
      }
    });
  }

  if (solution.cost === Infinity) {
    throw new Error('No solution found');
  }

  return solution.cost;
};

/**
 * Parses the input into a new burrow object:
 *
 * - Room size is determined by counting the number of newline characters in
 *   the input and subtracting `2`.
 * - The amphipod positions are determined by extracting the alphabetic
 *   characters from the input and reading them in order. The first one is the
 *   first amphipod in the first room, the second one is the first amphipod in
 *   the second room, and so on.
 *
 * @param {string} input - the trimmed puzzle input
 * @returns {Object} - the new burrow object
 */
const buildBurrow = input => {
  const roomSize = input.length - input.replace(/\n/g, '').length - 2;
  const rooms = [ ...input.matchAll(AMPHIPOD_REGEXP) ]
    .map(entry => entry[0])
    .reduce((rooms, amphipod, i) => {
      const letter = indexToLetter(i % 4);
      rooms[letter].push(amphipod);
      return rooms;
    }, { A: [], B: [], C: [], D: [] });
  return {
    hallways: new Array(7).fill(null),
    rooms,
    roomSize,
  };
}

/**
 * Deep clones the given burrow object.
 *
 * @param {Object} burrow - the burrow object to clone
 * @returns {Object} - the cloned burrow object
 */
 const cloneBurrow = burrow => ({
  hallways: [ ...burrow.hallways ],
  rooms: {
    A: [ ...burrow.rooms.A ],
    B: [ ...burrow.rooms.B ],
    C: [ ...burrow.rooms.C ],
    D: [ ...burrow.rooms.D ],
  },
  roomSize: burrow.roomSize,
});

/**
 * Returns an array of possible moves in the given burrow. This may not be all
 * the possible moves, because certain moves which are clearly better than
 * others will have higher priority. The priority order is:
 *
 * 1. Moving an amphipod from the hallway into a room.
 * 2. Moving an amphipod directly from room to room.
 * 3. Moving an amphipod from a room into a hallway.
 *
 * Only moves from the highest available priority are returned.
 *
 * @param {Object} burrow - the burrow object to analyze
 * @returns {Array} - an array of moves
 */
const getMoves = burrow => {
  let moves = getMovesFromHallwayToRoom(burrow);

  if (moves.length === 0) {
    moves = getMovesBetweenRooms(burrow);

    if (moves.length === 0) {
      moves = getMovesFromRoomToHallway(burrow);
    }
  }

  return moves;
};

/**
 * Returns of all the possible moves from a hallway node to a room. For each
 * hallway node:
 *
 * 1. Skip the node if it is empty.
 * 2. Skip the node if the occupant's desired room contains any amphipods that
 *    don't belong there.
 * 3. Get the list of hallway nodes along the path, and skip the node if any of
 *    them are occupied.
 * 4. Otherwise, this is a valid move. Compute its cost and add it to the move
 *    list.
 *
 * @param {Object} burrow - the burrow object
 * @returns {Array} - an array of moves
 */
const getMovesFromHallwayToRoom = burrow => {
  const moves = [];
  burrow.hallways.forEach((occupant, hallwayIndex) => {
    if (occupant === null) {
      return; // nobody here
    }

    const room = burrow.rooms[occupant];

    if (room.some(amphipod => amphipod !== occupant)) {
      return; // can't enter room with different amphipod in it
    }

    if (isBlockedBetweenRoomAndHallway(burrow, occupant, hallwayIndex)) {
      return; // path to room is blocked
    }

    const distance = getDistanceBetweenRoomAndHallway(occupant, hallwayIndex) +
      getDistanceToEnterRoom(burrow, occupant);
    moves.push({
      from: { type: 'hallway', index: hallwayIndex },
      to:   { type: 'room',    letter: occupant },
      cost: distance * COSTS[occupant],
    });
  });
  return moves;
};

/**
 * Returns of all the possible moves from one room to another. For each room:
 *
 * 1. Skip the room if it is empty or contains only amphipods that want to
 *    stay.
 * 2. Get the front amphipod in that room and find its target room. Skip if the
 *    target room contains any amphipods that don't belong there.
 * 3. Get the list of hallway nodes along the path, and skip if any of them are
 *    occupied.
 * 4. Otherwise, this is a valid move. Compute its cost and add it to the move
 *    list.
 *
 * @param {Object} burrow - the burrow object
 * @returns {Array} - an array of moves
 */
const getMovesBetweenRooms = burrow => {
  const moves = [];
  Object.entries(burrow.rooms)
    .filter(([ roomLetter1, room1 ]) => {
      // Skip rooms that are empty or contain only amphipods that want to stay
      return !room1.every(amphipod => amphipod === roomLetter1)
    })
    .forEach(([ roomLetter1, room1 ]) => {
      // Only the first amphipod in the room can leave, and can only go to
      // their target room.
      const roomLetter2 = room1[0];
      const room2 = burrow.rooms[roomLetter2];

      if (room2.some(amphipod => amphipod !== roomLetter2)) {
        return; // can't enter room with different amphipod in it
      }

      if (isBlockedBetweenRooms(burrow, roomLetter1, roomLetter2)) {
        return; // path between rooms is blocked
      }

      const distance = getDistanceToExitRoom(burrow, roomLetter1) +
        getDistanceBetweenRooms(roomLetter1, roomLetter2) +
        getDistanceToEnterRoom(burrow, roomLetter2);
      moves.push({
        from: { type: 'room', letter: roomLetter1 },
        to:   { type: 'room', letter: roomLetter2 },
        cost: distance * COSTS[roomLetter2],
      });
    });
  return moves;
};

/**
 * Returns of all the possible moves from a room to a hallway. For each room:
 *
 * 1. Skip the room if it is empty or contains only amphipods that want to
 *    stay.
 * 2. Iterate the hallway nodes:
 *    1. Skip the node if it is occupied.
 *    2. Get the list of hallway nodes along the path, and skip the node if any
 *       of them are occupied.
 *    3. Otherwise, this is a valid move. Compute its cost and add it to the
 *       move list.
 *
 * @param {Object} burrow - the burrow object
 * @returns {Array} - an array of moves
 */
const getMovesFromRoomToHallway = burrow => {
  const moves = [];
  Object.entries(burrow.rooms).forEach(([ roomLetter, room ]) => {
    if (room.every(amphipod => amphipod === roomLetter)) {
      return; // room is empty or only contains amphipods that want to stay
    }

    burrow.hallways.forEach((occupant, hallwayIndex) => {
      if (occupant !== null) {
        return; // already occupied
      }

      if (isBlockedBetweenRoomAndHallway(burrow, roomLetter, hallwayIndex)) {
        return; // path to hallway is blocked
      }

      const distance = getDistanceToExitRoom(burrow, roomLetter) +
        getDistanceBetweenRoomAndHallway(roomLetter, hallwayIndex);
      moves.push({
        from: { type: 'room',    letter: roomLetter },
        to:   { type: 'hallway', index: hallwayIndex },
        cost: distance * COSTS[room[0]],
      });
    });
  });
  return moves;
};

/**
 * Tests whether the path between the named room and hallway node is blocked.
 *
 * @param {Object} burrow - the burrow object
 * @param {string} roomLetter - the letter of the room
 * @param {number} hallwayIndex - the index of the hallway node
 * @returns {boolean} - `true` if the path is blocked, `false` otherwise
 */
 const isBlockedBetweenRoomAndHallway = (burrow, roomLetter, hallwayIndex) => {
  const blockers = HALLWAY_BLOCKERS[hallwayIndex][roomLetter];
  return blockers.some(blocker => burrow.hallways[blocker] !== null);
};

/**
 * Tests whether the path between the two named rooms is blocked.
 *
 * @param {Object} burrow - the burrow object
 * @param {string} roomLetter1 - the letter of the first room
 * @param {string} roomLetter2 - the letter of the second room
 * @returns {boolean} - `true` if the path is blocked, `false` otherwise
 */
const isBlockedBetweenRooms = (burrow, roomLetter1, roomLetter2) => {
  const blockers = ROOM_BLOCKERS[roomLetter1][roomLetter2];
  return blockers.some(blocker => burrow.hallways[blocker] !== null);
};

/**
 * Retrieves the distance an amphipod would have to travel to get as far back
 * in the named room as possible. If the room can only accept one more
 * amphipod, the distance is `0`.
 *
 * @param {Object} burrow - the burrow object
 * @param {string} roomLetter - the letter of the room to enter
 * @returns {number} - the travel distance
 */
const getDistanceToEnterRoom = (burrow, roomLetter) => {
  return burrow.roomSize - burrow.rooms[roomLetter].length - 1;
};

/**
 * Retrieves the distance the front amphipod in the named room would have to
 * travel to get to the front of the room in order to exit it. If the room is
 * currently full, the distance is `0`.
 *
 * @param {Object} burrow - the burrow object
 * @param {string} roomLetter - the letter of the room to exit
 * @returns {number} - the travel distance
 */
 const getDistanceToExitRoom = (burrow, roomLetter) => {
  return burrow.roomSize - burrow.rooms[roomLetter].length;
};

/**
 * Retrieves the distance an amphipod would have to travel between the front of
 * the named room and the indicated hallway node.
 *
 * @param {string} roomLetter - the letter of the room
 * @param {number} hallwayIndex - the index of the hallway node
 * @returns {number} - the travel distance
 */
const getDistanceBetweenRoomAndHallway = (roomLetter, hallwayIndex) => {
  return HALLWAY_DISTANCES[hallwayIndex][roomLetter];
};

/**
 * Retrieves the distance an amphipod would have to travel between the front of
 * the two named rooms.
 *
 * @param {string} roomLetter1 - the letter of the first room
 * @param {string} roomLetter2 - the letter of the second room
 * @returns {number} - the travel distance
 */
 const getDistanceBetweenRooms = (roomLetter1, roomLetter2) => {
  return ROOM_DISTANCES[roomLetter1][roomLetter2];
};

/**
 * Clones the given burrow and modifies it to reflect the given move.
 *
 * @param {Object} burrow - the burrow object
 * @param {Object} move - the move object
 * @returns {Object} - the cloned burrow object
 */
const performMove = (burrow, move) => {
  const clone = cloneBurrow(burrow);
  let amphipod;

  if (move.from.type === 'room') {
    amphipod = clone.rooms[move.from.letter].shift();
  } else {
    amphipod = clone.hallways[move.from.index];
    clone.hallways[move.from.index] = null;
  }

  if (move.to.type === 'room') {
    clone.rooms[move.to.letter].unshift(amphipod);
  } else {
    clone.hallways[move.to.index] = amphipod;
  }

  return clone;
};

/**
 * Determines whether all the amphipods are in their desired rooms.
 *
 * @param {Object} burrow - the burrow object
 * @returns {boolean} - `true` if all the amphipods are in their desired rooms;
 * `false` otherwise
 */
const atTargetState = burrow => {
  return Object.entries(burrow.rooms)
    .every(([ roomLetter, room ]) => {
      return room.length === burrow.roomSize && room.every(amphipod => amphipod === roomLetter);
    });
};

/**
 * Returns a string representation of the given burrow.
 *
 * @param {Object} burrow - the burrow object
 * @returns {string} - the string representation of the burrow
 */
const burrowToString = burrow => {
  const h = burrow.hallways.map(occupant => occupant ?? '.');
  const lines = [
    '#############',
    `#${h[0]}${h[1]}.${h[2]}.${h[3]}.${h[4]}.${h[5]}${h[6]}#`,
  ];

  for (let i = 0; i < burrow.roomSize; i++) {
    const r = Object.entries(burrow.rooms).map(([ _, room ]) => {
      const occupantIndex = i + room.length - burrow.roomSize;
      return (occupantIndex >= 0 && room[occupantIndex]) || '.';
    });
    const left = i === 0 ? '###' : '  #';
    const right = i === 0 ? '###' : '#';
    lines.push(`${left}${r.join('#')}${right}`);
  }

  lines.push('  #########');
  return lines.join('\n');
};

/**
 * Returns a string listing all the moves in the given solution, with the state
 * of the burrow displayed with each move.
 *
 * @param {Object} burrow - the burrow object
 * @param {Object} solution - the solution object 
 * @returns {string} - the string representation of the solution
 */
// eslint-disable-next-line no-unused-vars
const solutionToString = (burrow, solution) => {
  const output = [ burrowToString(burrow) ];
  let clone = burrow;
  solution.moves.forEach(move => {
    output.push(`${moveToString(move)}`);
    clone = performMove(clone, move);
    output.push(burrowToString(clone));
  });
  output.push(`TOTAL COST: ${solution.cost}`);
  return output.join('\n');
};

/**
 * Returns a string representation of the given move.
 *
 * @param {Object} move - the move object
 * @returns {string} - the string representation of the move
 */
const moveToString = move => {
  const from = move.from.type === 'room' ? move.from.letter : move.from.index;
  const to = move.to.type === 'room' ? move.to.letter : move.to.index;
  return `From ${move.from.type} ${from} to ${move.to.type} ${to}, cost=${move.cost}`;
};

/**
 * Returns the letter (`'A'` to `'D'`) corresponding to the given index number
 * (`0` to `3`).
 *
 * @param {number} index - the index number
 * @returns {string} - the corresponding letter
 */
 const indexToLetter = index => String.fromCharCode(index + 65);
