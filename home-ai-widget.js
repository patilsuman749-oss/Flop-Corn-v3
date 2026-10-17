/* =========================================
   FLOP CORN — Homepage Movie AI Buddy
   Shares the same AI chat worker and TMDB source
========================================= */
(function () {
    "use strict";

    const BASE_URL = "https://flop-corn-tmdb.patilsuman749.workers.dev";
    const API_KEY = "dd2ac99e60038c2254b111f850b49461";
    const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

    const root = document.getElementById("fcMovieBuddy");
    if (!root) return;

    const toggle = document.getElementById("fcBuddyToggle");
    const panel = document.getElementById("fcBuddyPanel");
    const closeButton = document.getElementById("fcBuddyClose");
    const input = document.getElementById("fcBuddyInput");
    const sendButton = document.getElementById("fcBuddySend");
    const messages = document.getElementById("fcBuddyMessages");
    const suggestions = document.getElementById("fcBuddySuggestions");

    const languages = {
        telugu: "te", tamil: "ta", kannada: "kn", malayalam: "ml", hindi: "hi", english: "en"
    };
    const genres = {
        action: 28, adventure: 12, animation: 16, comedy: 35, funny: 35, crime: 80,
        documentary: 99, drama: 18, family: 10751, fantasy: 14, history: 36, horror: 27,
        music: 10402, mystery: 9648, romance: 10749, romantic: 10749, "sci-fi": 878,
        thriller: 53, war: 10752
    };

    let chatHistory = [];
    let busy = false;

    function setOpen(open) {
        panel.hidden = !open;
        root.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close Movie AI Buddy" : "Open Movie AI Buddy");
        if (open) {
            window.setTimeout(() => input.focus(), 60);
        } else {
            toggle.focus();
        }
    }

    toggle.addEventListener("click", () => setOpen(panel.hidden));
    closeButton.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !panel.hidden) setOpen(false);
    });

    document.querySelectorAll("[data-open-fc-buddy]").forEach((button) => {
        button.addEventListener("click", () => setOpen(true));
    });

    sendButton.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    suggestions.querySelectorAll("[data-prompt]").forEach((button) => {
        button.addEventListener("click", () => {
            input.value = button.dataset.prompt || "";
            sendMessage();
        });
    });

    async function sendMessage() {
        const userText = input.value.trim();
        if (!userText || busy) return;

        busy = true;
        suggestions.hidden = true;
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';
        addMessage("user", userText);
        input.value = "";
        input.setAttribute("aria-busy", "true");
        const typing = addTyping();

        let aiResult;
        try {
            aiResult = await askAiBuddy(userText);
            typing.remove();
            const reply = typeof aiResult.reply === "string" && aiResult.reply.trim()
                ? aiResult.reply.trim()
                : "Let's find something great to watch. 🍿";
            addMessage("assistant", reply);
            chatHistory.push({ role: "user", text: userText });
            chatHistory.push({ role: "assistant", text: reply });
            chatHistory = chatHistory.slice(-10);

            clearMovieCards();
            const query = aiResult.movie_query || { mode: "none" };
            if (query.mode && query.mode !== "none") {
                try {
                    const movies = await findMovies(query);
                    if (movies.length) {
                        addMovieCards(movies);
                    } else {
                        addMessage("assistant", "I couldn't find a close match in the movie catalog yet. Try another language, genre, or title and I'll search again. 🍿");
                    }
                } catch (movieError) {
                    console.warn("Movie Buddy recommendation lookup failed:", movieError);
                    addMessage("assistant", "I have your request, but the movie catalog didn't respond just now. Please try that recommendation again in a moment. 🍿");
                }
            }
        } catch (error) {
            typing.remove();
            console.error("Homepage Movie Buddy error:", error);
            addMessage("assistant", "Sorry, I couldn't connect to Movie Buddy right now. Please try again in a moment, or open the full Movie Buddy page. 🍿");
        } finally {
            busy = false;
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
            input.removeAttribute("aria-busy");
            if (!panel.hidden) input.focus();
            scrollMessages();
        }
    }

    async function askAiBuddy(userText) {
        const response = await fetch(`${BASE_URL}/ai-chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText, history: chatHistory })
        });
        if (!response.ok) throw new Error(`AI chat request failed (${response.status})`);
        return response.json();
    }

    async function findMovies(query) {
        if (query.mode === "similar" && query.similar_to) return findSimilarMovies(query.similar_to);
        if (query.mode === "title_search" && query.title_search) return searchMoviesByTitle(query.title_search);
        return discoverMovies(query);
    }

    async function discoverMovies(query) {
        const parameters = new URLSearchParams({
            api_key: API_KEY,
            language: "en-US",
            sort_by: "popularity.desc",
            include_adult: "false",
            page: String(Math.floor(Math.random() * 5) + 1)
        });
        const normalizedLanguage = query.language ? String(query.language).toLowerCase().trim() : "";
        const regionalLanguages = ["kannada", "tamil", "telugu", "malayalam"];
        parameters.set("vote_count.gte", regionalLanguages.includes(normalizedLanguage) ? "5" : "50");
        if (languages[normalizedLanguage]) parameters.set("with_original_language", languages[normalizedLanguage]);

        if (Array.isArray(query.genres)) {
            const ids = query.genres.map((genre) => genres[String(genre).toLowerCase()]).filter(Boolean);
            if (ids.length) parameters.set("with_genres", [...new Set(ids)].join(","));
        }
        if (query.min_year) parameters.set("primary_release_date.gte", `${query.min_year}-01-01`);
        if (query.max_year) parameters.set("primary_release_date.lte", `${query.max_year}-12-31`);

        const response = await fetch(`${BASE_URL}/discover/movie?${parameters.toString()}`);
        if (!response.ok) throw new Error("Movie discovery request failed");
        const data = await response.json();
        const candidates = (data.results || []).filter((movie) => movie.poster_path && movie.vote_average > 0);
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        return candidates.slice(0, 4);
    }

    async function searchMoviesByTitle(title) {
        const parameters = new URLSearchParams({
            api_key: API_KEY,
            language: "en-US",
            query: title,
            include_adult: "false"
        });
        const response = await fetch(`${BASE_URL}/search/movie?${parameters.toString()}`);
        if (!response.ok) throw new Error("Movie search request failed");
        const data = await response.json();
        return (data.results || []).filter((movie) => movie.poster_path && movie.vote_average > 0).slice(0, 4);
    }

    async function findSimilarMovies(title) {
        const matches = await searchMoviesByTitle(title);
        if (!matches.length) return [];
        const parameters = new URLSearchParams({ api_key: API_KEY, language: "en-US" });
        const response = await fetch(`${BASE_URL}/movie/${matches[0].id}/recommendations?${parameters.toString()}`);
        if (!response.ok) throw new Error("Similar movie request failed");
        const data = await response.json();
        return (data.results || []).filter((movie) => movie.poster_path && movie.vote_average > 0).slice(0, 4);
    }

    function addMessage(type, text) {
        const message = document.createElement("div");
        message.className = `fc-buddy-message ${type === "user" ? "user" : "assistant"}`;

        const avatar = document.createElement("div");
        avatar.className = "fc-buddy-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.innerHTML = type === "user"
            ? '<i class="fa-solid fa-user"></i>'
            : '<i class="fa-solid fa-robot"></i>';

        const bubble = document.createElement("div");
        bubble.className = "fc-buddy-bubble";
        const label = document.createElement("strong");
        label.textContent = type === "user" ? "You" : "Movie Buddy";
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        bubble.append(label, paragraph);
        message.append(avatar, bubble);
        messages.appendChild(message);
        scrollMessages();
        return message;
    }

    function addTyping() {
        const message = document.createElement("div");
        message.className = "fc-buddy-message assistant";
        message.id = "fcBuddyTyping";
        message.innerHTML = '<div class="fc-buddy-avatar" aria-hidden="true"><i class="fa-solid fa-robot"></i></div><div class="fc-buddy-bubble"><strong>Movie Buddy</strong><div class="fc-buddy-typing" aria-label="Thinking"><span></span><span></span><span></span></div></div>';
        messages.appendChild(message);
        scrollMessages();
        return message;
    }

    function clearMovieCards() {
        messages.querySelectorAll(".fc-buddy-movie-grid").forEach((card) => card.remove());
    }

    function addMovieCards(movies) {
        const grid = document.createElement("div");
        grid.className = "fc-buddy-movie-grid";
        grid.setAttribute("aria-label", "Recommended movies");

        movies.forEach((movie) => {
            const card = document.createElement("article");
            card.className = "fc-buddy-movie-card";
            const image = document.createElement("img");
            image.src = `${IMAGE_URL}${movie.poster_path}`;
            image.alt = `${movie.title || "Movie"} poster`;
            image.loading = "lazy";
            image.onerror = () => { image.style.display = "none"; };

            const info = document.createElement("div");
            info.className = "fc-buddy-movie-info";
            const title = document.createElement("strong");
            title.textContent = movie.title || "Untitled movie";
            const year = movie.release_date ? movie.release_date.slice(0, 4) : "Year unknown";
            const rating = Number(movie.vote_average) > 0 ? Number(movie.vote_average).toFixed(1) : "N/A";
            const meta = document.createElement("span");
            meta.className = "fc-buddy-movie-meta";
            meta.textContent = `${year} · ★ ${rating}`;
            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.innerHTML = 'View movie <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
            viewButton.addEventListener("click", () => {
                window.location.href = `movie.html?id=${encodeURIComponent(movie.id)}`;
            });
            info.append(title, meta, viewButton);
            card.append(image, info);
            grid.appendChild(card);
        });
        messages.appendChild(grid);
        scrollMessages();
    }

    function scrollMessages() {
        messages.scrollTop = messages.scrollHeight;
    }
})();
