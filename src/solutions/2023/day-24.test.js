const solver = require('./day-24');

const EXAMPLE = `19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3`;

test('Day 24', async () => {
  await expect(solver(EXAMPLE, 7, 27)).resolves.toEqual([ 2, 47 ]);
}, 20_000);
