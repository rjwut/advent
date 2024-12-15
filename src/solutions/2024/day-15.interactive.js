const path = require('path');
const fs = require('fs/promises');
const Warehouse2 = require('./day-15.warehouse2');

const CLEAR_SCREEN = '\x1B[2J';
const HIDE_CURSOR = '\x1B[?25l';
const SHOW_CURSOR = '\x1B[?25h';
const HOME = '\x1B[H';
const UP = '\u001B\u005B\u0041';
const DOWN = '\u001B\u005B\u0042';
const LEFT = '\u001B\u005B\u0044';
const RIGHT = '\u001B\u005B\u0043';
const ESC = '\u001B';
const DIRECTIONS = {
  [ UP ]:    [ -1,  0 ],
  [ DOWN ]:  [  1,  0 ],
  [ LEFT ]:  [  0, -1 ],
  [ RIGHT ]: [  0,  1 ],
};

(async () => {
  const inputFile = path.resolve(
    __dirname, '..', '..', '..', 'input', '2024', '15.txt'
  );
  const input = await fs.readFile(inputFile, 'utf8');
  const warehouse = new Warehouse2(input);

  const onKey = key => {
    const dir = DIRECTIONS[key];

    if (dir) {
      warehouse.move(dir);
      console.log(HOME + warehouse.toString());
    } else if (key === ESC) {
      process.stdin.removeListener('data', onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      console.log(SHOW_CURSOR);
    }
  };

  console.log(HIDE_CURSOR + CLEAR_SCREEN + HOME + warehouse.toString());
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', onKey);
})();
