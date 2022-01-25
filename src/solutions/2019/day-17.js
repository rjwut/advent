const { parseGrid } = require('../util');
const intcode = require('./intcode-ascii');

const DIRECTIONS = [
  [ -1,  0 ], // north
  [  0,  1 ], // east
  [  1,  0 ], // south
  [  0, -1 ], // west
];
const ROBOT_CHARS = [ '^', '>', 'v', '<' ];
const MAX_FUNCTIONS = 3;
const MAX_FUNCTION_LENGTH = 20;
const VALID_ROUTINE = /^(?:[A-C],)*(?:[A-C])$/;
const SEGMENT_CHAINS = /(?:(?:L|R),\d+,)*(?:(?:L|R),\d+)/g;
const SEGMENTS = /(?:L|R),\d+/g;

/**
 * # [Advent of Code 2019 Day 17](https://adventofcode.com/2019/day/17)
 *
 * This solution is broken into several parts, each of which is implemented by
 * a separate function; see the corresponding function's comments for details:
 *
 * - Build the scaffold map: `buildScaffoldMap()`
 * - Locate the robot and the intersections: `sweepGrid()`
 * - Compute the path: `findPath()`
 * - Building the functions: `buildFunctions()`
 * - Running the robot: `runRobot()`
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const firstChar = input.charAt(0);
  const isIntcode = firstChar !== '.' && firstChar !== '#';
  const map = isIntcode ? buildScaffoldMap(input) : input;
  const analysis = analyzeScaffold(map);
  const part1Answer = analysis.intersections.reduce((sum, [ r, c ]) => sum + r * c, 0);
  const result = buildFunctions(analysis.path);
  const part2Answer = isIntcode ? runRobot(input, result) : undefined;
  return [ part1Answer, part2Answer ];
};

/**
 * Builds the scaffold map by running the given program through the Intcode
 * interpreter.
 *
 * @param {string} input - an Intcode program or a scaffold map
 * @returns {string} - the scaffold map
 */
const buildScaffoldMap = input => intcode(input).run();

/**
 * Performs an analysis of the scaffold as described in the given scaffold map.
 * The scaffold map may only contain the characters `#` (scaffold) or `.` (no
 * scaffold), plus exactly one instance of one of `^`, `>`, `v`, or `<` (the
 * robot, facing up, right, down, or left, respectively). The space occupied by
 * the robot is also considered to be scaffold.
 *
 * The analysis produces an object with the following properties:
 *
 * - `grid`: The scaffold map parsed into a two-dimensional array of
 *   characters. The robot character will have been removed from this
 *   representation and replaced with a `#`.
 * - `height`: The height of the grid.
 * - `width`: The width of the grid.
 * - `robot`: Information about the robot:
 *   - `position`: The position of the robot, as a two-dimensional array, where
 *     element `0` is the row and element `1` is the column.
 *   - `direction`: The direction the robot is facing, as an integer, where `0`
 *     is "north", `1` is "east", `2` is "south", and `3` is "west".
 * - `intersections`: An array of the coordinates of all scaffold
 *   intersections.
 * - `segments`: An array of objects representing scaffold segments. Each
 *   segment starts with the robot rotating by 90 degrees, followed by moving
 *   forward until it runs out of scaffold. Navigating the entire scaffold is
 *   done by stringing together segments.
 *
 * @param {string} map - the puzzle input (or the scaffold image)
 * @returns {Object} - the analysis of the scaffold
 */
const analyzeScaffold = map => {
  let analysis = {
    intersections: [],
  };

  analysis.grid = parseGrid(map);
  analysis.height = analysis.grid.length;
  analysis.width = analysis.grid[0].length;
  analysis = { ...analysis, ...sweepGrid(analysis.grid) };
  analysis.path = findPath(analysis);
  return analysis;
};

/**
 * Iterates through the scaffold grid to locate the robot and identify all
 * intersections.
 *
 * The robot is the only character on the grid that is one of: `^`, `>`, `v`,
 * or `<`. All others must be `#` (scaffold) or `.` (empty space). Once the
 * robot is located, its coordinates and direction are recorded and it's
 * replaced with `#`.
 *
 * To locate intersections, I simply iterate the map, and every time I
 * encounter a `#`, I check its four neighbors. If they are all `#, I add the
 * coordinates to the list of intersections. The answer to part one can now be
 * computed by multiplying the X and Y coordinates of each intersection and
 * summing the products.
 *
 * The object returned by this function has the following properties:
 *
 * - `intersections`: An array of intersection coordinates
 * - `robot`: An object describing the robot:
 *   - `direction`: A number describing the robot's direction, where `0` is
 *     "north", `1` is "east", `2` is "south", and `3` is "west".
 *   - `position`: The robot's coordinates
 *
 * @param {Array} grid - the two-dimensional array containing the scaffold map
 * @returns {Object} - the results of the sweep
 */
