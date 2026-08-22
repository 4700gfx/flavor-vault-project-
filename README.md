# Flavor Vault

### Recipe & Pantry Organizer

**A single-page vanilla JavaScript app that shows you which of your saved
recipes you can actually cook right now, based on what's in your pantry.**

Companion project for _The Complete JavaScript Course_ (Jonas Schmedtmann) —
Sections 7–9: DOM Manipulation, JS Behind the Scenes, and Data Structures /
Modern Operators & Strings.

---

## 1. Overview

Flavor Vault is a recipe box where every recipe card tells you, at a glance,
whether you have everything you need to cook it. Users add recipes with a name,
ingredient list, prep time, and tags. A "My Pantry" list tracks what's currently
on hand, and the app cross-references pantry contents against each recipe's
ingredients to highlight what's ready to cook, what's missing one item, and what
needs a shopping trip.

|                    |                                                                                |
| ------------------ | ------------------------------------------------------------------------------ |
| **Stack**          | HTML5 · Tailwind CSS (via CDN, no build step) · Vanilla JavaScript (ES6+)      |
| **Format**         | Single-page app — one `index.html`, one `script.js`, no frameworks or bundlers |
| **Course context** | Project 1 of 4 offered in the Section 7–9 assignment brief                     |
| **Difficulty**     | Easy → Medium                                                                  |
| **Estimated time** | 4–8 hours                                                                      |
| **AI policy**      | Tutoring/reference only — no AI-generated implementation code                  |

---

## 2. Core Features

Built from the assignment brief's core requirements, all reflected in the
mockup:

- **Add a recipe** — form capturing name, comma-separated ingredients, prep time
  (minutes), and comma-separated tags
- **Recipe cards** — each renders name, tag pills, ingredient count, and prep
  time
- **Live search/filter** — matches against ingredient names or tags as the user
  types
- **My Pantry** — a running list of owned ingredients; recipes the user can
  fully make are visually highlighted (accent top-border + "Pantry ready" badge)
- **Delete a recipe** — removes it from both the DOM and the underlying data
  array
- **Tag cloud** — a deduplicated, clickable row of every tag across all recipes,
  doubling as a filter
- **Sort control** — Newest / Prep time / A–Z (stretch goal, already designed
  into the mockup)
- **Favorites** — a star toggle per recipe (stretch goal)
- **Tag analytics footer** — tag → count breakdown (stretch goal)

### Bonus (not in the graded core, sequenced last)

- **Recipe Detail** screen — per-ingredient pantry check, favorite toggle, Edit
  (routes into the Add form pre-filled), Delete
- **Shopping List** screen — missing ingredients across near-ready recipes,
  checkable, with a "move checked to pantry" action

---

## 3. Screens

All five screens live in one `index.html`, toggled via a presentational
`fvGo(screen)` helper — only one `.fv-screen` element is visible at a time.

| `data-screen` value | Purpose                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `recipes`           | Home screen — card grid, search, sort, tag cloud, tag-analytics footer, sticky pantry sidebar |
| `add`               | Form to create/edit a recipe, with a live-preview card                                        |
| `detail`            | Single recipe view — ingredient-by-ingredient pantry check, Start Cooking, Edit, Delete       |
| `pantry`            | Categorized ingredient tags, "what can I make" table, shopping-tip callout                    |
| `shopping`          | Checkable missing-ingredient list, progress bar, sidebar nudges                               |

`fvGo()` itself only controls _which section is visible_ — it is not application
logic and doesn't touch state.

---

## 4. Data Model

```js
const recipe = {
	id: crypto.randomUUID(), // stable identity — NOT array index (breaks under filtering)
	name: 'Garlic Butter Pasta',
	ingredients: ['pasta', 'garlic', 'butter', 'parmesan'],
	prepTime: 20, // minutes
	tags: new Set(['vegetarian', 'quick']) // Set, not array — dedupes naturally, matches pantry comparison
};
```

**Key modeling decisions, locked in before coding:**

| Decision                   | Choice                                                                                                                                     | Why                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Tags: array or `Set`?      | `Set`                                                                                                                                      | Dedupes naturally and gives real spread/rest and Set-comparison practice for the grade's concept-coverage requirement |
| Recipe identity            | `crypto.randomUUID()`                                                                                                                      | Array index breaks the moment the list is filtered or searched, since visible position stops matching array position  |
| Pantry storage             | A `Set` of lowercase, trimmed strings                                                                                                      | Normalizing on entry avoids `'Garlic'` vs `'garlic'` silently failing to match                                        |
| Shopping list              | Derived on the fly from `recipes` + `pantry` (missing ingredients across near-ready recipes), with checked-item state persisted separately | Less state to keep in sync, at the cost of needing a small persisted "checked" record                                 |
| `this` inside `recipeBook` | `recipeBook` owns `this.recipes` as a real property (not a closure variable)                                                               | Makes `this` semantically meaningful and demonstrable inside its methods — required for concept coverage              |

---

## 5. `recipeBook` — the Data Layer

