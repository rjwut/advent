const { add, multiply } = require('../math2');
const { split } = require('../util');

const FIELD_DEFINITION_REGEXP = /^(?<field>.+): (?<min1>\d+)-(?<max1>\d+) or (?<min2>\d+)-(?<max2>\d+)$/;
const PREFIX = 'departure';

/**
 * # [Advent of Code 2020 Day 16](https://adventofcode.com/2020/day/16)
 *
 * ## Parsing the Data
 *
 * For the first section of the input data, I use a regular expression to parse
 * each line, and convert it to an object that describes that field. For
 * section two, I simply split the second line on the commas and parse the
 * tokens as integers.
 *
 * Section three is formatted just like section two, except there are multiple
 * tickets listed instead of just one. Also, I will need to detect which values
 * are valid and which ones aren't, so for each value I create an object with
 * two properties: `value`, which contains the value itself, and `valid`, which
 * contains a boolean indicating whether there are any fields that accept this
 * value. Once all the values for a ticket are processed, I put the ticket into
 * `valid` and `invalid` buckets according to whether it had any invalid
 * values.
 *
 * As this is the most complicated parser written for any 2020 puzzle so far, I
 * broke down the work done by `parse()` into additional functions. There's one
 * function for each section of the input. The first two input sections are
 * pretty straightforward, but the third involves a lot of validation, and so
 * is further broken down into additional functions. The `parseNearbyTickets()`
 * function delegates to `parseTicket()` for each line, which in turn calls
 * `isValueValidForAnyField()` to test the validity of each value. This calls
 * `isValueValidForField()` to test a value against a single field.
 *
 * ## Part 1
 *
 * Parsing and validating the nearby tickets has done 90% of the work for part
 * 1, which asks me to sum all the invalid values found on tickets. All I have
 * to do is iterate the tickets in the `invalid` bucket, collect their invalid
 * values into an array, then add them together.
 * 
 * ## Part 2
 *
 * This part is more involved. You have to figure out which column corresponds
 * to which field. This is done in a two-stage process:
 * 
 * 1. For each column, determine which fields accept all the values in that
 *    column among the valid tickets.
 * 2. Assign fields to columns by the process of elimination.
 *
 * Stage one is not too hard: for each column, start with a `Set` containing
 * all the fields. Iterate all values for that column across the valid tickets,
 * and test each value against each field. If a value fails validation for a
 * field, throw out that field as a candidate for the column.
 *
 * For stage two, look for a column that has only one possible field candidate.
 * Assign that field to the column, and remove it as a candidate for all other
 * columns. Repeat until all fields are assigned.
 *
 * Once all column fields are discovered, we simply filter the list of fields
 * to those with start with `'departure'`, then grab the values for those
 * fields from my ticket and multiply them together to get the answer.
 *
 * It should be noted that the example data for part 1 of the puzzle will not
 * work for part 2, and that part 2's example data doesn't have any fields
 * starting with `'departure'`, so your test module needs to account for this.
 * This is another puzzle where the test code executes the individual parts
 * with separate data.
 *
 * @param {string} input - the puzzle input
 * @param {number} [part] - which part to solve
 * @returns {array|number} - the puzzle answers, or the solution for one part
 * if `part` is specified
 */
module.exports = (input, part) => {
  input = parse(input);
  const parts = [ part1, part2 ];
  return part ? parts[part - 1](input) : parts.map(fn => fn(input));
};

/**
 * Parses the puzzle input into an array of ticket objects.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the parsed tickets
 */
const parse = input => {
  let [ fields, myTicket, nearbyTickets ] = split(input, { group: true });
  fields = parseFields(fields);
  myTicket = parseMyTicket(myTicket);
  nearbyTickets = parseNearbyTickets(nearbyTickets, fields);
  return { fields, myTicket, nearbyTickets };
};

const part1 = input => add(collectInvalidValues(input.nearbyTickets.invalid));

const part2 = input => {
  computeFields(input);
  return multiplyFields(input, PREFIX);
};

/**
 * Parses the input lines for field definitions. Each input line looks like
 * this:
 * 
 * ```
 * <field>: <min1>-<max1> or <min2>-<max2>
 * ```
 * 
 * The corresponding object looks like this:
 * 
 * ```
 * {
 *   name: '<field>',
 *   ranges: [
 *     { min: <min1>, max: <max1> },
 *     { min: <min2>, max: <max2> },
 *   ],
 * }
 * ```
 * @param {Array} lines - the input lines for the field definitions section
 * @returns {Array} - the parsed field definitions
 */
const parseFields = lines => lines.map(line => {
  const match = line.match(FIELD_DEFINITION_REGEXP).groups;
  return {
    name: match.field,
    ranges: [
      { min: parseInt(match.min1, 10), max: parseInt(match.max1, 10) },
      { min: parseInt(match.min2, 10), max: parseInt(match.max2, 10) },
    ],
  };
});

