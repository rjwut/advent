const parser = require('./day-25.parser');

const CHUNKS = [
  `A loud, robotic voice says "Analysis complete! You may proceed." and you enter the cockpit.
Santa notices your small droid, looks puzzled for a moment, realizes what has happened, and radios your ship directly.
"Oh, hello! You should be able to get in by typing 0123456789 on the keypad at the main airlock."`,
  'You drop the mutex.',
  `== Hull Breach ==
You got in through a hole in the floor here. To keep your ship from also freezing, the hole has been sealed.`,
  `Doors here lead:
- north
- east
- south`,
  `Items here:
- mutex`,
  'Command?',
  'A loud, robotic voice says "Alert! Droids on this ship are lighter than the detected value!" and you are ejected back to the checkpoint.',
  'You take the mutex.',
].join('\n\n');

const EVENTS = [
  { type: 'codeReceived', arg: '0123456789' },
  { type: 'itemDropped', arg: 'mutex' },
  { type: 'roomEntered', arg: 'Hull Breach' },
  { type: 'exitsListed', arg: '- north\n- east\n- south' },
  { type: 'itemsListed', arg: '- mutex' },
  { type: 'prompt', arg: undefined },
  { type: 'rejected', arg: 'lighter' },
  { type: 'itemTaken', arg: 'mutex' },
];

describe('2019 Day 25 - parser', () => {
  test('Recognized events', () => {
    expect(parser(CHUNKS)).toEqual(EVENTS);
  });

  test('Unrecognized event', () => {
    expect(() => parser('Santa destroys you with a photon torpedo.'))
      .toThrow('Unrecognized section: Santa destroys you with a photon torpedo.');
  });
});
