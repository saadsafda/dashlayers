/* ============================================================
   DashLayers — Desk Theme runtime
   - Applies the saved theme to <html data-dashlayer="...">
   - Injects a greeting header + floating theme switcher onto
     the Frappe "Desktop" springboard (.desktop-wrapper)
   ============================================================ */
(function () {
	"use strict";

	var THEMES = ["aurora", "midnight", "sunset", "forest"];
	var STORAGE_KEY = "dashlayers-theme";
	var DEFAULT_THEME = "aurora";

	function getTheme() {
		try {
			var t = localStorage.getItem(STORAGE_KEY);
			return THEMES.indexOf(t) !== -1 ? t : DEFAULT_THEME;
		} catch (e) {
			return DEFAULT_THEME;
		}
	}

	function applyTheme(theme) {
		document.documentElement.setAttribute("data-dashlayer", theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch (e) {
			/* private mode — ignore */
		}
		var sw = document.querySelector(".dl-switcher");
		if (sw) {
			sw.querySelectorAll(".dl-swatch").forEach(function (s) {
				s.classList.toggle("active", s.dataset.theme === theme);
			});
		}
	}

	// apply immediately to avoid a flash of the unthemed desk
	applyTheme(getTheme());

	function greetingText() {
		var h = new Date().getHours();
		if (h < 12) return "Good morning";
		if (h < 17) return "Good afternoon";
		return "Good evening";
	}

	function userName() {
		try {
			if (window.frappe && frappe.boot && frappe.boot.user) {
				return frappe.boot.user.first_name || frappe.boot.user.full_name || "";
			}
		} catch (e) {}
		var fn = (window.frappe && frappe.get_cookie && frappe.get_cookie("full_name")) || "";
		return (fn || "").split(" ")[0];
	}

	function buildGreeting() {
		var wrap = document.createElement("div");
		wrap.className = "dl-greeting";
		var name = userName();
		var heading = greetingText() + (name ? ", " + name : "");
		var d = new Date();
		var date = d.toLocaleDateString(undefined, {
			weekday: "long",
			month: "long",
			day: "numeric",
		});
		wrap.innerHTML =
			"<h1>" + heading + "</h1>" + "<p>" + date + " · Pick an app to get started</p>";
		return wrap;
	}

	function buildSwitcher() {
		var bar = document.createElement("div");
		bar.className = "dl-switcher";
		var label = document.createElement("span");
		label.className = "dl-switcher-label";
		label.textContent = "Theme";
		bar.appendChild(label);

		var current = getTheme();
		THEMES.forEach(function (theme) {
			var dot = document.createElement("button");
			dot.type = "button";
			dot.className = "dl-swatch" + (theme === current ? " active" : "");
			dot.dataset.theme = theme;
			dot.title = theme.charAt(0).toUpperCase() + theme.slice(1);
			dot.setAttribute("aria-label", "Switch to " + theme + " theme");
			dot.addEventListener("click", function () {
				applyTheme(theme);
			});
			bar.appendChild(dot);
		});
		return bar;
	}

	function enhance() {
		var wrapper = document.querySelector(".desktop-wrapper");
		if (!wrapper) return;

		// greeting — placed just above the icon grid
		if (!wrapper.querySelector(".dl-greeting")) {
			var container = wrapper.querySelector(".desktop-container");
			if (container && container.parentNode) {
				container.parentNode.insertBefore(buildGreeting(), container);
			}
		}

		// floating theme switcher (one per document)
		if (!document.querySelector(".dl-switcher")) {
			document.body.appendChild(buildSwitcher());
		}
	}

	function init() {
		enhance();
		// re-run on SPA navigation / lazy render of the springboard
		var obs = new MutationObserver(function () {
			enhance();
		});
		obs.observe(document.body, { childList: true, subtree: true });

		// also hook Frappe's router if available
		try {
			if (window.frappe && frappe.router && frappe.router.on) {
				frappe.router.on("change", function () {
					setTimeout(enhance, 100);
				});
			}
		} catch (e) {}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
