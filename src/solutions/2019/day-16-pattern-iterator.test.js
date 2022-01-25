const makePatternIterators = require('./day-16-pattern-iterator');

const EXPECTED_NO_OFFSET = [
  [  1,  0, -1,  0,  1,  0, -1,  0,  1,  0, -1,  0 ],
  [  0,  1,  1,  0,  0, -1, -1,  0,  0,  1,  1,  0 ],
  [  0,  0,  1,  1,  1,  0,  0,  0, -1, -1, -1,  0 ],
  [  0,  0,  0,  1,  1,  1,  1,  0,  0,  0,  0, -1 ],
];
const ITERATOR_COUNT = EXPECTED_NO_OFFSET.length;
const PATTERN_LENGTH = EXPECTED_NO_OFFSET[0].length;

test('Day 16 pattern iterators', () => {
  const iterators = makePatternIterators(ITERATOR_COUNT);
  const values = [];

  for (let i = 0; i < ITERATOR_COUNT; i++) {
    const iterator = iterators[i];
    const iteratorValues = new Array(PATTERN_LENGTH);
    values.push(iteratorValues);

    for (let j = 0; j < PATTERN_LENGTH; j++) {
      iteratorValues[j] = iterator.next().value;
    }
  }

  expect(values).toEqual(EXPECTED_NO_OFFSET);
});
