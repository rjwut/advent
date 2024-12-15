const SimpleGrid = require('../simple-grid');

const REPLACEMENTS = [
  [ '.', '..' ],
  [ '#', '##' ],
  [ 'O', '[]' ],
  [ '@', '@.' ],
];
const MOVES = {
  '^': [ -1,  0 ],
  'v': [  1,  0 ],
  '<': [  0, -1 ],
  '>': [  0,  1 ],
};

/**
 * Warehouse implementation for part one.
 */
class Warehouse2 extends SimpleGrid {
  #r;
  #c;
  #moves;

  /**
   * Parse the input and populate the grid.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input, widen = true) {
    const [ gridStr, movesStr ] = input.replaceAll('\r', '')
      .split('\n\n');
    let gridStr2 = gridStr;

    if (widen) { // Widen the grid
      REPLACEMENTS.forEach(([ from, to ]) => {
        gridStr2 = gridStr2.replaceAll(from, to);
      });
    }

    super({ data: gridStr2 });
    const { r, c } = this.coordsOf('@');
    this.#r = r;
    this.#c = c;
    this.#moves = [ ...movesStr.replaceAll('\n', '') ]
      .map(chr => MOVES[chr]);
  }

  /**
   * @returns {number} - the answer for this warehouse
   */
  get gpsSum() {
    return this.findAll(v => v === '[')
      .reduce((sum, { r, c }) => sum + r * 100 + c, 0);
  }

  /**
   * Execute all moves.
   */
  run() {
    for (const move of this.#moves) {
      this.move(move);
    }
  }

  /**
   * Execute a single move.
   *
   * @param {number[]} move - the move to perform
   */
  move(move) {
    let r = this.#r + move[0];
    let c = this.#c + move[1];
    const chr = this.get(r, c);

    if (chr === '#') {
      return; // can't move
    }

    if (chr === '[' || chr === ']') {
      const cratesToMove = this.#tryMoveCrate(r, c, move);

      if (!cratesToMove) {
        return; // can't push crates
      }

      // Move the crates
      [ ...cratesToMove ].map(crate => crate.split(',').map(Number))
      .forEach(crate => {
        this.set(crate[0], crate[1], '.');
        this.set(crate[0], crate[1] + 1, '.');
        this.set(crate[0] + move[0], crate[1] + move[1], '[');
        this.set(crate[0] + move[0], crate[1] + move[1] + 1, ']');
      });
    }

    // Move the robot
    this.set(this.#r, this.#c, '.');
    this.set(r, c, '@');
    this.#r = r;
    this.#c = c;
  }

  /**
   * Determine whether the crate at the given coordinates can be moved in the indicated direction.
   * This method is called recursively for all crates that may be pushed by the movement of this
   * crate.
   *
   * @param {number} r - the crate's row coordinate
   * @param {number} c - either of the crate's column coordinates
   * @param {number[]} move - the direction in which to move the crate
   * @param {Set<string>} cratesToMove - coordinates of all crates that we've determined may be
   * movable so far
   * @returns {Set<string>|null} - a reference to `cratesToMove` if the move is possible; `null`
   * otherwise
   */
  #tryMoveCrate(r, c, move, cratesToMove = new Set()) {
    const chr = this.get(r, c);
    const cLeft = chr === '[' ? c : c - 1;
    const cRight = cLeft + 1;

    if (move[0] === 0) {
      // moving horizontally
      const left = move[1] === -1;
      const cNext = left ? cLeft - 1 : cRight + 1;
      const chrNext = this.get(r, cNext);

      if (chrNext === '#') {
        return null; // crate is blocked by a wall
      }

      if (
        (chrNext === '[' || chrNext === ']') &&
        !this.#tryMoveCrate(r, cNext, move, cratesToMove)
      ) {
        return null; // crate is blocked by another crate that can't move
      }

      cratesToMove.add(`${r},${cLeft}`); // crate can move
      return cratesToMove;
    } else {
      // moving vertically
      const rNext = r + move[0];
      const chrLeftNext = this.get(rNext, cLeft);
      const chrRightNext = this.get(rNext, cRight);

      if (chrLeftNext === '#' || chrRightNext === '#') {
        return null; // crate is blocked by a wall
      }

      if (chrLeftNext === '[') {
        // pushing one box
        if (!this.#tryMoveCrate(rNext, cLeft, move, cratesToMove)) {
          return null; // crate is blocked by another crate that can't move
        }
      } else {
        // possibly pushing two boxes
        if (
          chrLeftNext === ']' &&
          !this.#tryMoveCrate(rNext, cLeft, move, cratesToMove)
        ) {
          return null; // crate is blocked by the left offset crate that can't move
        }

        if (
          chrRightNext === '[' &&
          !this.#tryMoveCrate(rNext, cRight, move, cratesToMove)
        ) {
          return null; // crate is blocked by the right offset crate that can't move
        }
      }
    }

    cratesToMove.add(`${r},${cLeft}`); // crate can move
    return cratesToMove;
  }
}

module.exports = Warehouse2;
