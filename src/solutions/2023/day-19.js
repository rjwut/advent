const { match } = require('../util');
const Range = require('../range');
const { add, multiply } = require('../math2');

const WORKFLOW_REGEXP = /^(?<id>[a-z]+){(?<rules>.+)}$/gm;
const PART_REGEXP = /^{x=(?<x>\d+),m=(?<m>\d+),a=(?<a>\d+),s=(?<s>\d+)}$/gm;

/**
 * # [Advent of Code 2023 Day 19](https://adventofcode.com/2023/day/19)
 *
 * I broke the workflow system down into a bunch of classes; see their comments for details on how
 * each one operates.
 *
 * Part one isn't terribly difficult, but it can take a little time to get all the parsing and
 * conditional testing up and running. One thing that helps is to represent the match condition for
 * each rule as a range of matching values; if the value for that field for a part is within the
 * range, it matches. This comes in _very_ handy later.
 *
 * Part two seems like something of a callback to [day 5](https://adventofcode.com/2023/day/5), in
 * that instead of just running individual parts through the workflows, we're now working with
 * ranges of part field values. I created a separate class to track ranges. I then performed a
 * search through the decision tree described by the workflows. Each rule can either match the
 * entire currently available range for a part value, match it partially, or not match it at all.
 * If it matches partially, you split that range and pursue a separate search tree branch for each;
 * otherwise the branch just continues with the one range. Whenever a branch ends with a part being
 * accepted, I multiply together the sizes of all the value ranges and add the product to an
 * `accepted` array. Once all branches have been searched, I sum the values in the `accepted` array
 * to get the answer.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const { manager, parts } = parse(input);
  return [
    manager.sortParts(parts),
    manager.computePossibleCombinations(),
  ];
};

/**
 * Parses the input into a `WorkflowManager` and an array of parts.
 *
 * @param {string} input - the puzzle input
 * @returns {Object} - contains the parsed results
 */
const parse = input => {
  const manager = new WorkflowManager(match(input, WORKFLOW_REGEXP));
  const parts = match(input, PART_REGEXP, { x: Number, m: Number, a: Number, s: Number });
  return { manager, parts };
};

/**
 * Manages the list of workflows.
 */
class WorkflowManager {
  #workflows;

  /**
   * Builds the `Workflow` objects from the input match records.
   *
   * @param {Array<Object>} records - the `RegExp` match records corresponding to the workflows
   */
  constructor(records) {
    this.#workflows = new Map();
    records.forEach(record => {
      const workflow = new Workflow(record);
      this.#workflows.set(workflow.id, workflow);
    });
  }

  /**
   * Solves part one of the puzzle. Every part, when run through the `Workflow`s, is eventually
   * accepted or rejected; this filters the parts list down to those that are accepted, then sums
   * all the values of the accepted parts.
   *
   * @param {Array<Object>} parts - the parts to sort
   * @returns {number} - the answer to part one
   */
  sortParts(parts) {
    return add(
      parts.filter(part => this.#sortPart(part))
        .map(part => add(Object.values(part)))
    );
  }

  /**
   * Solves part two of the puzzle. This searches the descision tree described by the `Workflow`s
   * to find all accepted ranges of part field values at the end of each branch. It then multiplies
   * together the sizes of all the ranges at each branch to find the number of combinations of
   * field values that can reach that branch, then adds them all together to get the answer.
   *
   * @returns {number} - the answer to part two
   */
  computePossibleCombinations() {
    const accepted = [];
    const stack = [
      {
        workflowId: 'in',
        ranges: new FieldRanges(),
      },
    ];

    do {
      const { workflowId, ranges } = stack.pop();
      const workflow = this.#workflows.get(workflowId);
      workflow.nextStates(ranges).forEach(state => {
        if (state.workflowId) {
          stack.push(state);
        } else if (state.accepted) {
          accepted.push(state.ranges.combinations);
        }
      });
    } while (stack.length > 0);

    return add(accepted);
  }

  /**
   * Runs the given part through the workflow system and returns whether or not it was ultimately
   * accepted.
   *
   * @param {Object} part - the part to sort
   * @returns {boolean} - whether or not the part was accepted
   */
  #sortPart(part) {
    let workflowId = 'in';

    do {
      const workflow = this.#workflows.get(workflowId);
      const rule = workflow.evaluate(part);

      if (!rule.workflowId) {
        return rule.accepted;
      }

      workflowId = rule.workflowId;
    } while (true);
  }
}

/**
 * Represents a single workflow.
 */
class Workflow {
  #id;
  #rules;

  /**
   * Parses the given rules string into an array of `Rule` objects.
   *
   * @param {Object} param0 - the `RegExp` match record for the workflow
   * @param {string} param0.id - the workflow ID
   * @param {string} param0.rules - the workflow rules string
   */
  constructor({ id, rules }) {
    this.#id = id;
    this.#rules = rules.split(',').map(ruleStr => new Rule(ruleStr));
  }

