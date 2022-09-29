const SPELLS = [
  {
    name: 'missile',
    cost: 53,
    onCast: ({ boss }) => {
      boss.hp -= 4;
    },
  },
  {
    name: 'drain',
    cost: 73,
    onCast: ({ me, boss }) => {
      boss.hp -= 2;
      me.hp += 2;
    },
  },
  {
    name: 'shield',
    cost: 113,
    onCast: ({ me }) => {
      me.armor += 7;
    },
    onEnd: ({ me }) => {
      me.armor -= 7;
    },
    duration: 6,
  },
  {
    name: 'poison',
    cost: 173,
    onTurn: ({ boss }) => {
      boss.hp -= 3;
    },
    duration: 6,
  },
  {
    name: 'recharge',
    cost: 229,
    onTurn: ({ me }) => {
      me.mana += 101;
    },
    duration: 5,
  },
];
const SPELL_LOOKUP = Object.fromEntries(
  SPELLS.map(spell => [ spell.name, spell ])
);

/**
 * Returns an array containing the possible next states from the given current
 * state. A state object has the following schema:
 *
 * - `me` (`Object`)
 *   - `hp` (`number`)
 *   - `armor` (`number`)
 *   - `mana` (`number`)
 *   - `spent` (`number`)
 * - `boss` (`Object`)
 *   - `hp` (`number`)
 *   - `damage` (`number`)
 * - `effects` (`Array<Object>`): Currently active effects:
 *   - `spell` (`string`)
 *   - `turnsLeft` (`number`)
 * - `hard` (`boolean`): Whether we're on hard difficulty
 * - `myTurn` (`boolean`): Whether it's the player's turn
 *
 * @param {Object} state - the current game state
 * @returns {Array<Object>} - the possible next states
 */
module.exports = state => {
  /**
   * Handles effect actions on beginning of turn or wearing off.
   */
  const processEffects = () => {
    state.effects.forEach(effect => {
      const spell = SPELL_LOOKUP[effect.spell];
      spell.onTurn?.(state);
      effect.turnsLeft--;

      if (effect.turnsLeft === 0) {
        spell.onEnd?.(state);
      }
    });
    state.effects = state.effects.filter(effect => effect.turnsLeft > 0);
  };

  /**
   * Determines what spells the player can cast and what next states would
   * result.
   *
   * @returns {Array<Object>} - the resulting states
   */
  const castSpell = () => {
    const canCast = spell => state.me.mana >= spell.cost && (
      !spell.duration || !state.effects.find(effect => effect.spell === spell.name)
    );
    const castableSpells = SPELLS.filter(canCast);

    if (!castableSpells.length) {
      state.me.hp = 0;
      return [ state ];
    }

    return castableSpells.map(spell => {
      const clonedState = cloneState(state);
      clonedState.me.mana -= spell.cost;
      clonedState.me.spent += spell.cost;
      spell.onCast?.(clonedState);
  
      if (spell.duration) {
        clonedState.effects.push({
          spell: spell.name,
          turnsLeft: spell.duration,
        });
      }
  
      return clonedState;
    });
  };

  /**
   * Applies the boss's attack.
   *
   * @returns {Array<Object>} - the resulting state
   */
  const bossAttack = () => {
    const damage = Math.max(state.boss.damage - state.me.armor, 1);
    state.me.hp -= damage;
    state.myTurn = !state.myTurn;
    return [ state ];
  };

  /**
   * Clones the current state.
   *
   * @returns {Object} - the clone
   */
  const cloneState = () => ({
    me: { ...state.me },
    boss: { ...state.boss },
    effects: state.effects.map(effect => ({ ...effect })),
    hard: state.hard,
    myTurn: !state.myTurn,
  });

  // ---- start of turn handling code ----

  // Handle hard mode
  if (state.hard && state.myTurn) {
    state.me.hp--;

    if (state.me.hp <= 0) {
      return [ state ];
    }
  }

  processEffects();

  // Did the boss die from poison?
  if (state.boss.hp <= 0) {
    return [ state ];
  }

  return (state.myTurn ? castSpell : bossAttack)();
};
