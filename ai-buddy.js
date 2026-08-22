/* =========================================
   FLOP CORN 🍿
   AI MOVIE BUDDY — now powered by real AI (Gemini and claude )
========================================= */

const API_KEY = "dd2ac99e60038c2254b111f850b49461";

const BASE_URL =
    "https://flop-corn-tmdb.patilsuman749.workers.dev";

const IMAGE_URL =
    "https://image.tmdb.org/t/p/w500";


/* HTML ELEMENTS */

const aiInput =
    document.getElementById("aiInput");

const sendAiMessage =
    document.getElementById("sendAiMessage");

const aiMessages =
    document.getElementById("aiMessages");

const quickPrompts =
    document.querySelectorAll(".quick-prompt");


/* LANGUAGE CODES (used to build TMDB queries from the AI's answer) */

const languages = {
    telugu: "te",
    tamil: "ta",
    kannada: "kn",
    malayalam: "ml",
    hindi: "hi",
    english: "en"
};


/* GENRE IDS (used to build TMDB queries from the AI's answer) */

const genres = {
    action: 28,
    adventure: 12,
    animation: 16,
    comedy: 35,
    funny: 35,
    crime: 80,
    documentary: 99,
    drama: 18,
    family: 10751,
    fantasy: 14,
    history: 36,
    horror: 27,
    music: 10402,
    mystery: 9648,
    romance: 10749,
    romantic: 10749,
    "sci-fi": 878,
    thriller: 53,
    war: 10752
};


/* CONVERSATION MEMORY (resets on page reload) */

let chatHistory = [];


/* SEND MESSAGE */

sendAiMessage.addEventListener("click", sendMessage);

aiInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

quickPrompts.forEach(function(button) {
    button.addEventListener("click", function() {
        aiInput.value = button.dataset.prompt;
        sendMessage();
    });
});


/* MAIN MESSAGE FUNCTION */

async function sendMessage() {

    const userText = aiInput.value.trim();

    if (!userText) {
        return;
    }

    addUserMessage(userText);

    aiInput.value = "";

    addTypingMessage();

    try {

        const aiResult = await askAiBuddy(userText);

        removeTypingMessage();

        addAiMessage(aiResult.reply || "Here's what I found! 🍿");

        chatHistory.push({ role: "user", text: userText });
        chatHistory.push({ role: "assistant", text: aiResult.reply || "" });
        chatHistory = chatHistory.slice(-10);

        const query = aiResult.movie_query || { mode: "none" };

        if (query.mode && query.mode !== "none") {

            const movies = await findMovies(query);

            if (movies && movies.length > 0) {
                showMovieRecommendations(movies);
            }

        }

    } catch (error) {

        console.error("AI Movie Buddy Error:", error);

        removeTypingMessage();

        addAiMessage("Oops! 🍿 I had trouble thinking that through. Please try again.");

    }

}


/* ASK THE REAL AI (via Cloudflare Worker -> Gemini) */