  /**
   * @returns {string} - the workflow ID
   */
  get id() {
    return this.#id;
  }

  /**
   * Evaluates the given part against this `Workflow`'s `Rule`s and returns the first `Rule` that
   * matches.
   *
   * @param {Object} part - the part to evaluate
   * @returns {Rule} - the first matching `Rule`
   */
  evaluate(part) {
    return this.#rules.find(rule => rule.matches(part));
  }

  /**
   * Accepts a `FieldRanges` object and returns an array of the next states to pursue in the tree
   * search to find all combinations of part field values. The returned objects have the following
   * properties:
   *
   * - `ranges: FieldRanges`: The part field ranges for the next state.
   * - `accepted?: boolean`: Present if the part field ranges for this state are accepted or
   *   rejected; otherwise, `workflowId` will be present instead.
   * - `workflowId?: string`: Present if the part field ranges for this state should be redirected
   *   to another `Workflow`; otherwise, `accepted` will be present instead.
   *
   * @param {FieldRanges} ranges - the part field ranges for the current state
   * @returns {Array<Object>} - the next states to pursue in the tree search
   */
  nextStates(ranges) {
    let nextStates = [];

    for (const rule of this.#rules) {
      let noMatch;
      rule.nextStates(ranges).forEach(state => {
        if (state.workflowId || 'accepted' in state) {
          nextStates.push(state);
        } else {
          noMatch = state.ranges;
        }
      });

      if (!noMatch) {
        break;
      }

      ranges = noMatch;
    }

    return nextStates;
  }
}

/**
 * Represents a single rule in a `Workflow`.
 */
class Rule {
  #condition;
  #accepted;
  #workflowId;

  /**
   * Parses a rule string.
   *
   * @param {string} ruleStr - the rule string
   */
  constructor(ruleStr) {
    const parts = ruleStr.split(':');

    if (parts.length === 2) {
      this.#condition = new Condition(parts[0]);
      this.#parseAction(parts[1]);
    } else {
      this.#parseAction(ruleStr);
    }
  }

  /**
   * @returns {boolean|undefined} - whether or not this rule accepts the part if it matches, or
   * `undefined` if it redirects the part to another workflow instead
   */
  get accepted() {
    return this.#accepted;
  }

  /**
   * @returns {string|undefined} - the ID of the workflow to redirect the part to if it matches, or
   * `undefined` if this rule accepts or rejects the part instead
   */
  get workflowId() {
    return this.#workflowId;
  }

  /**
   * Evaluates whether this `Rule` matches the given part.
   *
   * @param {Object} part - the part to test
   * @returns {boolean} - `true` if the `Rule` matches the part; `false` otherwise
   */
  matches(part) {
    return !this.#condition || this.#condition.evaluate(part);
  }

  /**
   * Accepts a `FieldRanges` object and returns an array of the next states to pursue in the tree
   * search to find all combinations of part field values. The returned objects have the following
   * properties:
   *
   * - `ranges: FieldRanges`: The part field ranges for the next state.
   * - `accepted?: boolean`: Present if the part field ranges for this state are accepted or
   *   rejected; otherwise, `workflowId` will be present instead.
   * - `workflowId?: string`: Present if the part field ranges for this state should be redirected
   *   to another `Workflow`; otherwise, `accepted` will be present instead.
   *
   * @param {FieldRanges} ranges - the part field ranges for the current state
   * @returns {Array<Object>} - the next states to pursue in the tree search
   */
  nextStates(ranges) {
    const states = [];

    if (this.#condition) {
      const results = this.#condition.updateRanges(ranges);

      if (results?.match) {
        const state = { ranges: results.match };

        if (this.#workflowId) {
          state.workflowId = this.#workflowId;
        } else {
          state.accepted = this.#accepted;
        }

        states.push(state);
      }

      if (results?.noMatch) {
        states.push({ ranges: results.noMatch });
      }
    } else {
      const state = { ranges };

      if (this.#workflowId) {
        state.workflowId = this.#workflowId;
      } else {
        state.accepted = this.#accepted;
      }

      states.push(state)
    }

    return states;
  }

  /**
   * Parses the string describing the action taken by this `Rule` if a part matches.
   *
   * @param {string} actionStr - the action string
   */
  #parseAction(actionStr) {
    if (actionStr === 'A') {
      this.#accepted = true;
    } else if (actionStr === 'R') {
      this.#accepted = false;
    } else {
      this.#workflowId = actionStr;
    }
  }
}

/**
 * Tests whether a part field falls within a range of values.
 */
class Condition {
  #field;
  #conditionRange;

