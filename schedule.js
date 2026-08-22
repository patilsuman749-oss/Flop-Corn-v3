/* =========================================
   FLOP CORN 🍿
   SCHEDULE PAGE
========================================= */

const API_KEY = "dd2ac99e60038c2254b111f850b49461";
const BASE_URL = "https://flop-corn-tmdb.patilsuman749.workers.dev";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";


const schedList = document.getElementById("schedList");

const sideTabs = document.querySelectorAll(".sched-side-tab");
const typePills = document.querySelectorAll(".sched-pill");


/* CURRENT SELECTIONS */

let activeStatus = "released";
let activeType = "all";


/* CACHE SO WE DON'T RE-FETCH TMDB EVERY CLICK */

const cache = {};


/* =========================================
   DATE HELPERS
========================================= */

function toISODate(date) {

    return date.toISOString().split("T")[0];

}


function formatDateBadge(dateStr) {

    const date = new Date(`${dateStr}T00:00:00`);

    return {
        weekday: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date).toUpperCase(),
        day: new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date),
        month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date).toUpperCase()
    };

}


function formatYearLabel(dateStr) {

    if (!dateStr) {
        return "TBA";
    }

    return new Date(`${dateStr}T00:00:00`).getFullYear();

}


/* RANGE OF DATES (IN "YYYY-MM-DD") FOR EACH SIDEBAR STATUS */

function getRangeForStatus(status) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (status === "released") {

        // Currently in theatres: released in the last ~45 days, up to today
        const start = new Date(today);
        start.setDate(start.getDate() - 45);

        return {
            gte: toISODate(start),
            lte: toISODate(today),
            sort: "release_date.desc"
        };

    }

    if (status === "upcoming") {

        // Releasing soon: today up to +90 days
        const end = new Date(today);
        end.setDate(end.getDate() + 90);

        return {
            gte: toISODate(today),
            lte: toISODate(end),
            sort: "release_date.asc"
        };

    }

    // announced: further out than 90 days, up to ~2 years ahead
    const start = new Date(today);
    start.setDate(start.getDate() + 91);

    const end = new Date(today);
    end.setFullYear(end.getFullYear() + 2);

    return {
        gte: toISODate(start),
        lte: toISODate(end),
        sort: "release_date.asc"
    };

}


/* =========================================
   FETCH FROM TMDB (VIA WORKER)
   Same approach as the homepage release
   calendar in app.js: discover + region=IN,
   filtered on the plain release_date field.
========================================= */