/**
 * Parses the "your ticket" section of the input.
 *
 * @param {Array} lines - the input lines for the "your ticket" section
 * @returns {Array} - the field values from my ticket
 */
const parseMyTicket = lines => lines[1].split(',').map(value => parseInt(value, 10));

/**
 * Parses the "nearby tickets" section of the input.
 *
 * @param {Array} lines - the input lines for the "nearby tickets" section
 * @returns {Array} - the field values from each ticket (an array of arrays)
 */
const parseNearbyTickets = (lines, fields) => {
  lines.shift(); // skip header line
  let tickets = {
    valid: [],
    invalid: [],
  };
  lines.forEach(line => {
    const ticket = parseTicket(line, fields);
    const ticketIsValid = ticket.every(value => value.valid);
    tickets[ticketIsValid ? 'valid' : 'invalid'].push(ticket);
  });
  return tickets;
};

/**
 * Parses a single ticket line.
 *
 * @param {string} line - the line for the ticket
 * @param {Array} fields - the field definitions
 */
const parseTicket = (line, fields) => line.split(',').map(value => {
  value = parseInt(value, 10);
  return {
    value,
    valid: isValueValidForAnyField(value, fields),
  }
});

/**
 * Returns all invalid values from the given array of invalid tickets.
 *
 * @param {Array} invalidTickets - the invalid tickets
 * @returns {Array} - the invalid values
 */
const collectInvalidValues = invalidTickets => {
  const values = [];
  invalidTickets.forEach(ticket => {
    ticket.forEach(valueObj => {
      if (!valueObj.valid) {
        values.push(valueObj.value);
      }
    });
  });
  return values;
};

/**
 * Determines the field to which each column corresponds. Each field will get
 * a `column` property specifying the index of the corresponding column.
 *
 * @param {Object} input - the parsed puzzle input
 */
const computeFields = input => {
  const possibleFieldsForColumns = computePossibleFieldsForColumns(input);
  assignFields(input.fields, possibleFieldsForColumns);
};

/**
 * Returns an array of `Set`s, where each set contains the fields which can
 * support all values from the corresponding column. This is computed as
 * follows:
 * 1. Create an array with a `Set` for each column.
 * 2. Populate each `Set` with all fields.
 * 3. Iterate the tickets:
 *    a. For each value on the ticket, check it against each field in the
 *       `Set` for the corresponding column.
 *    b. If a field is found for which that value is not legal, remove it from
 *       the `Set`.
 */
const computePossibleFieldsForColumns = input => {
  const tickets = input.nearbyTickets.valid;
  const columnFields = tickets[0].map(() => new Set(input.fields));
  tickets.forEach(ticket => {
    ticket.map(valueObj => valueObj.value).forEach((value, i) => {
      const possibleFields = columnFields[i];

      for (let field of possibleFields) {
        if (!isValueValidForField(value, field)) {
          possibleFields.delete(field);
        }
      }
    });
  });
  return columnFields;
};

/**
 * Given an array of `Set`s containing the possible fields for each column,
 * determine which field corresponds to which column by process of elimination:
 * 1. Find a column for which is only supported by one field.
 * 2. Set the `column` property of that field to the column's index.
 * 3. Remove that field as a possibility from all other columns.
 * 4. Repeat steps 1-3 until all fields are accounted for.
 *
 * @param {*} possibleFieldsForColumns 
 */
const assignFields = (fields, possibleFieldsForColumns) => {
  let unassignedFieldsCount = fields.length;

  do {
    possibleFieldsForColumns.forEach((columnFields, i) => {
      if (!columnFields || columnFields.size !== 1) {
        return;
      }

      // Found a column with exactly one possible field
      const field = Array.from(columnFields)[0];
      field.column = i;
      possibleFieldsForColumns[i] = null; // stop checking this column
      unassignedFieldsCount--;
      possibleFieldsForColumns.filter(fields => fields).forEach(otherColumnFields => {
        otherColumnFields.delete(field);
      });
    });
  } while (unassignedFieldsCount > 0);
};

/**
 * Find all columns whose names begin with the given prefix, retrieve the values
 * from my ticket corresponding to those columns, and multiply them together.
 *
 * @param {Object} input - the parsed input
 * @param {string} prefix - the field name prefix
 * @returns {number} - the product of the field values for my ticket
 */
const multiplyFields = (input, prefix) => multiply(
  input.fields.filter(field => field.name.startsWith(prefix))
    .map(field => input.myTicket[field.column])
);

/**
 * Returns whether the given value is valid for any field field.
 *
 * @param {number} value - the value to test
 * @param {Array} field - the fields to test against
 * @returns {boolean}
 */
 const isValueValidForAnyField = (value, fields) => fields.some(field => isValueValidForField(value, field));

/**
 * Returns whether the given value is valid for the indicated field.
 *
 * @param {number} value - the value to test
 * @param {Object} field - the field to test against
 * @returns {boolean}
 */
const isValueValidForField = (value, field) => field.ranges.some(range => value >= range.min && value <= range.max);
