const solver = require('./day-07');

const EXAMPLE = `Step C must be finished before step A can begin.
Step C must be finished before step F can begin.
Step A must be finished before step B can begin.
Step A must be finished before step D can begin.
Step B must be finished before step E can begin.
Step D must be finished before step E can begin.
Step F must be finished before step E can begin.`;

test('Day 7', () => {
  expect(solver(EXAMPLE, {
    workerCount: 2,
    baseTime: 0,
  })).toEqual([ 'CABDFE', 15 ]);
});
