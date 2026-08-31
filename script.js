// ============================================================
// Flavor Vault — script.js
//
// This file intentionally ships with ONLY the presentational
// screen-switcher below. Everything else (state, recipeBook,
// rendering, search, pantry matching, tag cloud, delete, etc.)
// is yours to write — that's the actual assignment.
//
// Suggested region order (see the project plan PDF, §1 and §4):
//   1. STATE            — the recipes array, the pantry Set, etc.
//   2. recipeBook        — object whose methods own the state
//   3. RENDER FUNCTIONS  — rebuild DOM sections from state
//   4. HELPERS           — parsing/formatting/dedupe helpers
//   5. EVENT LISTENERS   — wired last, after everything above
// ============================================================

// --- Screen switcher (presentational — which .fv-screen is visible) ---
function fvGo(screenName) {
	document.querySelectorAll('.fv-screen').forEach((el) => {
		el.hidden = el.dataset.screen !== screenName;
	});
	document.querySelectorAll('[data-nav]').forEach((a) => {
		if (a.dataset.nav === screenName) {
			a.setAttribute('aria-current', 'page');
		} else {
			a.removeAttribute('aria-current');
		}
	});
}

document.addEventListener('DOMContentLoaded', () => {
	fvGo('recipes');

	// 1. STATE

	//Pantry as a Set to Remove Duplicate Items
	const pantry = new Set([
		`Garlic`,
		`Pasta`,
		`Butter`,
		'Parmesan',
		'Tomatoes',
		'Onion',
		'Bacon',
		'Bread',
		'Lettuce',
		'Steak'
	]);

	// 2. RECIPE BOOK OBJECT WITH METHODS

	const recipeBook = {
		//Recipes Array [Array of Objects]
		recipes: [
			{
				id: crypto.randomUUID(),
				name: 'Garlic Butter Pasta',
				ingredients: ['pasta', 'garlic', 'butter', 'parmesan'],
				tags: new Set(['quick', 'vegetarian']),
				prepTime: 20
			},

			{
				id: crypto.randomUUID(),
				name: 'Shakshuka',
				ingredients: [
					'eggs',
					'tomatoes',
					'onion',
					'Garlic',
					'olive oil',
					'basil',
					'black pepper'
				],
				tags: new Set(['breakfast', 'spicy', 'vegetarian']),
				prepTime: 25
			},

			{
				id: crypto.randomUUID(),
				name: 'BLT Sandwich',
				ingredients: ['tomatoes', 'bacon', 'lettuce', 'bread'],
				tags: new Set(['breakfast', 'spicy', 'vegetarian']),
				prepTime: 25
			},

			{
				id: crypto.randomUUID(),
				name: 'Steak and Sweet Potatoes Bowl',
				ingredients: ['steak', 'sweet potatoes', 'olive oil'],
				tags: new Set(['dinner', 'spicy', 'healthy']),
				prepTime: 30
			}
		],

		//OBJECT FUNCTIONS TO ADD, REMOVE AND DELETE RECIPES

		//Adding Recipes
		add(recipe) {
			//Guard Clause for if Recipe Does Not Have ID
			if (!recipe.id) {
				recipe.id = crypto.randomUUID();
			}

			//Adds to Recipe Book Recipes
			this.recipes = [...this.recipes, recipe];
			return recipe;
		},

		//Removing Recipe
		remove(id) {
			const originalLength = this.recipes.length;
			this.recipes = this.recipes.filter((recipe) => recipe.id !== id);
			return this.recipes.length < originalLength;
		},

		//Finding Recipe
		findByIngredient(ingredient) {
			return this.recipes.filter((recipe) => {
				return recipe.ingredients.some(
					(ing) => ing.toLowerCase() === ingredient.toLowerCase()
				);
			});
		}
	};

	// 3. RENDER FUNCTIONS

	//Builds Single Recipe Cards
	function buildRecipeCard(recipe, pantry) {
		//Destructing Variables to Use within HTML
		const { id, name, ingredients, tags, prepTime } = recipe;

		//Variables based on Ternary Values
		const ready = canMake(recipe, pantry);
		const borderClass = ready ? 'border-accent' : 'border-transparent';
		const statusValue = ready ? 'ready' : 'missing';

		const missing = getMissingIngredients(recipe, pantry);
		const statusHTML = ready
			? `<div class="recipe-card-status flex items-center gap-1.5 text-xs text-accent-700 font-semibold" data-status="${statusValue}">
									<svg
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.4"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M20 6 9 17l-5-5"></path>
									</svg>
 			 Pantry ready — you have everything
			</div>`
			: `<div class="recipe-card-status text-xs text-neutral-600 font-semibold" data-status="missing">
  				Missing ${missing.length} — <span class="text-accent-700">${missing.join(', ')}</span>
				</div>`;

		//Adds Tag Span with Style Options
		const tagsHTML = [...tags]
			.map((tag) => {
				const tagClass =
					tag === 'quick'
						? 'bg-accent-100 text-accent-800'
						: 'bg-neutral-100 text-neutral-800';
				return `<span class="tag-pill text-[11px] rounded-full px-2.5 py-0.5 ${tagClass}">${tag}</span>`;
			})
			.join('');

		//Recipe Card HTML
		const recipeCard = `<article class="recipe-card bg-neutral-200 rounded-2xl p-3 flex flex-col gap-2 border-t-[3px] ${borderClass}" data-recipe-id="${id}">
								<div class="flex gap-3 items-center mb-1">
									<div
										class="w-[42px] h-[42px] rounded-xl bg-accent-100 flex items-center justify-center shrink-0">
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="#ae1800"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path
												d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"
											></path>
											<path
												d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"
											></path>
											<path d="m2.1 21.8 6.4-6.3"></path>
											<path d="m19 5-7 7"></path>
										</svg>
									</div>
									<div class="flex-1 min-w-0">
										<a
											href="#"
											onclick="
												fvGo('detail');
												return false;
											"
											class="no-underline text-inherit"
										>
											<div
												class="recipe-card-title font-extrabold text-[17px] leading-tight"
											>
												${name}
											</div>
										</a>
										<div class="recipe-card-meta text-xs text-neutral-600">
											${ingredients.length} ingredients · ${prepTime} min
										</div>
									</div>
									<button
										type="button"
										class="favorite-toggle"
										data-recipe-id="${id}"
										aria-label="Favorite"
										data-favorited="true"
									>
										<svg
											width="17"
											height="17"
											viewBox="0 0 24 24"
											fill="#ec3013"
											stroke="#ec3013"
											stroke-width="2"
											stroke-linejoin="round"
										>
											<path
												d="M11.5 2.5 14 8l6 .8-4.4 4.2 1 5.9-5.1-2.7-5.1 2.7 1-5.9L3 8.8 9 8z"
											></path>
										</svg>
									</button>
								</div>
									${statusHTML}
								<div
									class="recipe-card-ingredients text-[13px] text-neutral-700"
								>
									${ingredients.join(' · ')}
								</div>
								<div class="flex gap-1 flex-wrap items-center">
                ${tagsHTML}
									<button
										type="button"
										class="delete-recipe-btn ml-auto text-neutral-600 hover:text-accent hover:bg-accent/10 rounded-lg p-1.5"
										data-recipe-id="${id}"
										aria-label="Delete recipe"
									>
										<svg
											width="15"
											height="15"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M3 6h18"></path>
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
											<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
										</svg>
									</button>
								</div>
							</article>`;
		return recipeCard;
	}

	//Builds All of the Recipes from the Array
	function renderRecipes(recipesToRender = recipeBook.recipes) {
		const recipeGrid = document.querySelector(`#recipe-grid`);
		const emptyState = document.querySelector(`#recipe-empty-state`);

		//Guard Clause for If No Recipes are to Be Rendered
		if (recipesToRender.length === 0) {
			emptyState.hidden = false;
			recipeGrid.innerHTML = ``;
			return;
		}

		//Rendering Recipes
		emptyState.hidden = true;
		const cardHTML = recipesToRender
			.map((recipe) => buildRecipeCard(recipe, pantry))
			.join('');
		recipeGrid.innerHTML = cardHTML;
	}

	renderRecipes();

	//  function renderTagCloud() {}
	//  function renderPantrySidebar() {}

	// 4. HELPERS
	function parseCommaList(input) {
		//Takes List and Turns into an Array
		//Input: String, Output: Array

		return input
			.split(',')
			.map((ing) => ing.trim())
			.filter((ing) => Boolean(ing) === true);
	}

	function canMake(recipe, pantry) {
		//Lower Case Items to Compare
		const lowercasePantry = new Set(
			[...pantry].map((item) => item.toLowerCase())
		);

		//Compares Ingredients Aganist Items in Pantry
		return recipe.ingredients.every((ing) =>
			lowercasePantry.has(ing.toLowerCase())
		);
	}

	function matchesSearch(recipe, searchTerm) {
		//Turning Input into Lower Case to Compare
		const term = searchTerm.toLowerCase();

		//Different Matching Algorithms
		const ingredientMatch = recipe.ingredients.some((ing) =>
			ing.toLowerCase().includes(term)
		);
		const tagArr = [...recipe.tags];
		const tagMatch = tagArr.some((ing) => ing.toLowerCase().includes(term));
		const nameMatch = recipe.name.toLowerCase().includes(term);

		//Short Circuit based on Which Match
		return ingredientMatch || tagMatch || nameMatch;
	}

	function getMissingIngredients(recipe, pantry) {
		const lowercasePantry = new Set(
			[...pantry].map((item) => item.toLowerCase())
		);

		return recipe.ingredients.filter(
			(ingredient) => !lowercasePantry.has(ingredient.toLowerCase())
		);
	}

	//Elements for Form to Read
	const inputRecipeName = document.querySelector(`#recipe-name-input`);
	const inputIngredients = document.querySelector(`#recipe-ingredients-input`);
	const inputPrepTime = document.querySelector(`#recipe-preptime-input`);
	const inputRecipeTags = document.querySelector(`#recipe-tags-input`);
	const recipeForm = document.getElementById('recipe-form');
	const searchInput = document.querySelector('#search-input');

	// 5. EVENT LISTENERS
	recipeForm.addEventListener('submit', (event) => {
		event.preventDefault();

		const recipeName = inputRecipeName.value;
		const ingredientsList = inputIngredients.value;
		const recipePrepTime = Number(inputPrepTime.value);
		const recipeTags = inputRecipeTags.value;

		const ingredientArr = parseCommaList(ingredientsList);
		const tagsSet = new Set(parseCommaList(recipeTags));

		console.log(`Here are the Ingredients`, ingredientArr);
		console.log(
			`The Prep Time is going to take about ${recipePrepTime} mintues`
		);

		const newRecipe = {
			name: recipeName.trim(),
			ingredients: ingredientArr,
			tags: tagsSet,
			prepTime: recipePrepTime
		};

		console.log(`Your Recipe has been added:`, newRecipe);
		recipeBook.add(newRecipe);
		renderRecipes();
		recipeForm.reset();
	});

	//Search Logic to Find Recipes by Tags or Ingredients
	searchInput.addEventListener('input', (event) => {
		//Targeting the Value within the Input
		const searchTerm = event.target.value;

		//Gaurd Clause for an Empty Input
		if (searchTerm === '') {
			renderRecipes();
			return;
		}

		//Filters through the Recipe based on the Recipe and the Term
		const filtered = recipeBook.recipes.filter((recipe) =>
			matchesSearch(recipe, searchTerm.toLowerCase())
		);
		renderRecipes(filtered);
	});
});
