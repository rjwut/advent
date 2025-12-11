const solver = require('./day-08');

const EXAMPLE_1 = '123456789012';
const EXAMPLE_2 = '0222112222120000';

test('Day 8', async () => {
  await expect(solver(EXAMPLE_1, 1, 3, 2)).resolves.toBe(1);
  await expect(solver(EXAMPLE_2, 2, 2, 2)).resolves.toBe(' #\n# ');
});
