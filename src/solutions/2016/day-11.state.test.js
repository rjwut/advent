const {
  getElevator, putElevator, putObject, getFloors, computeGoal,
  getPairId, normalize, debt, isMicrochip
} = require('./day-11.state');

test('Manipulate elevator', () => {
  let state = 0;
  expect(getElevator(state)).toBe(0);
  state = putElevator(state, 1);
  expect(getElevator(state)).toBe(1);
});

test('Manipulate objects', () => {
  let state = 0;
  expect(getFloors(state, 4)).toEqual([ [ 0, 1, 2, 3 ], [], [], [] ]);
  state = putObject(state, 0, 2);
  state = putObject(state, 1, 1);
  expect(getFloors(state, 4)).toEqual([ [ 2, 3 ], [ 1 ], [ 0 ], [] ]);
});

test('Normalize', () => {
  expect(normalize(0b00_01_00_10_01, 4)).toBe(0b00_10_00_01_01);
});

test('First step in example', () => {
  let state = 0b00_10_00_01_00;
  expect(getFloors(state, 4)).toEqual([ [ 1, 3 ], [ 0 ], [ 2 ], []])
  state = putElevator(state, 1);
  expect(state).toBe(0b00_10_00_01_01);
  state = putObject(state, 1, 1);
  expect(state).toBe(0b00_10_01_01_01);
  expect(getFloors(state, 4)).toEqual([ [ 3 ], [ 0, 1 ], [ 2 ], [] ])
  state = normalize(state, 4);
  expect(state).toBe(0b01_01_00_10_01);
  expect(getFloors(state, 4)).toEqual([ [ 1 ], [ 2, 3 ], [ 0 ], [] ])
});

test('Compute goal', () => {
  expect(computeGoal(4)).toBe(0b11_11_11_11_11)
});

test('Test if something is a microchip', () => {
  expect(isMicrochip(0)).toBe(false);
  expect(isMicrochip(1)).toBe(true);
});

test('Get pair ID', () => {
  expect(getPairId(4)).toBe(5);
  expect(getPairId(5)).toBe(4);
});

test('Compute state debt', () => {
  expect(debt(0, 4)).toBe(12);
  expect(debt(computeGoal(4))).toBe(0);
});
