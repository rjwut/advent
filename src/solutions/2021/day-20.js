const { split } = require('../util');
const InfiniteGrid = require('../infinite-grid');

const PART_1_INDEX = 1;
const PART_2_INDEX = 49;

/**
 * # [Advent of Code 2021 Day 20](https://adventofcode.com/2021/day/20)
 *
 * The big "gotcha" with this puzzle is that there's an important difference
 * between the example algorithm and the actual one: The character at index `0`
 * is `#`, while the character at index `511` is '.'. This means that with each
 * enhance operation, the infinite space around the image ocillates between lit
 * and unlit. Fortunately, there is only an even number of enhance steps, so
 * the final image will always be surrounded by unlit pixels, but it means that
 * we have to consider a two pixel margin around the image with each
 * enhancement.
 *
 * I'm using the `InfiniteGrid` class I've written previously to represent the
 * pixels in the image, which is useful because it can expand in all directions
 * without the need for coordinate translation or array reallocation. I also
 * keep track of the current state of the pixels outside the image bounds (lit
 * or unlit), so that I can return the appropriate value if the status of an
 * out-of-bounds pixel is queried.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const image = new Image(input);
  const answers = [];

  for (let i = 0; i <= PART_2_INDEX; i++) {
    image.enhance();

    if (i === PART_1_INDEX) {
      answers.push(image.countLit());
    }
  }

  answers.push(image.countLit());
  return answers;
};

/**
 * Class representing the image and how to enhance it. During an enhancement
 * operation, pixels are read from `#currentGrid` and written to `#nextGrid`.
 * When an enhancement is complete, `#nextGrid` is swapped into `#currentGrid`
 * and `#nextGrid` is set to a new blank grid.
 */
class Image {
  #algorithm;
  #currentGrid;
  #nextGrid;
  #surroundedBy = 0;

  /**
   * Creates a new `Image` from the puzzle input.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    const groups = split(input, { group: true });
    this.#algorithm = groups[0][0];
    this.#currentGrid = groups[1].reduce((grid, line, r) => {
      [ ...line ].forEach((chr, c) => {
        grid.put([ r, c ], chr === '#' ? 1 : 0);
      });
      return grid;
    }, new InfiniteGrid());
    this.#nextGrid = new InfiniteGrid();
  }

  /**
   * Performs a single enhancement step.
   */
  enhance() {
    this.#currentGrid.forEach(coords => {
      let index = 0;
      this.#currentGrid.forEachNear(coords, (_nearCoords, value) => {
        index = (index << 1) | (value ?? this.#surroundedBy);
      });
      this.#nextGrid.put(coords, this.#pixelAtAlgorithmIndex(index));
    }, { margin: 1 });
    this.#currentGrid = this.#nextGrid;
    this.#nextGrid = new InfiniteGrid();
    const index = this.#surroundedBy ? 511 : 0;
    this.#surroundedBy = this.#pixelAtAlgorithmIndex(index);
  }

  /**
   * Counts how many pixels are lit.
   *
   * @returns {number} - the number of lit pixels
   */
  countLit() {
    let count = 0;
    this.#currentGrid.forEachSparse((_coords, value) => {
      count += value;
    });
    return count;
  }

  /**
   * Returns string representation of the `Image`.
   *
   * @returns {string} - the `Image` as a string
   */
  toString() {
    const lines = [];
    let curLine = [];
    let lastRow = null;
    this.#currentGrid.forEach((coords, value) => {
      if (coords[0] !== lastRow) {
        if (lastRow !== null) {
          lines.push(curLine.join(''));
          curLine = [];
        }

        lastRow = coords[0];
      }
      curLine.push(value ? '#' : '.');
    });
    return lines.join('\n');
  }

  /**
   * Consults the algorithm at the given index.
   *
   * @param {number} index - the index (from `0` to `511`, inclusive)
   * @returns {number} - the corresponding pixel value
   */
  #pixelAtAlgorithmIndex(index) {
    return this.#algorithm.charAt(index) === '#' ? 1 : 0;
  }
}
