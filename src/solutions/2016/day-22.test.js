const solver = require('./day-22');

const EXAMPLE_PART_1 = `Filesystem            Size  Used  Avail  Use%
/dev/grid/node-x0-y0   10T    8T     2T   80%
/dev/grid/node-x0-y1   11T    6T     5T   54%
/dev/grid/node-x0-y2   32T   28T     4T   87%
/dev/grid/node-x1-y0    9T    7T     2T   77%
/dev/grid/node-x1-y1    8T    0T     8T    0%
/dev/grid/node-x1-y2   11T    7T     4T   63%
/dev/grid/node-x2-y0   10T    6T     4T   60%
/dev/grid/node-x2-y1    9T    8T     1T   88%
/dev/grid/node-x2-y2    9T    6T     3T   66%`;
const EXAMPLE_PART_2 = `Filesystem            Size  Used  Avail  Use%
/dev/grid/node-x0-y0    1T    1T     0T  100%
/dev/grid/node-x0-y1    1T    1T     0T  100%
/dev/grid/node-x0-y2    1T    1T     0T  100%
/dev/grid/node-x0-y3    1T    1T     0T  100%
/dev/grid/node-x1-y0    1T    1T     0T  100%
/dev/grid/node-x1-y1    1T    1T     0T  100%
/dev/grid/node-x1-y2  100T  100T     0T  100%
/dev/grid/node-x1-y3    1T    1T     0T  100%
/dev/grid/node-x2-y0    1T    1T     0T  100%
/dev/grid/node-x2-y1    1T    1T     0T  100%
/dev/grid/node-x2-y2  100T  100T     0T  100%
/dev/grid/node-x2-y3    1T    0T     1T    0%`;

test('Day 22', () => {
  expect(solver(EXAMPLE_PART_1, 1)).toEqual(7);
  expect(solver(EXAMPLE_PART_2, 2)).toEqual(12);
});
