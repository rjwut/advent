const SHAPE_DEFS = [
  [ '0,0', '0,1', '0,2', '0,3' ],
  [ '0,1', '-1,0', '-1,1', '-1,2', '-2,1' ],
  [ '0,0', '0,1', '0,2', '-1,2', '-2,2' ],
  [ '0,0', '-1,0', '-2,0', '-3,0' ],
  [ '0,0', '0,1', '-1,0', '-1,1' ],
];
const CHAMBER_WIDTH = 7;
const START_ROW = -4;
const START_COL = 2;
const TARGET_SHAPE_COUNTS = [ 2022, 1_000_000_000_000 ];
const PATTERN_ROWS = 10;

/**
 * # [Advent of Code 2022 Day 17](https://adventofcode.com/2022/day/17)
 *
 * A single implementation can find the answer to both parts of this puzzle; the only difference is
 * the number of shapes to drop into the chamber. Obviously, we can't directly simulate 1 trillion
 * drops as required by part two, so another solution is needed. Eventually, the drops form a
 * repeating cycle, so we need to identify when the cycle occurs. I do this by producing a
 * "pattern" for each shape drop; when the same pattern is encountered again, we've found the
 * cycle. The pattern is a string that contains the following pieces of data:
 *
 * - The ID of the dropped shape
 * - The current index in the jet cycle
 * - The total vertical distance the shape fell
 * - The column index where the left edge of the piece came to rest
 * - Hashes representing the state of the top 10 rows of the stack
 *
 * The row hashes are computed by treating each cell in the row as a "digit" in a base 6 number,
 * containing the ID of the shape occupying that cell, or `0` if that cell is empty.
 *
 * For each drop, we store the drop index, the resulting height of the stack, and the pattern as
 * described above. We store this information in a `Map`, keyed under the pattern, and also in an
 * array by drop index.
 *
 * Once the cycle is identified, the number of drops in a complete cycle is determined by
 * subtracting the index of the start of the cycle from the index where the cycle repeated. The
 * height of a single cycle is also computed by taking the difference in chamber heights from those
 * two points.
 *
 * The completed series of drops can be divided into three parts:
 *
 * 1. _Pre-cycle:_ The pieces at the bottom of the stack that dropped before the cycle started.
 * 2. _Cycle:_ Pieces that form part of a complete cycle.
 * 3. _Remainder:_ The partial cycle at the top of the stack.
 *
 * The result is computed by adding together the heights of these three sections.
 *
 * The pre-cycle height is easily found; simply get the entry that represents the start of the
 * cycle and get the stack height at that point.
 *
 * To compute the number of times that the cycle repeats, get the total number of drops and
 * subtract the number of drops before the cycle started, then divide that by the number of drops
 * in the cycle, rounding down. We can then multiply the number of repeats by the cycle height to
 * get the height of all the cycle repeats.
 *
 * To compute the height of the remainder, we must first know how many drops occurred after the
 * last complete cycle. This is found by multiplying the number of repeats by the number of drops
 * in a single cycle, then subtracting that and the number of pre-cycle drops from the total number
 * of drops. We then locate the drop that occurs at that point in the cycle, and subtract the
 * pre-cycle height from the height of the stack at that time to get the height of the remainder.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const findHeight = buildHeightFn(input);
  return TARGET_SHAPE_COUNTS.map(findHeight);
};

/**
 * Returns a function that can compute the height of the `Shape` stack in the `Chamber` after any
 * number of drops.
 *
 * @param {string} input - the puzzle input
 * @returns {Function} - the height function
 */
const buildHeightFn = input => {
  const chamber = new Chamber(input);
  const shapes = SHAPE_DEFS.map((def, i) => new Shape(i, def));
  const byPattern = new Map();
  const byIndex = [ null ];
  let i = 0, cycle;

  do {
    const pattern = chamber.dropShape(shapes[i % shapes.length]);
    let entry = byPattern.get(pattern);

    if (entry) {
      cycle = {
        start: entry,
        count: i - entry.index + 1,
        height: chamber.height - entry.height,
      };
      break;
    }

    entry = {
      pattern,
      index: ++i,
      height: chamber.height,
    };
    byPattern.set(pattern, entry);
    byIndex.push(entry);
  } while (true);

  return targetIndex => {
    if (targetIndex < byIndex.length) {
      return byIndex[targetIndex].height;
    }

    let height = cycle.start.height;
    const cycleRepeats = Math.floor((targetIndex - cycle.start.index) / cycle.count);
    height += cycleRepeats * cycle.height;
    const remainingDrops = targetIndex - (cycle.start.index + cycleRepeats * cycle.count);
    const remainderIndex = cycle.start.index + remainingDrops;
    height += byIndex[remainderIndex].height - cycle.start.height;
    return height;
  };
};

/**
 * The chamber in which the shapes fall.
 */
class Chamber {
  #grid;
  #jets;
  #jetIndex;

  /**
   * Initializes the `Chamber` using the puzzle input to configure the jet directions.
   *
   * @param {string} jetSpec - the puzzle input
   */
  constructor(jetSpec) {
    this.#grid = [];
    this.#jets = [ ...jetSpec.trim() ].map(chr => chr === '<' ? -1 : 1);
    this.#jetIndex = 0;
  }

  /**
   * @returns {number} - the height of the stack of `Shape`s in the `Chamber`
   */
  get height() {
    return this.#grid.length;
  }

