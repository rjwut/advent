const IntcodeVm = require('./intcode');

const Tile = {
  EMPTY:  0,
  WALL:   1,
  BLOCK:  2,
  PADDLE: 3,
  BALL:   4,
};
const SYMBOLS = [ ' ', '█', '▒', '=', '⬤' ];
const SCREEN_SIZE = { x: 42, y: 25 };

/**
 * # [Advent of Code 2019 Day 13](https://adventofcode.com/2019/day/13)
 *
 * All you really have to do for this part is to look at every third output
 * value and count the number of times that it's `2`. Technically, the game
 * could output multiple blocks at the same location, or print out a tile and
 * then later overwrite it with something else, but it doesn't. I made my
 * implementation able to handle these cases because I felt like it. Each time
 * a brick is output, it's coordinates (concatenated to a string) are added to
 * a `Set`. When anything else is output, it's removed from the `Set`. When the
 * program terminates, I simply count the number of elements in the `Set`.
 *
 * For part two, I track the current positions of the ball and paddle. When the
 * program halts for input, I compute `Math.sign(ball.x - paddle.x)` and pass
 * the result into the program.
 *
 * @param {string} input - the puzzle input
 * @param {boolean} debug - if `true`, the game is rendered on the screen for
 * part 2
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, debug) => {
  return [ part1(input), part2(input, debug) ];
};

/**
 * Runs the program (without turning on freeplay mode) and returns the number
 * of blocks printed to the screen.
 *
 * @param {string} program - the Intcode program source
 * @returns {number} - the number of bricks
 */
const part1 = program => {
  const vm = new IntcodeVm();
  vm.load(program);
  vm.run();
  const blocks = new Set();
  const output = vm.dequeueAllOutput();

  for (let i = 0; i < output.length; i += 3) {
    const coords = output.slice(i, i + 2);
    const tile = output[i + 2];
    const value = coords.join();

    if (tile === Tile.BLOCK) {
      blocks.add(value);
    } else {
      blocks.delete(value);
    }
  }

  return blocks.size;
};

/**
 * Runs the full bricks game, keeping the paddle under the ball, and returns
 * the final score.
 *
 * @param {string} program - the Intcode program source
 * @param {boolean} debug - whether to show the game in progress on the screen
 * @returns {number} - the final score
 */
const part2 = (program, debug) => new BricksGame(program, debug).run();

/**
 * Tracks game state and handles program I/O.
 */
class BricksGame {
  #vm;
  #score = 0;
  #ballPos;
  #paddlePos;
  #screen;

  /**
   * Creates a new bricks game instance.
   *
   * @param {string} program - the Intcode program source
   * @param {boolean} display - whether to show the game in progress on the screen
   */
  constructor(program, display) {
    this.#vm = new IntcodeVm();
    this.#vm.load(program);
    this.#vm.program.write(0, 2);
    this.#screen = display ? new Screen() : new NoopScreen();
  }

  /**
   * Invoked every time the program halts. Reads the output from the program
   * and records the latest positions of the ball and paddle. If debugging
   * output is enabled, it will also write all tiles to the `Screen`.
   */
  #consumeOutput() {
    const output = this.#vm.dequeueAllOutput();

    for (let i = 0; i < output.length; i += 3) {
      const coords = output.slice(i, i + 2);
      const x = output[i];
      const z = output[i + 2];

      if (x === -1) {
        this.#score = z;
      } else {
        this.#screen.write(coords, z);

        if (z === Tile.PADDLE) {
          this.#paddlePos = x;
        } else if (z === Tile.BALL) {
          this.#ballPos = x;
        }
      }
    }
  }

  /**
   * Runs the game loop. Every time the program halts, it invokes
   * `#consumeOutput()`, renders the screen if applicable, and determines who
   * the paddle should be moved.
   *
   * @returns {number} - the final score
   */
  run() {
    do {
      this.#vm.run();
      this.#consumeOutput();
      this.#screen.render();

      if (this.#vm.state === 'terminated') {
        break;
      }

      let move = 0;

      if (this.#ballPos && this.#paddlePos) {
        move = Math.sign(this.#ballPos - this.#paddlePos);
      }

      this.#vm.enqueueInput(move);
    } while (true);

    return this.#score;
  }
}

/**
 * Renders the game for debug output.
 */
class Screen {
  #cells;

  /**
   * Clears the screen and sets up the tile array.
   */
  constructor() {
    console.log('\u001B[2J');
    this.#cells = new Array(SCREEN_SIZE.y);

    for (let i = 0; i < SCREEN_SIZE.y; i++) {
      this.#cells[i] = new Array(SCREEN_SIZE.x).fill(0);
    }
  }

  /**
   * Writes a tile to the tile array.
   *
   * @param {Array} coords - the tile coordinates
   * @param {number} tile - the tile ID
   */
  write(coords, tile) {
    this.#cells[coords[1]][coords[0]] = SYMBOLS[tile];
  }

  /**
   * Draws the game screen.
   */
  render() {
    console.log('\u001B[H' + this.#cells.map(line => line.join('')).join('\n'));
  }
}

/**
 * Do-nothing counterpart to `Screen`.
 */
class NoopScreen {
  write() {
  }

  render() {
  }
}
