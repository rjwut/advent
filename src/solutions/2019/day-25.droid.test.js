// Bypass the parser, just feed the droid the actual event objects
jest.mock('./day-25.parser', () => arg => arg);

const Droid = require('./day-25.droid');

describe('2019 Day 25 - droid', () => {
  let droid;

  beforeEach(() => {
    droid = new Droid();
  });

  test('We just started; it should map the room and pick a direction to go', () => {
    const exits = [ 'north', 'south', 'west' ];
    const command = droid.consume([
      { type: 'roomEntered', arg: 'Hull Breach' },
      { type: 'exitsListed', arg: exits.map(dir => '- ' + dir).join('\n') },
      { type: 'prompt' },
    ]);
    expect(exits.includes(command)).toBe(true);
    const hullBreach = droid.map.get('Hull Breach');
    expect(hullBreach.name).toBe('Hull Breach');
    expect([ ...hullBreach ]).toEqual([
      [ 'north', null ],
      [ 'south', null ],
      [ 'west', null ],
    ]);
  });

  test('Test phases one and two', () => {
    /*
     * Test conditions:
     *
     * - First room is the hull breach, with two exits.
     * - Make the first room the droid goes to the security checkpoint.
     * - Security checkpoint is a dead end.
     * - Make the other room off the hull breach the observatory.
     * - Observatory has eight safe items and is not a dead end.
     *
     * Expected droid behavior:
     *
     * 1. Move in any direction from the hull breach.
     * 2. Move back to the hull breach.
     * 3. Move to the only remaining unexplored exit.
     * 4. Pick up all eight items.
     * 5. Ignore unknown exit and move back to the security checkpoint.
     */
    const hullBreachExits = [ 'north', 'south' ];
    const hullBreachEvents = [
      { type: 'roomEntered', arg: 'Hull Breach' },
      { type: 'exitsListed', arg: hullBreachExits.map(dir => '- ' + dir).join('\n') },
      { type: 'prompt' },
    ];
    const securityCheckpointDir = droid.consume(hullBreachEvents);
    expect(hullBreachExits.includes(securityCheckpointDir)).toBe(true);
    const opposite = hullBreachExits.indexOf(securityCheckpointDir) === 0 ? 'south' : 'north';
    const securityCheckpointEvents = [
      { type: 'roomEntered', arg: 'Security Checkpoint' },
      { type: 'exitsListed', arg: '- ' + opposite },
      { type: 'prompt' },
    ];
    expect(droid.consume(securityCheckpointEvents)).toBe(opposite);
    expect(droid.consume(hullBreachEvents)).toBe(opposite);
    const items = [];

    for (let i = 0; i < 8; i++) {
      items.push(`item${i}`);
    }

    let nextEvents = [
      { type: 'roomEntered', arg: 'Observatory' },
      { type: 'exitsListed', arg: '- ' + securityCheckpointDir + '\n- ' + opposite },
      { type: 'itemsListed', arg: items.map(item => '- ' + item).join('\n') },
      { type: 'prompt' },
    ];

    for (let i = 0; i < 8; i++) {
      expect(droid.consume(nextEvents)).toBe(`take item${i}`);
      nextEvents = [
        { type: 'itemTaken', arg: `item${i}` },
        { type: 'prompt' },
      ];
    }

    // Phase two: Move to security checkpoint
    expect(droid.consume(nextEvents)).toBe(securityCheckpointDir);
    expect(droid.consume(hullBreachEvents)).toBe(securityCheckpointDir);
  });

  test('Test phase three', () => {
    /*
     * Test conditions:
     *
     * - Droid starts in security checkpoint with eight safe items.
     * - Security checkpoint has one exit, which leads to the
     *   pressure-sensitive floor.
     * - Pressure-sensitive floor accepts the droid only if it's holding items
     *   0, 4, and 7.
     *
     * Expected droid behavior:
     *
     * 1. Pick up all eight items.
     * 2. Attempt to move to the pressure-sensitive floor; get rejected.
     * 3. Continue dropping and picking up combinations of items until they try
     *    entering holding items 0, 4, and 7.
     * 4. No command is given after entering with those items.
     */
    const itemsOnFloor = [];

    for (let i = 0; i < 8; i++) {
      itemsOnFloor.push(`item${i}`);
    }

    /**
     * Build the events for getting rejected by security.
     *
     * @returns {Array} - the events for the rejection
     */
     const buildRejection = () => {
      const events = [
        ...pressureSensitiveFloorIntro,
      ];

      if (itemsOnFloor.length) {
        events.push(
          {
            type: 'itemsListed',
            arg: itemsOnFloor.map(item => '- ' + item).join('\n')
          },
        );
      }

      events.push({ type: 'prompt' });
      return events;
    };

    // Start out at the security checkpoint
    const securityCheckpointIntro = [
      { type: 'roomEntered', arg: 'Security Checkpoint' },
      { type: 'exitsListed', arg: '- west' },
    ];
    let nextEvents = [
      ...securityCheckpointIntro,
      { type: 'itemsListed', arg: itemsOnFloor.map(item => '- ' + item).join('\n') },
      { type: 'prompt' },
    ];

    // Pick up all items
    for (let i = 0; i < 8; i++) {
      expect(droid.consume(nextEvents)).toBe(`take item${i}`);
      itemsOnFloor.splice(itemsOnFloor.indexOf(`item${i}`), 1);
      nextEvents = [
        { type: 'itemTaken', arg: `item${i}` },
        { type: 'prompt' },
      ];
    }

    // Should immediately go to phase three: attempt to pass security
    expect(droid.consume(nextEvents)).toBe('west');
    const pressureSensitiveFloorIntro = [
      { type: 'roomEntered', arg: 'Pressure-Sensitive Floor' },
      { type: 'exitsListed', arg: '- east' },
      { type: 'rejected',    arg: 'lighter' },
      ...securityCheckpointIntro,
    ];

    nextEvents = buildRejection();
    let tries = 0;

    do {
      const command = droid.consume(nextEvents);

      if (!command) {
        // No command given; we should have the code now
        expect(droid.code).toBe('0123456789');
        break;
      }

      // Look at the command the droid has given and simulate the appropriate
      // events in response.
      const [ verb, object ] = command.split(' ');

      if (verb === 'drop') {
        // Droid is dropping an item
        itemsOnFloor.push(object);
        nextEvents = [
          { type: 'itemDropped', arg: object },
          { type: 'prompt' },
        ];
      } else if (verb === 'take') {
        // Droid is taking an item
        itemsOnFloor.splice(itemsOnFloor.indexOf(object), 1);
        nextEvents = [
          { type: 'itemTaken', arg: object },
          { type: 'prompt' },
        ];
      } else {
        // Droid is trying to pass security
        const itemsHeld = droid.inventory.toArray().sort().join();

        if (itemsHeld === 'item0,item4,item7') {
          // Droid has found the correct combination of items; give the code
          nextEvents = [
            { type: 'roomEntered',  arg: 'Pressure-Sensitive Floor' },
            { type: 'exitsListed',  arg: '- east' },
            { type: 'codeReceived', arg: '0123456789' },
          ];
        } else {
          // Droid has the wrong combination of items; reject it
          if (++tries > 256) {
            throw new Error('Should have gotten through by now');
          }

          nextEvents = buildRejection();
        }
      }
    } while (true);
  });
});