```js
const recipeBook = {
	recipes: [], // owned as a property so `this` is meaningful
	add(recipe) {
		/* … */
	},
	remove(id) {
		/* … */
	},
	findByIngredient(name) {
		/* … */
	}
};
```

Because `this.recipes` lives on the object itself rather than in a closure,
`recipeBook`'s methods can't be detached and passed as bare callbacks without
breaking `this` — e.g. `recipeBook.remove` used directly as an event listener
would lose its binding. The fix is to wrap it at the call site:
`() => recipeBook.remove(id)`. This is a deliberate concept-coverage moment, not
an oversight.

---

## 6. File Structure

```
flavor-vault/
├── index.html   # Tailwind CDN + inline theme config, all 5 screens, links script.js
├── script.js    # all JS logic
└── README.md    # what was built + which concept was trickiest
```

**`script.js` is organized top to bottom into five regions**, in dependency
order (state and functions are defined before the listeners that use them, for a
clean, hoisting-safe execution order):

1. **STATE** — `recipes` array, `pantry` Set, `shoppingList` (if built as its
   own list)
2. **`recipeBook`** — the object whose methods (`.add`, `.remove`,
   `.findByIngredient`) own state
3. **RENDER FUNCTIONS** — rebuild each screen's dynamic sections from state
4. **HELPERS** — parsing / formatting / dedupe helpers
5. **EVENT LISTENERS** — wired last, once everything above exists

---

## 7. Tailwind Migration

The original mockup used custom CSS design tokens (`--color-accent`,
`--color-neutral-*`, etc.). These are ported to Tailwind by registering the same
color ramps through the Tailwind Play-CDN's inline config, so the app gets real
utility classes (`bg-accent-500`, `text-neutral-700`) instead of scattered
arbitrary bracket values.

```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
	tailwind.config = {
		theme: {
			extend: {
				colors: {
					accent: {
						DEFAULT: '#ec3013',
						100: '#fff2ef',
						200: '#ffe0d9',
						300: '#ffc4b8',
						400: '#ff9783',
						500: '#ff563c',
						600: '#dd2b0f',
						700: '#ae1800',
						800: '#7c1405',
						900: '#4d170e'
					},
					neutral: {
						100: '#f8f4f4',
						200: '#eae7e7',
						300: '#d7d3d3',
						400: '#bab6b6',
						500: '#9b9797',
						600: '#7d7979',
						700: '#605d5d',
						800: '#444141',
						900: '#2d2b2b'
					}
				},
				fontFamily: { sans: ['Archivo', 'system-ui', 'sans-serif'] }
			}
		}
	};
</script>
```

**Component cheat sheet:**

| Custom class           | Tailwind equivalent                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `.btn-primary`         | `bg-accent hover:bg-accent-600 active:bg-accent-700 text-white font-extrabold text-sm rounded-full px-4 py-2 inline-flex items-center gap-1.5` |
| `.btn-secondary`       | `border border-neutral-300 hover:bg-black/5 active:bg-black/10 font-extrabold text-sm rounded-full px-4 py-2`                                  |
| `.btn-ghost`           | `text-accent hover:bg-accent/10 font-extrabold text-sm rounded-full px-2 py-2`                                                                 |
| `.card`                | `bg-neutral-200 rounded-2xl p-3 flex flex-col gap-2`                                                                                           |
| `.tag` / `.tag-accent` | `inline-flex items-center text-[11px] rounded-full px-2.5 py-0.5 bg-accent-100 text-accent-800`                                                |
| `.tag-outline`         | `inline-flex items-center text-[11px] rounded-full px-2.5 py-0.5 border border-accent text-accent`                                             |
| `.input`               | `w-full min-h-9 px-2.5 py-1.5 text-sm bg-neutral-200 border border-black/10 rounded-xl focus:border-accent focus:outline-none`                 |
| `.nav`                 | `flex items-center gap-4 px-4 py-3 border-b-2 border-black/10`                                                                                 |

> ⚠️ **Dynamic class names must stay whole literal strings.** Tailwind's CDN JIT
> compiler scans source for complete class-name strings — a concatenated name
> like `` `bg-${color}-500` `` that never appears whole in the source won't be
> generated. Use a lookup object mapping a status to a full class string
> instead.

---

## 8. Concept Coverage Map

Where each targeted Section 7–9 concept actually lives in the app:

