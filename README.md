<div align="center">

# 🎨 DashLayers

**Elevate your Frappe UI.** A drop-in, multi-theme visual overlay for the Frappe/ERPNext desk — modern glass + gradient styling for the springboard, sidebar, headers, lists, modals, and login page, with **live theme switching** and **zero core changes**.

`Aurora` · `Midnight` · `Sunset` · `Forest`

</div>

---

## ✨ Overview

DashLayers re-skins the Frappe desk without forking or patching core files. It works purely through Frappe's standard asset hooks (`app_include_css`, `app_include_js`, `web_include_css`, `web_include_js`), so you can install it, switch it on, and uninstall it cleanly at any time.

A small floating **theme switcher** lets users pick a look on the fly; the choice is saved per browser (`localStorage`) and applied everywhere — including the login screen.

## 🚀 Features

| Area | What DashLayers does |
| --- | --- |
| **Desktop springboard** (`/desk`) | Themed gradient-mesh background, frosted glass app tiles with vivid per-icon gradients, hover lift + glow, staggered entrance animation, frosted navbar & search pill |
| **Greeting header** | Time-aware greeting ("Good morning, *name*") with the date, injected above the app grid |
| **Folder popup** | Frosted glass panel, dimmed/blurred backdrop, gradient title, themed icons, pop-in animation — while keeping folder *thumbnails* compact |
| **Sidebar** | Accent-tinted background, gradient workspace icon, accent hover, active item with glow + colored left rail |
| **Page header** | Accent-tinted sticky bar with soft elevation |
| **List view (tables)** | Rounded elevated card, accent-tinted header, taller rows with clear borders, accent hover wash, theme-colored checkboxes, themed pagination |
| **Buttons** | Primary buttons rendered with the active theme gradient |
| **Login page** | Themed gradient backdrop, frosted glass card, gradient title, accent inputs with focus glow, themed buttons |
| **Theme switcher** | Floating control (bottom-right of the springboard) to switch theme instantly; persisted in `localStorage` |

All colors are driven by CSS custom properties, so every surface recolors together when you switch themes. Surfaces on working pages stay light and legible regardless of theme; only the **accent hue** follows your selection.

## 🎨 Themes

| Theme | Accent | Vibe |
| --- | --- | --- |
| **Aurora** *(default)* | Indigo → Pink | Soft, bright, airy |
| **Midnight** | Indigo → Fuchsia | Deep dark glass |
| **Sunset** | Orange → Rose | Warm and vivid |
| **Forest** | Emerald → Teal | Calm and green |

## 📦 Installation

Install with the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app https://github.com/saadsafda/dashlayers.git --branch version-16
bench install-app dashlayers

# rebuild assets & clear cache
bench build --app dashlayers
bench --site <your-site> clear-cache
```

Then hard-refresh the browser (`Cmd/Ctrl + Shift + R`).

> **Requirements:** Frappe **v16**, Python **≥ 3.14**. A `:has()`- and `backdrop-filter`-capable browser (recent Chrome/Edge/Safari/Firefox) is recommended; on older browsers the theme degrades gracefully to flat colors.

## 🕹️ Usage

- Open the desk (`/desk`). The **Aurora** theme is applied by default.
- Use the **floating theme switcher** at the bottom-right of the springboard to switch between Aurora, Midnight, Sunset, and Forest.
- Your choice is saved in the browser and carries across all desk pages and the login screen.

To change the default theme, edit the `DEFAULT_THEME` constant in
`dashlayers/public/js/dashlayers.bundle.js` (then rebuild).

## 🧩 How it works

DashLayers ships two **bundled** assets (SCSS + JS, compiled by Frappe's esbuild pipeline) and wires them through `hooks.py`:

```python
# desk pages
app_include_css = "dashlayers.bundle.css"
app_include_js  = "dashlayers.bundle.js"

# website pages (e.g. login)
web_include_css = "dashlayers.bundle.css"
web_include_js  = "dashlayers.bundle.js"
```

The styling is authored in SCSS and split into small, focused partials for easy maintenance:

```
dashlayers/public/scss/
├─ dashlayers.bundle.scss      # entry — @imports the partials in order
└─ dashlayers/
   ├─ _mixins.scss             # shared helpers (dl-glass, dl-icon-tiles, dl-stagger, …)
   ├─ _themes.scss             # one dl-theme() mixin → all palettes as CSS variables
   ├─ _animations.scss         # keyframes + reduced-motion
   ├─ _springboard.scss        # the /desk launcher
   ├─ _modal.scss              # folder / apps popup
   ├─ _chrome.scss             # sidebar + page header + buttons
   ├─ _list.scss               # list-view "table"
   ├─ _switcher.scss           # floating theme switcher
   └─ _login.scss              # login / auth pages

dashlayers/public/js/
└─ dashlayers.bundle.js        # applies the theme + injects greeting & switcher
```

| Asset | Role |
| --- | --- |
| `scss/dashlayers.bundle.scss` (+ partials) | All theme styling. Palettes are emitted by the `dl-theme()` mixin into `:root` / `html[data-dashlayer="…"]` as CSS variables; every rule is scoped (e.g. `.desktop-wrapper`, `.desktop-modal`, `.frappe-list`, `.for-login`) so unrelated areas are never touched. |
| `js/dashlayers.bundle.js` | Applies the saved theme to `<html data-dashlayer>` before paint, injects the greeting header and the theme switcher on the springboard, and re-runs on SPA navigation. |

The active theme is just an attribute on the root element:

```html
<html data-dashlayer="midnight">
```

No DocTypes, no scheduled jobs, no server-side overrides — uninstalling the app removes all of it.

> Because the CSS is a compiled bundle, style changes require a rebuild. During development run `bench watch` (auto-recompiles on save); for a one-off use `bench build --app dashlayers`.

## 🛠️ Customizing / adding a theme

1. Open `dashlayers/public/scss/dashlayers/_themes.scss`.
2. Copy an existing palette block (e.g. the `html[data-dashlayer="aurora"]` one) and give it a new `data-dashlayer` name, e.g. `html[data-dashlayer="ocean"]`.
3. In the `@include dl-theme(...)` call, set `$accent`, `$accent2`, `$ink`, `$ink-soft`, the `$bg` gradient, the six `$grads` pairs, and `$scheme: dark` for a dark theme. (Glass/navbar/shadow tokens are derived from the accent automatically.)
4. Register the theme name in the `THEMES` array in `dashlayers/public/js/dashlayers.bundle.js`, and add a matching `&[data-theme="ocean"]` swatch color in `dashlayers/public/scss/dashlayers/_switcher.scss`.
5. Run `bench build --app dashlayers && bench --site <site> clear-cache`, then hard-refresh.

To change the default theme, edit the `DEFAULT_THEME` constant in `dashlayers/public/js/dashlayers.bundle.js`.

## 🤝 Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/dashlayers
pre-commit install
```

Pre-commit is configured to use the following tools:

- ruff
- eslint
- prettier
- pyupgrade

## 📄 License

[MIT](license.txt) © Saad