const sweepGrid = grid => {
  const analysis = {
    intersections: [],
  };
  iterateGrid(grid, (chr, coords) => {
    let direction = ROBOT_CHARS.indexOf(chr);

    if (direction !== -1) {
      analysis.robot = {
        position: coords,
        direction,
      };
      chr = '#';
      grid[coords[0]][coords[1]] = '#';
    }

    if (chr === '#') {
      let neighborCount = 0;
      iterateNeighbors(grid, coords, nChr => {
        if (nChr === '#') {
          neighborCount++;
        }
      });

      if (neighborCount === 4) {
        analysis.intersections.push(coords);
      }
    }
  });
  return analysis;
};

/**
 * Determines the path to cover the entire scaffold. There are two observations
 * about the scaffold map that will help us here:
 *
 * 1. The robot always starts facing at 90 degrees with respect to the scaffold
 *    beam on which it is located.
 * 2. The robot is never required to turn at an intersection. It can always
 *    cover the entire scaffold by repeating the following two steps:
 *    1. Turn to face the uncleaned scaffold beam.
 *    2. Move forward until the scaffold beam ends
 *
 * This means that the entire list of instructions consists alternating turn
 * commands and movement commands. I will refer to a single turn command
 * followed by a single movement command as a _segment_. So the entire path can
 * be computed by following this algorithm:
 *
 * 1. Create an empty command list.
 * 2. Create a list of visited cells. Put the robot's starting position in this
 *    list.
 * 3. Look for an adjacent cell that is unvisited scaffold. If none is found,
 *    we're done.
 * 4. Turn to face that cell. Add the turn to the command list.
 * 5. Move forward one cell. Add the current location to the visited cells
 *    list. Repeat until the next cell is empty space or we reach the edge of
 *    the grid.
 * 6. Go to step 3.
 *
 * When the process completes, the command list will contain the correct path
 * to visit the entire scaffold. This is returned as a comma-delimited list of
 * commands.
 *
 * @param {Array} param0.grid - the scaffold map
 * @param {number} param0.width - the width of the scaffold map
 * @param {number} param0.height - the height of the scaffold map
 * @param {number} param0.robot.direction - the direction the robot is facing
 * @param {number} param0.robot.position - the robot's coordinates
 * @returns {string} - the path to cover the entire scaffold
 */
const findPath = ({ grid, width, height, robot }) => {
  const segments = [];
  let direction = robot.direction;
  let position = [ ...robot.position ];
  let visited = new Set([ position.join() ]);

  do {
    // Determine which direction to turn to face the next cell.
    let newDirection, nextPosition, distance = 0;
    iterateNeighbors(grid, position, (chr, coords, _, dirIndex) => {
      if (chr === '#' && !visited.has(coords.join())) {
        newDirection = dirIndex;
        nextPosition = coords;
      }
    });

    if (newDirection === undefined) {
      break;
    }

    let turn = newDirection - direction;

    if (Math.abs(turn) === 3) {
      turn = turn === 3 ? -1 : 1;
    }

    direction = newDirection;

    // Move forward until we reach the end of the beam.
    do {
      position = nextPosition;
      visited.add(position.join());
      distance++;
      nextPosition = position.map((val, i) => val + DIRECTIONS[direction][i]);

      if (
        nextPosition[0] < 0 || nextPosition[0] >= height ||
        nextPosition[1] < 0 || nextPosition[1] >= width
      ) {
        break;
      }
    } while(grid[nextPosition[0]][nextPosition[1]] === '#');

    segments.push(`${ turn === -1 ? 'L' : 'R'},${distance}`);
  } while (true);

  return segments.join();
};

/**
 * Determines how to break the given path down into three repeatable functions.
 * Each function consists of between one to five segments, where each segment
 * is a turn command followed by a movement command. (There can't be more than
 * five segments because each segment is a minimum of three characters, and
 * each function can be no more than 20 characters long.) We must produce the
 * three functions, as well as the main routine that calls them.
 *
 * I chose to solve this using regular expressions. The function names are `A`,
 * `B`, and `C`, and the main routine is a comma-delimited list of function
 * names. So a valid main routine would match the following regular expression:
 *
 * ```js
 * /^(?:[A-C],)*(?:[A-C])$/
 * ```
 *
 * A segment is a turn command followed by a movement command. All segments in
 * the path can be located using this regular expression:
 *
 * ```js
 * /(?:L|R),\d+/g
 * ```
 *
 * When we find a function, we replace its occurrences in the path with its
 * function letter. For example, suppose we had a path like this:
 *
 * ```txt
 * L,6,R,3,R,4,R,7,L,6,R,3,L,5
 * ```
 *
 * ...and suppose that we decided the first function were `L,6,R,3`. If we
 * substituted that function into the path, we'd get:
 *
 * ```txt
 * A,R,4,R,7,A,L,5
 * ```
 *
 * We are left with two segment chains: `R,4,R,7` and `L,5`. Segment chains can
 * be matched by the following regular expression:
 *
 * ```js
 * /(?:(?:L|R),\d+,)*(?:(?:L|R),\d+)/g
 * ```
 *
 * We can recursively compute the functions as follows:
 *
 *  1. The input for our recursive function is a path and a list of existing
 *     functions. When we first begin the computation, the path is a list of
 *     segments with no functions, and the list of functions is empty.
 *  2. Find all the segment chain regular expression matches in the path.
 *  3. For the first chain, find all the segment matches.
 *  4. Set `n` to `5` or number of segments in the first chain, whichever is
 *     lower).
 *  5. Create a new function using the first `n` segments of the chain.
 *  6. If the function exceeds the maximum length, skip to step 11.
 *  7. Create a new path by replacing all occurrences of the new function in
 *     the old path with its corresponding letter.
 *  8. If the new path is a valid main routine (it contains only functions and
 *     no commands and does not exceed the maximum length), we've discovered
 *     the solution. Return the function list and the main routine.
 *  9. If we haven't used up all three functions yet, recurse by returning to
 *     step 1 using the new path and list of functions.
 * 10. If the return value from step 9 is not `undefined`, return it.
 * 11. Decrement `n`. If `n` is `0`, return `undefined`. Otherwise, go to step
 *     5.
 *
 * The returned object contains the following properties:
 *
 * - `main`: The main routine, which is a path expressed entirely with
 *   functions rather than commands.
 * - `fns`: An array containing three functions, each of which is a string
 *   describing a segment chain.
 *
 * @param {string} path - the path to break down into functions 
 * @param {Array} [fns=[]] - the list of existing functions
 * @returns {Object} - the functions and main routine
 */
