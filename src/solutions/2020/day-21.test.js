const solver = require('./day-21');

const EXAMPLE = `mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
trh fvjkl sbzzf mxmxvkd (contains dairy)
sqjhc fvjkl (contains soy)
sqjhc mxmxvkd sbzzf (contains fish)`;

test('Day 21', () => {
  expect(solver(EXAMPLE)).toEqual([ 5, 'mxmxvkd,sqjhc,fvjkl' ]);
});
