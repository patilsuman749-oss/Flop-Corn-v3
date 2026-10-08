/* =========================================
   FLOP CORN 🍿
   GLOBAL LIGHT / DARK MODE
   Shared by every page.
========================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "flopCornTheme";

    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null;
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (error) {
            // Ignore storage failures; the theme still works for this page.
        }
    }

    function applyTheme(theme) {
        const isLight = theme === "light";
        document.documentElement.classList.toggle("light-mode", isLight);

        if (document.body) {
            document.body.classList.toggle("light-mode", isLight);
        }

        const lamps = document.querySelectorAll(".theme-lamp");
        lamps.forEach((lamp) => {
            lamp.classList.toggle("lamp-on", isLight);
            lamp.title = isLight ? "Turn the lights off" : "Turn the lights on";
            lamp.setAttribute(
                "aria-label",
                isLight ? "Switch to dark mode" : "Switch to light mode"
            );
            lamp.setAttribute("aria-pressed", String(isLight));
        });

        const themeColor = isLight ? "#f5f3ed" : "#070707";
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "theme-color";
            document.head.appendChild(meta);
        }
        meta.content = themeColor;
    }

    function isHomepage() {
        const path = window.location.pathname || "";
        return path === "/" || path.endsWith("/index.html");
    }

    function initTheme() {
        const savedTheme = getSavedTheme();

        // The theme switcher is intentionally shown only on the homepage.
        const lamp = isHomepage() ? document.getElementById("themeLamp") : null;

        applyTheme(savedTheme === "light" ? "light" : "dark");

        if (!lamp) {
            return;
        }

        // Replace any previous handler on the homepage button with one global handler.
        if (!lamp.dataset.themeBound) {
            lamp.addEventListener("click", function () {
                const nextTheme = document.documentElement.classList.contains("light-mode")
                    ? "dark"
                    : "light";

                applyTheme(nextTheme);
                saveTheme(nextTheme);
            });

            lamp.dataset.themeBound = "true";
        }
    }

    // Apply the saved class as early as possible. The head preloader also handles
    // the first paint, while this keeps body and controls synchronized.
    const savedTheme = getSavedTheme();
    if (savedTheme === "light") {
        document.documentElement.classList.add("light-mode");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTheme, { once: true });
    } else {
        initTheme();
    }
})();