| Concept                                | Lives here                                                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| DOM manipulation & events              | Card rendering, form submit, delete buttons, search input, tag pills                                                                             |
| Execution context / scope / hoisting   | Data and functions declared before the listeners that use them (see §6 file layout)                                                              |
| The `this` keyword                     | `recipeBook.add()` / `.remove()` / `.findByIngredient()` — contrasted with an arrow-function helper that intentionally does _not_ rely on `this` |
| Primitive vs. reference types          | Copying a recipe object before editing it, vs. mutating the array in place                                                                       |
| Destructuring                          | Pulling `{ name, ingredients, prepTime, tags }` out of each recipe object when rendering                                                         |
| Spread / rest                          | `[...recipes, newRecipe]` instead of `.push()`; merging tag arrays/Sets without mutating the original                                            |
| Short-circuiting                       | Guard clauses, e.g. `name.trim() && recipeBook.add(...)`                                                                                         |
| Optional chaining / nullish coalescing | `recipe.rating ?? 'Unrated'` or similar optional-field reads                                                                                     |
| Looping over objects                   | `Object.entries()` driving the tag → count analytics footer                                                                                      |
| Sets                                   | Tag-cloud dedupe; pantry vs. ingredient comparison ("can I make this?"); favorites                                                               |
| Maps                                   | Tag → count for the analytics footer                                                                                                             |
| String methods                         | `.split(',').map(s => s.trim())` for parsing input; `.toLowerCase()` / `.includes()` for search                                                  |

This covers the graded core (Phases 2–9 below); the Detail and Shopping List
screens (Phase 10) layer additional practice on top but aren't required for the
rubric.

---

## 9. Build Order & Current Status

Development is phased so CSS bugs and logic bugs never tangle, and so graded
features are built before bonus polish.

| Phase | Scope                                                                                                                             | Status                                 |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 0     | Setup — git repo, Tailwind CDN + config, file scaffold                                                                            | ✅ Done                                |
| 1     | Static Tailwind port of all 5 screens, hardcoded mockup data, zero JS logic beyond `fvGo()`                                       | ✅ Done                                |
| 2     | Data layer — `recipes` array + `recipeBook.add()` / `.remove()` / `.findByIngredient()`, wired to the Add form                    | 🔶 In progress                         |
| 3     | Rendering engine — `renderRecipes()`, destructured card templates                                                                 | ⬜ Not started                         |
| 4     | Live search/filter                                                                                                                | ⬜ Not started                         |
| 5     | Pantry matching — `canMake(recipe)` via Set comparison                                                                            | ⬜ Not started                         |
| 6     | Tag cloud + tag-analytics footer (Map of tag → count)                                                                             | ⬜ Not started                         |
| 7     | Delete (event delegation, `array.filter`, not in-place mutation)                                                                  | ⬜ Not started                         |
| 8     | Concept-coverage comment pass (≥5 flagged concepts)                                                                               | ⬜ Not started                         |
| 9     | Edge cases & validation (empty name guard, trim/lowercase matching, zero-tag/zero-ingredient recipes, empty-state on last delete) | ⬜ Not started                         |
| 10    | Bonus — Detail & Shopping List real wiring                                                                                        | ⬜ Not started (portfolio polish only) |
| 11    | Docs & submission — README, coverage self-check, commit count, push                                                               | ⬜ Not started                         |

**Immediate next step:** implement `recipeBook.add()`, then `.remove()` and
`.findByIngredient()`, completing Phase 2's data layer.

---

## 10. Pitfalls Being Actively Watched For

- **Interpolated Tailwind class names** (`` `bg-${color}-500` ``) — the JIT
  compiler won't generate classes it never sees as a complete literal string.
- **`const recipes = [...]` reassignment** — `const` locks the _binding_, not
  the contents. `recipes.push(...)` or `recipes = recipes.filter(...)` with
  `let` both work; reassigning a `const` array does not.
- **`for...in` on the recipes array** — iterates keys/indices (including
  inherited enumerable properties). Use `for...of` or array methods instead.
- **Missing `return` in a braces-style arrow function** — `{}` needs an explicit
  `return`, unlike the implicit-return concise form.
- **Passing `recipeBook.remove` directly as a listener callback** — detaches the
  method from its object and breaks `this`. Wrap it:
  `() => recipeBook.remove(id)`.
- **Mutating a "copy" pulled from the array without spreading it first** —
  objects and Sets are reference types; editing an unspread copy silently
  corrupts the source data.

---

## 11. Grading

**This project (Udemy course track):**

| Component        | Weight | Focus                                                        |
| ---------------- | ------ | ------------------------------------------------------------ |
| Functionality    | 40%    | Every core requirement works end-to-end, zero console errors |
| Concept Coverage | 30%    | Clear, comment-flagged use of ≥5 Section 7–9 concepts        |
| Code Quality     | 15%    | Readable, DRY, sensibly named                                |
| UI / UX          | 15%    | Responsive, clean, usable — built with Tailwind utilities    |

**Deliverables required for submission:**

- `index.html` (Tailwind via CDN, no build step) + separate `script.js`
- `README.md` (3–5 sentences: what was built, trickiest concept)
- ≥5 inline comments each flagging a specific Section 7–9 concept at its exact
  usage
- Pushed to GitHub with ≥5 meaningful commits (no single giant "initial commit")

---

## 12. Broader Curriculum Context

Flavor Vault also satisfies coursework inside the 8-week OSSU (Open Source
Society University) self-paced curriculum, specifically the JavaScript
Foundations and later concept-reinforcement tracks that run alongside the Udemy
course. It is tracked independently in the OSSU progress tracker
(`OSSUTracker.jsx`) as project/practice evidence for the JavaScript track,
separate from its Udemy Sections 7–9 grade.
