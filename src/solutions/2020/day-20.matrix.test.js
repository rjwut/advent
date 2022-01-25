const buildMatrix = require('./day-20.matrix');

const MATRIX = buildMatrix([
  [ 'a', 'b', 'c' ],
  [ 'd', 'e', 'f' ],
  [ 'g', 'h', 'i' ],
]);

describe('Day 20 - Matrix', () => {
  describe('Retrieve characters', () => {
    test('Untranslated matrix', () => {
      expect(MATRIX.get(0, 0, { x: 1, y: 0 })).toBe('b');
      expect(MATRIX.get(0, 0, { x: 2, y: 1 })).toBe('f');
      expect(MATRIX.get(0, 0, { x: 0, y: 2 })).toBe('g');
      expect(MATRIX.get(0, 0, { x: 1, y: 1 })).toBe('e');
    });

    test('Flipped matrix', () => {
      expect(MATRIX.get(1, 0, { x: 1, y: 0 })).toBe('b');
      expect(MATRIX.get(1, 0, { x: 2, y: 1 })).toBe('d');
      expect(MATRIX.get(1, 0, { x: 0, y: 2 })).toBe('i');
      expect(MATRIX.get(1, 0, { x: 1, y: 1 })).toBe('e');
    });

    test('Rotated matrix', () => {
      expect(MATRIX.get(0, 1, { x: 1, y: 0 })).toBe('d');
      expect(MATRIX.get(0, 1, { x: 2, y: 1 })).toBe('b');
      expect(MATRIX.get(0, 1, { x: 0, y: 2 })).toBe('i');
      expect(MATRIX.get(0, 1, { x: 1, y: 1 })).toBe('e');
    });

    test('Flipped and rotated matrix', () => {
      expect(MATRIX.get(1, 1, { x: 1, y: 0 })).toBe('f');
      expect(MATRIX.get(1, 1, { x: 2, y: 1 })).toBe('b');
      expect(MATRIX.get(1, 1, { x: 0, y: 2 })).toBe('g');
      expect(MATRIX.get(1, 1, { x: 1, y: 1 })).toBe('e');
    });
  });
});