const buildFunctions = (path, fns = []) => {
  const chains = matchAll(path, SEGMENT_CHAINS);
  const nextChain = chains[0];
  const segments = matchAll(nextChain, SEGMENTS);

  for (let i = Math.min(segments.length, 5); i > 0; i--) {
    const newFn = segments.slice(0, i).join();

    if (newFn.length > MAX_FUNCTION_LENGTH) {
      continue;
    }

    const newFns = [ ...fns, newFn ];
    const newFnLetter = String.fromCharCode(65 + fns.length);
    const newPath = path.replaceAll(newFn, newFnLetter);

    if (VALID_ROUTINE.test(newPath) && newPath.length < MAX_FUNCTION_LENGTH) {
      return { main: newPath, fns: newFns };
    }

    if (fns.length + 1 < MAX_FUNCTIONS) {
      const result = buildFunctions(newPath, newFns);

      if (result) {
        return result;
      }
    }
  }
};

/**
 * Configures the robot according to the computed main routine and functions,
 * then runs it and outputs the amount of dust collected, which is the answer
 * to part two.
 *
 * 1. Feed the program to the Intcode interpreter.
 * 2. Replace the value at memory address `0` with `2`.
 * 3. Assemble the input and feed it to the Intcode interpreter.
 * 4. Execute the program.
 * 5. The final value output by the interpreter is the answer to part two.
 *
 * @param {string} program - the Intcode program for the robot
 * @param {string} param1.main - the main routine to give the robot
 * @param {Array} param1.fns - the three functions to give the robot
 * @returns {number} - the amount of dust collected by the robot
 */
const runRobot = (program, { main, fns }) => {
  const { send, state } = intcode(program, 'raw');
  state.memory[0] = 2;
  const lines = [
    main,
    ...fns,
    'n',
  ];
  const output = send(lines.join('\n') + '\n');
  return output[output.length - 1];
};

/**
 * Similar to `string.matchAll()`, but returns just a simple array of the
 * matched strings.
 *
 * @param {string} string - the string to search
 * @param {RegExp} regexp - the regular expression to match
 * @returns {Array} - the matched strings
 */
const matchAll = (string, regexp) => {
  return [ ...string.matchAll(regexp) ].map(match => match[0]);
};

/**
 * Iterates all the cells in the grid.
 *
 * @param {Array} grid - the grid to iterate
 * @param {Function} fn - the callback function
 */
const iterateGrid = (grid, fn) => {
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];

    for (let c = 0; c < row.length; c++) {
      fn(grid[r][c], [ r, c ]);
    }
  }
};

/**
 * Iterates the two to four cells neighboring the cell at the given coordinates
 * in the two-dimensional array. The callback function receives four arguments:
 *
 * - The value at the neighboring cell
 * - The coordinates of the neighboring cell
 * - The coordinate delta between the neighboring cell and the given cell
 * - The corresponding `DIRECTION` index
 *
 * @param {Array} grid - the scaffold map
 * @param {Array} coords - the coordinates of the cells whose neighbors should
 * be iterated
 * @param {Function} fn - the callback function
 */
const iterateNeighbors = (grid, coords, fn) => {
  DIRECTIONS.forEach((delta, index) => {
    const nCoords = coords.map((val, i) => val + delta[i]);

    if (
      nCoords[0] >= 0 && nCoords[0] < grid.length &&
      nCoords[1] >= 0 && nCoords[1] < grid[nCoords[0]].length
    ) {
      fn(grid[nCoords[0]][nCoords[1]], nCoords, delta, index);
    }
  });
};
