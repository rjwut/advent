const Keypad = require('./day-21.keypad');

let keypad;

describe('Numeric', () => {
  beforeAll(() => {
    keypad = new Keypad('789\n456\n123\n 0A');
  });

  test('Don\'t move if we\'re already on the right key', () => {
    expect(keypad.getMoves('4', '4')).toEqual([ 'A' ]);
  });

  test('Only horizontal moves when on the same row', () => {
    expect(keypad.getMoves('7', '9')).toEqual([ '>>A' ]);
    expect(keypad.getMoves('9', '7')).toEqual([ '<<A' ]);
  });

  test('Only vertical moves when on the same column', () => {
    expect(keypad.getMoves('8', '0')).toEqual([ 'vvvA' ]);
    expect(keypad.getMoves('0', '8')).toEqual([ '^^^A' ]);
  });

  test('Tries both ways when not on the same row or column', () => {
    expect(keypad.getMoves('8', 'A')).toEqual([ 'vvv>A', '>vvvA' ]);
    expect(keypad.getMoves('A', '8')).toEqual([ '^^^<A', '<^^^A' ]);
    expect(keypad.getMoves('9', '0')).toEqual([ 'vvv<A', '<vvvA' ]);
    expect(keypad.getMoves('0', '9')).toEqual([ '^^^>A', '>^^^A' ]);
  });

  test('Avoids the gap', () => {
    expect(keypad.getMoves('7', 'A')).toEqual([ '>>vvvA' ]);
    expect(keypad.getMoves('A', '7')).toEqual([ '^^^<<A' ]);
  });
});

describe('Directional', () => {
  beforeAll(() => {
    keypad = new Keypad(' ^A\n<v>');
  });

  test('Don\'t move if we\'re already on the right key', () => {
    expect(keypad.getMoves('^', '^')).toEqual([ 'A' ]);
  });

  test('Only horizontal moves when on the same row', () => {
    expect(keypad.getMoves('<', '>')).toEqual([ '>>A' ]);
    expect(keypad.getMoves('>', '<')).toEqual([ '<<A' ]);
  });

  test('Only vertical moves when on the same column', () => {
    expect(keypad.getMoves('A', '>')).toEqual([ 'vA' ]);
    expect(keypad.getMoves('>', 'A')).toEqual([ '^A' ]);
  });

  test('Tries both ways when not on the same row or column', () => {
    expect(keypad.getMoves('^', '>')).toEqual([ 'v>A', '>vA' ]);
    expect(keypad.getMoves('>', '^')).toEqual([ '^<A', '<^A' ]);
    expect(keypad.getMoves('A', 'v')).toEqual([ 'v<A', '<vA' ]);
    expect(keypad.getMoves('v', 'A')).toEqual([ '^>A', '>^A' ]);
  });

  test('Avoids the gap', () => {
    expect(keypad.getMoves('<', 'A')).toEqual([ '>>^A' ]);
    expect(keypad.getMoves('A', '<')).toEqual([ 'v<<A' ]);
  });
});
