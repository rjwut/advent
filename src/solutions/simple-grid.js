const INTERNAL = Symbol('INTERNAL');

/**
 * This class has better performance than `InfiniteGrid`, but is only suited
 * for two-dimensional grids of fixed size. Choose `InfiniteGrid` when its
 * specific advantages are more suited for the use case.
 */
class SimpleGrid {
  #grid
  #rows
  #cols

  /**
   * Creates a new `SimpleGrid` instance.
   *
   * Options (all are optional individually, either `data` or `rows` and `cols`
   * must be provided):
   *
   * - `cols` (number): The number of columns in the grid.
   * - `data` (string): Data with which to populate the grid. Carriage returns
   *   will be stripped first. If it contains one or more instances of the
   *   separator character, the data will be split into rows on those
   *   characters, and the `rows` and `cols` options will be ignored.
   *   Otherwise, the `rows` or `cols` option (or both) must be specified so
   *   that the size of the grid can be computed.
   * - `fill` (any, default = `undefined`): The value to fill the empty grid
   *   with. Ignored if `data` is specified.
   * - `separator` (string, default = `'\n`): If this character is found in the
   *   string, it will be used as the row separator. If the `data` string ends
   *   with this character, it will be stripped off. Ignored if `data` is not
   *   specified.
   * - `rows` (number): The number of rows in the grid.
   *
   * `SimpleGrid` methods that create new `SimpleGrid` instances can use an
   * alternate form of the constructor options (all required):
   *
   * - `[INTERNAL]` (any value): Flag indicating that this options format
   *   should be used.
   * - `grid` (`Array`): The grid data, as a one-dimenstional array.
   * - `rows` (number): The number of rows in the grid.
   * - `cols` (number): The number of columns in the grid.
   *
   * @param {*} options - the options object
   */
  constructor(options) {
    if (INTERNAL in options) {
      this.#populateInternal(options);
      return;
    }

    options = {
      separator: '\n',
      ...options,
    }

    if ('data' in options) {
      this.#populateGrid(options);
    } else {
      this.#buildEmptyGrid(options);
    }
  }

  get rows() {
    return this.#rows;
  }

  get cols() {
    return this.#cols;
  }

  /**
   * Returns the value stored in the grid at the given location.
   *
   * @param {number} r - the row
   * @param {number} c - the column
   * @returns {*} - the value stored there
   */
  get(r, c) {
    return this.#grid[this.#getIndex(r, c)];
  }

  /**
   * Sets the value at the given location.
   *
   * @param {number} r - the row
   * @param {number} c - the column
   * @param {*} value - the value to store
   */
  set(r, c, value) {
    this.#grid[this.#getIndex(r, c)] = value;
  }

  /**
   * Populates all elements in the given rectangular region with the indicated
   * value.
   *
   * @param {number} r0 - the row of the region's upper-left corner
   * @param {number} c0 - the column of the region's upper-left corner
   * @param {number} w - the region width
   * @param {number} h - the region height
   * @param {*} value - the value to populate
   */
  fill(r0, c0, w, h, value) {
    const r1 = r0 + h;
    const c1 = c0 + w;

    for (let r = r0; r < r1; r++) {
      const i0 = this.#getIndex(r, c0);
      const i1 = this.#getIndex(r, c1);
      this.#grid.fill(value, i0, i1);
    }
  }

  /**
   * Iterates all the values in the grid, in row-major order.
   *
   * @returns {Iterator} - the `Iterator` instance
   */
  *[Symbol.iterator]() {
    yield *this.#grid[Symbol.iterator]();
  }

