const doTurn = require('./day-22.state');

let state;

beforeEach(() => {
  state = {
    me: { hp: 10, armor: 0, mana: 250, spent: 0 },
    boss: { hp: 13, damage: 8 },
    effects: [],
    hard: false,
    myTurn: true,
  };
});

describe('Player turn', () => {
  describe('Available mana restricts castable spells', () => {
    test('Can cast any spell with at least 229 mana', () => {
      state.me.mana = 229;
      expect(doTurn(state)).toEqual([
        // magic missile, drain, shield, poison, recharge
        { me: { hp: 10, armor: 0, mana: 176, spent:  53 }, boss: { hp:  9, damage: 8 }, effects: [], hard: false, myTurn: false },
        { me: { hp: 12, armor: 0, mana: 156, spent:  73 }, boss: { hp: 11, damage: 8 }, effects: [], hard: false, myTurn: false },
        { me: { hp: 10, armor: 7, mana: 116, spent: 113 }, boss: { hp: 13, damage: 8 }, effects: [ { spell: 'shield', turnsLeft: 6 }], hard: false, myTurn: false },
        { me: { hp: 10, armor: 0, mana:  56, spent: 173 }, boss: { hp: 13, damage: 8 }, effects: [ { spell: 'poison', turnsLeft: 6 }], hard: false, myTurn: false },
        { me: { hp: 10, armor: 0, mana:   0, spent: 229 }, boss: { hp: 13, damage: 8 }, effects: [ { spell: 'recharge', turnsLeft: 5 }], hard: false, myTurn: false },
      ]);
    });

    test('Can\'t cast recharge with less than 229 mana', () => {
      state.me.mana = 228;
      expect(doTurn(state)).toEqual([
        // magic missile, drain, shield, poison
        { me: { hp: 10, armor: 0, mana: 175, spent:  53 }, boss: { hp:  9, damage: 8 }, effects: [], hard: false, myTurn: false },
        { me: { hp: 12, armor: 0, mana: 155, spent:  73 }, boss: { hp: 11, damage: 8 }, effects: [], hard: false, myTurn: false },
        { me: { hp: 10, armor: 7, mana: 115, spent: 113 }, boss: { hp: 13, damage: 8 }, effects: [ { spell: 'shield', turnsLeft: 6 }], hard: false, myTurn: false },
        { me: { hp: 10, armor: 0, mana:  55, spent: 173 }, boss: { hp: 13, damage: 8 }, effects: [ { spell: 'poison', turnsLeft: 6 }], hard: false, myTurn: false },
      ]);
    });

    test('Can\'t cast poison with less than 173 mana', () => {
      state.me.mana = 172;
      expect(doTurn(state)).toEqual([
        // magic missile, drain, shield
        { me: { hp: 10, armor: 0, mana: 119, spent:  53 }, boss: { hp:  9, damage: 8 }, effects: [], hard: false, myTurn: false },
        { me: { hp: 12, armor: 0, mana:  99, spent:  73 }, boss: { hp: 11, damage: 8 }, effects: [], hard: false, myTurn: false },
        { me: { hp: 10, armor: 7, mana:  59, spent: 113 }, boss: { hp: 13, damage: 8 }, effects: [ { spell: 'shield', turnsLeft: 6 }], hard: false, myTurn: false },
      ]);
    });

    test('Can\'t cast shield with less than 113 mana', () => {
      state.me.mana = 112;
      expect(doTurn(state)).toEqual([
        // magic missile, drain
        { me: { hp: 10, armor: 0, mana: 59, spent: 53 }, boss: { hp:  9, damage: 8 }, effects: [], hard: false, myTurn: false },
        { me: { hp: 12, armor: 0, mana: 39, spent: 73 }, boss: { hp: 11, damage: 8 }, effects: [], hard: false, myTurn: false },
      ]);
    });

    test('Can\'t cast drain with less than 73 mana', () => {
      state.me.mana = 72;
      expect(doTurn(state)).toEqual([
        // magic missile
        { me: { hp: 10, armor: 0, mana: 19, spent: 53 }, boss: { hp: 9, damage: 8 }, effects: [], hard: false, myTurn: false },
      ]);
    });

    test('Can\'t cast any spells with less than 53 mana', () => {
      state.me.mana = 52;
      expect(doTurn(state)).toEqual([
        { me: { hp: 0, armor: 0, mana: 52, spent: 0 }, boss: { hp: 13, damage: 8 }, effects: [], hard: false, myTurn: true },
      ]);
    });
  });

  test('Can\'t cast any spells that are still active', () => {
    state.me.armor = 7;
    state.effects = [
      { spell: 'shield', turnsLeft: 1 },
      { spell: 'poison', turnsLeft: 2 },
    ];
    expect(doTurn(state)).toEqual([
      // Can cast shield (wears off this turn)
      // Can't cast poison (still active)
      // Can cast recharge (not active)
      { me: { hp: 10, armor: 0, mana: 197, spent:  53 }, boss: { hp:  6, damage: 8 }, effects: [ { spell: 'poison', turnsLeft: 1 } ], hard: false, myTurn: false },
      { me: { hp: 12, armor: 0, mana: 177, spent:  73 }, boss: { hp:  8, damage: 8 }, effects: [ { spell: 'poison', turnsLeft: 1 } ], hard: false, myTurn: false },
      { me: { hp: 10, armor: 7, mana: 137, spent: 113 }, boss: { hp: 10, damage: 8 }, effects: [ { spell: 'poison', turnsLeft: 1 }, { spell: 'shield', turnsLeft: 6 } ], hard: false, myTurn: false },
      { me: { hp: 10, armor: 0, mana:  21, spent: 229 }, boss: { hp: 10, damage: 8 }, effects: [ { spell: 'poison', turnsLeft: 1 }, { spell: 'recharge', turnsLeft: 5 } ], hard: false, myTurn: false },
    ]);
  });

  test('Recharging mana', () => {
    state.me.mana = 0;
    state.effects = [
      { spell: 'recharge', turnsLeft: 2 },
    ];
    expect(doTurn(state)).toEqual([
      // magic missile or drain, recharge effect occurs
      { me: { hp: 10, armor: 0, mana: 48, spent: 53 }, boss: { hp:  9, damage: 8 }, effects: [ { spell: 'recharge', turnsLeft: 1 } ], hard: false, myTurn: false },
      { me: { hp: 12, armor: 0, mana: 28, spent: 73 }, boss: { hp: 11, damage: 8 }, effects: [ { spell: 'recharge', turnsLeft: 1 } ], hard: false, myTurn: false },
    ]);
  });
});

