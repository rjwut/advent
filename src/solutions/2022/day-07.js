const { split } = require('../util');

const MAX_DIR_SIZE = 100_000;
const VOLUME_SIZE = 70_000_000;
const REQUIRED_FREE = 30_000_000;

/**
 * # [Advent of Code 2022 Day 7](https://adventofcode.com/2022/day/7)
 *
 * I went ahead and built the file system in memory. The first command is always `$ cd /`, so we
 * know we're starting at the root, which makes things easier. I created a variable named `cwd` to
 * track the current working `Directory` while parsing the input, and implemented `cd()`,
 * `mkdir()`, and `mkfile()` methods on it to simplify executing commands. Each time I added a file
 * to the file system, I added its size to all of its ancestor directories; thus, once the input is
 * processed, I already know the sizes of all the directories in the file system.
 *
 * I implemented `Directory.walk()` to make it easy to recursively iterate each `Directory` in the
 * file system and pass them one at a time into a given function. This made implementation of each
 * part of the puzzle easy:
 *
 * - For part 1, walk the tree and add up the sizes of all `Directory` entries whose sizes are no
 *   greater than `100_000`.
 * - For part 2, subtract the size of the root `Directory` from the volume size to get the current
 *   amount of free space on the volume. Subtract that from the system update size to get the
 *   amount of space you need to free up. Then walk the tree, keeping track of the smallest
 *   directory encountered that is at least as large as the space you need to free up.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
 module.exports = input => {
  const root = parse(input);
  return [ part1, part2 ].map(part => part(root));
};

/**
 * Constructs the directory tree from the input.
 *
 * @param {string} input - the puzzle input
 * @returns {Directory} - the root directory
 */
const parse = input => {
  const root = new Directory(null, '');
  let cwd = root;
  split(input).forEach(line => {
    const tokens = line.split(' ');

    switch (tokens[0]) {
      case '$':
        switch (tokens[1]) {
          case 'cd':
            cwd = cwd.cd(tokens[2]);
            break;

          case 'ls':
            break;

          default:
            throw new Error(`Unrecognized command: ${line}`);
        }

        break;

      case 'dir':
        cwd.mkdir(tokens[1]);
        break;

      default:
        cwd.mkfile(tokens[1], parseInt(tokens[0], 10));
    }
  });

  return root;
};

/**
 * Computes the answer to part 1.
 *
 * @param {Directory} root - the root directory
 * @returns {number} - the answer to part 1
 */
const part1 = root => {
  let size = 0;
  root.walk(dir => {
    if (dir.size <= MAX_DIR_SIZE) {
      size += dir.size;
    }
  });
  return size;
};

/**
 * Computes the answer to part 2.
 *
 * @param {Directory} root - the root directory
 * @returns {number} - the answer to part 2
 */
const part2 = root => {
  const freeSpace = VOLUME_SIZE - root.size;
  const deleteSize = REQUIRED_FREE - freeSpace;
  let bestDir = { size: Infinity };
  root.walk(dir => {
    if (dir.size >= deleteSize && dir.size < bestDir.size) {
      bestDir = dir;
    }
  });
  return bestDir.size;
};

/**
 * A file or directory.
 */
class Entry {
  #parent;
  #name;

  /**
   * @param {Directory|null} parent - the parent directory, or `null` if this is the root
   * @param {string} name - the entry's name
   */
  constructor(parent, name) {
    this.#parent = parent;
    this.#name = name;
  }

  /**
   * @returns {Directory|null} - the parent directory, or `null` if this is the root
   */
  get parent() {
    return this.#parent;
  }

  /**
   * @returns {string} - the name of this `Entry`
   */
  get name() {
    return this.#name;
  }
}

/**
 * A directory in the file system.
 */
class Directory extends Entry {
  #children;
  #size;

  /**
   * @param {Directory|null} parent - the parent directory, or `null` if this is the root
   * @param {string} name - the directory's name
   */
  constructor(parent, name) {
    super(parent, name);
    this.#children = [];
    this.#size = 0;
  }

  /**
   * @returns {number} - the size of all files under this directory (including subdirectories)
   */
  get size() {
    return this.#size;
  }

  /**
   * Returns the `Directory` indicated by the given name:
   *
   * - `/`: The root `Directory`
   * - `..`: This `Directory`'s parent
   * - other: The child `Directory` of this `Directory` with the given name
   *
   * @param {string} name - name indicating the `Directory` to return
   * @returns {Directory} - the named `Directory`
   */
  cd(name) {
    if (name === '/') {
      let cwd = this;

      while (cwd.parent) {
        cwd = cwd.parent;
      }

      return cwd;
    }

    if (name === '..') {
      if (this.parent) {
        return this.parent;
      }

      throw new Error('Root directory has no parent');
    }

    const dir = this.#dir(name);

    if (dir) {
      return dir;
    }

    throw new Error(`No such directory: ${this.path}/${name}`);
  }

  /**
   * Creates a subdirectory under this `Directory`.
   *
   * @param {string} name - the name of the subdirectory
   */
  mkdir(name) {
    const dir = this.#dir(name);

    if (dir) {
      throw new Error(`Directory already exists: ${dir.path}`);
    }

    this.#children.push(new Directory(this, name));
  }

  /**
   * Creates a `File` under this `Directory`.
   *
   * @param {string} name - the name of the `File`
   * @param {number} size - the `File`'s size
   */
  mkfile(name, size) {
    this.#children.push(new File(this, name, size));
    let cwd = this;

    do {
      cwd.#size += size;
      cwd = cwd.parent;
    } while (cwd);
  }

  /**
   * Recursively builds a string representation of the directory tree, rooted at this `Directory`.
   * This method isn't used by the solution, but was useful for debugging.
   *
   * @param {number} [indent=0] - the indentation depth
   * @returns {string} - the string representation of the directory tree
   */
  toString(indent = 0) {
    const chunks = [ `${'  '.repeat(indent)}- ${this.name || '/'} (dir)` ];
    const nextIndent = indent + 1;
    this.#children.forEach(child => {
      chunks.push(child.toString(nextIndent));
    });
    return chunks.join('\n');
  }

  /**
   * Executes the given function for this `Directory` and every descendant `Directory`.
   *
   * @param {Function} fn - the function to execute, passing in `Directory` instances one at a time
   */
  walk(fn) {
    fn(this);
    this.#children.filter(child => child instanceof Directory)
      .forEach(dir => dir.walk(fn));
  }

  /**
   * Finds the subdirectory with the given name.
   *
   * @param {string} name - the name of the subdirectory
   * @returns {Directory|undefined} - the subdirectory, or `undefined` if no such `Directory` is
   * found
   */
  #dir(name) {
    return this.#children.find(child => child instanceof Directory && child.name === name);
  }
}

/**
 * A file in the file system.
 */
class File extends Entry {
  #size;

  /**
   * @param {Directory} parent - the file's parent directory
   * @param {string} name - the file name
   * @param {number} size - the file's size
   */
  constructor(parent, name, size) {
    super(parent, name);
    this.#size = size;
  }

  /**
   * @returns {number} - the file's size
   */
  get size() {
    return this.#size;
  }

  /**
   * Returns a string representing this file in a directory tree. This is called by
   * `Directory.toString()`.
   *
   * @param {number} indent - the indentation level for this entry
   * @returns {string} - the string representation of this `File`
   */
  toString(indent) {
    return `${'  '.repeat(indent)}- ${this.name} (file, size=${this.#size})`;
  }
}
