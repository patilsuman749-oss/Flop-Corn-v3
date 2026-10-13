// =========================================
// MOBILE BOTTOM TASKBAR
// Injects a 5-shortcut app-style taskbar
// (Home, News, Box Office, Calendar, Explore)
// on every page that includes this script.
// =========================================

(function () {

    var ITEMS = [
        { href: "index.html",       icon: "fa-solid fa-house",         label: "Home",       match: "index.html" },
        { href: "news.html",        icon: "fa-solid fa-newspaper",     label: "News",       match: "news.html" },
        { href: "box-office.html",  icon: "fa-solid fa-chart-column",  label: "Box Office", match: "box-office.html" },
        { href: "schedule.html",    icon: "fa-solid fa-calendar-days", label: "Calendar",   match: "schedule.html" },
        { href: "explore.html",     icon: "fa-solid fa-compass",       label: "Explore",    match: "explore.html" }
    ];

    function currentPage() {
        var path = window.location.pathname.split("/").pop();
        return path === "" ? "index.html" : path;
    }

    function buildNav() {
        var page = currentPage();

        var nav = document.createElement("nav");
        nav.className = "fc-bottom-nav";
        nav.setAttribute("aria-label", "Quick navigation");

        ITEMS.forEach(function (item) {
            var link = document.createElement("a");
            link.href = item.href;
            link.className = "fc-bottom-nav-item";
            if (page === item.match) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
            link.innerHTML =
                '<i class="' + item.icon + '"></i><span>' + item.label + "</span>";
            nav.appendChild(link);
        });

        document.body.appendChild(nav);
        document.body.classList.add("has-fc-bottom-nav");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", buildNav);
    } else {
        buildNav();
    }
})();
