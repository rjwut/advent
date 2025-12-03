const Session = require('./session');

/**
 * Writes the argument to the session cookie file.
 */
const run = async () => {
  const session = await Session.load();

  const printUsage = () => {
    console.log(`
Usage: npm run session {sessionId}[ {contactInfo}]

sessionId    The session cookie value from adventofcode.com
contactInfo  Your contact information (e.g. email address), to be used by
             Advent of Code to contact you in case of issues. Optional if
             provided previously, required otherwise. Use quotes if it contains
             any space characters.
`);
  };

  if (process.argv.length < 3) {
    console.error('You must specify a session cookie value.');
    printUsage();
    process.exit(1);
  }

  if (!session.contact && process.argv.length < 4) {
    console.error('You must provide contact information.');
    printUsage();
    process.exit(1);
  }

  try {
    const [ , , sessionId, contact = session.contact ] = process.argv;
    await session.set(sessionId, contact);
    console.log('Saved to input/.session');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
