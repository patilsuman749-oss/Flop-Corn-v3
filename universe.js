/* FLOP CORN — shared Cinematic Universe UI/data layer */
(function () {
    "use strict";

    const CONFIG = window.UNIVERSE_CONFIG || {};
    const API_KEY = "dd2ac99e60038c2254b111f850b49461";
    const BASE_URL = "https://flop-corn-tmdb.patilsuman749.workers.dev";
    const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
    const BACKDROP_URL = "https://image.tmdb.org/t/p/original";
    const FALLBACK_LOGO = "assets/images/flopcorn-logo.png";
    const CACHE_TTL = 6 * 60 * 60 * 1000;
    const CACHE_PREFIX = `flopCornUniverse:${CONFIG.slug || "default"}:`;

    const GENRES = {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
        99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
        27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
        53: "Thriller", 10752: "War"
    };

    const hero = document.getElementById("universeHero");
    const heroMedia = hero ? hero.querySelector(".universe-hero-media") : null;
    const movieContainer = document.getElementById("releasedMovies");
    const filterButtons = Array.from(document.querySelectorAll(".universe-filter-button"));
    const upcomingContainer = document.getElementById("upcomingProjects");
    const timeline = document.getElementById("universeTimeline");
    const connections = document.getElementById("universeConnections");
    const characters = document.getElementById("universeCharacters");
    const statsReleased = document.getElementById("statsReleased");
    const statsUpcoming = document.getElementById("statsUpcoming");
    const statsBegins = document.getElementById("statsBegins");

    let releasedData = [];
    let heroTimer = null;
    let heroIndex = 0;

    function getCache(key) {
        try {
            const raw = localStorage.getItem(CACHE_PREFIX + key);
            if (!raw) return null;
            const cached = JSON.parse(raw);
            if (!cached || !cached.savedAt || !cached.data || Date.now() - cached.savedAt > CACHE_TTL) {
                localStorage.removeItem(CACHE_PREFIX + key);
                return null;
            }
            return cached.data;
        } catch (_) { return null; }
    }

    function setCache(key, data) {
        try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ savedAt: Date.now(), data })); } catch (_) {}
    }

    async function fetchJson(endpoint) {
        const separator = endpoint.includes("?") ? "&" : "?";
        const url = `${BASE_URL}${endpoint}${separator}api_key=${encodeURIComponent(API_KEY)}&language=en-US`;
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 12000);
        try {
            const response = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
            if (!response.ok) throw new Error(`TMDB request failed (${response.status})`);
            return await response.json();
        } finally {
            window.clearTimeout(timeout);
        }
    }

    async function fetchMovie(id) {
        const cached = getCache(`movie:${id}`);
        if (cached) return cached;
        const data = await fetchJson(`/movie/${id}`);
        setCache(`movie:${id}`, data);
        return data;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    function yearFrom(movie, fallbackYear) {
        const y = Number(String(movie?.release_date || "").slice(0,4));
        return Number.isFinite(y) && y > 1900 ? y : (fallbackYear || "TBA");
    }

    function runtimeLabel(minutes) {
        const value = Number(minutes);
        if (!Number.isFinite(value) || value <= 0) return "Runtime unavailable";
        const h = Math.floor(value / 60), m = value % 60;
        return h ? `${h}h ${m}m` : `${m}m`;
    }

    function genresFor(movie, fallback) {
        if (Array.isArray(movie?.genres) && movie.genres.length) return movie.genres.slice(0, 4).map(x => x.name).filter(Boolean);
        if (Array.isArray(movie?.genre_ids) && movie.genre_ids.length) return movie.genre_ids.map(id => GENRES[id]).filter(Boolean).slice(0,4);
        return fallback || [];
    }

    function posterMarkup(movie, item) {
        const src = movie?.poster_path ? `${IMAGE_URL}${movie.poster_path}` : "";
        if (src) return `<img src="${src}" alt="${escapeHtml(movie.title || item.title)} poster" loading="lazy" data-fallback="${FALLBACK_LOGO}">`;
        return `<div class="universe-card-fallback" role="img" aria-label="${escapeHtml(item.title)} poster unavailable"><span>${escapeHtml(item.title)}</span></div>`;
    }

    function movieCard(movie, item) {
        const id = Number(movie?.id || item.id);
        const title = movie?.title || item.title;
        const year = yearFrom(movie, item.year);
        const rating = Number(movie?.vote_average);
        const genres = genresFor(movie, item.fallbackGenres || []);
        const overview = movie?.overview || item.fallbackOverview || "Movie overview unavailable.";
        const chapter = item.chapter || "Universe Film";
        return `
            <article class="universe-movie-card reveal-on-scroll" data-type="released" data-year="${year}" data-chapter="${escapeHtml(chapter)}">
                <a class="universe-card-main-link" href="movie.html?id=${id}" aria-label="Open ${escapeHtml(title)} details">
                    <div class="universe-card-media">
                        <span class="universe-card-badge">${escapeHtml(chapter)}</span>
                        ${posterMarkup(movie, item)}
                    </div>
                    <div class="universe-card-content">
                        <div class="universe-card-title-row">
                            <h3 class="universe-card-title">${escapeHtml(title)}</h3>
                            <span class="universe-card-year">${year}</span>
                        </div>
                        <p class="universe-card-overview">${escapeHtml(overview)}</p>
                        <div class="universe-card-meta">
                            <span class="universe-meta-pill">⭐ <strong>${Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : "—"}</strong></span>
                            <span class="universe-meta-pill">⏱ <strong>${runtimeLabel(movie?.runtime)}</strong></span>
                            <span class="universe-tmdb-pill">TMDB <strong>${id}</strong></span>
                        </div>
                        <div class="universe-card-genres">
                            ${genres.length ? genres.map(g => `<span class="universe-card-genre">${escapeHtml(g)}</span>`).join("") : `<span class="universe-card-genre">Genre unavailable</span>`}
                        </div>
                    </div>
                </a>
                <div class="universe-card-actions">
                    <a class="universe-card-action details" href="movie.html?id=${id}">Movie Details <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
                    <a class="universe-card-action trailer" href="movie.html?id=${id}&autoplayTrailer=1">Trailer <i class="fa-solid fa-film" aria-hidden="true"></i></a>
                </div>
            </article>`;
    }

    function upcomingCard(project) {
        const link = project.tmdbId ? `movie.html?id=${project.tmdbId}` : "";
        const media = project.tmdbPoster ?
            `<div class="universe-project-art tmdb-art" style="background-image:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.55)),url('${project.tmdbPoster}')"><span>${escapeHtml(project.artLabel || project.title)}</span></div>` :
            `<div class="universe-project-art"><span>${escapeHtml(project.artLabel || project.title)}</span></div>`;
        return `
            <article class="universe-project-card reveal-on-scroll" data-type="upcoming">
                <div class="universe-project-media">${media}</div>
                <div class="universe-project-body">
                    <div class="universe-project-topline"><span class="universe-status upcoming">${escapeHtml(project.status || "Upcoming")}</span><span class="universe-project-date">${escapeHtml(project.dateLabel || "Release date TBA")}</span></div>
                    <h3>${escapeHtml(project.title)}</h3>
                    <p>${escapeHtml(project.description || "More details will be added when reliably confirmed.")}</p>
                    <div class="universe-project-meta"><span>${project.tmdbId ? `TMDB: <strong>${project.tmdbId}</strong>` : "TMDB: <strong>Not selected</strong>"}</span><span>${escapeHtml(project.meta || "")}</span></div>
                    ${link ? `<a href="${link}" class="universe-project-link">Open movie details <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>` : `<span class="universe-project-disabled">Details link not available yet</span>`}
                </div>
            </article>`;
    }

    function renderTimeline() {
        if (!timeline) return;
        const items = CONFIG.timeline || [];
        timeline.innerHTML = items.map((item) => `
            <article class="universe-timeline-item reveal-on-scroll">
                <div class="universe-timeline-node">${escapeHtml(item.node || item.year || "•")}</div>
                <div class="universe-timeline-card">
                    <span class="universe-status ${item.future ? "upcoming" : "released"}">${escapeHtml(item.status || (item.future ? "Future" : "Released"))}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.description || "")}</p>
                    ${item.link ? `<a href="${item.link}">${escapeHtml(item.linkLabel || "Open details")} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>` : ""}
                </div>
            </article>`).join("");
    }

    function renderConnections() {
        if (!connections) return;
        const steps = CONFIG.connections || [];
        connections.innerHTML = steps.map((s,i) => `${i ? `<div class="universe-connection-line" aria-hidden="true"><i class="fa-solid fa-chevron-right"></i></div>` : ""}<div class="universe-connection-step reveal-on-scroll ${s.future ? "future" : ""}"><span>${escapeHtml(s.index || String(i+1).padStart(2,"0"))}</span><strong>${escapeHtml(s.title)}</strong><small>${escapeHtml(s.subtitle || "")}</small></div>`).join("");
        const note = document.getElementById("universeConnectionNote");
        if (note) note.textContent = CONFIG.connectionNote || "This guide uses established connections and does not invent story links between unrelated films.";
    }

    function renderCharacters() {
        if (!characters) return;
        characters.innerHTML = (CONFIG.characters || []).map(ch => `
            <article class="universe-character-card reveal-on-scroll">
                <div class="universe-character-icon">${escapeHtml(ch.icon || ch.name?.[0] || "•")}</div>
                <div><span>${escapeHtml(ch.label || "KEY FIGURE")}</span><h3>${escapeHtml(ch.name)}</h3><p>${escapeHtml(ch.description || "")}</p></div>
            </article>`).join("");
    }

    function bindImageFallbacks() {
        document.querySelectorAll("img[data-fallback]").forEach(img => {
            img.addEventListener("error", function onError() {
                img.removeEventListener("error", onError);
                const fallback = img.dataset.fallback;
                img.outerHTML = `<div class="universe-card-fallback" role="img" aria-label="Poster unavailable"><span>${escapeHtml(CONFIG.shortTitle || "FLOP CORN")}</span></div>`;
            });
        });
    }

    function observeReveals(scope = document) {
        const elements = Array.from(scope.querySelectorAll(".reveal-on-scroll:not(.is-observed)"));
        if (!elements.length) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
            elements.forEach(el => el.classList.add("is-observed","is-visible"));
            return;
        }
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible","is-observed");
                obs.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
        elements.forEach(el => observer.observe(el));
    }

    function setHeroBackdrops(movies) {
        if (!heroMedia) return;
        const preferred = (CONFIG.heroMovieIds || []).map(Number);
        const byId = new Map(movies.map(m => [Number(m.id), m]));
        const paths = preferred.map(id => byId.get(id)?.backdrop_path).filter(Boolean);
        const fallbacks = movies.map(m => m.backdrop_path).filter(Boolean);
        const backdrops = [...new Set([...paths, ...fallbacks])].map(p => `${BACKDROP_URL}${p}`);
        if (!backdrops.length) {
            heroMedia.style.backgroundImage = "radial-gradient(circle at 55% 25%, rgba(255,210,28,.18), transparent 35%),linear-gradient(135deg,#222,#090909)";
            return;
        }
        const show = (index) => {
            heroIndex = index % backdrops.length;
            hero?.classList.add("is-changing");
            window.setTimeout(() => { heroMedia.style.backgroundImage = `url(\"${backdrops[heroIndex]}\")`; hero?.classList.remove("is-changing"); }, 240);
        };
        show(0);
        if (backdrops.length > 1) heroTimer = window.setInterval(() => show(heroIndex + 1), 7000);
    }

    function applyFilter(filter) {
        const cards = Array.from(document.querySelectorAll(".universe-movie-card,.universe-project-card"));
        cards.forEach(card => card.classList.toggle("is-hidden", filter !== "all" && (card.dataset.type || "") !== filter));
        filterButtons.forEach(btn => {
            const active = btn.dataset.filter === filter;
            btn.classList.toggle("is-active", active);
            btn.setAttribute("aria-selected", String(active));
        });
        if (movieContainer) movieContainer.hidden = filter === "upcoming";
        if (upcomingContainer) upcomingContainer.closest("section")?.toggleAttribute("hidden", filter === "released" && (CONFIG.upcoming || []).length === 0);
    }

    function initFilters() {
        filterButtons.forEach(btn => btn.addEventListener("click", () => {
            const filter = btn.dataset.filter || "all";
            applyFilter(filter);
            const target = filter === "upcoming" ? document.getElementById("upcoming-section") : document.getElementById("universe-movies");
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        }));
    }

    async function loadMovies() {
        if (!movieContainer) return;
        const items = Array.isArray(CONFIG.movies) ? CONFIG.movies : [];
        if (!items.length) {
            movieContainer.innerHTML = `<div class="universe-error-card"><h3>No films configured</h3><p>The universe is ready, but no movie entries were supplied.</p></div>`;
            return;
        }
        movieContainer.innerHTML = `<div class="universe-loading-card"><span class="universe-spinner"></span>Loading ${escapeHtml(CONFIG.shortTitle || "universe")} films from TMDB…</div>`;
        const results = await Promise.allSettled(items.map(item => fetchMovie(item.id)));
        releasedData = results.map((result,i) => {
            if (result.status === "fulfilled") return result.value;
            const item=items[i];
            return { id:item.id, title:item.title, release_date:`${item.year || "1900"}-01-01`, overview:item.fallbackOverview || "Movie information unavailable.", vote_average:0, runtime:0, genres:(item.fallbackGenres||[]).map(name=>({name})), poster_path:null, backdrop_path:null };
        });
        movieContainer.innerHTML = releasedData.map((movie,i)=>movieCard(movie,items[i])).join("");
        bindImageFallbacks();
        setHeroBackdrops(releasedData);
        observeReveals(movieContainer);
    }

    function renderUpcoming() {
        if (!upcomingContainer) return;
        const items = CONFIG.upcoming || [];
        upcomingContainer.innerHTML = items.length ? items.map(upcomingCard).join("") : `<article class="universe-project-card reveal-on-scroll"><div class="universe-project-media"><div class="universe-project-art"><span>MORE TO COME</span></div></div><div class="universe-project-body"><div class="universe-project-topline"><span class="universe-status upcoming">Watchlist</span><span class="universe-project-date">TBA</span></div><h3>No additional confirmed projects listed</h3><p>FLOP CORN will add future universe entries when they are reliably confirmed.</p></div></article>`;
        observeReveals(upcomingContainer);
    }

    function initTextAndStats() {
        document.title = `${CONFIG.title} | FLOP CORN`;
        const set = (id, value) => { const el=document.getElementById(id); if (el) el.textContent=value; };
        set("heroEyebrow", CONFIG.eyebrow || "CINEMATIC UNIVERSE");
        set("heroKicker", CONFIG.kicker || "CONNECTED STORIES");
        set("universeTitleShort", CONFIG.titleShort || CONFIG.shortTitle || "UNIVERSE");
        set("universeSubtitle", CONFIG.title || "Cinematic Universe");
        set("heroCopy", CONFIG.description || "Explore the connected film universe on FLOP CORN.");
        set("moviesKicker", CONFIG.moviesKicker || "THE FILMS");
        set("moviesTitle", CONFIG.moviesTitle || `${CONFIG.shortTitle || "Universe"} Movie Collection`);
        set("moviesCopy", CONFIG.moviesCopy || "TMDB supplies artwork and movie metadata; movie.html remains the destination for details, reviews, watchlist, trailers and Where to Watch.");
        set("timelineKicker", CONFIG.timelineKicker || "THE JOURNEY");
        set("timelineTitle", CONFIG.timelineTitle || `${CONFIG.shortTitle || "Universe"} Timeline`);
        set("connectionsKicker", CONFIG.connectionsKicker || "CONNECTED STORIES");
        set("connectionsTitle", CONFIG.connectionsTitle || "How the Universe Connects");
        set("charactersKicker", CONFIG.charactersKicker || "KEY FIGURES");
        set("charactersTitle", CONFIG.charactersTitle || "Character Connections");
        set("upcomingKicker", CONFIG.upcomingKicker || "WHAT'S NEXT");
        set("upcomingTitle", CONFIG.upcomingTitle || `Upcoming / Announced ${CONFIG.shortTitle || "Universe"} Projects`);
        set("statsReleased", String((CONFIG.movies || []).length));
        set("statsUpcoming", String((CONFIG.upcoming || []).length));
        const firstYear=Math.min(...(CONFIG.movies || []).map(m=>Number(m.year)).filter(Boolean));
        set("statsBegins", Number.isFinite(firstYear) ? String(firstYear) : "—");
        const media=document.getElementById("heroMediaLabel"); if (media) media.textContent=CONFIG.heroMediaAlt || `${CONFIG.shortTitle || "Universe"} cinematic backdrop`;
    }

    function init() {
        initTextAndStats();
        initFilters();
        renderTimeline();
        renderConnections();
        renderCharacters();
        renderUpcoming();
        applyFilter("all");
        observeReveals();
        loadMovies().catch(error => {
            console.error(`${CONFIG.shortTitle || "Universe"} TMDB error:`, error);
            if (movieContainer) movieContainer.innerHTML = `<div class="universe-error-card"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><h3>TMDB is temporarily unavailable</h3><p>The universe layout is still available; retry later for live posters, ratings and metadata.</p></div>`;
        });
    }

    document.addEventListener("DOMContentLoaded", init, { once:true });
    window.addEventListener("pagehide", () => { if (heroTimer) window.clearInterval(heroTimer); });
})();
