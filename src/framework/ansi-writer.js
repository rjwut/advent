const CSI = `\u001b[`;

/**
 * A class for writing ANSI escape codes to a stream. There are, of course,
 * other libraries that do this, but since this is a personal project for fun,
 * I wanted to write it myself.
 *
 * > "Telling a programmer there's already a library to do X is like telling a
 * > songwriter there's already a song about love."
 * >
 * > Pete Cordell
 */
class AnsiWriter {
  #writeable;

  /**
   * Creates a new `AnsiWriter` instance that writes to the given `Writeable`.
   *
   * @param {stream.Writeable} [writeable=process.stdout] - the stream to write
   */
  constructor(writeable = process.stdout) {
    this.#writeable = writeable;
  }

  /**
   * Changes the current text style. You may specify any number of style
   * constants, which include `BOLD`, `UNDERLINE`, `REVERSE`, `FG_*`, and
   * `BG_*`.
   *
   * @param {...*} styles - constants for the styles to apply
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  style(...styles) {
    this.#writeable.write(CSI + styles.join(';') + 'm');
    return this;
  }

  /**
   * Resets to the default text style.
   *
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  resetStyle() {
    this.#writeable.write(CSI + '0m');
    return this;
  }

  /**
   * Moves the cursor by the given direction and distance.
   *
   * @param {Symbol} direction - one of `UP`, `DOWN`, `LEFT`, or `RIGHT`
   * @param {number} [distance=1] - the number of units to move the cursor
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  moveBy(direction, distance = 1) {
    this.#writeable.write(CSI + distance + MoveBy[direction]);
    return this;
  }

  /**
   * Moves the cursor up or down by the given number of lines, and to the start
   * of that line.
   *
   * @param {Symbol} direction - one of `UP` or `DOWN`
   * @param {number} [distance=1] - the number of lines to move
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  moveByLines(direction, distance = 1) {
    if (distance === 1) {
      distance = '';
    }

    this.#writeable.write(CSI + distance + MoveByLines[direction]);
    return this;
  }

  /**
   * Moves the cursor to the given column (one-based) on the current line.
   *
   * @param {number} [column=1] - the column to move to
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  moveToColumn(column = 1) {
    if (column === 1) {
      column = '';
    }

    this.#writeable.write(CSI + column + 'G');
    return this;
  }

  /**
   * Moves the cursor to the given absolute position.
   *
   * @param {number} [row=1] - the row to move to
   * @param {number} [column=1] - the column to move to
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  moveTo(row = 1, column = 1) {
    if (row === 1) {
      row = '';
    }

    if (column === 1) {
      column = '';
    }

    this.#writeable.write(CSI + row + ';' + column + 'H');
    return this;
  }

  /**
   * Erases part or all of the screen. Valid range constants are `TO_START`,
   * `TO_END`, `ALL`, and `ALL_INCLUDING_SCROLLBACK`.
   *
   * @param {number} range - the range to erase
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  eraseScreen(range) {
    this.#writeable.write(CSI + range + 'J');
    return this;
  }

  /**
   * Erases part or all of the current. Valid range constants are `TO_START`,
   * `TO_END`, and `ALL`.
   *
   * @param {number} range - the range to erase
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  eraseLine(range) {
    this.#writeable.write(CSI + range + 'K');
    return this;
  }

  /**
   * Scrolls the screen by the indicated distance and number of lines.
   *
   * @param {Symbol} direction - one of `UP` or `DOWN`
   * @param {number} distance - the number of lines to scroll
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  scroll(direction, distance) {
    this.#writeable.write(CSI + distance + Scroll[direction]);
    return this;
  }

  /**
   * Writes the given value to the `Writeable` stream.
   *
   * @param {*} output - the content to write
   * @returns {AnsiWriter} - this `AnsiWriter` instance
   */
  write(output) {
    this.#writeable.write(String(output));
    return this;
  }
}

// cursor movement
AnsiWriter.UP    = Symbol('up');
AnsiWriter.DOWN  = Symbol('down');
AnsiWriter.RIGHT = Symbol('right');
AnsiWriter.LEFT  = Symbol('left');

// text styles
AnsiWriter.BOLD       = '1';
AnsiWriter.UNDERLINE  = '4';
AnsiWriter.REVERSE    = '7';
AnsiWriter.FG_BLACK   = '30';
AnsiWriter.FG_RED     = '31';
AnsiWriter.FG_GREEN   = '32';
AnsiWriter.FG_YELLOW  = '33';
AnsiWriter.FG_BLUE    = '34';
AnsiWriter.FG_MAGENTA = '35';
AnsiWriter.FG_CYAN    = '36';
AnsiWriter.FG_WHITE   = '37';
AnsiWriter.BG_BLACK   = '40';
AnsiWriter.BG_RED     = '41';
AnsiWriter.BG_GREEN   = '42';
AnsiWriter.BG_YELLOW  = '43';
AnsiWriter.BG_BLUE    = '44';
AnsiWriter.BG_MAGENTA = '45';
AnsiWriter.BG_CYAN    = '46';
AnsiWriter.BG_WHITE   = '47';

// erasure ranges
AnsiWriter.TO_END                   = 0;
AnsiWriter.TO_START                 = 1;
AnsiWriter.ALL                      = 2;
AnsiWriter.ALL_INCLUDING_SCROLLBACK = 3;

const MoveBy = {
  [AnsiWriter.UP]:    'A',
  [AnsiWriter.DOWN]:  'B',
  [AnsiWriter.RIGHT]: 'C',
  [AnsiWriter.LEFT]:  'D',
};

const MoveByLines = {
  [AnsiWriter.DOWN]: 'E',
  [AnsiWriter.UP]:   'F',
};

const Scroll = {
  [AnsiWriter.UP]:   'S',
  [AnsiWriter.DOWN]: 'T',
};

module.exports = Object.freeze(AnsiWriter);