async function fetchSchedule(mediaType, status) {

    const cacheKey = `${mediaType}-${status}`;

    if (cache[cacheKey]) {
        return cache[cacheKey];
    }


    const range = getRangeForStatus(status);

    const dateField =
        mediaType === "tv"
            ? "first_air_date"
            : "release_date";

    const results = [];

    try {

        for (let page = 1; page <= 5; page++) {

            const url =
                `${BASE_URL}/discover/${mediaType}`
                + `?api_key=${API_KEY}`
                + `&language=en-US`
                + `&region=IN`
                + `&${dateField}.gte=${range.gte}`
                + `&${dateField}.lte=${range.lte}`
                + `&sort_by=popularity.desc`
                + `&include_adult=false`
                + `&page=${page}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Schedule could not load");
            }

            const data = await response.json();

            results.push(...data.results);

            if (page >= data.total_pages) {
                break;
            }

        }

    } catch (error) {

        console.error("Schedule fetch error:", error);

        return null;

    }


    // Dedupe

    const unique = Array.from(
        new Map(results.map((item) => [item.id, item])).values()
    );


    unique.forEach((item) => {

        item._mediaType = mediaType;
        item._releaseDate =
            mediaType === "tv"
                ? item.first_air_date
                : item.release_date;

    });


    // Same guard the homepage calendar uses: keep only titles with a
    // release date actually inside the requested range, plus a poster.

    const cleaned = unique.filter(
        (item) =>
            item._releaseDate
            && item._releaseDate >= range.gte
            && item._releaseDate <= range.lte
            && item.poster_path
    );


    cache[cacheKey] = cleaned;

    return cleaned;

}


/* =========================================
   BUILD + RENDER
========================================= */

async function loadSchedule() {

    schedList.innerHTML = `
        <p class="search-message">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading schedule...
        </p>
    `;


    const mediaTypes =
        activeType === "all"
            ? ["movie", "tv"]
            : [activeType];


    const chunks = await Promise.all(
        mediaTypes.map((type) => fetchSchedule(type, activeStatus))
    );


    if (chunks.some((chunk) => chunk === null)) {

        schedList.innerHTML = `
            <p class="search-message">
                <i class="fa-solid fa-triangle-exclamation"></i>
                Couldn't load the schedule right now. Please try again later.
            </p>
        `;

        return;

    }


    let items = chunks.flat();


    // Sort ascending/descending consistently based on status

    items.sort((a, b) => {

        if (activeStatus === "released") {
            return b._releaseDate.localeCompare(a._releaseDate);
        }

        return a._releaseDate.localeCompare(b._releaseDate);

    });


    if (items.length === 0) {

        schedList.innerHTML = `
            <p class="search-message">
                <i class="fa-solid fa-clapperboard"></i>
                Nothing here yet. Check back soon!
            </p>
        `;

        return;

    }


    renderGroupedList(items);

}


function renderGroupedList(items) {

    // Group items by their release date

    const groups = new Map();

    items.forEach((item) => {

        const key = item._releaseDate;

        if (!groups.has(key)) {
            groups.set(key, []);
        }

        groups.get(key).push(item);

    });


    schedList.innerHTML = "";


    groups.forEach((groupItems, dateStr) => {

        const badge = formatDateBadge(dateStr);

        const group = document.createElement("div");
        group.className = "sched-group";

        group.innerHTML = `
            <div class="sched-date-badge">
                <span class="sched-weekday">${badge.weekday}</span>
                <span class="sched-day">${badge.day}</span>
                <span class="sched-month">${badge.month}</span>
            </div>
            <div class="sched-group-cards"></div>
        `;

        const cardsWrap = group.querySelector(".sched-group-cards");

        groupItems.forEach((item) => {
            cardsWrap.appendChild(buildCard(item));
        });

        schedList.appendChild(group);

    });

}


function buildCard(item) {

    const card = document.createElement("a");
    card.className = "sched-card";

    const title = item.title || item.name || "Untitled";
    const year = formatYearLabel(item._releaseDate);

    const statusLabel =
        activeStatus === "released"
            ? "In Theatre"
            : activeStatus === "upcoming"
                ? "Coming Soon"
                : "Announced";

    if (item._mediaType === "tv") {

        // No dedicated show page yet — link out to TMDB for details
        card.href = `https://www.themoviedb.org/tv/${item.id}`;
        card.target = "_blank";
        card.rel = "noopener";

    } else {

        card.href = `movie.html?id=${item.id}`;

    }

    card.innerHTML = `
        <div class="sched-poster">
            ${
                item.poster_path
                    ? `<img src="${IMAGE_URL}${item.poster_path}" alt="${title}" loading="lazy">`
                    : `<div class="sched-no-poster"><i class="fa-solid fa-film"></i></div>`
            }
        </div>
        <div class="sched-card-title">${title}</div>
        <div class="sched-card-sub">${statusLabel} • ${year}</div>
    `;

    return card;

}


/* =========================================
   TAB / PILL EVENTS
========================================= */

sideTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        sideTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        activeStatus = tab.dataset.status;

        loadSchedule();

    });

});


typePills.forEach((pill) => {

    pill.addEventListener("click", () => {

        typePills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");

        activeType = pill.dataset.type;

        loadSchedule();

    });

});


/* =========================================
   INIT
========================================= */

loadSchedule();
