const Range = require('./range');

test('Clone', () => {
  const a = new Range(0, 7);
  const b = a.clone();
  expect(a.equals(b)).toBe(true);
  expect(a.containsRange(b)).toBe(true);
  expect(b.containsRange(a)).toBe(true);
  expect(a.size).toBe(b.size);
  expect(a.toArray()).toEqual(b.toArray());
  expect(a.toString()).toBe(b.toString());
});

test('A partially overlaps B', () => {
  const a = new Range(0, 7);
  const b = new Range(5, 9);
  expect(a.containsRange(b)).toBe(false);
  expect(b.containsRange(a)).toBe(false);
  expect(a.intersects(b)).toBe(true);
  expect(b.intersects(a)).toBe(true);
  const intersection = a.intersection(b);
  expect(intersection.toArray()).toEqual([ 5, 7 ]);
  expect(intersection.toString()).toBe('[5,7]');
  expect(intersection.size).toBe(3);
  expect(b.intersection(a).equals(intersection)).toBe(true);
  const union = a.union(b);
  expect(union.toArray()).toEqual([ 0, 9 ]);
  expect(union.toString()).toBe('[0,9]');
  expect(b.union(a).equals(union)).toBe(true);
});

test('A contains B', () => {
  const a = new Range(0, 9);
  const b = new Range(5, 7);
  expect(a.containsRange(b)).toBe(true);
  expect(b.containsRange(a)).toBe(false);
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
  expect(a.containsRange(b)).toBe(false);
  expect(b.containsRange(a)).toBe(false);
  expect(a.intersects(b)).toBe(false);
  expect(b.intersects(a)).toBe(false);
  expect(a.intersection(b)).toBe(null);
  expect(b.intersection(a)).toBe(null);
  expect(a.union(b)).toBe(null);
  expect(b.union(a)).toBe(null);
});

describe('Subrange', () => {
  test('Basic subrange test', () => {
    const a = new Range(0, 7);
    const b = a.subrange(2, 3);
    expect(b.min).toBe(2);
    expect(b.max).toBe(4);
    expect(a.containsRange(b)).toBe(true);
    expect(a.intersects(b)).toBe(true);
    expect(b.intersects(a)).toBe(true);
    expect(a.intersection(b).equals(b)).toBe(true);
    expect(b.intersection(a).equals(b)).toBe(true);
    expect(a.union(b).equals(a)).toBe(true);
    expect(b.union(a).equals(a)).toBe(true);
  });

  test('Subrange offset can\'t be negative', () => {
    expect(() => new Range(0, 7).subrange(-1, 3))
      .toThrow('Subrange offset out of range: -1');
  });

  test('Subrange offset can\'t exceed range size', () => {
    expect(() => new Range(0, 7).subrange(8, 3))
      .toThrow('Subrange offset out of range: 8');
  });

  test('Subrange length can\'t be less than 1', () => {
    expect(() => new Range(0, 7).subrange(0, 0))
      .toThrow('Subrange length out of range: 0');
  });

  test('Subrange length can\'t exceed range size', () => {
    expect(() => new Range(0, 7).subrange(7, 2))
      .toThrow('Subrange length out of range: 2');
  });
});

describe('Subtract', () => {
  test('Subtracting ranges from this range', () => {
    const a = new Range(0, 7);
    const remains = a.subtract(
      new Range(-1, 2),
      new Range(4, 5),
      new Range(7, 8)
    );
    expect(remains.length).toBe(2);
    expect(remains[0].toArray()).toEqual([ 3, 3 ]);
    expect(remains[1].toArray()).toEqual([ 6, 6 ]);
  });

  test('Subracting the entire range', () => {
    expect(new Range(0, 7).subtract(new Range(0, 7))).toHaveLength(0);
  });

  test('Subtracting a range that does not intersect with this range', () => {
    const remains = new Range(0, 7).subtract(new Range(8, 9));
    expect(remains).toHaveLength(1);
    expect(remains[0].toArray()).toEqual([ 0, 7 ]);
  });
});
