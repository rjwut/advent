const fs = require('fs/promises');
const path = require('path');

/**
 * Writes the argument to the session cookie file.
 */
const run = async () => {
  if (process.argv.length < 3) {
    console.error('You must specify a session cookie value.');
    process.exit(1);
  }

  try {
    const cookie = process.argv[2];
    const cookieFile = path.join(__dirname, '..', '..', 'input', '.session');
    await fs.writeFile(cookieFile, cookie);
    console.log('Session cookie saved to input/.session');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
