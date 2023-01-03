const SimpleGrid = require('../simple-grid');

const GRID_SPEC = {
  test: {
    size: 4,
    portals: [
      [ // part 1
        [
          { square: 0, turn: 0 },
          { square: 3, turn: 0 },
          { square: 0, turn: 0 },
          { square: 4, turn: 0 },
        ],
        [
          { square: 2, turn: 0 },
          { square: 1, turn: 0 },
          { square: 3, turn: 0 },
          { square: 1, turn: 0 },
        ],
        [
          { square: 3, turn: 0 },
          { square: 2, turn: 0 },
          { square: 1, turn: 0 },
          { square: 2, turn: 0 },
        ],
        [
          { square: 1, turn: 0 },
          { square: 4, turn: 0 },
          { square: 2, turn: 0 },
          { square: 0, turn: 0 },
        ],
        [
          { square: 5, turn: 0 },
          { square: 0, turn: 0 },
          { square: 5, turn: 0 },
          { square: 3, turn: 0 },
        ],
        [
          { square: 4, turn: 0 },
          { square: 5, turn: 0 },
          { square: 4, turn: 0 },
          { square: 5, turn: 0 },
        ],
      ],
      [ // part 2
        [
          { square: 5, turn: 2 },
          { square: 3, turn: 0 },
          { square: 2, turn: 3 },
          { square: 1, turn: 2 },
        ],
        [
          { square: 2, turn: 0 },
          { square: 4, turn: 2 },
          { square: 5, turn: 3 },
          { square: 0, turn: 2 },
        ],
        [
          { square: 3, turn: 0 },
          { square: 4, turn: 3 },
          { square: 1, turn: 0 },
          { square: 0, turn: 1 },
        ],
        [
          { square: 5, turn: 1 },
          { square: 4, turn: 0 },
          { square: 2, turn: 0 },
          { square: 0, turn: 0 },
        ],
        [
          { square: 5, turn: 0 },
          { square: 1, turn: 2 },
          { square: 2, turn: 1 },
          { square: 3, turn: 0 },
        ],
        [
          { square: 0, turn: 2 },
          { square: 1, turn: 1 },
          { square: 4, turn: 0 },
          { square: 3, turn: 3 },
        ],
      ]
    ],
  },
  real: {
    size: 50,
    portals: [
      [ // part 1
        [
          { square: 1, turn: 0 },
          { square: 2, turn: 0 },
          { square: 1, turn: 0 },
          { square: 4, turn: 0 },
        ],
        [
          { square: 0, turn: 0 },
          { square: 1, turn: 0 },
          { square: 0, turn: 0 },
          { square: 1, turn: 0 },
        ],
        [
          { square: 2, turn: 0 },
          { square: 4, turn: 0 },
          { square: 2, turn: 0 },
          { square: 0, turn: 0 },
        ],
        [
          { square: 4, turn: 0 },
          { square: 5, turn: 0 },
          { square: 4, turn: 0 },
          { square: 5, turn: 0 },
        ],
        [
          { square: 3, turn: 0 },
          { square: 0, turn: 0 },
          { square: 3, turn: 0 },
          { square: 2, turn: 0 },
        ],
        [
          { square: 5, turn: 0 },
          { square: 3, turn: 0 },
          { square: 5, turn: 0 },
          { square: 3, turn: 0 },
        ],
      ],
      [ // part 2
        [
          { square: 1, turn: 0 },
          { square: 2, turn: 0 },
          { square: 3, turn: 2 },
          { square: 5, turn: 1 },
        ],
        [
          { square: 4, turn: 2 },
          { square: 2, turn: 1 },
          { square: 0, turn: 0 },
          { square: 5, turn: 0 },
        ],
        [
          { square: 1, turn: 3 },
          { square: 4, turn: 0 },
          { square: 3, turn: 3 },
          { square: 0, turn: 0 },
        ],
        [
          { square: 4, turn: 0 },
          { square: 5, turn: 0 },
          { square: 0, turn: 2 },
          { square: 2, turn: 1 },
        ],
        [
          { square: 1, turn: 2 },
          { square: 5, turn: 1 },
          { square: 3, turn: 0 },
          { square: 2, turn: 0 },
        ],
        [
          { square: 4, turn: 3 },
          { square: 1, turn: 0 },
          { square: 0, turn: 3 },
          { square: 3, turn: 0 },
        ],
      ]
    ],
  },
};
const INSTRUCTIONS_REGEXP = /(?:(\d+)|([LR]))/g;
const WALL = '#';
const OPEN = '.';
const VOID = ' ';
const DIRECTIONS = [
  { r:  0, c:  1 }, // east
  { r:  1, c:  0 }, // south
  { r:  0, c: -1 }, // west
  { r: -1, c:  0 }, // north
];

