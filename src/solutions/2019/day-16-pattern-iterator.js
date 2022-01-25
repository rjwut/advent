const BASE_PATTERN = [ 0, 1, 0, -1 ];

module.exports = (length, offset = 0) => {
  const iterators = new Array(length);

  for (let i = 0; i < length; i++) {
    const iterator = makeGenerator(offset + i)();
    iterator.next(); // skip the first digit in the pattern
    iterators[i] = iterator;
  }

  return iterators;
};

const makeGenerator = offset => function*() {
  do {
    for (let i = 0; i < BASE_PATTERN.length; i++) {
      const digit = BASE_PATTERN[i];

      for (let j = 0; j <= offset; j++) {
        yield digit;
      }
    }
  } while(true);
};
