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

	const pantry = new Set([]);

	// 2. recipeBook
	const recipeBook = {
		recipes: [
			{
				id: crypto.randomUUID(),
				name: 'Garlic Butter Pasta',
				ingredients: ['pasta', 'garlic', 'butter', 'parmesan'],
				tags: new Set(['quick', 'vegetarian']),
				prepTime: 40
			}
		],
		add(recipe) {
			if (!recipe.id) {
				recipe.id = crypto.randomUUID();
				console.log(recipe.id);
			}
			this.recipes = [...this.recipes, recipe];
			return recipe;
		},
		remove(id) {},
		findByIngredient(ingredient) {}
	};

	// 3. RENDER FUNCTIONS
	//    function renderRecipes() { ... }
	//    function renderTagCloud() { ... }
	//    function renderPantrySidebar() { ... }

	// 4. HELPERS
	//    function parseCommaList(input) { ... }
	//    function canMake(recipe, pantry) { ... }

	// 5. EVENT LISTENERS
	//    document.getElementById('recipe-form').addEventListener('submit', ...);
	//    document.getElementById('search-input').addEventListener('input', ...);
	console.log(recipeBook);
	recipeBook.add({
		name: 'Test',
		ingredients: [],
		tags: new Set(),
		prepTime: 5
	});
});
