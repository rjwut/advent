const ansi = require('./ansi');

const GREEN = ansi(ansi.FG_GREEN, ansi.BOLD);
const RED = ansi(ansi.FG_RED, ansi.BOLD);
const RESET = ansi(ansi.RESET);
const ADVENT = [
  '    ___       __                 __',
  '   /   | ____/ /   _____  ____  / /_',
  '  / /| |/ __  / | / / _ \\/ __ \\/ __/',
  ' / ___ / /_/ /| |/ /  __/ / / / /_',
  '/_/  |_\\__,_/ |___/\\___/_/ /_/\\__/',
];
const OF = [
  '           ____   ',
  '   ____  / __/  ',
  '  / __ \\/ /_   ',
  '   / /_/ / __/  ',
  '   \\____/_/     ',
];
const CODE = [
  '______          __',
  '/ ____/___  ____/ /__',
  '/ /   / __ \\/ __  / _ \\',
  '/ /___/ /_/ / /_/ /  __/',
  '\\____/\\____/\\__,_/\\___/',
];

let lines = [];

for (let i = 0; i < ADVENT.length; i++) {
  lines.push(`${RED}${ADVENT[i]}${RESET}${OF[i]}${GREEN}${CODE[i]}${RESET}`);
}

/**
 * Exports a string that prints out a fun masthead to print out to the console.
 */
module.exports = lines.join('\n');
