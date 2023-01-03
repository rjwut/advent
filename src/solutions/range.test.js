const Range = require('./range');

test('A partially overlaps B', () => {
  const a = new Range(0, 7);
  const b = new Range(5, 9);
  expect(a.intersects(b)).toBe(true);
  expect(b.intersects(a)).toBe(true);
  expect(a.intersection(b).toArray()).toEqual([ 5, 7 ]);
  expect(b.intersection(a).toArray()).toEqual([ 5, 7 ]);
  expect(a.union(b).toArray()).toEqual([ 0, 9 ]);
  expect(b.union(a).toArray()).toEqual([ 0, 9 ]);
});

test('A contains B', () => {
  const a = new Range(0, 9);
  const b = new Range(5, 7);
  expect(a.intersects(b)).toBe(true);
  expect(b.intersects(a)).toBe(true);
  expect(a.intersection(b).equals(b)).toBe(true);
  expect(b.intersection(a).equals(b)).toBe(true);
  expect(a.union(b).equals(a)).toBe(true);
  expect(b.union(a).equals(a)).toBe(true);
});

test('A and B do not intersect', () => {
  const a = new Range(0, 5);
  const b = new Range(7, 9);
  expect(a.intersects(b)).toBe(false);
  expect(b.intersects(a)).toBe(false);
  expect(a.intersection(b)).toBe(null);
  expect(b.intersection(a)).toBe(null);
  expect(a.union(b)).toBe(null);
  expect(b.union(a)).toBe(null);
});
