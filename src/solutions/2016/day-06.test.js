const solver = require('./day-06');

const EXAMPLE = `eedadn
drvtee
eandsr
raavrd
atevrs
tsrnev
sdttsa
rasrtv
nssdts
ntnada
svetve
tesnvt
vntsnd
vrdear
dvrsen
enarar`;

test('Day 6', () => {
  expect(solver(EXAMPLE)).toEqual([ 'easter', 'advent' ]);
});