  /**
   * Iterates all values in the grid, in row-major order, invoking `callback`
   * for each, passing in the value, row, column, and index.
   *
   * @param {Function} callback - the callback function
   */
  forEach(callback) {
    for (let i = 0; i < this.#grid.length; i++) {
      const r = Math.floor(i / this.#cols);
      const c = i % this.#cols;
      callback(this.#grid[i], r, c, i);
    }
  }

  /**
   * Iterates all values in a rectangular region of the grid, in row-major
   * order, invoking `callback` for each, passing in the value, row, column,
   * and index.
   *
   * @param {number} r0 - the row of the top-left corner
   * @param {number} c0 - the column of the top-left corner
   * @param {number} rows - the number of rows to iterate
   * @param {number} cols - the number of columns to iterate
   * @param {Function} callback - the callback function
   */
  forEachInRegion(r0, c0, rows, cols, callback) {
    const r1 = r0 + rows;
    const c1 = c0 + cols;

    for (let r = r0; r < r1; r++) {
      for (let c = c0; c < c1; c++) {
        const index = this.#getIndex(r, c);
        callback(this.#grid[index], r, c, index);
      }
    }
  }

  /**
   * Iterates all values in a rectangular region of the grid, where all values
   * are at least `size` cells away from the indicated location. The selected
   * region is iterated in row-major order, invoking `callback` for each,
   * passing in the value, row, column, and index. Note that the specified
   * location can be optionally included or omitted.
   *
   * @param {number} r - the location row
   * @param {number} c - the location column
   * @param {Function} callback - the callback function
   * @param {number} [size=1] - the maximum distance from the location to
   * include
   * @param {boolean=false} includeSelf - whether to include the specified
   * location in the iteration
   */
  forEachNear(r, c, callback, size = 1, includeSelf = false) {
    const r0 = Math.max(r - size, 0);
    const r1 = Math.min(r + size, this.#rows - 1);
    const c0 = Math.max(c - size, 0);
    const c1 = Math.min(c + size, this.#cols - 1);

    for (let nr = r0; nr <= r1; nr++) {
      for (let nc = c0; nc <= c1; nc++) {
        if (r === nr && c === nc && !includeSelf) {
          continue;
        }

        const index = this.#getIndex(nr, nc);
        callback(this.#grid[index], nr, nc, index);
      }
    }
  }

  /**
   * Returns the number of elements which match the given predicate.
   *
   * @param {Function} predicate - the predicate to use to test elements
   * @returns {number} - the number of elements which match the predicate
   */
  count(predicate) {
    return this.#grid.filter(predicate).length;
  }

  /**
   * Returns a copy of this `SimpleGrid` instance.
   *
   * @returns {SimpleGrid} - the clone
   */
  clone() {
    return new SimpleGrid({
      [INTERNAL]: true,
      grid: [ ...this.#grid ],
      rows: this.#rows,
      cols: this.#cols,
    });
  }

  /**
   * Returns a copy of a rectangular region of this `SimpleGrid` instance as a
   * new `SimpleGrid` instance.
   *
   * @param {number} r0 - the row of the top-left corner
   * @param {number} c0 - the column of the top-left corner
   * @param {number} rows - the number of rows to iterate
   * @param {number} cols - the number of columns to iterate
   * @returns {SimpleGrid} - the copy
   */
  slice(r0, c0, rows, cols) {
    const r1 = r0 + rows;
    const c1 = c0 + cols;
    const grid = new Array(rows * cols);
    let i = 0;

    for (let r = r0; r < r1; r++) {
      for (let c = c0; c < c1; c++) {
        grid[i++] = this.#grid[this.#getIndex(r, c)];
      }
    }

    return new SimpleGrid({ [INTERNAL]: true, grid, rows, cols });
  }

  /**
   * Copies the cells from the given `SimpleGrid` into this `SimpleGrid`
   * instance.
   *
   * @param {SimpleGrid} pasted - the grid to copy
   * @param {number} r - the row of the top-left corner of the destination
   * @param {number} c - the column of the top-left corner of the destination 
   */
  paste(pasted, r, c) {
    pasted.forEach((value, rPaste, cPaste) => {
      this.set(r + rPaste, c + cPaste, value);
    });
  }

  /**
   * Returns a new `SimpleGrid` instance with the same dimensions as this one,
   * with each cell populated by `callback`'s return value, passing in the
   * value, row, column, and index of the corresponding cell from this
   * `SimpleGrid`.
   *
   * @param {Function} callback - the callback function
   * @returns {SimpleGrid} - the new grid
   */
  map(callback) {
    const grid = new Array(this.#rows * this.#cols);
    this.forEach((value, r, c, i) => {
      grid[i] = callback(value, r, c, i);
    });
    return new SimpleGrid({ [INTERNAL]: true, grid, rows: this.#rows, cols: this.#cols });
  }

  /**
   * Computes a single value from the values in this `SimpleGrid`. The cells
   * are iterated in row-major order, invoking `callback` for each, passing in
   * the following arguments:
   *
   * 1. The current accumulator value
   * 2. The value of the current element
   * 3. The current row index
   * 4. The current column index
   * 5. The current element index
   *
   * The return value of `callback` is the accumulator value which is passed
   * into the next invocation. The `initialValue` argument is the accumulator
   * value for the first invocation of `callback`. When all cells are iterated,
   * the accumulator value is returned.
   *
   * @param {Function} callback - the callback function
   * @param {*} initialValue - the first accumulator value
   * @returns {*} - the final accumulator value
   */
  reduce(callback, initialValue) {
    let acc = initialValue;
    this.forEach((value, r, c, i) => {
      acc = callback(acc, value, r, c, i);
    });
    return acc;
  }

  /**
   * Returns a new `SimpleGrid` which represents a vertical flip of this
   * `SimpleGrid`.
   *
   * @returns {SimpleGrid} - the new flipped grid
   */
   flipRows() {
    const newGrid = new SimpleGrid({ rows: this.#rows, cols: this.#cols });
    this.forEach((value, r, c) => {
      newGrid.set(this.#rows - r - 1, c, value);
    });
    return newGrid;
  }

  /**
   * Returns a new `SimpleGrid` which represents a horizontal flip of this
   * `SimpleGrid`.
   *
   * @returns {SimpleGrid} - the new flipped grid
   */
  flipCols() {
    const newGrid = new SimpleGrid({ rows: this.#rows, cols: this.#cols });
    this.forEach((value, r, c) => {
      newGrid.set(r, this.#cols - c - 1, value);
    });
    return newGrid;
  }

  /**
   * Returns a new `SimpleGrid` instance that represents a rotation of this
   * `SimpleGrid` by the given number of 90-degree clockwise turns (or, if
   * `turns` is negative, counterclockwise turns).
   *
   * @param {number} turns - the number of 90-degree turns
   * @returns {SimpleGrid} - the rotated grid
   */
  rotate(turns) {
    turns = (Math.sign(turns) * (Math.abs(turns) % 4) + 4) % 4;
    const r0 = turns === 0 || turns === 3 ? 0 : this.#rows - 1;
    const r1 = r0 === 0 ? this.#rows : -1;
    const dr = r0 === 0 ? 1 : -1;
    const c0 = turns === 0 || turns === 1 ? 0 : this.#cols - 1;
    const c1 = c0 === 0 ? this.#cols : -1;
    const dc = c0 === 0 ? 1 : -1;
    const grid = new Array(this.#grid.length);
    let rows, cols, i = 0;

    if (turns === 0 || turns === 2) {
      // Iterate rows first, then columns
      rows = this.#rows;
      cols = this.#cols;

      for (let r = r0; r !== r1; r += dr) {
        for (let c = c0; c !== c1; c += dc) {
          grid[i++] = this.#grid[this.#getIndex(r, c)];
        }
      }
    } else {
      // Iterate columns first, then rows
      rows = this.#cols;
      cols = this.#rows;

      for (let c = c0; c !== c1; c += dc) {
        for (let r = r0; r !== r1; r += dr) {
          grid[i++] = this.#grid[this.#getIndex(r, c)];
        }
      }
    }

    return new SimpleGrid({ [INTERNAL]: true, grid, rows, cols });
  }

  /**
   * Shifts the elements in the indicated row of the grid to the right by the
   * given number of positions (or left if `amount` is negative). Elements that
   * are pushed off the edge of the grid "wrap around" to the other side.
   *
   * @param {number} r - the row to shift
   * @param {number} amount - the number of positions to shift the elements
   */
  shiftRow(r, amount) {
    if (amount === 0) {
      return;
    }

    amount = Math.sign(amount) * (Math.abs(amount) % this.#cols);
    const rowStart = this.#getIndex(r, 0);
    const rowEnd = rowStart + this.#cols;

    if (amount > 0) {
      const shiftedOff = this.#grid.splice(rowEnd - amount, amount);
      this.#grid.splice(rowStart, 0, ...shiftedOff);
    } else {
      const shiftedOff = this.#grid.splice(rowStart, -amount);
      this.#grid.splice(rowEnd + amount, 0, ...shiftedOff);
    }
  }

  /**
   * Shifts the elements in the indicated column of the grid down by the given
   * number of positions (or up if `amount` is negative). Elements that are
   * pushed off the edge of the grid "wrap around" to the other side.
   *
   * @param {number} c - the column to shift
   * @param {number} amount - the number of positions to shift the elements
   */
  shiftColumn(c, amount) {
    if (amount === 0) {
      return;
    }

    amount = Math.sign(amount) * (Math.abs(amount) % this.#rows);
    const column = new Array(this.#rows);

    for (let i = 0; i < this.#rows; i++) {
      column[i] = this.#grid[this.#getIndex(i, c)];
    }

    if (amount > 0) {
      const shiftedOff = column.splice(column.length - amount, amount);
      column.splice(0, 0, ...shiftedOff);
    } else {
      const shiftedOff = column.splice(0, -amount);
      column.splice(column.length, 0, ...shiftedOff);
    }

    for (let i = 0; i < this.#rows; i++) {
      this.#grid[this.#getIndex(i, c)] = column[i];
    }
  }

  /**
   * Returns a string representation of this `SimpleGrid`.
   *
   * @returns {string} - the string render
   */
  toString() {
    const rows = new Array(this.#rows);

    for (let r = 0; r < this.#rows; r++) {
      rows[r] = this.#grid.slice(r * this.#cols, (r + 1) * this.#cols).join('');
    }

    return rows.join('\n');
  }

  /**
   * Used by `SimpleGrid` methods to directly populate the private variables of
   * the a new `SimpleGrid` via the constructor.
   *
   * @param {Object} options - the variables
   */
  #populateInternal(options) {
    this.#grid = options.grid;
    this.#rows = options.rows;
    this.#cols = options.cols;
  }

  /**
   * Invoked by the constructor when the `data` option is specified.
   * @param {Object} options - the options object
   */
  #populateGrid(options) {
    // Clean up data first
    options.data = options.data.replace(/\r/g, '');

    if (options.data.endsWith(options.separator)) {
      options.data = options.data.slice(0, -1);
    }

    if (options.data.includes(options.separator)) {
      // Data is already split into rows
      const rows = options.data.split(options.separator);
      this.#rows = rows.length;

      for (let row of rows) {
        if (this.#cols === undefined) {
          this.#cols = row.length;
        } else {
          if (row.length !== this.#cols) {
            throw new Error('Rows are uneven');
          }
        }
      }

      this.#grid = [ ...options.data.replace(/\n/g, '') ];
    } else {
      // We have to split the data
      if (options.rows) {
        this.#rows = options.rows;
        this.#cols = options.data.length / options.rows;

        if (!Number.isInteger(this.#cols)) {
          throw new Error('Data is not rectangular');
        }
      } else if (options.cols) {
        this.#cols = options.cols;
        this.#rows = options.data.length / options.cols;

        if (!Number.isInteger(this.#rows)) {
          throw new Error('Data is not rectangular');
        }
      } else {
        throw new Error('Must specify either rows or cols option');
      }
    }
  }

  /**
   * Invoked by the constructor when the `data` option is not specified.
   *
   * @param {Object} options - the options object
   */
  #buildEmptyGrid(options) {
    this.#rows = options.rows;
    this.#cols = options.cols;
    this.#grid = new Array(this.#rows * this.#cols).fill(options.fill);
  }

  /**
   * Returns the index of `#grid` corresponding to the given location.
   * @param {number} r - the row
   * @param {number} c - the column
   * @returns {number} - the index
   */
  #getIndex(r, c) {
    return r * this.#cols + c;
  }
}

module.exports = SimpleGrid;
