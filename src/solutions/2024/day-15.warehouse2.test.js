const Warehouse2 = require('./day-15.warehouse2');

test('Test case 1', () => {
  const grid = `##############
##......##..##
##..........##
##...[][]...##
##....[]....##
##.....@....##
##############`;
  const expected = `##############
##......##..##
##...[][]...##
##....[]....##
##.....@....##
##..........##
##############`
  run(grid, '^^', expected);
});

test('Test case 2', () => {
  const grid = `##############
##....@.....##
##....[]....##
##...[][]...##
##....[]....##
##..........##
##############`;
  const expected = `##############
##..........##
##....@.....##
##....[]....##
##...[][]...##
##....[]....##
##############`;
  run(grid, 'v', expected);
});

const run = (grid, moves, expected) => {
  const input = `${grid}\n\n${moves}`;
  const warehouse = new Warehouse2(input, false);
  warehouse.run();
  expect(warehouse.toString()).toBe(expected);
};