  /**
   * Drops a `Shape` into the `Chamber`, and returns a string that represents the pattern that can
   * be used to search for the cycle.
   *
   * @param {Shape} shape - the `Shape` to drop
   * @returns {string} - the resulting pattern
   */
  dropShape(shape) {
    const anchor = [ START_ROW, START_COL ];
    const jetIndex = this.#jetIndex;

    do {
      let next = [ anchor[0], anchor[1] + this.#jets[this.#jetIndex] ];
      this.#jetIndex = (this.#jetIndex + 1) % this.#jets.length;

      if (this.#fits(shape, next)) {
        anchor[1] = next[1];
      }

      next = [ anchor[0] + 1, anchor[1] ];

      if (this.#fits(shape, next)) {
        anchor[0]++;
      } else {
        this.#place(shape, anchor);
        break;
      }
    } while(true);

    const [ r, c ] = anchor;
    const fallDistance = r - START_ROW;
    const rowHashes = this.#grid.slice(0, PATTERN_ROWS)
      .map(row => row.hash);
    return `${shape.id},${jetIndex},${fallDistance},${c},${rowHashes.join(',')}`;
  }

  /**
   * Gets the ID of the `Shape` found at the given coordinates.
   *
   * @param {Array<number>} param0 - the coordinates
   * @returns {number} - the `Shape` ID, or `0` if no `Shape` is there.
   */
  #get([ r, c ]) {
    return r < 0 ? 0 : this.#grid[r].get(c);
  }

  /**
   * Adds the given number of empty `Row`s to the top of the `Chamber`.
   *
   * @param {number} count - the number of `Row`s to add
   */
  #addRows(count) {
    for (let i = 0; i < count; i++) {
      const row = new Row();
      this.#grid.unshift(row);
    }
  }

  /**
   * Determines whether a `Shape` can be placed at a particular location.
   *
   * @param {Shape} shape - the `Shape` to test
   * @param {Array<number>} anchor - the coordinates of the `Shape`'s lower-left corner
   * @returns {boolean} - whether the shape can be placed there
   */
  #fits(shape, anchor) {
    const [ r, c ] = anchor;
    return r < this.#grid.length && c >= 0 && c + shape.width <= CHAMBER_WIDTH &&
      shape.toAbsoluteCoords(anchor).every(coords => this.#get(coords) === 0);
  }

  /**
   * Inserts the `Shape` at the indicated location. Assumes that `#fits()` returns `true` for the
   * same arguments.
   *
   * @param {Shape} shape - the `Shape` to place
   * @param {Array<number>} anchor - the coordinates of the `Shape`'s lower-left corner
   */
  #place(shape, anchor) {
    const rowsToAdd = Math.max(shape.height - anchor[0] - 1, 0);
    this.#addRows(rowsToAdd);
    anchor[0] += rowsToAdd;
    shape.toAbsoluteCoords(anchor).forEach(([ r, c ]) => {
      this.#grid[r].set(c, shape.id);
    });
  }

  /**
   * Renders the `Chamber` to a string.
   *
   * @returns {string} - the string representation of the `Chamber`
   */
  toString() {
    return this.#grid.map(row => row.toString()).join('\n');
  }
}

/**
 * Represents a single row in the `Chamber`.
 */
class Row {
  #cells;
  #hash;

  /**
   * Creates a new empty `Row`.
   */
  constructor() {
    this.#cells = new Array(CHAMBER_WIDTH);
    this.#cells.fill(0);
    this.#hash = 0;
  }

  /**
   * Gets the ID of the `Shape` occupying the named cell in this `Row`, or `0` if no `Shape` is
   * located there.
   *
   * @param {number} c - the column number
   * @returns {number} - the `Shape` ID, or `0` if no `Shape` is there
   */
  get(c) {
    return this.#cells[c];
  }

  /**
   * Sets the ID of the `Shape` occupying the named cell in this `Row`.
   *
   * @param {number} c - the column number
   * @param {number} - the `Shape` ID
   */
  set(c, shapeId) {
    this.#cells[c] = shapeId;
    this.#hash += shapeId * (6 ** c);
  }

  /**
   * @returns {number} - a value representing the configuration of this `Row`
   */
  get hash() {
    return this.#hash;
  }

  /**
   * A visual representation of this `Row`.
   *
   * @returns {string} - the `Row` rendered as a string
   */
  toString() {
    return this.#cells.map(val => val === 0 ? '.' : val.toString()).join('');
  }
}

/**
 * Represents a single "Tetris" shape.
 */
class Shape {
  #id;
  #coords;
  #width;
  #height;

  /**
   * Creates a new `Shape`. There are five different `Shape`s in total, indexed `0` to `4`. Each
   * `Shape` is described by an array referred to as the shape definition. Each element in the
   * definition array is a string containing the coordinates of one of the shape tiles, relative
   * to the lower-left corner of the shape.
   *
   * @param {number} index - the shape index
   * @param {Array<string>} def - the shape definition
   */
  constructor(index, def) {
    this.#id = index + 1;
    this.#coords = def.map(coords => coords.split(',').map(Number));
    let minRow = Infinity;
    let maxCol = -Infinity;
    this.#coords.forEach(coords => {
      minRow = Math.min(minRow, coords[0]);
      maxCol = Math.max(maxCol, coords[1]);
    });
    this.#height = -minRow + 1;
    this.#width = maxCol + 1;
  }

  /**
   * @returns {number} - the `Shape` ID (the index plus 1)
   */
  get id() {
    return this.#id;
  }

  /**
   * @returns {number} - the height of the `Shape` in tiles
   */
  get height() {
    return this.#height;
  }

  /**
   * @returns {number} - the width of the `Shape` in tiles
   */
  get width() {
    return this.#width;
  }

  /**
   * Computes the absolute coordinates of this `Shape`'s tiles.
   *
   * @param {Array<number>} anchor - the absolute position of the lower-left corner of the `Shape`
   * @returns {Array<number>} - the absolute coordinates of the tiles
   */
  toAbsoluteCoords(anchor) {
    return this.#coords.map(coords => coords.map((coord, i) => coord + anchor[i]));
  }
}
