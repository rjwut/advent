const AnsiWriter = require('./ansi-writer');

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

const chunks = [];
const writeable = {
  write: str => chunks.push(str),
};
const ansi = new AnsiWriter(writeable);

for (let i = 0; i < ADVENT.length; i++) {
  ansi
    .style(AnsiWriter.FG_RED, AnsiWriter.BOLD)
    .write(ADVENT[i])
    .resetStyle()
    .write(OF[i])
    .style(AnsiWriter.FG_GREEN, AnsiWriter.BOLD)
    .write(CODE[i])
    .resetStyle()
    .write('\n');
}

/**
 * Exports a string that prints out a fun masthead to print out to the console.
 */
module.exports = chunks.join('');
