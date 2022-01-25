const EVENT_REGEXPS = [
  { regexp: /typing (\d+) on/s,      type: 'codeReceived' },
  { regexp: /^You drop the (.+)\.$/, type: 'itemDropped'  },
  { regexp: /^== (.+) ==/s,          type: 'roomEntered'  },
  { regexp: /^Doors.+:\n(.+)$/s,     type: 'exitsListed'  },
  { regexp: /^Items h.+:\n(.+)$/s,   type: 'itemsListed'  },
  { regexp: /\?$/,                   type: 'prompt'       },
  { regexp: /this ship are (\S+)/s,  type: 'rejected'     },
  { regexp: /^You take the (.+)\.$/, type: 'itemTaken'    }, 
];

/**
 * Converts the given output from the Intcode computer into an array of event
 * objects. Each event object has two properties:
 *
 * - `type`: The event type, one of: `codeReceived`, `itemDropped`,
 *   `roomEntered`, `exitsListed`, `itemsListed`, `prompt`, `rejected`, or
 *   `itemTaken`
 * - `arg`: An argument for the event. The value depends on the event type.
 *
 * The Intcode computer is capable of producing output strings not recognized
 * by this parser, but my solution never commits the actions that cause those
 * strings to be output in the first place:
 *
 * - Responses to unrecognized or invalid commands
 * - Responses resulting from taking unsafe objects
 * - Responses to the `inv` command
 *
 * @param {string} output - the output from the Intcode computer
 * @returns {Array} - the generated event objects
 */
module.exports = output => chunkOutput(output).map(sectionToEvent);

/**
 * Breaks the output into sections, each of which produces a single event.
 *
 * @param {string} output - the output from the Intcode computer 
 * @returns {Array} - the sections
 */
const chunkOutput = output => {
  const lines = output.split('\n');
  const sections = [];

  while (lines.length) {
    const nonBlankIndex = lines.findIndex(line => line !== '');

    if (nonBlankIndex === -1) {
      break;
    }

    let blankIndex = lines.indexOf('', nonBlankIndex);

    if (blankIndex === -1) {
      blankIndex = lines.length;
    }

    sections.push(lines.splice(nonBlankIndex, blankIndex - nonBlankIndex).join('\n'));
  }

  return sections;
};

/**
 * Converts an output section to an event.
 *
 * @param {string} section - the section to convert
 * @returns {Object} - the generated event
 */
const sectionToEvent = section => {
  for (let eventObj of EVENT_REGEXPS) {
    const match = section.match(eventObj.regexp);

    if (match) {
      return { type: eventObj.type, arg: match.slice(1)[0] };
    }
  }

  throw new Error(`Unrecognized section: ${section}`);
};
