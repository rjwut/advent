const FILE_POSITION_SORT = (a, b) => a.index - b.index;

/**
 * # [Advent of Code 2024 Day 9](https://adventofcode.com/2024/day/9)
 *
 * Given the different ways in which the file blocks can be organized in the two parts, I decided to
 * create two completely separate classes to represent the drive in each part. Each class has a
 * constructor that accepts the input string and parses it into the appropriate data structure. They
 * also both have a `pack()` method that moves the file blocks around according to the rules given
 * by that part of the puzzle. Finally, they both have a read-only `checksum` property that returns
 * the drive's checksum.
 *
 * ## Part 1
 *
 * ### Parsing
 *
 * Here, the file's blocks do not have to be contiguous, and the only piece of data that's of
 * interest for any one block is the ID of the file to which it belongs. So for this part, the drive
 * is represented as an array where each element contains either a file ID or `null` to represent an
 * empty block.
 *
 * ### Packing
 *
 * 1. Set `fromIndex` to the index of the last non-empty block.
 * 2. Set `toIndex` to the index of the first empty block.
 * 3. While `fromIndex` is greater than `toIndex`:
 *    1. Swap the blocks at `fromIndex` and `toIndex`.
 *    2. Set `fromIndex` to the index of the last non-empty block before the current `fromIndex`.
 *    3. Set `toIndex` to the index of the first empty block after the current `toIndex`.
 *
 * ### Checksum
 *
 * Iterate the non-empty blocks, multiply their indexes by their IDs, and sum the results.
 *
 * ## Part 2
 *
 * ### Parsing
 *
 * In this part, the file blocks must be contiguous. The drive is represented as a map of file
 * objects, where each file is keyed under its ID, and each file object has two properties: the
 * index of its first block (`index`) and the number of blocks it occupies (`size`).
 *
 * ### Packing
 *
 * 1. Set `fileId` to the last file ID.
 * 2. Loop:
 *    1. Get the file object for the current `fileId`; this is the file we want to move.
 *    2. Decrement `fileId`.
 *    3. Sort the file objects by increasing `index`.
 *    4. Iterate the sorted files:
 *       1. Compute the amount of space between the start of the current file and the end of the
 *          previous one.
 *       2. If the space is large enough for the file we want to move, and the starting index of
 *          the space is less than the index of the file we want to move, change that file's index
 *          to the starting index of the space, and stop iterating the sorted files.
 *    5. If `fileId` is `0`, stop the outer loop.
 *
 * ### Checksum
 *
 * The contribution of each file to the checksum is the sum of the indexes of each of the blocks is
 * occupies multiplied its ID. The sum of a series of integers between `a` and `b` inclusive is:
 *
 * ```
 * (b - a + 1) * ((a + b) / 2)
 * ```
 *
 * So we compute the indexes of the first and last blocks of the file, and multiply the formula
 * above by the file's ID to get its contribution to the checksum. We sum the contributions of all
 * files to produce the drive's checksum.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => [ Drive1, Drive2 ].map(DriveClass => {
  const drive = new DriveClass(input);
  drive.pack();
  return drive.checksum;
});

/**
 * Drive implementation for part 1, where file blocks need not be contiguous.
 */
class Drive1 {
  #blocks;

  /**
   * Creates the part 1 drive object.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    input = input.trim();
    let space = false;
    this.#blocks = [];

    for (let i = 0; i < input.length; i++) {
      const num = parseInt(input.charAt(i), 10);
      const block = space ? null : String(Math.floor(i / 2));

      for (let j = 0; j < num; j++) {
        this.#blocks.push(block);
      }

      space = !space;
    }
  }

  /**
   * Packs the file blocks according to part 1's rules.
   */
  pack() {
    let fromIndex = this.#blocks.findLastIndex(x => x);
    let toIndex = this.#blocks.indexOf(null);

    while (fromIndex > toIndex) {
      this.#blocks[toIndex] = this.#blocks[fromIndex];
      this.#blocks[fromIndex] = null;
      fromIndex = this.#blocks.findLastIndex(x => x, fromIndex - 1);
      toIndex = this.#blocks.indexOf(null, toIndex + 1);
    }
  }

  /**
   * @returns {number} - the drive checksum
   */
  get checksum() {
    return this.#blocks
      .slice(0, this.#blocks.indexOf(null))
      .reduce((sum, num, i) => sum + num * i, 0);
  }
}

/**
 * Drive implementation for part 2, where file blocks must be contiguous.
 */
class Drive2 {
  #files;

  /**
   * Creates the part 2 drive object.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    this.#files = new Map();
    input = input.trim();
    let index = 0;
    let space = false;
    let nextFileId = 0;

    for (let i = 0; i < input.length; i++) {
      const size = parseInt(input.charAt(i), 10);

      if (!space) {
        this.#files.set(nextFileId++, { index, size });
      }

      index += size;
      space = !space;
    }
  }

  /**
   * Packs the file blocks according to part 2's rules.
   */
  pack() {
    let fileId = this.#files.size - 1;

    do {
      const file = this.#files.get(fileId--);
      const spaceIndex = this.#findSpace(file.size, file.index);

      if (spaceIndex !== -1) {
        file.index = spaceIndex;
      }
    } while (fileId > 0);
  }

  /**
   * @returns {number} - the drive checksum
   */
  get checksum() {
    return [...this.#files.entries()].reduce(
      (checksum, [ id, { index, size } ]) => {
        const start = index;
        const end = index + size - 1;
        return checksum + (end - start + 1) * ((start + end) / 2) * id;
      },
      0
    );
  }

  /**
   * @returns {Object[]} - the files, sorted by index
   */
  get #sorted() {
    return [...this.#files.values()].sort(FILE_POSITION_SORT);
  }

  /**
   * Locates a contiguous space of at least the given size in the drive before the indicated index.
   *
   * @param {number} size - the size of the space to find
   * @param {number} beforeIndex - the index before which the space must be found
   * @returns {number} - the index of the space, or `-1` if no space was found
   */
  #findSpace(size, beforeIndex) {
    const sorted = this.#sorted;
    let index = 0;

    for (const file of sorted) {
      const spaceSize = file.index - index;

      if (spaceSize >= size && index < beforeIndex) {
        return index;
      }

      index = file.index + file.size;
    }

    return -1;
  }
}
