const DIGITS = [
  [ '╓───╖', '║   ║', '╙───╜' ],
  [ '─╖ ',   ' ║ ',   '─╨─'   ],
  [ '────╖', '╓───╜', '╙────' ],
  [ '────╖', ' ───╢', '────╜' ],
  [ '╥   ╥', '╙───╢', '    ╨' ],
  [ '╓────', '╙───╖', '────╜' ],
  [ '╓────', '╟───╖', '╙───╜' ],
  [ '────╖', '    ║', '    ╨' ],
  [ '╓───╖', '╟───╢', '╙───╜' ],
  [ '╓───╖', '╙───╢', '────╜' ],
];

/**
 * A fun little module for generating fancy large digits for printing out the
 * years, like this:
 *
 * ```txt
 * ────╖ ╓───╖ ────╖ ─╖
 * ╓───╜ ║   ║ ╓───╜  ║
 * ╙──── ╙───╜ ╙──── ─╨─
 * ```
 * 
 * @param {string|number} digits - the digits to print
 * @returns {string} - the fancy digits
 */
module.exports = digits => {
  const lines = [ ...String(digits) ].reduce((lines, digit) => {
    DIGITS[digit].forEach((line, i) => lines[i] += line + ' ');
    return lines;
  }, [ '', '', '']);
  return lines.join('\n');
};
