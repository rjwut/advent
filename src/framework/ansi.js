/**
 * Simple function to provide some basic ANSI style support without the
 * overkill of a module like `chalk`. Constants representing the available
 * styles are defined as properties of this function:
 *
 * - `RESET`
 * - `BOLD`
 * - `UNDERLINE`
 * - `REVERSE`
 * - `FG_{color}`
 * - `BG_{color}`
 *
 * The available `color`s are:
 *
 * - `BLACK`
 * - `RED`
 * - `GREEN`
 * - `YELLOW`
 * - `BLUE`
 * - `MAGENTA`
 * - `CYAN`
 * - `WHITE`
 *
 * Example usage:
 *
 * ```js
 * const ansi = require('./ansi');
 * const RED = ansi(ansi.FG_RED, ansi.BOLD);
 * const RESET = ansi(ansi.RESET);
 * console.log(`${RED}Hello, world!${RESET}`);
 * ```
 *
 * @param {...number} - the constants representing the desired style codes
 * @returns {string} - the ANSI style codes
 */
const render = (...styles) => '\u001b[' + styles.join(';') + 'm';

render.RESET      = 0;
render.BOLD       = 1;
render.UNDERLINE  = 4;
render.REVERSE    = 7;
render.FG_BLACK   = 30;
render.FG_RED     = 31;
render.FG_GREEN   = 32;
render.FG_YELLOW  = 33;
render.FG_BLUE    = 34;
render.FG_MAGENTA = 35;
render.FG_CYAN    = 36;
render.FG_WHITE   = 37;
render.BG_BLACK   = 40;
render.BG_RED     = 41;
render.BG_GREEN   = 42;
render.BG_YELLOW  = 43;
render.BG_BLUE    = 44;
render.BG_MAGENTA = 45;
render.BG_CYAN    = 46;
render.BG_WHITE   = 47;
module.exports = render;
