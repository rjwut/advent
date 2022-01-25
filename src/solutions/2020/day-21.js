const { split } = require('../util');

const LINE_REGEXP = /^(?<ingredients>.+) \(contains (?<allergens>.+)\)$/;

/**
 * # [Advent of Code 2020 Day 21](https://adventofcode.com/2020/day/21)
 *
 * Algorithm:
 *
 * 1. Create an object for each allergen, containing:
 *    - the name of the allergen
 *    - the ingredient which contains that allergen (starts out `null`)
 *    - the list of foods which are known to contain that allergen (Note: The
 *      same food can appear under more than one allergen.)
 * 2. Put the allergen objects into a list of allergens which are not assigned
 *    to ingredients.
 * 3. While the list of unassigned allergens is not empty, iterate the allergen
 *    objects:
 *     - If any food containing that allergen has only one ingredient, assign
 *       that allergen to that ingredient.
 *     - If any ingredient in the food list for that allergen is the only one
 *       common to all of them, assign that allergen to that ingredient.
 *     - If the allergen has been assigned to an ingredient:
 *       - Remove that allergen from the list of unassigned allergens.
 *       - Remove that ingredient from all foods.
 * 
 * Once that is done, each allergen object will have a corresponding
 * ingredient, which gives you everything you need to compute the answers.
 * 
 * - **Part one:** Filter the list of ingredients to those that have no
 *   corresponding allergen. Then iterate the foods and count how many times
 *   any of those ingredients appear.
 * - **Part two:** Sort the allergens by name, then `map()` over them to
 *   extract their ingredients and `join()` them.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  const foods = parse(input);
  const ingredients = buildIngredientSet(foods);
  const allergens = deduce(foods, ingredients);  
  return [ part1, part2 ].map(fn => fn(foods, allergens));
};

/**
 * Parse the input into a list of food objects.
 *
 * @param {string} input - the puzzle input 
 * @returns {Array} - the foods
 */
const parse = input => split(input).map(parseLine);

/**
 * Counts the number of times that safe ingredients are used in the foods.
 *
 * @param {Array} foods - the list of foods 
 * @param {Object} allergens - allergens keyed on their names 
 * @returns {number}
 */
const part1 = (foods, allergens) => {
  const allergenIngredients = Object.values(allergens);
  return foods.reduce((count, food) => {
    const safeIngredients = Array.from(food.ingredients)
      .filter(ingredient => !allergenIngredients.includes(ingredient));
    return count + safeIngredients.length;
  }, 0);
};

/**
 * Produces the list of dangerous ingredients.
 *
 * @param {Array} _ - ignored
 * @param {Object} allergens - allergens keyed on their names 
 * @returns {string} - the comma-delimited list of ingredients
 */
const part2 = (_, allergens) => Object.entries(allergens)
  .sort((e1, e2) => e1[0].localeCompare(e2[0]))
  .map(entry => entry[1])
  .join();

/**
 * Parses a single ingredient list.
 *
 * @param {string} line - the puzzle input line
 * @returns {Object} - contains two `Set`s: `ingredients` and `allergens`
 */
const parseLine = line => {
  const match = line.match(LINE_REGEXP);
  return {
    ingredients: new Set(match.groups.ingredients.split(' ')),
    allergens: new Set(match.groups.allergens.split(', ')),
  };
};

/**
 * Determines which ingredients contain which allergens.
 *
 * @param {Array} foods - the list of food objects
 * @param {Set} ingredients - the known ingredients 
 * @returns {Object} - each dangerous ingredient name keyed to the name of its
 * allergen
 */
const deduce = (foods, ingredients) => {
  foods = foods.map(food => ({
    ingredients: new Set(food.ingredients),
    allergens: new Set(food.allergens),
  }));
  ingredients = new Set(ingredients);
  const allergenMap = buildAllergenMap(foods);
  let unassignedAllergens = Array.from(allergenMap.values());

  do {
    unassignedAllergens.forEach(allergen => {
      const deducedIngredient = deduceAllergenIngredient(allergen, ingredients);
 
      if (deducedIngredient) {
        allergen.ingredient = deducedIngredient;
        foods.forEach(food => food.ingredients.delete(deducedIngredient));
      }
    });

    unassignedAllergens = unassignedAllergens.filter(allergen => !allergen.ingredient);
  } while (unassignedAllergens.length);

  return [ ...allergenMap.values() ].reduce((results, allergen) => {
    results[allergen.name] = allergen.ingredient;
    return results;
  }, {});
};

/**
 * Given an allergen object and the set of ingredients, deduce, if possible,
 * which ingredient contains that allergen.
 *
 * @param {Object} allergen - the allergen object 
 * @param {Set} ingredients - the possible ingredients 
 * @returns {string|undefined} - the name of the deduced allergen, or
 * `undefined` if no deduction could be made
 */
const deduceAllergenIngredient = (allergen, ingredients) => {
  const foodsWithOnlyOneIngredient = allergen.foods.filter(food => food.ingredients.size === 1);

  if (foodsWithOnlyOneIngredient.length) {
    return Array.from(foodsWithOnlyOneIngredient[0].ingredients)[0];
  }

  ingredients = new Set(ingredients);
  allergen.foods.forEach(food => {
    ingredients.forEach(ingredient => {
      if (!food.ingredients.has(ingredient)) {
        ingredients.delete(ingredient);
      }
    })
  });

  if (ingredients.size === 1) {
    return Array.from(ingredients)[0];
  }
};

/**
 * Returns a `Map` where each key is the name of an allergen and the
 * corresponding value is an object with the following properties:
 * - `name`: The name of the allergen
 * - `ingredient`: Where the ingredient that contains that allergen will set
 *   when it is discovered.
 * - `foods`: The list of foods which are known to contain that allergen.
 *
 * @param {Array} foods - the array of food objects 
 * @returns {Map}
 */
const buildAllergenMap = foods => foods.reduce((allergens, food) => {
  food.allergens.forEach(allergenName => {
    let allergen = allergens.get(allergenName);

    if (!allergen) {
      allergen = {
        name: allergenName,
        ingredient: null,
        foods: [],
      };
      allergens.set(allergenName, allergen);
    }

    allergen.foods.push(food);
  });
  return allergens;
}, new Map());

/**
 * Produces a `Set` containing all possible ingredients.
 *
 * @param {Array} foods - the list of food objects 
 * @returns {Set} - the ingredients found in those foods
 */
const buildIngredientSet = foods => {
  const ingredients = new Set();
  foods.forEach(food => {
    food.ingredients.forEach(ingredient => {
      ingredients.add(ingredient);
    });
  });
  return ingredients;
};