  /**
   * Parses a condition string in the form `{field}{operator}{value}`; e.g. `'x<47'`.
   *
   * @param {string} conditionStr - the condition string
   */
  constructor(conditionStr) {
    this.#field = conditionStr.charAt(0);
    const value = parseInt(conditionStr.slice(2), 10);
    const lessThan = conditionStr.charAt(1) === '<';
    const min = lessThan ? 1 : value + 1;
    const max = lessThan ? value - 1 : 4000;
    this.#conditionRange = new Range(min, max);
  }

  /**
   * Tests the given part against this `Condition`.
   *
   * @param {Object} part - the part to test
   * @returns {boolean} - `true` if the part matches this `Condition`; `false` otherwise
   */
  evaluate(part) {
    return this.#conditionRange.contains(part[this.#field]);
  }

  /**
   * Tests whether the `Range` for the field tested by this `Condition` intersects with the
   * corresponding `Range` from the given `FieldRanges` object. If there is an intersection, the
   * returned object describes the result:
   *
   * - `match: FieldRanges|null`: A copy of the given `FieldRanges`, but with the field tested by
   *   this `Condition` updated to contain only the with the `Condition` range`.
   * - `noMatch: FieldRanges|null`: If any part of the `Range` from the given `FieldRanges` object
   *   did not intersect, this property will contain a copy of the given `FieldRanges`, but with
   *   the field tested by this `Condition` updated to contain only that non-intersecting `Range`;
   *   otherwise, this property will be `null`.
   *
   * @param {FieldRanges} ranges - the `FieldRanges` object to evaluate
   * @returns {Object|null} - the result of the evaluation, or `null` if there was no intersection
   */
  updateRanges(ranges) {
    return ranges.applyCondition(this.#field, this.#conditionRange);
  }
}

/**
 * Contains a `Range` object for each part field. This is used to represent the ranges of field
 * values that are possible at a given branch of the workflows search tree.
 */
class FieldRanges {
  #ranges;

  /**
   * Creates a new `FieldRanges` object. If `clonedRanges` is specified, it is expected to be
   * the internal `Map` from another `FieldRanges` object that should be deep copied into this one.
   * Otherwise, the default ranges are used.
   *
   * @param {Map<string, Range>} [clonedRanges] - the `Range`s to copy, if any
   */
  constructor(clonedRanges) {
    if (clonedRanges) {
      // Deep copy the ranges
      this.#ranges = new Map(
        [ ...clonedRanges.entries() ]
          .map(([ field, range ]) => [ field, range.clone() ])
      );
    } else {
      // Set the ranges to 1 - 4000
      this.#ranges = new Map();
      this.#ranges.set('x', new Range(1, 4000));
      this.#ranges.set('m', new Range(1, 4000));
      this.#ranges.set('a', new Range(1, 4000));
      this.#ranges.set('s', new Range(1, 4000));
    }
  }

  /**
   * @returns {number} - the total number of possible combinations of part field values represented
   * by this `FieldRanges` object.
   */
  get combinations() {
    return multiply([ ...this.#ranges.values() ].map(range => range.size));
  }

  /**
   * Tests whether `conditionRange` intersects with the corresponding `Range` for the given field
   * in this `FieldRanges` object. If there is an intersection, the returned object describes the
   * result and has the following properties:
   *
   * - `match: FieldRanges|null`: A copy of the given `FieldRanges`, but with the field tested by
   *   this `Condition` updated to contain only that intersection; otherwise, this property will be
   *   `null`.
   * - `noMatch: FieldRanges|null`: If any part of the `Range` from the given `FieldRanges` object
   *   did not intersect, this property will contain a copy of the given `FieldRanges`, but with
   *   the field tested by this `Condition` updated to contain only that non-intersecting `Range`;
   *   otherwise, this property will be `null`.
   *
   * @param {string} field - the field to test
   * @param {Range} conditionRange - the `Range` of values that match the condition
   * @returns {Object|null} - the result of the evaluation, or `null` if there was no intersection
   */
  applyCondition(field, conditionRange) {
    const range = this.#ranges.get(field);
    const intersection = range.intersection(conditionRange);

    if (!intersection) {
      return null;
    }

    // The two ranges intersect; split the current Range into the intersecting and non-intersecting
    // (if any) parts
    const result = { noMatch: null };
    let clone = this.#clone();
    clone.#ranges.set(field, intersection);
    result.match = clone;
    const unmatched = range.subtract(intersection)[0];

    if (unmatched) {
      // There was a non-intersecting part
      clone = this.#clone();
      clone.#ranges.set(field, unmatched);
      result.noMatch = clone;
    }

    return result;
  }

  /**
   * @returns {FieldRanges} - a deep copy of this `FieldRanges` object
   */
  #clone() {
    return new FieldRanges(this.#ranges);
  }
}
