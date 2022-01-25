const { grid, split } = require('../util');
const ocr = require('../ocr');

const DEFAULT_WIDTH = 25;
const DEFAULT_HEIGHT = 6;

/**
 * The most performant way to store the data is to use a single array, and
 * simply compute the layer, row, and column indices from the array index. I
 * implemented an `iterate()` function that would invoke a callback function
 * for each digit in the input data, providing the layer, row, and column
 * indices for each color as it is encountered.
 *
 * For part one, we create an array of color counts for each layer. Each color
 * count is itself an array which stores how many of each color we see. Then we
 * just iterate the data and increment the appropriate counter. Then we just
 * grab the counts for the layer with the fewest `0`s, and add together the
 * counts of `1`s and `2`s that layer.
 *
 * For part two, we create a grid of `undefined` values representing the final,
 * composite image. Once more, we iterate the data, and for each color, we
 * check to see if the corresponding pixel in the composite image has already
 * been painted (i.e., is not `undefined`). If it has, we skip it. Otherwise,
 * if the color is not transparent, we paint it on the composite image: `' '`
 * for black, and `'#'` for white. We can then feed the composite image into
 * the `ocr` module to get the result.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = async (input, part, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) => {
  const data = parse(input, width, height);

  if (part !== undefined) {
    return await PARTS[part - 1](data, true);
  }

  return [
    part1(data),
    await part2(data),
  ];
};

/**
 * Returns an object describing the size of the input data (width, height, and
 * number of layers), and which provides an `iterate()` function. The callback
 * function passed to `iterate()` will be invoked for each color value in the
 * input, and provides the following arguments:
 *
 * - `color`: the color value (0, 1, or 2)
 * - `layer`: the layer index (0-based)
 * - `r`: the row index (0-based)
 * - `c`: the column index (0-based)
 *
 * @param {string} input - the puzzle input
 * @param {number} width - the width of the image
 * @param {number} height - the height of the image
 * @returns {Object} - the parsed data
 */
const parse = (input, width, height) => {
  const data = split(input, { delimiter: '', parseInt: true });
  const layerSize = width * height;
  return {
    layerCount: Math.ceil(data.length / layerSize),
    width,
    height,
    iterate: fn => {
      data.forEach((color, i) => {
        const layer = Math.floor(i / layerSize);
        const r = Math.floor((i % layerSize) / width);
        const c = i % width;
        fn(color, layer, r, c);
      })
    },
  };
};

/**
 * Solves part one of the puzzle.
 *
 * @param {Object} data - the parsed data
 * @returns {number} - the answer for part one
 */
const part1 = data => {
  const counts = new Array(data.layerCount);

  for (let i = 0; i < data.layerCount; i++) {
    counts[i] = [ 0, 0, 0 ];
  }

  data.iterate((color, layer) => {
    counts[layer][color]++;
  });

  const fewestZeroes = counts.reduce((fewest, layerCounts) => {
    const foundFewer = !fewest || layerCounts[0] < fewest[0];
    return foundFewer ? layerCounts: fewest;
  }, null);
  return fewestZeroes[1] * fewestZeroes[2];
};

/**
 * Solves part two of the puzzle.
 *
 * @param {Object} data - the parsed data
 * @returns {string} - the answer for part two
 */
 const part2 = async (data, debug) => {
  const composite = grid(data.width, data.height);
  data.iterate((color, _, r, c) => {
    if (composite[r][c] !== undefined) {
      return;
    }

    if (color !== 2) {
      composite[r][c] = color ? '#' : ' ';
    }
  });

  const glyphs = composite.map(line => line.join('')).join('\n');

  if (debug) {
    return glyphs;
  }

  return await ocr(glyphs);
};

const PARTS = [ part1, part2 ];
