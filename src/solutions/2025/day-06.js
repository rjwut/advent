const OPS = {
  '+': (a, b) => a + b,
  '*': (a, b) => a * b,
};

/**
 * # [Advent of Code 2025 Day 6](https://adventofcode.com/2025/day/6)
 *
 * Both parts of the puzzle require you to parse the input into a grid, but the way you parse it in
 * part 1 will likely work against you for part 2. Each cell in the grid (except for the last row)
 * contains a sequence of digits. The last row contains an operator (`+` or `*`) for each column.
 *
 * In part 1, the digits in each cell are simply parsed as an integer. You would naturally trim off
 * any spaces. However, in part 2, the spaces become significant, because cephalopod math turns out
 * to write numbers vertically, and spaces are ignored. So if you strip off the spaces, the digits
 * won't line up properly.
 *
 * So the first step is to parse the input into a grid of _strings_ rather than numbers, preserving
 * the spaces. To do this, you have to detect the column boundaries. This is done by scanning down
 * each column to see if it's blank in every row. If so, it's a column boundary. I produced an array
 * of column definition objects, each with a `start` and `end` index. Then I iterated over the rows
 * and sliced each one into cells based on those indices.
 *
 * The last row contains the operation to be performed on the values in each column. I popped that
 * row off the grid, trimmed each cell, and converted them to the functions that perform the actual
 * operations.
 *
 * With the grid properly parsed, it's now time to actually solve the two parts. For part 1, step 1
 * is to simply parse each cell into an integer. Then I performed a reduce operation over the rows,
 * applying the appropriate operation for each column. This produced an array of results, one per
 * column. Finally, I summed those results to get the answer for part 1.
 *
 * Part 2 is a bit more involved. For each column, I determined the width of the column (i.e., the
 * number of characters in each cell). Then, for each character position in the column, I built up
 * the operand by iterating over the rows and extracting the character at that position. Ignoring
 * any `0`, each digit encountered is appended to the operand. This produces an array of operands
 * for the column. I then applied the column's operation to those operands to get the column's
 * result. As with part 1, this resulted in a final array of results for the columns, which I then
 * summed to get the answer to part 2.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { grid, ops } = parse(input);
  return [ part1(grid, ops), part2(grid, ops) ];
};

/**
 * Parse the input into a grid of cell strings and an array of column operations.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsed grid and operations
 */
const parse = input => {
  // Break input into rows, handling any Windows line endings and removing the final blank line
  const rows = input
    .replaceAll('\r', '')
    .split('\n')
    .filter(Boolean);

  // Determine where the columns are
  const width = rows[0].length;
  const columnDefs = [];
  let lastBlank = -1;

  for (let col = 0; col < width; col++) {
    if (rows.every(row => row.charAt(col) === ' ')) {
      columnDefs.push({ start: lastBlank + 1, end: col });
      lastBlank = col;
    }
  }

  columnDefs.push({ start: lastBlank + 1, end: width });

  // Split the rows into cells based on the column definitions
  const grid = rows.map(row => {
    return columnDefs.map(({ start, end }) => row.slice(start, end));
  });

  // Extract the operations from the last row and convert to functions
  const ops = grid.pop().map(cell => OPS[cell.trim()]);

  return { grid, ops };
};

/**
 * Solve part 1.
 *
 * @param {string[][]} grid - the parsed grid
 * @param {Function[]} ops - the column operations
 * @returns {number} - the answer for part 1
 */
const part1 = (grid, ops) => {
  // Parse each cell as an integer
  grid = grid.map(
    row => row.map(
      cell => parseInt(cell.trim(), 10)
    )
  );
  // Apply the operations to each column, then sum the results
  return grid.reduce((acc, row) => {
    return acc.map((val, i) => ops[i](val, row[i]));
  }).reduce((a, b) => a + b);
};

/**
 * Solve part 2.
 *
 * @param {string[][]} grid - the parsed grid
 * @param {Function[]} ops - the column operations
 * @returns {number} - the answer for part 2
 */
const part2 = (grid, ops) => {
  // Iterate over each column
  const answers = ops.map((op, cMajor) => {
    const columnWidth = grid[0][cMajor].length;
    let operands = []

    // Iterate the characters in the column
    for (let cMinor = 0; cMinor < columnWidth; cMinor++) {
      operands.push(
        // Grab each digit and build up the operand
        grid.reduce((value, row) => {
          const chr = row[cMajor].charAt(cMinor);

          if (chr !== ' ') {
            // Found a digit; append it to the operand
            value = value * 10 + parseInt(chr, 10);
          }

          return value;
        }, 0)
      );
    }

    // Apply the operation to the operands for this column
    return operands.reduce((a, b) => op(a, b));
  });
  // Sum the results for all columns
  return answers.reduce((a, b) => a + b);
};