/**
 * # [Advent of Code 2022 Day 22](https://adventofcode.com/2022/day/22)
 *
 * The input consists of six `n` x `n` squares, arranged so that each tile touches at least one
 * other edge-to-edge, and we have to trace a path over these squares. The difference between the
 * two parts is what happens when the path goes past the edge of a square to a location where no
 * other square appears to exist. In part one, you "wrap around" to the opposite edge of that row
 * or column of squares. In part two, it's found that the six squares are actually the faces of a
 * cube, so going off the edge of one square is really going around to one of the cube's other
 * faces.
 *
 * Both parts can be solved by creating "portals" along the edges of the squares that tell us where
 * to go next when exiting the square along that edge. While it would be possible to compute the
 * correct locations for the portals programmatically, I chose to hard-code them. This means that
 * my solution wouldn't work for every possible input, but it turns out that all the inputs from
 * the Advent of Code site are laid out in the same way, so it will work for any actual input.
 *
 * The part two cube portals for the real input can be diagrammed as follows:
 *
 * ```txt
 * +--------------+    +--------+
 * |              |    |        |
 * |    +--------[0]--[1]--+    |
 * |    |         |    |   |    |
 * |    |    +---[2]---+   |    |
 * |    |    |    |        |    |
 * |    +---[3]--[4]-------+    |
 * |         |    |             |
 * +--------[5]---+             |
 *           |                  |
 *           +------------------+
 * ```
 *
 * In the diagram above, each face of the cube is numbered, and lines connect the joined faces.
 *
 * The input is parsed as follows:
 *
 * 1.  Remove any instances of `\r`.
 * 2.  Split the input on `\n\n`: the first part is the map, the second is the instructions.
 * 3.  Split the map into lines, then determine the maximum line length.
 * 4.  Pad the end of every map line with spaces so that all lines are the same length.
 * 5.  Read the map into a `SimpleGrid`.
 * 6.  Check whether the maximum row length is divisible by 50; if so, we're using the real input;
 *     otherwise, it's test input.
 * 7.  Retrieve the real or test grid specification; this is an object that says how large the
 *     squares are and how they're connected for each part.
 * 8.  Iterate the grid every `size` rows and columns, where `size` is the square size given by the
 *     spec. Each location iterated which does not contain a space is the upper-left corner of a
 *     square. Use `SimpleGrid.slice()` to cut the square out of the grid and push it to an array.
 *     At the end, we should have an array containing six squares, in the order that they occur
 *     from top to bottom, left to right.
 * 9.  Determine the starting position, which is the at the first `'.'` character in the first row
 *     of the first square.
 * 10. Split the instructions apart into tokens, where each token is either the letters `'L'` or
 *     `'C'`, or an integer greater than zero.
 * 11. Parse the integers in the instructions array into `number`s.
 *
 * Each portal is stored in a structure where you can look it up from the square you're currently
 * on and the edge of the square you are crossing (`0` = east, `1` = south, `2` = west, `3` =
 * north). The portal gives the index of the destination square, and how much of a turn to apply to
 * the current direction (as a value between `0` and `3`, which is added to the current direction,
 * then we take the remainder of dividing it by `4`). So the turn values mean:
 *
 * - `0`: Keep going the same direction
 * - `1`: Turn right
 * - `2`: Turn 180 degrees
 * - `3`: Turn left
 *
 * The information about which direction you're exiting a square and what turn to take is enough
 * information to compute the location where you end up on the target square. Assuming `r0` and
 * `c0` are your current coordinates on the square you're leaving, the coordinates `(r, c)` on the
 * target square can be computed as follows:
 *
 * - Direction 0 (east)
 *   - Turn 0: `r = r0, c = 0`
 *   - Turn 1: `r = 0, c = size - r0`
 *   - Turn 2: `r = size - r0, c = size - 1`
 *   - Turn 3: `r = size - 1, c = r`
 * - Direction 1 (south)
 *   - Turn 0: `r = 0, c = c0`
 *   - Turn 1: `r = c0, c = size - 1`
 *   - Turn 2: `r = size - 1, c = size - c0`
 *   - Turn 3: `r = size - c0, c = 0`
 * - Direction 2 (west)
 *   - Turn 0: `r = r0, c = size - 1`
 *   - Turn 1: `r = size - 1, c = size - r0`
 *   - Turn 2: `r = size - r0, c = 0`
 *   - Turn 3: `r = 0, c = r0`
 * - Direction 3 (north)
 *   - Turn 0: `r = size - 1, c = c0`
 *   - Turn 1: `r = c0, c = 0`
 *   - Turn 2: `r = 0, c = size - c0`
 *   - Turn 3: `r = size - c0, c = size - 1`
 *
 * These were encoded as sixteen functions that were stored in a structure mirroring the list above
 * to allow them to be looked up easily.
 *
 * So when we enter a portal, we do the following:
 *
 * 1. Look up the portal based on our current square and direction we're facing.
 * 2. Target square is given by the selected portal.
 * 3. Using the current direction and the amount of turn, look up the function that will give our
 *    new coordinates and execute it.
 * 4. Compute the new dirction by applying the turn amount specified on the portal.
 *
 * Note that whether moving normally or passing through a portal, we must be certain to check to
 * see if the target tile contains a wall (`'#'`); if so, we don't move and we skip to the next
 * turn instruction.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const data = parse(input);
  const state = { ...data.state }; // store initial state
  const part1 = execute(data, 0);
  data.state = state; // restore initial state
  const part2 = execute(data, 1);
  return [ part1, part2 ];
};

/**
 * Parse the input and:
 *
 * - Determine the grid spec to use
 * - Find the six squares in the puzzle
 * - Set up the initial state
 * - Parse the array of instructions
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsing results
 */
