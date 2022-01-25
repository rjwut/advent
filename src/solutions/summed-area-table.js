/**
 * Uses a
 * [summed-area table](https://en.wikipedia.org/wiki/Summed-area_table) to
 * allow you to rapidly find the sum of a rectangular block of cells in a
 * two-dimensional array of values.
 */
class SummedAreaTable {
  #sumTable;

  /**
   * Builds a new `SummedArrayTable` based on the given two-dimensional array
   * of values.
   *
   * @param {Array} table - the two-dimensional array of values
   */
  constructor(table) {
    this.#sumTable = new Array(table.length);

    for (let r = 0; r < table.length; r++) {
      const tableRow = table[r];
      const sumTableRow = new Array(tableRow.length);
      this.#sumTable[r] = sumTableRow;

      for (let c = 0; c < tableRow.length; c++) {
        sumTableRow[c] = tableRow[c] + this.#lookupSum(r, c - 1) +
        this.#lookupSum(r - 1, c) - this.#lookupSum(r - 1, c - 1);
      }
    }
  }

  /**
   * Compute the sum of the values stored in the block of cells with its
   * upper-left corner at the given coordinates and which has the indicated
   * dimensions.
   *
   * @param {number} r - the row of the block's upper-left corner
   * @param {number} c - the column of the block's upper-left corner
   * @param {number} width - the block's width
   * @param {number} height - the block's height
   * @returns {number} - the sum of the values in the block
   */
  getSum(r, c, width, height) {
    const r0 = r - 1;
    const c0 = c - 1;
    const r1 = r + height - 1;
    const c1 = c + width - 1;
    return this.#lookupSum(r1, c1) + this.#lookupSum(r0, c0) -
      this.#lookupSum(r1, c0) - this.#lookupSum(r0, c1);
  }

  /**
   * Looks up a value in the sum table. If the given coordinates fall above the
   * top or left of the left edge of the table, the value `0` is returned.
   *
   * @param {number} r - the row of the value to look up
   * @param {number} c - the column of the value to look up
   * @returns {number} - the value at the given coordinates, or `0` if it's off
   * the top or left edge of the table
   */
  #lookupSum(r, c) {
    if (r < 0 || c < 0) {
      return 0;
    }

    return this.#sumTable[r][c];
  }
}

module.exports = SummedAreaTable;
