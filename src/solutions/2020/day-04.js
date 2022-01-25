const { split } = require('../util');

// Validator functions
const ANY_VALUE = () => true;
const IS_DEFINED = val => typeof val !== 'undefined';
const VALID_HEIGHT = val => {
  if (typeof val !== 'string') {
    return false;
  }

  const count = parseInt(val.substring(0, val.length - 2));
  const unit = val.substr(-2);

  if (unit === 'cm') {
    return count >= 150 && count <= 193;
  }

  if (unit === 'in') {
    return count >= 59 && count <= 76;
  }

  return false;
};

// Constants used by validator functions
const YEAR_REGEXP = /^\d{4}$/;
const COLOR_REGEXP = /^#[0-9a-f]{6}$/;
const EYE_COLORS = [ 'amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth' ];
const PASSPORT_ID_REGEXP = /^\d{9}$/;

// Field validators for the two parts
const FIELD_VALIDATORS = [
  {
    'byr': IS_DEFINED,
    'iyr': IS_DEFINED,
    'eyr': IS_DEFINED,
    'hgt': IS_DEFINED,
    'hcl': IS_DEFINED,
    'ecl': IS_DEFINED,
    'pid': IS_DEFINED,
    'cid': ANY_VALUE,
  },
  {
    'byr': val => yearInRange(val, 1920, 2002),
    'iyr': val => yearInRange(val, 2010, 2020),
    'eyr': val => yearInRange(val, 2020, 2030),
    'hgt': VALID_HEIGHT,
    'hcl': val => testRegExp(val, COLOR_REGEXP),
    'ecl': val => EYE_COLORS.includes(val),
    'pid': val => testRegExp(val, PASSPORT_ID_REGEXP),
    'cid': ANY_VALUE,
  },
];

/**
 * # [Advent of Code 2020 Day 4](https://adventofcode.com/2020/day/4)
 *
 * First we need to write a parser for the passport batch files. A slight
 * wrinkle here from our previous parsing is that a single passport can span
 * multiple lines; they're separated by a blank line. This is handled easily by
 * the grouping option in the `split()` function from my `util` module. For
 * each line in a passport, we split the line into tokens which take the form
 * `field:value`, split each token on the colon, and build an object with the
 * given properties. So the parser returns an array of passport objects.
 * 
 * To solve both parts of the puzzle, I wrote a `solve()` function that accepts
 * the array of passports and an object that provides a validation function for
 * each field, and returns the number of valid passports. The
 * `solve()` function filters the given passports down to those who pass a
 * `validate()` function, then returns how many passed.
 * 
 * The `validate()` function accepts a passport and the field validators
 * object. The properties of the passport are mapped against the validation
 * functions, and returns `true` if all field validations pass. So now all
 * that's left is to write two passport validation objects, one for each part
 * of the puzzle.
 * 
 * Part one is easy: `cid` should always pass, while the rest should pass if
 * they're not `undefined`. I define an `ANY_VALUE` function that always
 * returns `true`, and an `IS_DEFINED` function that returns `true` only if the
 * value is defined, and part one is solved.
 * 
 * For part two, `cid` still uses `ANY_VALUE`. The others have more specific
 * validations. The first three fields (`byr`, `iyr`, and `eyr`) expect the
 * value to be a year within a particular range (although the range differs for
 * each field), so let's start with that. Time to bring out regular
 * expressions: `/^\d{4}$/` matches four digits, and then I just have to parse
 * the value as an integer and assert that it falls within the given range.
 * Wrap that test in a function and it can be used for all three of those
 * fields.
 * 
 * For the `hgt` field, the value is expected to be a valid height, but it must
 * handle both metric (`cm`) and imperial (`in`) units, with different ranges
 * for each. So I first separate the value into two parts, the count and the
 * unit, then test the range depending on the unit specified.
 * 
 * The fifth field is `hcl` (hair color), where the value must be a hex color
 * string. The regular expression `/^#[0-9a-f]{6}$/` handles that, no problem.
 * 
 * Unlike hair color, the `ecl` (eye color) field value is one of a fixed set
 * of values, so I can simply check to see if the value in question is included
 * in an array containing all the valid values. Easy.
 * 
 * The `pid` (passport ID) field expects a string of nine-digits, which is also
 * easily handled with a regular expression (`/^\d{9}$/`). Since we have two
 * fields (`hcl` and `pid`) that can be validated with just a regular
 * expression, I create a `testRegExp()` function that asserts that the value
 * is a string and passes the given regular expression, and use that for both.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
 module.exports = input => {
  input = readPassportData(input);
  return FIELD_VALIDATORS.map(validators => solve(input, validators));
};

/**
 * Solves a part of the puzzle, using the given field validators.
 *
 * @param {Array} input - the passport objects
 * @param {Function} fieldValidators - the field validators to use
 * @returns {number} - the puzzle output
 */
const solve = (input, fieldValidators) => input
  .map(passport => validate(passport, fieldValidators))
  .filter(valid => valid)
  .length;

/**
 * Generates an array of passport objects from the given input.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the passport objects
 */
const readPassportData = input => {
  return split(input, { group: true })
    .map(group => {
      const passport = {};
      group.forEach(line => {
        line.split(' ').forEach(field => {
          const parts = field.split(':');
          passport[parts[0]] = parts[1];
        });
      });
      return passport;
    });
};

/**
 * Determines whether the given passport is valid according to the given field
 * validators.
 *
 * @param {Object} passport - a passport object
 * @param {Object} fieldValidators - the field validators to use
 * @returns {boolean}
 */
const validate = (passport, fieldValidators) => Object.entries(fieldValidators)
  .map(([ key, fn ]) => fn(passport[key]))
  .every(valid => valid);

/**
 * Returns whether the given year has four digits and falls within the
 * specified range.
 *
 * @param {string} yearStr - the year as a string
 * @param {number} min - the minimum valid year
 * @param {number} max - the maximum valid year
 * @returns {boolean}
 */
const yearInRange = (yearStr, min, max) => {
  if (typeof yearStr !== 'string' || !YEAR_REGEXP.test(yearStr)) {
    return false;
  }

  const year = parseInt(yearStr, 10);
  return year >= min && year <= max;
};

/**
 * Returns `true` if the given value is defined and passes the indicated
 * regular expression.
 *
 * @param {string} val - the value to test 
 * @param {RegExp} regexp - the regular expression to test the value against
 * @returns {boolean}
 */
const testRegExp = (val, regexp) => typeof val !== 'undefined' && regexp.test(val);
