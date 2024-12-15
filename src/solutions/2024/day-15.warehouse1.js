const SimpleGrid = require('../simple-grid');

const MOVES = {
  '^': [ -1,  0 ],
  'v': [  1,  0 ],
  '<': [  0, -1 ],
  '>': [  0,  1 ],
};

/**
 * Warehouse implementation for part one.
 */
class Warehouse1 extends SimpleGrid {
  #r;
  #c;
  #moves;

  /**
   * Parse the input and populate the grid.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    const [ gridStr, movesStr ] = input.replaceAll('\r', '')
      .split('\n\n');
    super({ data: gridStr });
    const { r, c } = this.coordsOf('@');
    this.#r = r;
    this.#c = c;
    this.#moves = [ ...movesStr.replaceAll('\n', '') ].map(chr => MOVES[chr]);
  }

  /**
   * @returns {number} - the answer for this warehouse
   */
  get gpsSum() {
    return this.findAll(v => v === 'O')
      .reduce((sum, { r, c }) => sum + r * 100 + c, 0);
  }

  /**
   * Execute all moves.
   */
  run() {
    for (const move of this.#moves) {
      this.#move(move);
    }
  }

  /**
   * Execute a single move.
   *
   * @param {number[]} move - the move to perform
   */
  #move(move) {
    let r = this.#r;
    let c = this.#c;
    let cell = '@'
    let pushed = false; // Did we push any crates?

    do {
      r += move[0];
      c += move[1];
      cell = this.get(r, c);
      pushed = pushed || cell === 'O';
    } while (cell === 'O');

    if (cell === '#') {
      return; // can't move
    }

    if (pushed) {
      this.set(r, c, pushed ? 'O' : '@');
    }

    this.set(this.#r, this.#c, '.');
    this.#r += move[0];
    this.#c += move[1];
    this.set(this.#r, this.#c, '@');
  }
}

module.exports = Warehouse1;