const parse = input => {
  let [ grid, instructions ] = input.replaceAll('\r', '').split('\n\n');

  // Normalize the map and read it into a grid
  grid = grid.split('\n');
  const maxRowLength = grid.reduce((max, line) => Math.max(max, line.length), 0);
  grid = grid.map(line => line.padEnd(maxRowLength, VOID));
  grid = new SimpleGrid({ data: grid.join('\n') });

  // Break the grid into squares
  const gridSpec = GRID_SPEC[maxRowLength % 50 === 0 ? 'real' : 'test'];
  const rows = grid.rows / gridSpec.size;
  const cols = grid.cols / gridSpec.size;
  const squares = [];
  let state = null;

  for (let r = 0; r < rows; r++) {
    const rCell = r * gridSpec.size;

    for (let c = 0; c < cols; c++) {
      const cCell = c * gridSpec.size;
      const corner = grid.get(rCell, cCell);

      if (corner === OPEN || corner === WALL) {
        const square = grid.slice(rCell, cCell, gridSpec.size, gridSpec.size);
        square.anchor = { r: rCell, c: cCell };
        squares.push(square);

        if (state === null) {
          state = { s: 0, r: 0, c: input.indexOf(OPEN) - cCell, dir: 0 };
        }
      }
    }
  }

  // Parse the instructions
  instructions = instructions.match(INSTRUCTIONS_REGEXP)
    .map(match => match === 'L' || match === 'R' ? match : parseInt(match, 10));
  return { gridSpec, squares, state, instructions };
};

