const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const fonts = new Map(); // font cache

/**
 * Performs translation of ASCII font "glyphs" used in some AoC puzzles, sort
 * of like optical character recognition (OCR). These glyphs are represented by
 * a multiline string referred to as a glyph block. For example, feeding the
 * following glyph block into this function will return `'AOC'`:
 *
 * ```txt
 *  ##   ##   ##
 * #  # #  # #  #
 * #  # #  # #
 * #### #  # #
 * #  # #  # #  #
 * #  #  ##   ##
 * ```
 *
 * Rules:
 *
 * - The glyph block is a rectangular grid of ASCII characters, where each
 *   character represents a pixel. A single character represents a "lit" pixel
 *   (`'#'` by default). All other characters are considered "unlit" pixels.
 * - Glyphs are laid out horizontally in the glyph block left to right.
 * - All glyphs in a block are the same height, but not neccesarily the same
 *   width.
 * - A glyph consists of a sequence of columns, where each column contains at
 *   least one lit pixel.
 * - A single glyph block will have exactly one font.
 * - Each font has a unique height, therefore the height of the glyph block can
 *   be used to identify which font to use.
 * - A font's glyphs can have different widths. A glyph is terminated either by
 *   a blank column or when the number of columns in the glyph reaches the
 *   maximum number of columns of any glyph in the font.
 * - A font matches a unique glyph pattern to a unique translated character.
 * - If a glyph pattern is not recognized, it translates to `?`. Any
 *   translation containing a `?` character is not considered accurate.
 * - Extra horizontal space before the first glyph, after the last glyph, or
 *   between glyphs is ignored.
 *
 * Below is a list of the fonts that have been used in AoC so far, and the days
 * in which they were used:
 *
 * - `font6`: Glyphs are six lines high, most glyphs are four columns wide
 *   - 2016: day 8
 *   - 2019: days 8 and 11
 *   - 2021: day 13
 *   - 2022: day 10
 * - `font8`: Glyphs are eight lines high, glyphs are at most five columns wide
 *   - 2018: day 10 (example data only)
 * - `font10`: Glyphs are ten lines high and six columns wide
 *   - 2018: day 10
 *
 * This module will auto-detect the correct font to use based on the height of
 * the glyph block, then parse the glyphs and compare them to the known glyphs
 * in the font to translate them.
 *
 * Glyph patterns sourced from
 * [mstksg/advent-of-code-ocr](https://github.com/mstksg/advent-of-code-ocr).
 *
 * @param {string} block - a multiline string containing ASCII font "glyphs" to
 * recognize
 * @param {string} [pixelChar='#'] - the character that represents a lit pixel
 * in the font
 * @returns {string} - the recognized characters
 */
module.exports = async (block, pixelChar = '#') => {
  block = block.replaceAll('\r', '');
  const lines = block.split('\n');
  const glyphs = await loadFont(`font${lines.length}`);
  return recognize(lines, glyphs, pixelChar);
};

/**
 * Returns a `Map` that associates a glyph hash with a character. The font file
 * consists of a line containing all the possible translated characters,
 * followed by a glyph block containing the corresponding glyphs in the same
 * order, using `#` for lit pixels. Since the maximum width of a glyph is
 * unknown while loading the font file, all glyphs must be separated by a blank
 * column of pixels. The returned `Map` will have a `maxWidth` property that
 * gives the maximum width of any glyph in the font.
 *
 * @param {string} name - the name of the font to load
 * @returns {Map} - the glyph map
 */
const loadFont = async name => {
  let font = fonts.get(name);

  if (!font) {
    const file = path.join(__dirname, `${name}.txt`);
    const data = await fs.readFile(file, 'utf8');
    let lines = data.split('\n');
    const letters = lines[0];
    lines.splice(0, 1);
    const hashes = hashLines(lines, '#');
    font = hashes.reduce((glyphs, hash, i) => {
      glyphs.set(hash, letters[i]);
      return glyphs;
    }, new Map());
    font.maxWidth = hashes.maxWidth;
    fonts.set(name, font);
  }

  return font;
};

/**
 * Returns a string of characters recognized from the given glyph block lines.
 *
 * @param {Array} lines - an array of lines from the glyph block
 * @param {Map} font - the glyph `Map`
 * @param {string} [pixelChar='#'] - the character that represents a pixel in
 * the ASCII font
 * @returns {string} - the recognized characters
 */
const recognize = (lines, font, pixelChar) => hashLines(lines, pixelChar, font.maxWidth)
  .map(hash => font.get(hash) || '?')
  .join('');

/**
 * Each glyph is represented by a hash of the concatenated columns of
 * characters that make it up. This function accepts an array of lines from a
 * glyph block and returns an array containing the hash for each glyph. The
 * returned array will have one additional property:
 *
 * - `maxWidth` (number): The maximum width of any glyph found in the glyph
 *   block.
 *
 * @param {Array} lines - an array of lines from the glyph block
 * @param {string} pixelChar - the character that represents a lit pixel in the
 * font
 * @param {number} [maxWidth] - the maximum widht of a glyph; if omitted, all
 * glyphs must be separated by at least one column of blank pixels
 * @returns {Array} - an array of resulting hashes
 */
const hashLines = (lines, pixelChar, maxWidth) => {
  const length = lines.reduce(
    (max, line) => Math.max(max, line.length), 0
  );
  let columns = [];
  const hashes = [];
  hashes.maxWidth = 0;

  /**
   * The `columns` variable is an array of strings, where each string is a
   * column of pixels read from a glyph from top to bottom. This function
   * concatenates those strings and hashes the result to produce a hash that
   * represents the glyph, which is then stored in the `hashes` array. We use
   * MD5 because it's fast and cryptographic strength is not a concern here.
   */
  const hashGlyph = () => {
    const hash = crypto.createHash('md5');
    hash.update(columns.join('\n'));
    hashes.push(hash.digest('base64'));
    hashes.maxWidth = Math.max(hashes.maxWidth, columns.length);
    columns = [];
  };

  for (let c = 0; c < length; c++) {
    let column = [];

    for (let r = 0; r < lines.length; r++) {
      column.push(lines[r][c] === pixelChar ? '#' : ' ');
    }

    column = column.join('');
    const emptyColumn = column.trim() === '';

    if (!emptyColumn) {
      columns.push(column);
    }

    if (emptyColumn && columns.length || columns.length === maxWidth) {
      hashGlyph(); // end of glyph
    }
  }

  if (columns.length) {
    // Catch the last glyph if it's not followed by a blank column
    hashGlyph();
  }

  return hashes;
};