describe('Boss turn', () => {
  beforeEach(() => {
    state.myTurn = false;
  });

  test('With no shield', () => {
    expect(doTurn(state)).toEqual([
      { me: { hp: 2, armor: 0, mana: 250, spent: 0 }, boss: { hp: 13, damage: 8 }, effects: [], hard: false, myTurn: true },
    ]);
  });

  test('With shield', () => {
    state.me.armor = 7;
    state.effects = [
      { spell: 'shield', turnsLeft: 2 },
    ];
    expect(doTurn(state)).toEqual([
      { me: { hp: 9, armor: 7, mana: 250, spent: 0 }, boss: { hp: 13, damage: 8 }, effects: [ { spell: 'shield', turnsLeft: 1 } ], hard: false, myTurn: true },
    ]);
  });

  test('Poison can kill the boss before they attack', () => {
    state.boss.hp = 3;
    state.effects = [
      { spell: 'poison', turnsLeft: 1 },
    ];
    expect(doTurn(state)).toEqual([
      { me: { hp: 10, armor: 0, mana: 250, spent: 0 }, boss: { hp: 0, damage: 8 }, effects: [], hard: false, myTurn: false, },
    ]);
  });
});

describe('Hard mode', () => {
  beforeEach(() => {
    state.me.mana = 72;
    state.hard = true;
  });

  test('Lose a hit point at the start of the player turn', () => {
    expect(doTurn(state)).toEqual([
      // magic missile
      { me: { hp: 9, armor: 0, mana: 19, spent: 53 }, boss: { hp: 9, damage: 8 }, effects: [], hard: true, myTurn: false },
    ]);
  });

  test('Do not lose a hit point at the start of the boss turn', () => {
    state.myTurn = false;
    expect(doTurn(state)).toEqual([
      // magic missile
      { me: { hp: 2, armor: 0, mana: 72, spent: 0 }, boss: { hp: 13, damage: 8 }, effects: [], hard: true, myTurn: true },
    ]);
  });

  test('Hard mode can kill you', () => {
    state.me.hp = 1;
    expect(doTurn(state)).toEqual([
      { me: { hp: 0, armor: 0, mana: 72, spent: 0 }, boss: { hp: 13, damage: 8 }, effects: [], hard: true, myTurn: true },
    ]);
  });
});
