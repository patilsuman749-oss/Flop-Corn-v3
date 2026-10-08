/* =========================================================
   FLOP CORN 🍿 — LCU DATA / INTERACTION LAYER
   Reuses the site's existing TMDB worker + key and the
   existing movie.html details/trailer experience.
========================================================= */

(function () {
    "use strict";

    const API_KEY = "dd2ac99e60038c2254b111f850b49461";
    const BASE_URL = "https://flop-corn-tmdb.patilsuman749.workers.dev";
    const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
    const BACKDROP_URL = "https://image.tmdb.org/t/p/original";
    const FALLBACK_LOGO = "assets/images/flopcorn-logo.png";
    const CACHE_TTL = 6 * 60 * 60 * 1000;
    const CACHE_PREFIX = "flopCornLcuTmdb:";

    const GENRES = {
        28: "Action",
        12: "Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        14: "Fantasy",
        36: "History",
        27: "Horror",
        10402: "Music",
        9648: "Mystery",
        10749: "Romance",
        878: "Sci-Fi",
        53: "Thriller",
        10752: "War"
    };

    const RELEASED_MOVIES = [
        {
            id: 587030,
            title: "Kaithi",
            year: 2019,
            fallbackOverview: "An ex-convict is drawn into a dangerous night-time operation after a police drug raid.",
            fallbackGenres: ["Action", "Crime", "Thriller"]
        },
        {
            id: 762504,
            title: "Vikram",
            year: 2022,
            fallbackOverview: "A covert operative uncovers a dangerous trail while investigating a series of brutal murders.",
            fallbackGenres: ["Action", "Crime", "Thriller"]
        },
        {
            id: 949229,
            title: "Leo",
            year: 2023,
            fallbackOverview: "A quiet cafe owner is forced to confront a violent past when a drug cartel claims to know him.",
            fallbackGenres: ["Action", "Crime", "Thriller"]
        }
    ];

    const hero = document.getElementById("lcuHero");
    const heroMedia = hero ? hero.querySelector(".lcu-hero-media") : null;
    const releasedContainer = document.getElementById("releasedMovies");
    const filterButtons = Array.from(document.querySelectorAll(".lcu-filter-button"));
    const projectCards = Array.from(document.querySelectorAll(".lcu-project-card"));

    let releasedData = [];
    let currentHeroIndex = 0;
    let heroTimer = null;

    function getCache(key) {
        try {
            const raw = localStorage.getItem(CACHE_PREFIX + key);
            if (!raw) return null;

            const cached = JSON.parse(raw);

            if (
                !cached ||
                !cached.savedAt ||
                !cached.data ||
                Date.now() - cached.savedAt > CACHE_TTL
            ) {
                localStorage.removeItem(CACHE_PREFIX + key);
                return null;
            }

            return cached.data;
        } catch (error) {
            return null;
        }
    }

    function setCache(key, data) {
        try {
            localStorage.setItem(
                CACHE_PREFIX + key,
                JSON.stringify({
                    savedAt: Date.now(),
                    data
                })
            );
        } catch (error) {
            // Ignore storage quota/privacy failures.
        }
    }

    async function fetchJson(endpoint) {
        const separator = endpoint.includes("?") ? "&" : "?";
        const url =
            `${BASE_URL}${endpoint}` +
            `${separator}api_key=${encodeURIComponent(API_KEY)}` +
            `&language=en-US`;

        const response = await fetch(url, {
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`TMDB request failed (${response.status})`);
        }

        return response.json();
    }

    async function fetchMovie(movieId) {
        const cached = getCache(`movie:${movieId}`);

        if (cached) {
            return cached;
        }

        const data = await fetchJson(`/movie/${movieId}`);
        setCache(`movie:${movieId}`, data);
        return data;
    }

    async function fetchBenz() {
        try {
            return await fetchMovie(1274230);
        } catch (error) {
            console.warn("Benz TMDB request failed:", error);
            return null;
        }
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function toYear(releaseDate, fallbackYear) {
        const value = String(releaseDate || "");
        const year = Number(value.slice(0, 4));
        return Number.isFinite(year) && year > 1900 ? year : fallbackYear;
    }

    function runtimeLabel(minutes) {
        if (!Number.isFinite(Number(minutes)) || Number(minutes) <= 0) {
            return "Runtime unavailable";
        }

        const hours = Math.floor(Number(minutes) / 60);
        const mins = Number(minutes) % 60;

        if (!hours) {
            return `${mins}m`;
        }

        return `${hours}h ${mins}m`;
    }

    function genreLabels(movie, fallbackGenres) {
        if (Array.isArray(movie?.genres) && movie.genres.length) {
            return movie.genres
                .slice(0, 4)
                .map((genre) => genre.name)
                .filter(Boolean);
        }

        if (Array.isArray(movie?.genre_ids) && movie.genre_ids.length) {
            return movie.genre_ids
                .map((id) => GENRES[id])
                .filter(Boolean)
                .slice(0, 4);
        }

        return fallbackGenres || [];
    }

    function safeImage(url) {
        return url || FALLBACK_LOGO;
    }

    function movieCard(movie, fallback) {
        const title = movie.title || fallback.title;
        const year = toYear(movie.release_date, fallback.year);
        const overview = movie.overview || fallback.fallbackOverview || "Movie overview unavailable.";
        const rating = Number(movie.vote_average);

        const genres = genreLabels(movie, fallback.fallbackGenres);

        const posterUrl = movie.poster_path
            ? `${IMAGE_URL}${movie.poster_path}`
            : FALLBACK_LOGO;

        const movieId = Number(movie.id || fallback.id);
        const detailsUrl = `movie.html?id=${movieId}`;
        const trailerUrl = `movie.html?id=${movieId}&autoplayTrailer=1`;

        const genreHtml = genres.length
            ? genres
                .map((genre) => `<span class="lcu-card-genre">${escapeHtml(genre)}</span>`)
                .join("")
            : `<span class="lcu-card-genre">Genre unavailable</span>`;

        return `
            <article class="lcu-movie-card reveal-on-scroll" data-type="released">
                <a class="lcu-card-main-link" href="${detailsUrl}">
                    <div class="lcu-card-media">
                        <span class="lcu-card-badge">Released</span>
                        <img
                            src="${safeImage(posterUrl)}"
                            alt="${escapeHtml(title)} poster"
                            loading="lazy"
                            data-fallback="${FALLBACK_LOGO}"
                        >
                    </div>

                    <div class="lcu-card-content">
                        <div class="lcu-card-title-row">
                            <h3 class="lcu-card-title">${escapeHtml(title)}</h3>
                            <span class="lcu-card-year">${year || "TBA"}</span>
                        </div>

                        <p class="lcu-card-overview">${escapeHtml(overview)}</p>

                        <div class="lcu-card-meta">
                            <span class="lcu-meta-pill">
                                ⭐
                                <strong>${Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : "—"}</strong>
                            </span>

                            <span class="lcu-meta-pill">
                                <i class="fa-regular fa-clock" aria-hidden="true"></i>
                                ${escapeHtml(runtimeLabel(movie.runtime))}
                            </span>

                            <span class="lcu-tmdb-pill">
                                TMDB <strong>${movieId}</strong>
                            </span>
                        </div>

                        <div class="lcu-card-genres">
                            ${genreHtml}
                        </div>
                    </div>
                </a>

                <div class="lcu-card-actions">
                    <a class="lcu-card-action details" href="${detailsUrl}">
                        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                        Details
                    </a>

                    <a
                        class="lcu-card-action trailer"
                        href="${trailerUrl}"
                        aria-label="Open ${escapeHtml(title)} and launch the existing trailer"
                    >
                        <i class="fa-solid fa-film" aria-hidden="true"></i>
                        Trailer
                    </a>
                </div>
            </article>
        `;
    }

    function bindImageFallbacks(scope) {
        scope.querySelectorAll("img[data-fallback]").forEach((image) => {
            image.addEventListener(
                "error",
                () => {
                    if (image.src.endsWith(FALLBACK_LOGO)) {
                        return;
                    }

                    image.src = image.dataset.fallback;
                },
                { once: true }
            );
        });
    }

    async function loadReleasedMovies() {
        if (!releasedContainer) return;

        releasedContainer.innerHTML = `
            <div class="lcu-loading-card">
                <span class="lcu-spinner"></span>
                Loading Kaithi, Vikram and Leo from TMDB…
            </div>
        `;

        const results = await Promise.allSettled(
            RELEASED_MOVIES.map((fallback) =>
                fetchMovie(fallback.id).then((movie) => ({ movie, fallback }))
            )
        );

        releasedData = results.map((result, index) => {
            if (result.status === "fulfilled") {
                return result.value.movie;
            }

            console.warn(
                `LCU movie ${RELEASED_MOVIES[index].title} could not load:`,
                result.reason
            );

            return {
                id: RELEASED_MOVIES[index].id,
                title: RELEASED_MOVIES[index].title,
                release_date: `${RELEASED_MOVIES[index].year}-01-01`,
                overview: RELEASED_MOVIES[index].fallbackOverview,
                vote_average: 0,
                runtime: 0,
                genres: RELEASED_MOVIES[index].fallbackGenres.map((name) => ({ name })),
                poster_path: null,
                backdrop_path: null
            };
        });

        releasedContainer.innerHTML = releasedData
            .map((movie, index) => movieCard(movie, RELEASED_MOVIES[index]))
            .join("");

        bindImageFallbacks(releasedContainer);
        observeReveals(releasedContainer);
        setHeroBackdrops(releasedData);
    }

    async function loadUpcomingData() {
        const benzData = await fetchBenz();

        if (!benzData) {
            return;
        }

        const benzProject = projectCards.find(
            (card) => card.dataset.project === "benz"
        );

        if (benzProject) {
            const media = benzProject.querySelector(".lcu-project-media");
            const art = benzProject.querySelector(".lcu-project-art");
            const source = benzProject.querySelector('[data-project-source="benz"]');
            const tmdbId = benzProject.querySelector('[data-tmdb-id="benz"]');
            const link = benzProject.querySelector('[data-project-link="benz"]');

            if (media && benzData.backdrop_path) {
                media.classList.add("tmdb-art");
                media.style.backgroundImage =
                    `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.5)), url("${BACKDROP_URL}${benzData.backdrop_path}")`;
            }

            if (art && benzData.poster_path) {
                art.style.backgroundImage =
                    `linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,.62)), url("${IMAGE_URL}${benzData.poster_path}")`;
                art.style.backgroundSize = "cover";
                art.style.backgroundPosition = "center";
            }

            if (source) {
                source.textContent =
                    benzData.poster_path || benzData.backdrop_path
                        ? "TMDB artwork loaded"
                        : "TMDB entry found; artwork unavailable";
            }

            if (tmdbId) {
                tmdbId.textContent = benzData.id || "1274230";
            }

            if (link && benzData.id) {
                link.href = `movie.html?id=${benzData.id}`;
            }
        }


    }

    function setHeroBackdrops(movies) {
        if (!heroMedia || !Array.isArray(movies)) return;

        const backdrops = movies
            .map((movie) =>
                movie.backdrop_path
                    ? `${BACKDROP_URL}${movie.backdrop_path}`
                    : null
            )
            .filter(Boolean);

        if (!backdrops.length) {
            heroMedia.style.backgroundImage =
                "radial-gradient(circle at 55% 25%, rgba(255,210,28,.18), transparent 35%), linear-gradient(135deg, #222, #090909)";
            return;
        }

        function showBackdrop(index) {
            currentHeroIndex = index % backdrops.length;

            if (hero) {
                hero.classList.add("is-changing");
            }

            window.setTimeout(() => {
                heroMedia.style.backgroundImage =
                    `url("${backdrops[currentHeroIndex]}")`;

                if (hero) {
                    hero.classList.remove("is-changing");
                }
            }, 260);
        }

        showBackdrop(0);

        if (backdrops.length > 1) {
            heroTimer = window.setInterval(() => {
                showBackdrop(currentHeroIndex + 1);
            }, 7000);
        }
    }

    function applyFilter(filter) {
        const allMovieCards = Array.from(
            document.querySelectorAll("#releasedMovies .lcu-movie-card, #upcoming-projects .lcu-project-card")
        );

        allMovieCards.forEach((card) => {
            const type = card.dataset.type || "";
            const show =
                filter === "all" ||
                filter === type;

            card.classList.toggle("is-hidden", !show);
        });

        const filterGroups = [
            document.getElementById("releasedMovies"),
            document.querySelector("#upcoming-projects .lcu-upcoming-grid")
        ].filter(Boolean);

        filterGroups.forEach((grid) => {
            const visible = grid.querySelectorAll(
                ".lcu-movie-card:not(.is-hidden), .lcu-project-card:not(.is-hidden)"
            );

            grid.hidden = visible.length === 0 && filter !== "all";
        });

        filterButtons.forEach((button) => {
            const active = button.dataset.filter === filter;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-selected", String(active));
        });
    }

    function initFilters() {
        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                applyFilter(button.dataset.filter || "all");

                const target =
                    button.dataset.filter === "upcoming"
                        ? document.getElementById("upcoming-projects")
                        : document.getElementById("lcu-movies");

                if (target && button.dataset.filter !== "all") {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    }

    function observeReveals(scope = document) {
        const elements = Array.from(
            scope.querySelectorAll(".reveal-on-scroll:not(.is-observed)")
        );

        if (!elements.length) return;

        if (
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            elements.forEach((element) => {
                element.classList.add("is-observed", "is-visible");
            });
            return;
        }

        if (!("IntersectionObserver" in window)) {
            elements.forEach((element) => {
                element.classList.add("is-observed", "is-visible");
            });
            return;
        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");
                    entry.target.classList.add("is-observed");
                    currentObserver.unobserve(entry.target);
                });
            },
            {
                rootMargin: "0px 0px -8% 0px",
                threshold: 0.12
            }
        );

        elements.forEach((element) => observer.observe(element));
    }

    function init() {
        initFilters();
        observeReveals();

        loadReleasedMovies().catch((error) => {
            console.error("LCU release data error:", error);

            if (releasedContainer) {
                releasedContainer.innerHTML = `
                    <div class="lcu-error-card">
                        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                        <h3>LCU movies could not fully load</h3>
                        <p>
                            TMDB is temporarily unavailable. The page kept the LCU structure intact;
                            try again later for live artwork and metadata.
                        </p>
                    </div>
                `;
            }
        });

        loadUpcomingData().catch((error) => {
            console.warn("LCU upcoming data error:", error);
        });

        applyFilter("all");
    }

    document.addEventListener("DOMContentLoaded", init, { once: true });

    window.addEventListener("pagehide", () => {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
    });
})();
