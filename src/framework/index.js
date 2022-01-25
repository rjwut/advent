const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const MASTHEAD = require('./masthead');
const fancyDigits = require('./fancy-digits');
const fetchInput = require('./fetch-input');
const AnsiWriter = require('./ansi-writer');

const FIRST_AOC_YEAR = 2015;
const SOLUTIONS_DIR = path.join(__dirname, '..', 'solutions');
const YEAR_REGEXP = /^\d{4}$/;

const stdout = new AnsiWriter();
const stderr = new AnsiWriter(process.stderr);

const fail = msg => {
  stderr
    .style(AnsiWriter.RED, AnsiWriter.BOLD)
    .write(msg + '\n')
    .resetStyle();
  process.exit(1);
};

/**
 * Prints Advent of Code answers.
 */
const run = async () => {
  const validYears =
    (await fsp.readdir(SOLUTIONS_DIR, { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory() && YEAR_REGEXP.test(dirent.name))
      .map(dirent => dirent.name)
      .sort();
  const args = process.argv.slice(2);

  let year, day;

  if (args.length === 0) {
    // No arguments, run the most recent day of the most recent year
    year = validYears[validYears.length - 1];
    day = await getLastDayForYear(year);
  } else if (args[0] !== '*') { // Either a year, a day, or both has been specified
    if (args.length === 1) {
      // One argument:
      // If it's an asterisk, run all days of all years.
      // If it's a year, run the most recent day of that year.
      // If it's a day, run that day of the most recent year.
      let value;

      try {
        value = parseInt(args[0], 10);
      } catch {
        fail(`Could not parse argument: ${args[0]}`);
      }

      if (value >= FIRST_AOC_YEAR) { // year
        year = value;

        if (!validYears.includes(year.toString())) {
          fail(`Invalid year: ${year}`);
        } else if (args.length === 1) {
          day = await getLastDayForYear(year);

          if (day === 0) {
            fail(`No input found for year: ${year}`);
          }
        }
      } else { // day
        if (day < 1 || day > 25) {
          fail(`Invalid day: ${day}`);
        }

        year = validYears[validYears.length - 1];
        day = value;
      }
    } else {
      // Two arguments:
      // First argument is the year.
      // If the second is an asterisk, run all the days of the specified year.
      // If both are numbers, run the specified day of the specified year.
      try {
        year = parseInt(args[0], 10);
      } catch {
        fail(`Could not parse year: ${args[0]}`);
      }

      if (!validYears.includes(year.toString())) {
        fail(`Invalid year: ${year}`);
      }

      if (args[1] !== '*') {
        day = parseInt(args[1], 10);

        if (day < 1 || day > 25) {
          fail(`Invalid day: ${day}`);
        }
      }
    }
  }

  stdout.write(MASTHEAD);

  if (year === undefined) {
    for (const year of validYears) {
      await runYear(year, stdout);
    }
  } else if (day === undefined) {
    await runYear(year, stdout);
  } else {
    stdout.write(fancyDigits(year) + '\n');
    await runDay(year, day, stdout);
  }
};

/**
 * Returns the last day for the given year where a solution exists.
 *
 * @param {number} year - the year to search
 * @returns {number} - the last day where solution exists, or `0` if no input
 * is found
 */
const getLastDayForYear = async year => {
  for (let day = 25; day > 0; day--) {
    const moduleName = `day-${String(day).padStart(2, '0')}`;
    const file = path.join(SOLUTIONS_DIR, String(year), moduleName + '.js');

    try {
      await fsp.access(file, fs.F_OK);
      return day;
    } catch {
      // do nothing
    }
  }

  return 0;
};

/**
 * Runs all solutions for the given year and prints out the results.
 *
 * @param {string} year - the year to run
 */
const runYear = async (year) => {
  stdout.write(fancyDigits(year) + '\n');

  for (let day = 1; day < 26; day++) {
    try {
      await runDay(year, day);
    } catch (err) {
      fail(err.stack);
    }
  }
};

/**
 * Runs the solution for a given day and prints out the results.
 *
 * @param {string} year - the year to run
 * @param {number} day - the day to run
 */
const runDay = async (year, day) => {
  day = String(day)
  const moduleName = `day-${day.padStart(2, '0')}`;
  const modulePath = path.join(SOLUTIONS_DIR, String(year), moduleName + '.js');

  try {
    await fsp.access(modulePath, fs.F_OK)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    return;
  }

  const input = await fetchInput(year, day);
  const dayModule = require(`../solutions/${year}/${moduleName}`);
  stdout
    .write('Day ')
    .style(AnsiWriter.FG_YELLOW, AnsiWriter.BOLD)
    .write(day.padStart(2, ' '))
    .resetStyle();
  const answers = await dayModule(input);
  stdout
    .write(', part ')
    .style(AnsiWriter.FG_YELLOW, AnsiWriter.BOLD)
    .write('1')
    .resetStyle()
    .write(': ')
    .style(AnsiWriter.FG_GREEN, AnsiWriter.BOLD)
    .write(answers[0])
    .resetStyle()
    .write('\n        part ')
    .style(AnsiWriter.FG_YELLOW, AnsiWriter.BOLD)
    .write('2')
    .resetStyle()
    .write(': ')
    .style(AnsiWriter.FG_GREEN, AnsiWriter.BOLD)
    .write(answers[1])
    .resetStyle()
    .write('\n');
}

run();