async function askAiBuddy(userText) {

    const response = await fetch(`${BASE_URL}/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: userText,
            history: chatHistory
        })
    });

    if (!response.ok) {
        throw new Error("AI chat request failed");
    }

    return await response.json();

}


/* FIND MOVIES — now driven by the AI's structured answer instead of guesswork */

async function findMovies(query) {

    if (query.mode === "similar" && query.similar_to) {
        return await findSimilarMovies(query.similar_to);
    }

    if (query.mode === "title_search" && query.title_search) {
        return await searchMoviesByTitle(query.title_search);
    }

    return await discoverMovies(query);

}


async function discoverMovies(query) {

    const parameters = new URLSearchParams();

    parameters.append("api_key", API_KEY);
    parameters.append("language", "en-US");
    parameters.append("sort_by", "popularity.desc");
    parameters.append("include_adult", "false");
    parameters.append("vote_count.gte", "50");

    if (query.language && languages[query.language]) {
        parameters.append("with_original_language", languages[query.language]);
    }

    if (Array.isArray(query.genres) && query.genres.length > 0) {

        const genreIds = query.genres
            .map(g => genres[String(g).toLowerCase()])
            .filter(Boolean);

        if (genreIds.length > 0) {
            parameters.append("with_genres", genreIds.join(","));
        }

    }

    if (query.min_year) {
        parameters.append("primary_release_date.gte", `${query.min_year}-01-01`);
    }

    if (query.max_year) {
        parameters.append("primary_release_date.lte", `${query.max_year}-12-31`);
    }

    const movieURL = `${BASE_URL}/discover/movie?${parameters.toString()}`;

    const response = await fetch(movieURL);

    if (!response.ok) {
        throw new Error("Movie request failed");
    }

    const data = await response.json();

    return (data.results || [])
        .filter(movie => movie.poster_path && movie.vote_average > 0)
        .slice(0, 5);

}


async function searchMoviesByTitle(title) {

    const parameters = new URLSearchParams();

    parameters.append("api_key", API_KEY);
    parameters.append("language", "en-US");
    parameters.append("query", title);
    parameters.append("include_adult", "false");

    const movieURL = `${BASE_URL}/search/movie?${parameters.toString()}`;

    const response = await fetch(movieURL);

    if (!response.ok) {
        throw new Error("Movie search failed");
    }

    const data = await response.json();

    return (data.results || [])
        .filter(movie => movie.poster_path && movie.vote_average > 0)
        .slice(0, 5);

}


async function findSimilarMovies(title) {

    const matches = await searchMoviesByTitle(title);

    if (!matches || matches.length === 0) {
        return [];
    }

    const baseMovie = matches[0];

    const parameters = new URLSearchParams();

    parameters.append("api_key", API_KEY);
    parameters.append("language", "en-US");

    const movieURL = `${BASE_URL}/movie/${baseMovie.id}/recommendations?${parameters.toString()}`;

    const response = await fetch(movieURL);

    if (!response.ok) {
        throw new Error("Similar movie request failed");
    }

    const data = await response.json();

    return (data.results || [])
        .filter(movie => movie.poster_path && movie.vote_average > 0)
        .slice(0, 5);

}


/* ADD USER MESSAGE */

function addUserMessage(text) {

    const message = document.createElement("div");

    message.className = "message user-message";

    message.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-user"></i>
        </div>
        <div class="message-bubble">
            <strong>You</strong>
            <p>${escapeHTML(text)}</p>
        </div>
    `;

    aiMessages.appendChild(message);

    scrollChat();

}


/* ADD AI MESSAGE */

function addAiMessage(text) {

    const message = document.createElement("div");

    message.className = "message ai-message";

    message.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-bubble">
            <strong>Flop Corn Buddy</strong>
            <p>${escapeHTML(text)}</p>
        </div>
    `;

    aiMessages.appendChild(message);

    scrollChat();

}


/* SHOW MOVIE RECOMMENDATIONS */

function showMovieRecommendations(movies) {

    movies.forEach(function(movie) {

        const movieCard = document.createElement("div");

        movieCard.className = "ai-movie-result";

        const year = movie.release_date
            ? movie.release_date.substring(0, 4)
            : "N/A";

        const rating = movie.vote_average
            ? movie.vote_average.toFixed(1)
            : "N/A";

        movieCard.innerHTML = `
            <img src="${IMAGE_URL}${movie.poster_path}" alt="${escapeHTML(movie.title)}">
            <div class="ai-movie-info">
                <h3>${escapeHTML(movie.title)}</h3>
                <p>${year} • ⭐ ${rating}</p>
                <button>
                    View Movie
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;

        movieCard.querySelector("button").addEventListener("click", function() {
            window.location.href = `movie.html?id=${movie.id}`;
        });

        aiMessages.appendChild(movieCard);

    });

    scrollChat();

}


/* TYPING MESSAGE */

function addTypingMessage() {

    const typing = document.createElement("div");

    typing.className = "message ai-message";
    typing.id = "aiTyping";

    typing.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-bubble">
            <strong>Flop Corn Buddy</strong>
            <p>Thinking... 🍿</p>
        </div>
    `;

    aiMessages.appendChild(typing);

    scrollChat();

}


/* REMOVE TYPING */

function removeTypingMessage() {

    const typing = document.getElementById("aiTyping");

    if (typing) {
        typing.remove();
    }

}


/* SCROLL CHAT */

function scrollChat() {
    aiMessages.scrollTop = aiMessages.scrollHeight;
}


/* SECURITY */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
