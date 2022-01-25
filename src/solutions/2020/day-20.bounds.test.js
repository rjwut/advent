const buildBounds = require('./day-20.bounds');

describe('Day 20 - Bounds', () => {
  let bounds, fn;

  beforeEach(() => {
    bounds = buildBounds();
    fn = jest.fn();
  });

  test('A new bounds object only contains 0,0', () => {
    expect(bounds.get()).toEqual({
      x: { min: 0, max: 0 },
      y: { min: 0, max: 0 },
      w: 1,
      h: 1,
    });
    bounds.iterate(fn)
    expect(fn.mock.calls).toEqual([
      [ { x: 0, y: 0 } ],
    ]);
    const map = bounds.map(coords => `${coords.x},${coords.y}`);
    expect(map).toEqual([
      [ '0,0' ],
    ]);
  });

  test('Expand a bounds object', () => {
    bounds.put({ x: 2, y: 0 });
    bounds.put({ x: 0, y: -1 });
    expect(bounds.get()).toEqual({
      x: { min: 0, max: 2 },
      y: { min: -1, max: 0 },
      w: 3,
      h: 2,
    });
    bounds.iterate(fn);
    expect(fn.mock.calls).toEqual([
      [ { x: 0, y: -1 }],
      [ { x: 1, y: -1 }],
      [ { x: 2, y: -1 }],
      [ { x: 0, y: 0 }],
      [ { x: 1, y: 0 }],
      [ { x: 2, y: 0 }],
    ]);
    const map = bounds.map(coords => `${coords.x},${coords.y}`);
    expect(map).toEqual([
      [ '0,-1', '1,-1', '2,-1' ],
      [ '0,0',  '1,0',  '2,0'  ],
    ]);
  });
});
