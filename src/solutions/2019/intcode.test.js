const intcode = require('./intcode');

describe('Intcode interpreter', () => {
  test('Day 2, example 1', () => {
    const { state, api } = intcode('1,9,10,3,2,3,11,0,99,30,40,50');
    api.run();
    expect(state).toMatchObject({
      error: null,
      memory: [ 3500, 9, 10, 70, 2, 3, 11, 0, 99, 30, 40, 50 ],
      status: 'terminated',
    });
  });

  test('Day 2, example 2 (add)', () => {
    const { state, api } = intcode('1,0,0,0,99');
    api.run();
    expect(state).toMatchObject({
      error: null,
      memory: [ 2, 0, 0, 0, 99 ],
      status: 'terminated',
    });
  });

  test('Day 2, example 3 (multiply)', () => {
    const { state, api } = intcode('2,3,0,3,99');
    api.run();
    expect(state).toMatchObject({
      error: null,
      memory: [ 2, 3, 0, 6, 99 ],
      status: 'terminated',
    });
  });

  test('Day 2, example 4', () => {
    const { state, api } = intcode('2,4,4,5,99,0');
    api.run();
    expect(state).toMatchObject({
      error: null,
      memory: [ 2, 4, 4, 5, 99, 9801 ],
      status: 'terminated',
    });
  });

  test('Day 2, example 5', () => {
    const { state, api } = intcode('1,1,1,4,99,5,6,0,99');
    api.run();
    expect(state).toMatchObject({
      error: null,
      memory: [ 30, 1, 1, 4, 2, 5, 6, 0, 99 ],
      status: 'terminated',
    });
  });

  test('Noun and verb handling', () => {
    const { state, api } = intcode('1,2,3,0,99');
    state.memory[1] = 0;
    state.memory[2] = 0;
    api.run();
    expect(state).toMatchObject({
      error: null,
      memory: [ 2, 0, 0, 0, 99 ],
      status: 'terminated',
    });
  });

  describe('Day 5, example 1 (input/output)', () => {
    test('Output to array', () => {
      const { state, api } = intcode('3,0,4,0,99');
      api.input(1);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1 ],
        status: 'terminated',
      });
    });
  
    test('Input after start', () => {
      const { state, api } = intcode('3,0,4,0,99');
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [],
        status: 'blocked',
      });
      api.input(1);
      expect(state.status).toBe('ready');
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1 ],
        status: 'terminated',
      });
    });
  });

  test('Day 5, example 2 (parameter modes)', () => {
    const { state, api } = intcode('1002,4,3,4,33');
    api.run();
    expect(state).toMatchObject({
      error: null,
      memory: [ 1002, 4, 3, 4, 99 ],
      status: 'terminated',
    });
  });

  test('Day 5, example 3 (negative values)', () => {
    const { state, api } = intcode('1101,100,-1,4,0');
    api.run();
    expect(state).toMatchObject({
      error: null,
      memory: [ 1101, 100, -1, 4, 99 ],
      status: 'terminated',
    });
  });

  describe('Day 5, example 4 (equals, position mode)', () => {
    test('Is equal', () => {
      const { state, api } = intcode('3,9,8,9,10,9,4,9,99,-1,8');
      api.input(8);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1 ],
        status: 'terminated',
      });
    });

    test('Is not equal', () => {
      const { state, api } = intcode('3,9,8,9,10,9,4,9,99,-1,8');
      api.input(7);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 0 ],
        status: 'terminated',
      });
    });
  });

  describe('Day 5, example 5 (less than, position mode)', () => {
    test('Is not less than', () => {
      const { state, api } = intcode('3,9,7,9,10,9,4,9,99,-1,8');
      api.input(8);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 0 ],
        status: 'terminated',
      });
    });

    test('Is less than', () => {
      const { state, api } = intcode('3,9,7,9,10,9,4,9,99,-1,8');
      api.input(7);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1 ],
        status: 'terminated',
      });
    });
  });

  describe('Day 5, example 6 (equals, immediate mode)', () => {
    test('Is equal', () => {
      const { state, api } = intcode('3,3,1108,-1,8,3,4,3,99');
      api.input(8);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1 ],
        status: 'terminated',
      });
    });

    test('Is not equal', () => {
      const { state, api } = intcode('3,3,1108,-1,8,3,4,3,99');
      api.input(7);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 0 ],
        status: 'terminated',
      });
    });
  });

  describe('Day 5, example 7 (less than, immediate mode)', () => {
    test('Is not less than', () => {
      const { state, api } = intcode('3,3,1107,-1,8,3,4,3,99');
      api.input(8);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 0 ],
        status: 'terminated',
      });
    });

    test('Is less than', () => {
      const { state, api } = intcode('3,3,1107,-1,8,3,4,3,99');
      api.input(7);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1 ],
        status: 'terminated',
      });
    });
  });

  describe('Day 5, example 8 (jump, position mode)', () => {
    test('Input is 0', () => {
      const { state, api } = intcode('3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9');
      api.input(0);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 0 ],
        status: 'terminated',
      });
    });

    test('Input is non-zero', () => {
      const { state, api } = intcode('3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9');
      api.input(7);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1 ],
        status: 'terminated',
      });
    });
  });

  describe('Day 5, example 9 (jump, immediate mode)', () => {
    test('Input is zero', () => {
      const { state, api } = intcode('3,3,1105,-1,9,1101,0,0,12,4,12,99,1');
      api.input(0);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 0 ],
        status: 'terminated',
      });
    });

    test('Input is non-zero', () => {
      const { state, api } = intcode('3,3,1105,-1,9,1101,0,0,12,4,12,99,1');
      api.input(7);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1 ],
        status: 'terminated',
      });
    });
  });

  describe('Day 5, example 10', () => {
    test('Input less than 8', () => {
      const { state, api } = intcode('3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99');
      api.input(7);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 999 ],
        status: 'terminated',
      });
    });

    test('Input equals 8', () => {
      const { state, api } = intcode('3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99');
      api.input(8);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1000 ],
        status: 'terminated',
      });
    });

    test('Input greater than 8', () => {
      const { state, api } = intcode('3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99');
      api.input(9);
      api.run();
      expect(state).toMatchObject({
        error: null,
        output: [ 1001 ],
        status: 'terminated',
      });
    });
  });

  test('Day 9, example 1', () => {
    const { state, api } = intcode('109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99');
    api.run();
    expect(state).toMatchObject({
      error: null,
      output: [ 109, 1, 204, -1, 1001, 100, 1, 100, 1008, 100, 16, 101, 1006, 101, 0, 99 ],
      status: 'terminated',
    });
  });

  test('Day 9, example 2 (large number)', () => {
    const { state, api } = intcode('1102,34915192,34915192,7,4,7,99,0');
    api.run();
    expect(state).toMatchObject({
      error: null,
      output: [ 1219070632396864 ],
      status: 'terminated',
    });
  });

  test('Day 9, example 3', () => {
    const { state, api } = intcode('104,1125899906842624,99');
    api.run();
    expect(state).toMatchObject({
      error: null,
      output: [ 1125899906842624 ],
      status: 'terminated',
    });
  });
});
