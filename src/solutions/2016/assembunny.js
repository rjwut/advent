const { split } = require('../util')

const REG_NAMES = new Set([ 'a', 'b', 'c', 'd' ]);
const OPERATIONS = {
  cpy: (ctx, args) => {
    ctx.regs[args[1]] = ctx.valueOf(args[0]);
    return 1;
  },
  inc: (ctx, args) => {
    ctx.regs[args[0]]++;
    return 1;
  },
  dec: (ctx, args) => {
    ctx.regs[args[0]]--;
    return 1;
  },
  jnz: (ctx, args) => {
    return ctx.valueOf(args[0]) ? ctx.valueOf(args[1]) : 1;
  },
};

module.exports = input => {
  const program = parse(input);
  const ctx = {
    regs: Object.fromEntries([ ...REG_NAMES ].map(key => [ key, 0 ])),
    pointer: 0,
    valueOf: value => typeof value === 'string' ? ctx.regs[value] : value,
  };
  return {
    ctx,
    run: () => run(program, ctx),
  };
};

const parse = input => split(input).map(line => {
  const parts = line.split(' ');
  const args = parts.slice(1).map(arg => REG_NAMES.has(arg) ? arg: parseInt(arg, 10));
  return {
    op: parts[0],
    args,
  };
});

const run = (program, ctx) => {
  do {
    const instruction = program[ctx.pointer];
    ctx.pointer += OPERATIONS[instruction.op](ctx, instruction.args);
  } while (ctx.pointer >= 0 && ctx.pointer < program.length);
};
