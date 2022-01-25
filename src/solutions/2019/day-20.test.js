const solver = require('./day-20');
const path = require('path');
const fs = require('fs/promises');

const ANSWERS = [
  [ 23, 26 ],
  [ 58, Infinity ],
  [ 77, 396 ],
];

let examples;

beforeAll(async () => {
  const filepath = path.join(__dirname, 'day-20.test.txt');
  const content = await fs.readFile(filepath, 'utf8');
  examples = content.replaceAll('\r', '').split('\n\n');
});

test('Day 20', () => {
  examples.forEach((example, i) => {
    expect(solver(example)).toEqual(ANSWERS[i]);
  });
});