/**
 * Executes the instructions on the grid.
 *
 * @param {Object} param0 - the parsed input
 * @param {Object} param0.gridSpec - the grid spec object which applies to this input
 * @param {Array<SimpleGrid>} param0.squares - the six squares
 * @param {Object} param0.state - the initial state
 * @param {Array<string|number>} param0.instructions - the parsed instructions
 * @param {Array<string|number>} partIndex - `0` or `1`, indicating the part we're running
 * @returns {number} - the answer for this part
 */
const execute = ({ gridSpec, squares, state, instructions }, partIndex) => {
  const { size } = gridSpec;
  const PORTAL_TURNS = [
    [ // east
      () => ({ r: state.r, c: 0 }),
      () => ({ r: 0, c: size - state.r - 1 }),
      () => ({ r: size - state.r - 1, c: size - 1 }),
      () => ({ r: size - 1, c: state.r }),
    ],
    [ // south
      () => ({ r: 0, c: state.c }),
      () => ({ r: state.c, c: size - 1 }),
      () => ({ r: size - 1, c: size - state.c - 1 }),
      () => ({ r: size - state.c - 1, c: 0 }),
    ],
    [ // west
      () => ({ r: state.r, c: size - 1 }),
      () => ({ r: size - 1, c: size - state.r - 1 }),
      () => ({ r: size - state.r - 1, c: 0 }),
      () => ({ r: 0, c: state.r }),
    ],
    [ // north
      () => ({ r: size - 1, c: state.c }),
      () => ({ r: state.c, c: 0 }),
      () => ({ r: 0, c: size - state.c - 1 }),
      () => ({ r: size - state.c - 1, c: size - 1 }),
    ]
  ];

  // Look up portals applicable to this part
  const portals = gridSpec.portals[partIndex];
  // Execute instructions
  instructions.forEach(instruction => {
    if (typeof instruction === 'number') {
      // We're moving
      for (let i = 0; i < instruction; i++) {
        let next = { s: state.s };
        const deltas = DIRECTIONS[state.dir];
        next.r = state.r + deltas.r;
        next.c = state.c + deltas.c;
        next.dir = state.dir;
        let exitDir;

        // Did we enter a portal?
        if (next.r === -1) {
          exitDir = 3;
        } else if (next.c === -1) {
          exitDir = 2;
        } else if (next.c === size) {
          exitDir = 0;
        } else if (next.r === size) {
          exitDir = 1;
        }

        if (exitDir !== undefined) {
          // We entered a portal; figure out where we end up and which way we're facing
          const portal = portals[state.s][exitDir];
          next.s = portal.square;
          const coordsAfterTurn = PORTAL_TURNS[exitDir][portal.turn](state);
          next.r = coordsAfterTurn.r;
          next.c = coordsAfterTurn.c;
          next.dir = (state.dir + portal.turn) % 4;
        }

        if (squares[next.s].get(next.r, next.c) === WALL) {
          // Our target location is a wall; don't move
          break;
        }

        // Update the state to reflect our new location and direction
        state.s = next.s;
        state.r = next.r;
        state.c = next.c;
        state.dir = next.dir;
      }
    } else {
      // We're turning
      const turn = instruction === 'L' ? -1 : 1;
      state.dir = (state.dir + turn + 4) % 4;
    }
  });
  // Compute our final location and the resulting answer for this part
  const square = squares[state.s];
  return (square.anchor.r + state.r + 1) * 1000 + (square.anchor.c + state.c + 1) * 4 + state.dir;
};
