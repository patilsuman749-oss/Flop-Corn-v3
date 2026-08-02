/* =========================================
   FLOP CORN 🍿
   AI MOVIE BUDDY
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


/* LANGUAGE CODES */

const languages = {

    telugu: "te",

    tamil: "ta",

    kannada: "kn",

    malayalam: "ml",

    hindi: "hi",

    english: "en"

};


/* GENRE IDS */

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


/* SEND MESSAGE */

sendAiMessage.addEventListener(
    "click",
    sendMessage
);


/* PRESS ENTER */

aiInput.addEventListener(
    "keydown",

    function(event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);


/* QUICK PROMPT BUTTONS */

quickPrompts.forEach(

    function(button) {

        button.addEventListener(
            "click",

            function() {

                aiInput.value =
                    button.dataset.prompt;

                sendMessage();

            }

        );

    }

);


/* MAIN MESSAGE FUNCTION */

async function sendMessage() {

    const userText =
        aiInput.value.trim();


    if (!userText) {

        return;

    }


    addUserMessage(
        userText
    );


    aiInput.value = "";


    addTypingMessage();


    try {

        const movies =
            await findMovies(
                userText
            );


        removeTypingMessage();


        if (
            !movies ||
            movies.length === 0
        ) {

            addAiMessage(

                "Hmm 🤔 I couldn't find the perfect movie for that request. Try something like “funny Telugu movie” or “Kannada action movie”."

            );

            return;

        }


        showMovieRecommendations(
            movies,
            userText
        );

    }


    catch(error) {

        console.error(
            "AI Movie Buddy Error:",
            error
        );


        removeTypingMessage();


        addAiMessage(

            "Oops! 🍿 I had trouble finding movies right now. Please try again."

        );

    }

}


/* FIND MOVIES */

async function findMovies(
    userText
) {

    const text =
        userText.toLowerCase();


    let selectedLanguage = "";

    let selectedGenre = "";


    /* DETECT LANGUAGE */

    for (
        const language
        in languages
    ) {

        if (
            text.includes(
                language
            )
        ) {

            selectedLanguage =
                languages[
                    language
                ];

            break;

        }

    }


    /* DETECT GENRE */

    for (
        const genre
        in genres
    ) {

        if (
            text.includes(
                genre
            )
        ) {

            selectedGenre =
                genres[
                    genre
                ];

            break;

        }

    }


    let endpoint =
        "/discover/movie";


    const parameters =
        new URLSearchParams();


    parameters.append(
        "api_key",
        API_KEY
    );


    parameters.append(
        "language",
        "en-US"
    );


    parameters.append(
        "sort_by",
        "popularity.desc"
    );


    parameters.append(
        "include_adult",
        "false"
    );


    parameters.append(
        "vote_count.gte",
        "50"
    );


    if (
        selectedLanguage
    ) {

        parameters.append(

            "with_original_language",

            selectedLanguage

        );

    }


    if (
        selectedGenre
    ) {

        parameters.append(

            "with_genres",

            selectedGenre

        );

    }


    const movieURL =

        `${BASE_URL}${endpoint}?${parameters.toString()}`;


    const response =
        await fetch(
            movieURL
        );


    if (!response.ok) {

        throw new Error(
            "Movie request failed"
        );

    }


    const data =
        await response.json();


    const movies =

        data.results

        .filter(

            movie =>

                movie.poster_path

                &&

                movie.vote_average > 0

        )

        .slice(
            0,
            5
        );


    return movies;

}


/* ADD USER MESSAGE */

function addUserMessage(
    text
) {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message user-message";


    message.innerHTML = `

        <div class="message-avatar">

            <i class="fa-solid fa-user"></i>

        </div>


        <div class="message-bubble">

            <strong>
                You
            </strong>

            <p>
                ${escapeHTML(text)}
            </p>

        </div>

    `;


    aiMessages.appendChild(
        message
    );


    scrollChat();

}


/* ADD AI MESSAGE */

function addAiMessage(
    text
) {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message ai-message";


    message.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>


        <div class="message-bubble">

            <strong>
                Flop Corn Buddy
            </strong>

            <p>
                ${text}
            </p>

        </div>

    `;


    aiMessages.appendChild(
        message
    );


    scrollChat();

}


/* SHOW MOVIE RECOMMENDATIONS */

function showMovieRecommendations(
    movies,
    userText
) {

    addAiMessage(

        `Great choice! 🍿 Based on “${escapeHTML(userText)}”, here are some movies you might enjoy:`

    );


    movies.forEach(

        function(movie) {


            const movieCard =
                document.createElement(
                    "div"
                );


            movieCard.className =
                "ai-movie-result";


            const year =

                movie.release_date

                ?

                movie.release_date
                .substring(
                    0,
                    4
                )

                :

                "N/A";


            const rating =

                movie.vote_average

                ?

                movie.vote_average
                .toFixed(
                    1
                )

                :

                "N/A";


            movieCard.innerHTML = `

                <img

                    src="${IMAGE_URL}${movie.poster_path}"

                    alt="${escapeHTML(movie.title)}"

                >


                <div class="ai-movie-info">

                    <h3>

                        ${escapeHTML(movie.title)}

                    </h3>


                    <p>

                        ${year}

                        • ⭐ ${rating}

                    </p>


                    <button>

                        View Movie

                        <i class="fa-solid fa-arrow-right"></i>

                    </button>

                </div>

            `;


            movieCard
            .querySelector(
                "button"
            )
            .addEventListener(

                "click",

                function() {

                    window.location.href =

                        `movie.html?id=${movie.id}`;

                }

            );


            aiMessages.appendChild(
                movieCard
            );

        }

    );


    scrollChat();

}


/* TYPING MESSAGE */

function addTypingMessage() {

    const typing =
        document.createElement(
            "div"
        );


    typing.className =
        "message ai-message";

    typing.id =
        "aiTyping";


    typing.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div class="message-bubble">

            <strong>
                Flop Corn Buddy
            </strong>

            <p>
                Thinking of some movies... 🍿
            </p>

        </div>

    `;


    aiMessages.appendChild(
        typing
    );


    scrollChat();

}


/* REMOVE TYPING */

function removeTypingMessage() {

    const typing =
        document.getElementById(
            "aiTyping"
        );


    if (typing) {

        typing.remove();

    }

}


/* SCROLL CHAT */

function scrollChat() {

    aiMessages.scrollTop =
        aiMessages.scrollHeight;

}


/* SECURITY */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}
