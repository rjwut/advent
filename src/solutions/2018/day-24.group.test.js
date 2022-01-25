const Group = require('./day-24.group');

describe('Day 24 - groups', () => {
  test('Parser', () => {
    const group = new Group('foo', '17 units each with 47 hit points (weak to lint, earwax; immune to tuna) with an attack that does 3 emotional damage at initiative 2');
    expect(group.faction).toBe('foo');
    expect(group.units).toBe(17);
    expect(group.hitPoints).toBe(47);
    expect(group.getDamageMultiplier('lint')).toBe(2);
    expect(group.getDamageMultiplier('earwax')).toBe(2);
    expect(group.getDamageMultiplier('tuna')).toBe(0);
    expect(group.getDamageMultiplier('decompression')).toBe(1);
    expect(group.attackDamage).toBe(3);
    expect(group.damageType).toBe('emotional');
    expect(group.initiative).toBe(2);
  });

  describe('Example battle', () => {
    let immune1, immune2, infection1, infection2, groups;

    beforeEach(() => {
      immune1 = new Group('Immune System', '17 units each with 5390 hit points (weak to radiation, bludgeoning) with an attack that does 4507 fire damage at initiative 2');
      immune2 = new Group('Immune System', '989 units each with 1274 hit points (immune to fire; weak to bludgeoning, slashing) with an attack that does 25 slashing damage at initiative 3');
      infection1 = new Group('Infection', '801 units each with 4706 hit points (weak to radiation) with an attack that does 116 bludgeoning damage at initiative 1');
      infection2 = new Group('Infection', '4485 units each with 2961 hit points (immune to radiation; weak to fire, cold) with an attack that does 12 slashing damage at initiative 4');
      groups = [ immune1, immune2, infection1, infection2 ];
    });

    const toJSON = groupArray => groupArray.map(group => group.toJSON());

    test('Target selection priority', () => {
      groups.sort(Group.TARGET_SELECTION_PRIORITY_SORT);
      expect(toJSON(groups)).toEqual(toJSON([ infection1, immune1, infection2, immune2 ]));
    });

    test('Target selection', () => {
      let targets = [ immune1, immune2 ];
      expect(infection1.chooseTarget(targets)).toEqual(immune2);
      expect(targets).toEqual([ immune1 ]);
      targets = [ infection1, infection2 ];
      expect(immune2.chooseTarget(targets)).toEqual(infection2);
      expect(targets).toEqual([ infection1 ]);
    });

    test('Attack priority', () => {
      groups.sort(Group.ATTACK_PRIORITY_SORT);
      expect(toJSON(groups)).toEqual(toJSON([ infection2, immune2, immune1, infection1 ]));
    });

    test('Damage computation', () => {
      expect(immune1.computeDamage(infection1)).toBe(185832);
      expect(immune2.computeDamage(infection1)).toBe(185832);
      expect(immune1.computeDamage(infection2)).toBe(53820);
      expect(immune2.computeDamage(infection2)).toBe(107640);
      expect(infection1.computeDamage(immune1)).toBe(76619);
      expect(infection2.computeDamage(immune1)).toBe(153238);
      expect(infection1.computeDamage(immune2)).toBe(24725);
      expect(infection2.computeDamage(immune2)).toBe(24725);
    });

    test('Attacks', () => {
      const unitsBefore = groups.map(group => group.units);
      immune2.computeDamage(infection2, true);
      infection1.computeDamage(immune2, true)
      infection2.computeDamage(immune1, true);
      immune1.computeDamage(infection1, true);
      const unitsAfter = groups.map(group => group.units);
      const killed = unitsAfter.map((units, index) => unitsBefore[index] - units);
      expect(killed).toEqual([ 17, 84, 4, 51 ]);
      expect(immune1.alive).toBe(false);
    });

    test('Boost', () => {
      immune1.boost(1570);
      immune2.boost(1570);
      expect(immune1.attackDamage).toBe(6077);
      expect(immune2.attackDamage).toBe(1595);
    });
  });
});
