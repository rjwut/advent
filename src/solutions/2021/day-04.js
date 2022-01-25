const { split } = require('../util');

/**
 * # [Advent of Code 2021 Day 4](https://adventofcode.com/2021/day/4)
 *
 * A bingo board is implemented as an object with `mark()` method. After the
 * number is marked (if it's present on the board), `mark()` checks to see if
 * the board has won; if so, it computes the score and sets it onto its `score`
 * property.
 *
 * Part one asks you for the score of the first board to win, while part two
 * asks for the score of the last board to win. Both parts can be solved at
 * once by simply putting each board into an array as it wins, then getting the
 * scores for the first and last boards in the array.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { numbers, boards } = parse(input);
  const winOrder = play(numbers, boards);
  return [
    winOrder[0].score,
    winOrder[winOrder.length - 1].score,
  ];
};

/**
 * Produces an object with two properties:
 *
 * - `numbers`: the list of numbers to be called
 * - `boards`: the list of bingo boards
 *
 * Each board is an object with `mark()` method, and which gets a `score`
 * property when it wins.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsed puzzle data
 */
const parse = input => {
  const groups = split(input, { group: true });
  const numbers = split(groups[0][0], {
    delimiter: ',',
    parseInt: true,
  });
  const boards = groups.slice(1).map(buildBoard)
  return { numbers, boards }
};

/**
 * Plays bingo with the given numbers and boards until all the boards have won.
 * It then returns an array containing all the boards in the order they won,
 * and each board will have a `score` property.
 *
 * @param {Array} numbers - the numbers to be called
 * @param {Array} boards - the bingo boards
 * @returns {Array} - the boards in win order
 */
const play = (numbers, boards) => {
  const won = [];

  for (let number of numbers) {
    for (let i = 0; i < boards.length; i++) {
      const board = boards[i];

      if (!board.score) { // don't mark a board that has already won
        board.mark(number);

        if (!board.score) {
          continue; // board hasn't won yet
        }

        // Board has won; add it to the `won` array
        won.push(board);

        if (won.length === boards.length) {
          return won; // all boards have won; we're done
        }
      }
    }
  }
};

/**
 * Returns an object representing the board described by the given input lines.
 * Internally, each cell in the grid of numbers is represented by an object
 * with four properties:
 *
 * - `r`: the row number
 * - `c`: the column number
 * - `number`: the number in the cell
 * - `marked`: whether the number has been marked
 *
 * @param {Array} lines - the input lines describing this board
 * @returns {Object} - the board object
 */
const buildBoard = lines => {
  const grid = lines.map((line, r) => line.split(/\s+/).map((value, c) => ({
    r,
    c,
    number: parseInt(value, 10),
    marked: false,
  })));

  /**
   * Returns the cell containing the given number, or `undefined` if no such
   * cell exists on this board.
   *
   * @param {number} number - the number to find
   * @returns {object|undefined} - the cell containing the number, if found
   */
  const find = number => {
    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];

      for (let c = 0; c < row.length; c++) {
        const cell = row[c];

        if (cell.number === number) {
          return cell;
        }
      }
    }
  };

  /**
   * Returns whether the given cell is part of a fully-marked row or column.
   *
   * @param {Object} markedCell - the cell that was just marked
   * @returns {boolean} - whether the cell is part of a fully-marked row or
   * column
   */
  const isWon = markedCell => isRowMarked(markedCell) || isColumnMarked(markedCell);

  /**
   * Returns whether the given cell is part of a fully-marked row.
   *
   * @param {Object} markedCell - the cell that was just marked
   * @returns {boolean} - whether the cell is part of a fully-marked row
   */
  const isRowMarked = markedCell => {
    const row = grid[markedCell.r];

    for (let c = 0; c < row.length; c++) {
      if (!row[c].marked) {
        return false;
      }
    }

    return true;
  };

  /**
   * Returns whether the given cell is part of a fully-marked column.
   *
   * @param {Object} markedCell - the cell that was just marked
   * @returns {boolean} - whether the cell is part of a fully-marked column
   */
   const isColumnMarked = markedCell => {
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r][markedCell.c].marked) {
        return false;
      }
    }

    return true;
  };

  /**
   * Computes the score for this board.
   *
   * @param {number} lastNumber - the last number that was marked
   * @returns {number} - the score for this board
   */
  const computeScore = lastNumber => {
    let score = 0;

    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];

      for (let c = 0; c < row.length; c++) {
        const cell = row[c];

        if (!cell.marked) {
          score += cell.number;
        }
      }
    }

    return score * lastNumber;
  }

  const board = {
    /**
     * Marks the cell with the given number on this board, if present. If this
     * results in a win, the board's `score` property will be set to its score.
     *
     * @param {number} number - the number to mark
     */
    mark: number => {
      const cell = find(number);

      if (cell) {
        cell.marked = true;

        if (isWon(cell)) {
          board.score = computeScore(number);
        }
      }
    },
  };
  return board;
};
