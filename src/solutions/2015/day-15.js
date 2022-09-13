const { match } = require('../util');

const REGEXP = /^(?<name>\w+): (?<properties>.+)$/gm;
const PROPERTIES = [ 'capacity', 'durability', 'flavor', 'texture', 'calories' ];
const MAX_TEASPOONS = 100;
const TARGET_CALORIES = 500;
const NO_FILTER = recipe => recipe.score;
const TARGET_CALORIES_FILTER = recipe => recipe.calories === TARGET_CALORIES ? recipe.score : -Infinity;
const FILTERS = [ NO_FILTER, TARGET_CALORIES_FILTER ];

/**
 * # [Advent of Code 2015 Day 15](https://adventofcode.com/2015/day/15)
 *
 * We need a way to iterate through all the possible recipes, given a list of
 * ingredients. We do this by iterating the number of teaspoons for the first
 * ingredient, then recurse for each of the remaining ingredients. Once we have
 * the full recipe, we can compute the total values for each property, and from
 * there produce the recipe's score. The `#analyze()` method does this,
 * returning an object representing the results of the analysis: the recipe's
 * `score` and number of `calories`.
 * 
 * The difference between the two parts is the definition of the "best" recipe:
 * for part one, it's the one that has the best overall score. For part two,
 * there's an additional requirement that the cookie must have exactly 500
 * calories. To handle this, the `findBestRecipes()` method accepts a list of
 * filters: functions which accept a recipe analysis and return the score. For
 * part one, it just returns the recipe's score as is. For part two, it checks
 * to see if the recipe is exactly 500 calories. If not, the filter returns a
 * score of `-Infinity`.
 *
 * @param {string} input - the puzzle input
 * @returns {Array} - the puzzle answers
 */
module.exports = input => {
  return new Kitchen(input).findBestRecipes(FILTERS);
};

/**
 * A class that can find optimal recipes.
 */
class Kitchen {
  #ingredients;
  #ingredientKeys;

  /**
   * Parses the input in preparation for the analyses.
   *
   * @param {string} input - the puzzle input
   */
  constructor(input) {
    this.#ingredients = Object.fromEntries(
      match(input, REGEXP, obj => [
        obj.name,
        obj.properties.split(', ').map(
          property => {
            const parts = property.split(' ');
            parts[1] = parseInt(parts[1], 10);
            return parts;
          }
        )
      ])
    );
    this.#ingredientKeys = Object.keys(this.#ingredients);
  }

  /**
   * Analyzes all possible recipes and returns the scores of the best ones, as
   * determined by the given `filter` functions. Each filter function receives
   * an object containing the `score` and `calories` for a recipe, and should
   * return the final score. This allows us to alter the score based on the
   * calories for part two.
   *
   * This is a recursive function; the latter two arguments are used to pass
   * along recursion state.
   *
   * @param {Array<Function>} filters - the filter functions
   * @param {Array<Array<string,number>>} [currentRecipe] - the partial recipe
   * being built in this recursion branch
   * @param {number} teaspoonsLeft - the number of teaspoons of ingredients
   * that can still be added to the recipe
   * @returns {Array<number>} - the best recipe score for each of the given
   * `filters`
   */
  findBestRecipes(filters, currentRecipe = [], teaspoonsLeft = MAX_TEASPOONS) {
    const numberOfIngredientsLeft = this.#ingredientKeys.length - currentRecipe.length;

    if (numberOfIngredientsLeft === 1) {
      // Only one ingredient left; add it and analyze this recipe
      currentRecipe.push([
        this.#ingredientKeys[this.#ingredientKeys.length - 1],
        teaspoonsLeft,
      ]);
      const result = this.#analyze(currentRecipe);
      return filters.map(filter => filter(result));
    }

    // We need to add more ingredients
    const ingredientKey = this.#ingredientKeys[currentRecipe.length];
    const best = new Array(filters.length).fill(-Infinity);
    const maxTsp = teaspoonsLeft - numberOfIngredientsLeft + 1;

    for (let tsp = 1; tsp <= maxTsp; tsp++) {
      const scores = this.findBestRecipes(
        filters,
        [
          ...currentRecipe,
          [ ingredientKey, tsp ],
        ],
        teaspoonsLeft - tsp,
      );
      best.forEach((max, i) => {
        best[i] = Math.max(max, scores[i]);
      });
    }

    return best;
  }

  /**
   * Computes the values for each of the properties, then computes the overall
   * score for it.
   *
   * The recipe is an array of ingredients. Each ingredient is itself an array,
   * where the first element is the name of the ingredient, and the second is
   * the quantity of that ingredient.
   *
   * The returned object has `score` and `calories` properties.
   *
   * @param {Array<Array<string,number>>} recipe - the recipe to analyze
   * @returns {Object} - the result of the analysis
   */
  #analyze(recipe) {
    // Total all properties
    const properties = Object.entries(recipe.reduce(
      (properties, [ ingredientKey, qty ]) => {
        this.#ingredients[ingredientKey].forEach(([ propertyKey, value ]) => {
          properties[propertyKey] += value * qty;
        });
        return properties;
      },
      Object.fromEntries(PROPERTIES.map(property => [ property, 0 ]))
    ));
    // Force property totals to 0 if negative
    properties.forEach(property => {
      property[1] = Math.max(property[1], 0);
    });
    // Score the recipe
    const score = properties.filter(([ key ]) => key !== 'calories')
      .reduce((score, [, value ]) => score * value, 1);
    return {
      score,
      calories: properties.find(property => property[0] === 'calories')[1],
    };
  }
}
