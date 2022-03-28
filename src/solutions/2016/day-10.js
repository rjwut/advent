const { arraysEqual, match } = require('../util');

const RULES_REGEXP = /^value (?<value>\d+) goes to bot (?<botId>\d+)$|^bot (?<giverId>\d+) gives low to (?<lowRecipientType>bot|output) (?<lowRecipientId>\d+) and high to (?<highRecipientType>bot|output) (?<highRecipientId>\d+)$/gm;
const NUMERIC_SORT = (a, b) => a - b;

/**
 * # [Advent of Code 2016 Day 10](https://adventofcode.com/2016/day/10)
 *
 * I parsed the input with a regular expression and then build a rules object
 * which contained initialization rules (give chip {value} to bot {ID}) and
 * transfer rules (bot {ID} gives low chip to bot {ID} and high chip to bot
 * {ID}). The rules are stored in `Map`s so they can be easily looked up: init
 * rules are mapped under the chip value, while the transfer rules are mapped
 * under the ID of the robot holding the chips. Transfer rules and chip pairs
 * are represented as two-element arrays, where element `0` represents the low
 * chip and element `1` represents the high chip.
 *
 * I wrote a function that handles a bot receiving a chip. If it results in the
 * bot having two chips, it performs two actions:
 *
 * 1. If the two chips match the target chips we're seeking for part one, note
 *    the bot's ID; it's the answer to part one.
 * 2. Look up the transfer rule for that bot and execute it. This will result
 *    in `giveToBot()` being executed recursively if the rule indicates that a
 *    chip is to be given to another bot.
 *
 * With this in place, the simulation is pretty straightforward: Run all the
 * init rules, which will result in transfer rules getting invoked as the bots
 * receive their second chips. Once the init rules have completed, the outputs
 * contain the chips, so we can just multiply the ones in slots `0`, `1`, and
 * `2` to get the answer to part two.
 *
 * @param {string} input - the puzzle input
 * @param {Array} [chips=[17,61]] - the target chips we're looking for for part
 * one
 * @returns {Array} - the puzzle answers
 */
module.exports = (input, chips = [ 17, 61 ]) => {
  chips.sort(NUMERIC_SORT);
  const rules = parse(input);
  return simulate(rules, chips);
};

/**
 * Parses the input into a rules object:
 *
 * - `init` (`Map`): Maps chip values to the IDs of the bots that receive them.
 * - `xfer` (`Map`): Maps bot IDs to the chip transfer rules for that bot. The
 *   rules are an array, with element `0` containing the rule for the low chip,
 *   and element `1` containing the rule for the high chip. Each rule object
 *   looks like this:
 *   - `type` (`string`): Either `bot` or `output`
 *   - `id` (`number`): The ID of the bot or output to which the chip is to be
 *     transferred
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - the parsed rules
 */
const parse = input => {
  return match(input, RULES_REGEXP, {
    value: Number,
    botId: Number,
    giverId: Number,
    lowRecipientId: Number,
    highRecipientId: Number,
  }).reduce((rules, rule) => {
    if (rule.value === undefined) { // xfer rule
      rules.xfer.set(rule.giverId, [
        { type: rule.lowRecipientType, id: rule.lowRecipientId },
        { type: rule.highRecipientType, id: rule.highRecipientId },
      ]);
    } else { // init rule
      rules.init.set(rule.value, rule.botId);
    }

    return rules;
  }, { init: new Map(), xfer: new Map() });
};

/**
 * Runs the simulation according to the rules, and returns the puzzle answers.
 *
 * @param {Object} rules - the rules object
 * @param {Array} targetChips - the target chips we're looking for for part one
 * @returns {Array} - the puzzle answers
 */
const simulate = (rules, targetChips) => {
  const bots = new Map();
  const outputs = new Map();
  let part1;

  const giveToBot = (chip, botId) => {
    let bot = bots.get(botId);

    if (!bot) {
      bot = [];
      bots.set(botId, bot);
    }

    bot.push(chip);

    if (bot.length === 2) {
      bot.sort(NUMERIC_SORT);

      if (part1 === undefined && arraysEqual(bot, targetChips)) {
        part1 = botId;
      }

      const xferRule = rules.xfer.get(botId);
      xferRule.forEach((rule, i) => {
        if (rule.type === 'output') {
          outputs.set(rule.id, bot[i]);
        } else {
          giveToBot(bot[i], rule.id);
        }
      });
      bots.set(botId, []);
    }
  };

  for (const rule of rules.init.entries()) {
    giveToBot(rule[0], rule[1]);
  }

  const part2 = outputs.get(0) * outputs.get(1) * outputs.get(2);
  return [ part1, part2 ];
};
