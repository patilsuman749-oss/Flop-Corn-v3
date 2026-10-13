(function () {
  "use strict";

  const API_KEY = "dd2ac99e60038c2254b111f850b49461";
  const BASE_URL = "https://flop-corn-tmdb.patilsuman749.workers.dev";
  const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
  const PAGE_SIZE = 12;
  const state = { mode: "worldwide", year: "all", search: "", movies: [], visible: PAGE_SIZE, requestId: 0 };

  const els = {
    statCount: document.getElementById("boStatCount"),
    statGross: document.getElementById("boStatGross"),
    statTop: document.getElementById("boStatTop"),
    statTopTitle: document.getElementById("boStatTopTitle"),
    statRating: document.getElementById("boStatRating"),
    sectionTitle: document.getElementById("boSectionTitle"),
    sectionDescription: document.getElementById("boSectionDescription"),
    yearSelect: document.getElementById("boYearSelect"),
    worldwideButton: document.getElementById("boWorldwideButton"),
    indiaButton: document.getElementById("boIndiaButton"),
    searchInput: document.getElementById("boSearchInput"),
    chartPanel: document.getElementById("boChartPanel"),
    chart: document.getElementById("boChart"),
    resultsTitle: document.getElementById("boResultsTitle"),
    resultsCount: document.getElementById("boResultsCount"),
    movieGrid: document.getElementById("boMovieGrid"),
    loadMore: document.getElementById("boLoadMore"),
    themeToggle: document.getElementById("boThemeToggle")
  };

  const compactUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
  const fullUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function safeMoviePath(path) {
    return path ? IMAGE_URL + path : "";
  }

  function currency(value) {
    const amount = Number(value) || 0;
    return amount > 0 ? compactUSD.format(amount) : "Not reported";
  }

  function fullCurrency(value) {
    const amount = Number(value) || 0;
    return amount > 0 ? fullUSD.format(amount) : "Not reported";
  }

  function rating(value) {
    const amount = Number(value) || 0;
    return amount > 0 ? amount.toFixed(1) : "—";
  }

  function releaseYear(movie) {
    const date = movie.release_date || "";
    return /^\d{4}/.test(date) ? date.slice(0, 4) : "Year unknown";
  }

  function languageLabel(code) {
    const names = { en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil", kn: "Kannada", ml: "Malayalam", ko: "Korean", ja: "Japanese", zh: "Chinese", es: "Spanish", fr: "French", de: "German" };
    return names[code] || (code ? code.toUpperCase() : "Language n/a");
  }

  async function fetchTMDB(endpoint, params) {
    const url = new URL(BASE_URL + endpoint);
    url.searchParams.set("api_key", API_KEY);
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    });
    const response = await fetch(url.toString(), { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("TMDB request failed (" + response.status + ")");
    return response.json();
  }

  function setLoading() {
    els.movieGrid.setAttribute("aria-busy", "true");
    els.movieGrid.innerHTML = '<div class="bo-state-card"><span class="bo-spinner"></span><strong>Gathering the numbers…</strong><span>Loading movie data from TMDB.</span></div>';
    els.chart.innerHTML = '<div class="bo-chart-loading">Loading box office data…</div>';
    els.resultsCount.textContent = "Loading movies…";
    els.loadMore.hidden = true;
  }

  function setError(error) {
    console.error("FLOP CORN Box Office error:", error);
    els.movieGrid.setAttribute("aria-busy", "false");
    els.movieGrid.innerHTML = '<div class="bo-state-card"><i class="fa-solid fa-cloud-arrow-down" style="font-size:28px;color:var(--bo-yellow)"></i><strong>Box office data could not load</strong><span>TMDB may be temporarily unavailable. Check your connection and try again.</span><button type="button" class="bo-state-action" id="boRetryButton">Retry</button></div>';
    els.chart.innerHTML = '<div class="bo-chart-loading">Chart unavailable right now.</div>';
    els.resultsCount.textContent = "Data unavailable";
    document.getElementById("boRetryButton")?.addEventListener("click", loadMovies, { once: true });
  }

  async function loadMovieDetails(list) {
    const selected = (list || []).filter((movie) => movie && movie.id).slice(0, 20);
    const details = await Promise.allSettled(selected.map((movie) => fetchTMDB("/movie/" + encodeURIComponent(movie.id), { language: "en-US" })));
    const merged = [];
    details.forEach((result, index) => {
      if (result.status === "fulfilled") merged.push({ ...selected[index], ...result.value });
      else merged.push({ ...selected[index], revenue: 0, budget: 0 });
    });
    return merged;
  }

  async function loadMovies() {
    const requestId = ++state.requestId;
    setLoading();
    els.yearSelect.disabled = state.mode === "india";
    if (state.mode === "india") {
      els.sectionTitle.textContent = "Bollywood Now Playing in India";
      els.sectionDescription.textContent = "Hindi-language Bollywood movies currently listed for Indian theatres. Gross figures below are worldwide totals where reported.";
      els.resultsTitle.textContent = "Bollywood movies in Indian theatres";
      els.chartPanel.querySelector(".bo-chart-heading h3").textContent = "Worldwide gross for these titles";
      els.chartPanel.querySelector(".bo-chart-unit").textContent = "Worldwide gross only · USD";
    } else {
      els.sectionTitle.textContent = "Box Office Tracker";
      els.sectionDescription.textContent = "Movies ranked by their reported worldwide theatrical revenue.";
      els.resultsTitle.textContent = "Worldwide box office";
      els.chartPanel.querySelector(".bo-chart-heading h3").textContent = "Top grossing titles";
      els.chartPanel.querySelector(".bo-chart-unit").textContent = "Reported worldwide gross · USD";
    }

    try {
      let payload;
      let sourceResults = [];
      if (state.mode === "india") {
        // The India now-playing endpoint contains Hindi, Tamil, Telugu and other
        // language releases. Gather a handful of pages, then keep Hindi originals
        // only so this view is specifically for Bollywood films.
        payload = await fetchTMDB("/movie/now_playing", { region: "IN", language: "en-US", page: 1 });
        const pageCount = Math.min(Math.max(Number(payload.total_pages) || 1, 1), 5);
        const extraPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) =>
            fetchTMDB("/movie/now_playing", { region: "IN", language: "en-US", page: index + 2 })
              .catch(() => ({ results: [] }))
          )
        );
        const allIndiaNowPlaying = [payload, ...extraPages]
          .flatMap((page) => Array.isArray(page.results) ? page.results : []);
        const seenIds = new Set();
        sourceResults = allIndiaNowPlaying.filter((movie) => {
          const isHindiOriginal = String(movie.original_language || "").toLowerCase() === "hi";
          if (!isHindiOriginal || !movie.id || seenIds.has(movie.id)) return false;
          seenIds.add(movie.id);
          return true;
        }).slice(0, 20);
      } else {
        const params = { language: "en-US", include_adult: false, include_video: false, sort_by: "revenue.desc", page: 1 };
        if (state.year !== "all") {
          params["primary_release_date.gte"] = state.year + "-01-01";
          params["primary_release_date.lte"] = state.year + "-12-31";
        }
        payload = await fetchTMDB("/discover/movie", params);
        sourceResults = Array.isArray(payload.results) ? payload.results : [];
      }
      if (requestId !== state.requestId) return;
      const movies = await loadMovieDetails(sourceResults);
      if (requestId !== state.requestId) return;
      state.movies = state.mode === "worldwide"
        ? movies.sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0))
        : movies.filter((movie) => {
            const isHindiOriginal = String(movie.original_language || "").toLowerCase() === "hi";
            const hasIndianOrigin = (Array.isArray(movie.origin_country) && movie.origin_country.includes("IN"))
              || (Array.isArray(movie.production_countries) && movie.production_countries.some((country) => country && country.iso_3166_1 === "IN"));
            return isHindiOriginal && hasIndianOrigin;
          });
      state.visible = PAGE_SIZE;
      renderAll();
    } catch (error) {
      if (requestId === state.requestId) setError(error);
    }
  }

  function filteredMovies() {
    const search = state.search.trim().toLowerCase();
    if (!search) return state.movies;
    return state.movies.filter((movie) => [movie.title, movie.original_title, movie.overview].filter(Boolean).join(" ").toLowerCase().includes(search));
  }

  function renderStats(movies) {
    const reported = movies.filter((movie) => Number(movie.revenue) > 0);
    const sum = reported.reduce((total, movie) => total + Number(movie.revenue || 0), 0);
    const top = reported.slice().sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))[0];
    const rated = movies.filter((movie) => Number(movie.vote_average) > 0);
    const average = rated.length ? rated.reduce((total, movie) => total + Number(movie.vote_average), 0) / rated.length : 0;
    els.statCount.textContent = String(movies.length);
    els.statGross.textContent = sum > 0 ? currency(sum) : "—";
    els.statGross.title = sum > 0 ? fullCurrency(sum) : "No reported gross for this list";
    els.statTop.textContent = top ? currency(top.revenue) : "—";
    els.statTop.title = top ? fullCurrency(top.revenue) : "No reported gross for this list";
    els.statTopTitle.textContent = top ? top.title : "No gross reported";
    els.statRating.textContent = average > 0 ? average.toFixed(1) : "—";
  }

  function renderChart(movies) {
    const top = movies.filter((movie) => Number(movie.revenue) > 0).sort((a, b) => Number(b.revenue) - Number(a.revenue)).slice(0, 6);
    if (!top.length) {
      els.chart.innerHTML = '<div class="bo-chart-loading">Reported gross figures aren’t available for this set of movies yet.</div>';
      return;
    }
    const max = Math.max(...top.map((movie) => Number(movie.revenue) || 0), 1);
    els.chart.innerHTML = top.map((movie) => {
      const amount = Number(movie.revenue) || 0;
      const height = Math.max(4, Math.round((amount / max) * 100));
      return '<div class="bo-chart-item" title="' + escapeHTML(movie.title) + ': ' + escapeHTML(fullCurrency(amount)) + '">' +
        '<span class="bo-chart-value">' + escapeHTML(currency(amount)) + '</span>' +
        '<div class="bo-chart-track"><span class="bo-chart-bar" style="height:' + height + '%"></span></div>' +
        '<span class="bo-chart-title">' + escapeHTML(movie.title || "Untitled") + '</span></div>';
    }).join("");
  }

  function renderCard(movie, index) {
    const title = movie.title || movie.original_title || "Untitled movie";
    const poster = safeMoviePath(movie.backdrop_path || movie.poster_path);
    const budget = Number(movie.budget) || 0;
    const revenue = Number(movie.revenue) || 0;
    const ratio = budget > 0 && revenue > 0 ? (revenue / budget).toFixed(1) + "×" : "—";
    const posterHtml = poster
      ? '<img class="bo-card-poster" src="' + escapeHTML(poster) + '" alt="' + escapeHTML(title + " artwork") + '" loading="lazy">'
      : '<div class="bo-card-poster-placeholder"><i class="fa-solid fa-film" aria-hidden="true"></i></div>';
    return '<article class="bo-movie-card">' +
      '<div class="bo-card-poster-wrap">' + posterHtml +
      (state.mode === "india" ? '<span class="bo-card-now">Bollywood</span>' : '<span class="bo-card-rank">#' + (index + 1) + '</span>') +
      '</div><div class="bo-card-body"><div class="bo-card-title-row"><a class="bo-card-title" href="movie.html?id=' + encodeURIComponent(movie.id) + '">' + escapeHTML(title) + '</a><span class="bo-card-rating" title="TMDB rating"><i class="fa-solid fa-star"></i>' + escapeHTML(rating(movie.vote_average)) + '</span></div>' +
      '<div class="bo-card-meta"><span>' + escapeHTML(releaseYear(movie)) + '</span><span>•</span><span class="bo-language">' + escapeHTML(languageLabel(movie.original_language)) + '</span></div>' +
      '<div class="bo-card-metrics"><div class="bo-metric bo-gross" title="' + escapeHTML(fullCurrency(revenue)) + '"><span>Worldwide gross</span><strong>' + escapeHTML(currency(revenue)) + '</strong></div><div class="bo-metric" title="' + escapeHTML(fullCurrency(budget)) + '"><span>Reported budget</span><strong>' + escapeHTML(currency(budget)) + '</strong></div></div>' +
      '<div class="bo-card-ratio"><span>Revenue / budget</span><strong>' + escapeHTML(ratio) + '</strong></div>' +
      '<a class="bo-card-detail-link" href="movie.html?id=' + encodeURIComponent(movie.id) + '">View movie details <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div></article>';
  }

  function renderMovies(movies) {
    const visible = movies.slice(0, state.visible);
    els.movieGrid.setAttribute("aria-busy", "false");
    if (!movies.length) {
      const emptyTitle = state.mode === "india" && !state.search ? "No Bollywood movies found right now" : "No movies match that search";
      const emptyDescription = state.mode === "india" && !state.search
        ? "TMDB currently has no matching Hindi-language titles listed for Indian theatres. Try again later."
        : "Try another title or clear the search box.";
      els.movieGrid.innerHTML = '<div class="bo-state-card"><i class="fa-solid fa-magnifying-glass" style="font-size:27px;color:var(--bo-yellow)"></i><strong>' + escapeHTML(emptyTitle) + '</strong><span>' + escapeHTML(emptyDescription) + '</span>' + (state.search ? '<button type="button" class="bo-state-action" id="boClearSearch">Clear search</button>' : '') + '</div>';
      document.getElementById("boClearSearch")?.addEventListener("click", () => { state.search = ""; els.searchInput.value = ""; renderAll(); });
    } else {
      els.movieGrid.innerHTML = visible.map((movie, index) => renderCard(movie, index)).join("");
      els.movieGrid.querySelectorAll(".bo-card-poster").forEach((image) => {
        image.addEventListener("error", function () {
          const placeholder = document.createElement("div");
          placeholder.className = "bo-card-poster-placeholder";
          placeholder.innerHTML = '<i class="fa-solid fa-film" aria-hidden="true"></i>';
          image.replaceWith(placeholder);
        }, { once: true });
      });
    }
    els.resultsCount.textContent = movies.length + (movies.length === 1 ? " movie" : " movies") + (state.search ? " found" : " loaded");
    els.loadMore.hidden = visible.length >= movies.length;
  }

  function renderAll() {
    const movies = filteredMovies();
    renderStats(movies);
    renderChart(movies);
    renderMovies(movies);
    els.worldwideButton.classList.toggle("active", state.mode === "worldwide");
    els.worldwideButton.setAttribute("aria-pressed", String(state.mode === "worldwide"));
    els.indiaButton.classList.toggle("active", state.mode === "india");
    els.indiaButton.setAttribute("aria-pressed", String(state.mode === "india"));
    els.resultsTitle.textContent = state.mode === "india" ? "Bollywood movies in Indian theatres" : "Worldwide box office";
  }

  els.worldwideButton.addEventListener("click", () => {
    if (state.mode === "worldwide") return;
    state.mode = "worldwide";
    state.search = "";
    els.searchInput.value = "";
    loadMovies();
  });

  els.indiaButton.addEventListener("click", () => {
    if (state.mode === "india") return;
    state.mode = "india";
    state.search = "";
    els.searchInput.value = "";
    loadMovies();
  });

  els.yearSelect.addEventListener("change", () => {
    state.year = els.yearSelect.value;
    if (state.mode !== "worldwide") return;
    loadMovies();
  });

  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value;
    state.visible = PAGE_SIZE;
    renderAll();
  });

  els.loadMore.addEventListener("click", () => {
    state.visible += PAGE_SIZE;
    renderAll();
  });

  function applyTheme(light) {
    document.documentElement.classList.toggle("light-mode", light);
    try { localStorage.setItem("flopCornTheme", light ? "light" : "dark"); } catch (e) {}
    els.themeToggle.classList.toggle("lamp-on", light);
    els.themeToggle.setAttribute("aria-pressed", String(light));
    els.themeToggle.title = light ? "Switch to dark mode" : "Switch to light mode";
  }
  const isLightAtStart = document.documentElement.classList.contains("light-mode");
  applyTheme(isLightAtStart);
  els.themeToggle.addEventListener("click", () => applyTheme(!document.documentElement.classList.contains("light-mode")));

  loadMovies();
})();
