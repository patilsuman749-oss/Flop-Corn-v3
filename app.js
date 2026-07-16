import {
    auth,
    db,
    signOut,
    onAuthStateChanged
} from "./firebase.js";

import {  
    collection,
    onSnapshot,
    query,
    where,
    doc,
    getDoc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* =========================================
   FLOP CORN 🍿
   PART 3 — COMPLETE APP.JS
========================================= */


/* ---------- TMDB SETTINGS ---------- */

const API_KEY =  "dd2ac99e60038c2254b111f850b49461";

const BASE_URL = "https://flop-corn-tmdb.patilsuman749.workers.dev";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";


/* ---------- HTML ELEMENTS ---------- */

const trendingMovies =
    document.getElementById("trendingMovies");

const newMovies =
    document.getElementById("newMovies");

    const bollywoodMovies =
    document.getElementById("bollywoodMovies");

    const southIndianMovies =
    document.getElementById("southIndianMovies");

const openSearch =
    document.getElementById("openSearch");

const closeSearch =
    document.getElementById("closeSearch");

const searchOverlay =
    document.getElementById("searchOverlay");

const movieSearchInput =
    document.getElementById("movieSearchInput");

const searchResults =
    document.getElementById("searchResults");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileMenu =
    document.getElementById("mobileMenu");


/* ---------- MOVIE GENRES ---------- */

const genres = {

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


/* =========================================
   GET MOVIES FROM TMDB
========================================= */

async function getMovies(
    endpoint,
    movieContainer
) {

    try {

        const movieURL =

            `${BASE_URL}${endpoint}` +

        `${endpoint.includes("?") ? "&" : "?"}api_key=${API_KEY}` +

            `&language=en-US` +

            `&page=1`;


        const response =

            await fetch(movieURL);


        if (!response.ok) {

            throw new Error(

                "TMDB request failed"

            );

        }


        const movieData =

            await response.json();


        displayMovies(

            movieData.results.slice(
                0,
                10
            ),

            movieContainer

        );

    }


    catch (error) {

        console.error(

            "Movie loading error:",

            error

        );


        movieContainer.innerHTML = `

            <div class="movie-error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>

                    Movies could not load

                </h3>

                <p>

                    Check your TMDB API key
                    and internet connection.

                </p>

            </div>

        `;

    }

}


/* =========================================
   CREATE MOVIE CARDS
========================================= */

function displayMovies(
    movies,
    movieContainer
) {

    movieContainer.innerHTML = "";


    const moviesWithPosters =

        movies.filter(

            movie => movie.poster_path

        );


    moviesWithPosters.forEach(

        function (movie) {


            const movieYear =

                movie.release_date

                ?

                movie.release_date.substring(
                    0,
                    4
                )

                :

                "Coming Soon";


            const movieGenre =

                movie.genre_ids

                &&

                movie.genre_ids.length > 0

                ?

                genres[
                    movie.genre_ids[0]
                ]

                ||

                "Movie"

                :

                "Movie";


            const movieRating =

                movie.vote_average

                ?

                movie.vote_average.toFixed(
                    1
                )

                :

                "N/A";


            const movieCard =

                document.createElement(

                    "article"

                );


            movieCard.className =

                "movie-card";


            movieCard.innerHTML = `

                <div class="movie-poster">

                    <img

                        src="${IMAGE_URL}${movie.poster_path}"

                        alt="${movie.title} movie poster"

                        loading="lazy"

                    >


                    <div class="movie-rating">

                        <i class="fa-solid fa-star"></i>

                        ${movieRating}

                    </div>


                    <div class="poster-overlay">

                        <div class="poster-play-button">

                            <i class="fa-solid fa-arrow-right"></i>

                        </div>

                    </div>

                </div>


                <div class="movie-info">

                    <h3>

                        ${movie.title}

                    </h3>


                    <div class="movie-details">

                        <span>

                            ${movieYear}

                        </span>


                        <span class="movie-genre">

                            ${movieGenre}

                        </span>

                    </div>

                </div>

            `;


            movieCard.addEventListener(

                "click",

                function () {

                    openMoviePage(

                        movie.id

                    );

                }

            );


            movieContainer.appendChild(

                movieCard

            );

        }

    );

}


/* =========================================
   OPEN INDIVIDUAL MOVIE PAGE
========================================= */

function openMoviePage(
    movieId
) {

    window.location.href =

        `movie.html?id=${movieId}`;

}


/* =========================================
   SEARCH INPUT
========================================= */

let searchTimer;


movieSearchInput.addEventListener(

    "input",

    function (event) {


        clearTimeout(

            searchTimer

        );


        const searchText =

            event.target.value.trim();


        if (

            searchText.length < 2

        ) {

            searchResults.innerHTML = `

                <p class="search-message">

                    Type at least two letters
                    to search for a movie.

                </p>

            `;


            return;

        }


        searchResults.innerHTML = `

            <p class="search-message">

                <i class="fa-solid fa-spinner fa-spin"></i>

                Searching for movies...

            </p>

        `;


        searchTimer = setTimeout(

            function () {

                searchMovies(

                    searchText

                );

            },

            500

        );

    }

);


/* =========================================
   SEARCH MOVIES USING TMDB
========================================= */

async function searchMovies(
    movieName
) {

    try {

        const searchURL =

            `${BASE_URL}/search/movie`

            +

            `?api_key=${API_KEY}`

            +

            `&language=en-US`

            +

            `&query=${encodeURIComponent(
                movieName
            )}`

            +

            `&page=1`

            +

            `&include_adult=false`;


        const response =

            await fetch(

                searchURL

            );


        if (!response.ok) {

            throw new Error(

                "Movie search failed"

            );

        }


        const movieData =

            await response.json();


        const moviesWithPosters =

            movieData.results.filter(

                movie =>

                    movie.poster_path

            );


        if (

            moviesWithPosters.length === 0

        ) {

            searchResults.innerHTML = `

                <p class="search-message">

                    No movies were found.

                </p>

            `;


            return;

        }


        displayMovies(

            moviesWithPosters.slice(
                0,
                12
            ),

            searchResults

        );

    }


    catch (error) {

        console.error(

            "Movie search error:",

            error

        );


        searchResults.innerHTML = `

            <p class="search-message">

                Search is unavailable.

                Please try again.

            </p>

        `;

    }

}


/* =========================================
   OPEN SEARCH WINDOW
========================================= */

openSearch.addEventListener(

    "click",

    function () {


        searchOverlay.classList.add(

            "show"

        );


        document.body.style.overflow =

            "hidden";


        setTimeout(

            function () {

                movieSearchInput.focus();

            },

            300

        );

    }

);


/* =========================================
   CLOSE SEARCH WINDOW
========================================= */

closeSearch.addEventListener(

    "click",

    closeMovieSearch

);


function closeMovieSearch() {

    searchOverlay.classList.remove(

        "show"

    );


    document.body.style.overflow =

        "";

}


/* CLOSE SEARCH WITH ESCAPE KEY */

document.addEventListener(

    "keydown",

    function (event) {


        if (

            event.key === "Escape"

        ) {

            closeMovieSearch();

        }

    }

);


/* =========================================
   MOBILE MENU
========================================= */

mobileMenuButton.addEventListener(

    "click",

    function () {

        mobileMenu.classList.toggle(

            "show"

        );

    }

);


document.querySelectorAll(

    ".mobile-menu a"

).forEach(

    function (menuLink) {


        menuLink.addEventListener(

            "click",

            function () {

                mobileMenu.classList.remove(

                    "show"

                );

            }

        );

    }

);


/* =========================================
   LOGIN BUTTONS
========================================= */

const loginButton =
    document.getElementById(
        "signInButton"
    );


const joinCommunityButton =

    document.getElementById(

        "joinCommunityButton"

    );


const writeReviewButton =

    document.getElementById(

        "writeReviewButton"

    );


writeReviewButton.addEventListener("click", () => {

    const user = auth.currentUser;

if (!user) {

    profileWatchlist.innerHTML = `

        <p class="watchlist-message">

            Please sign in to view your Watchlist 🍿

        </p>

    `;

    return;

}

    if (!user) {
        alert("Sign in with Google to write a movie review 🍿");
        return;
    }

window.location.href = "#trending";

});

joinCommunityButton.addEventListener("click", () => {
    if (auth.currentUser) {
        alert("You are already part of the Flop Corn community 🍿");
    } else {
        loginButton.click();
    }
});





/* =========================================
   NAVBAR SCROLL EFFECT
========================================= */

window.addEventListener(

    "scroll",

    function () {


        const navbar =

            document.querySelector(

                ".navbar"

            );


        if (

            window.scrollY > 50

        ) {

            navbar.style.background =

                "rgba(7, 7, 7, 0.96)";

        }


        else {

            navbar.style.background =

                "rgba(7, 7, 7, 0.78)";

        }

    }

);


/* =========================================
   LOAD REAL MOVIES
========================================= */


/* LOAD TRENDING MOVIES */

getMovies(

    "/trending/movie/week",

    trendingMovies

);

/* LOAD BOLLYWOOD MOVIES */

getMovies(

"/discover/movie?with_original_language=hi&sort_by=popularity.desc",

    bollywoodMovies

);

/* LOAD SOUTH INDIAN MOVIES */

getMovies(

    "/discover/movie?with_original_language=te|ta|kn|ml&sort_by=popularity.desc",

    southIndianMovies

);


/* LOAD NEW MOVIES */

getMovies(

    "/movie/now_playing",

    newMovies

);
document.querySelectorAll(".view-all-button").forEach((button) => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;

        if (category === "trending") {
            window.location.href =
                "https://www.themoviedb.org/trending/movie/day";
        }

        if (category === "new") {
            window.location.href =
                "https://www.themoviedb.org/movie/now-playing";
        }
    });
});
/* =========================
   USER PROFILE MENU
========================= */

const profileMenu = document.getElementById("profileMenu");
const profileMenuPhoto = document.getElementById("profileMenuPhoto");
const profileMenuName = document.getElementById("profileMenuName");
const profileMenuEmail = document.getElementById("profileMenuEmail");
const profileSignOutButton = document.getElementById("profileSignOutButton");

/* OPEN AND CLOSE PROFILE MENU */

loginButton.onclick = function (event) {

    const user = auth.currentUser;

    /* Allow normal Google login if signed out */
    if (!user) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    profileMenuName.textContent =
        user.displayName || "Flop Corn User";

    profileMenuEmail.textContent =
        user.email || "";

    profileMenuPhoto.src =
        user.photoURL || "flopcorn-logo.jpeg.jpeg";

    profileMenu.classList.toggle("show");

};

/* Close menu when clicking outside */
document.addEventListener("click", (event) => {

    if (
        !profileMenu.contains(event.target) &&
        !loginButton.contains(event.target)
    ) {
        profileMenu.classList.remove("show");
    }

});

/* Sign out */
profileSignOutButton.addEventListener("click", async () => {

    await signOut(auth);

    profileMenu.classList.remove("show");

});
/* =====================================
   FULL USER PROFILE POPUP
===================================== */

const myProfileButton =
    document.getElementById("myProfileButton");

const fullProfileOverlay =
    document.getElementById("fullProfileOverlay");

const closeProfileButton =
    document.getElementById("closeProfileButton");

const fullProfilePhoto =
    document.getElementById("fullProfilePhoto");

const fullProfileName =
    document.getElementById("fullProfileName");

const fullProfileEmail =
    document.getElementById("fullProfileEmail");


/* OPEN FULL PROFILE */

if (myProfileButton && fullProfileOverlay) {

    myProfileButton.addEventListener("click", () => {

        const user = auth.currentUser;

        if (!user) return;

        fullProfilePhoto.src =
            user.photoURL || "flopcorn-logo.jpeg.jpeg";

        

        fullProfileEmail.textContent =
            user.email || "Email not available";

        fullProfileOverlay.classList.add("show");
        
loadUserWatchlist();
        profileMenu.classList.remove("show");

    });

}


/* CLOSE USING X BUTTON */

if (closeProfileButton) {

    closeProfileButton.addEventListener("click", () => {

        fullProfileOverlay.classList.remove("show");

    });

}


/* CLOSE BY CLICKING OUTSIDE */

if (fullProfileOverlay) {

    fullProfileOverlay.addEventListener("click", (event) => {

        if (event.target === fullProfileOverlay) {

            fullProfileOverlay.classList.remove("show");

        }

    });
    }

    /* =========================================
   TOP RATED ON FLOP CORN 🏆
========================================= */

const topRatedMovies =
    document.getElementById("topRatedMovies");

if (topRatedMovies) {

    onSnapshot(
        collection(db, "reviews"),

        (snapshot) => {

            const movieRatings = {};

            snapshot.forEach((reviewDocument) => {

                const review =
                    reviewDocument.data();

                if (
                    !review.movieId ||
                    !review.movieTitle ||
                    !review.rating
                ) {
                    return;
                }

                const movieId =
                    review.movieId;

                if (!movieRatings[movieId]) {

                    movieRatings[movieId] = {

                        id: movieId,

                        title:
                            review.movieTitle,

                        poster:
                            review.moviePoster || "",

                        totalRating: 0,

                        reviewCount: 0

                    };

                }

                movieRatings[movieId]
                    .totalRating +=
                    Number(review.rating);

                movieRatings[movieId]
                    .reviewCount++;

            });


            const rankedMovies =

                Object.values(movieRatings)

                .map((movie) => {

                    movie.averageRating =

                        movie.totalRating /

                        movie.reviewCount;

                    return movie;

                })

                .sort(

                    (a, b) =>

                        b.averageRating -

                        a.averageRating

                )

                .slice(0, 10);


            displayTopRatedMovies(
                rankedMovies
            );

        },

        (error) => {

            console.error(
                "Top-rated movies error:",
                error
            );

            topRatedMovies.innerHTML = `

                <p class="search-message">

                    Top-rated movies could
                    not load.

                </p>

            `;

        }

    );

}


/* DISPLAY TOP-RATED MOVIES */

function displayTopRatedMovies(
    movies
) {

    if (!topRatedMovies) {
        return;
    }


    if (movies.length === 0) {

        topRatedMovies.innerHTML = `

            <p class="search-message">

                No Flop Corn ratings yet 🍿

            </p>

        `;

        return;

    }


    topRatedMovies.innerHTML = "";


    movies.forEach(

        (movie, index) => {


            const movieCard =

                document.createElement(
                    "article"
                );


            movieCard.className =

                "movie-card";


            const posterImage =

                movie.poster

                ?

                `${IMAGE_URL}${movie.poster}`

                :

                "flopcorn-logo.jpeg.jpeg";


            movieCard.innerHTML = `

                <div class="movie-poster">

                    <img

                        src="${posterImage}"

                        alt="${movie.title}"

                        loading="lazy"

                    >


                    <div class="movie-rating">

                        🏆

                        ${movie.averageRating
                            .toFixed(1)}

                    </div>


                    <div class="poster-overlay">

                        <div
                            class="poster-play-button"
                        >

                            <i class=
                            "fa-solid fa-arrow-right">
                            </i>

                        </div>

                    </div>

                </div>


                <div class="movie-info">

                    <h3>

                        ${index + 1}.
                        ${movie.title}

                    </h3>


                    <div class="movie-details">

                        <span>

                            ⭐
                            ${movie.averageRating
                                .toFixed(1)}/10

                        </span>


                        <span class="movie-genre">

                            ${movie.reviewCount}

                            ${
                                movie.reviewCount === 1

                                ?

                                "Review"

                                :

                                "Reviews"
                            }

                        </span>

                    </div>

                </div>

            `;


            movieCard.addEventListener(

                "click",

                () => {

                    openMoviePage(
                        movie.id
                    );

                }

            );


            topRatedMovies.appendChild(

                movieCard

            );

        }

    );

}

/* =========================================
   MY WATCHLIST ❤️
========================================= */

const profileWatchlist =
    document.getElementById("profileWatchlist");


function loadUserWatchlist() {

    const user = auth.currentUser;


    if (!user || !profileWatchlist) {

        return;

    }


    profileWatchlist.innerHTML = `

        <p class="watchlist-message">

            Loading your Watchlist... 🍿

        </p>

    `;


    const userWatchlistQuery =

        query(

            collection(
                db,
                "watchlists"
            ),

            where(
                "userId",
                "==",
                user.uid
            )

        );


    onSnapshot(

        userWatchlistQuery,

        (snapshot) => {


            if (snapshot.empty) {

                profileWatchlist.innerHTML = `

                    <p class="watchlist-message">

                        Your Watchlist is empty. ❤️

                        <br>

                        Save a movie to watch it later!

                    </p>

                `;

                return;

            }


            profileWatchlist.innerHTML = "";


            snapshot.forEach(

                (movieDocument) => {


                    const movie =

                        movieDocument.data();


                    const watchlistMovie =

                        document.createElement(
                            "div"
                        );


                    watchlistMovie.className =

                        "watchlist-movie-card";


                    const posterImage =

                        movie.moviePoster

                        ?

                        `${IMAGE_URL}${movie.moviePoster}`

                        :

                        "flopcorn-logo.jpeg.jpeg";


                    watchlistMovie.innerHTML = `

                        <img

                            src="${posterImage}"

                            alt="${movie.movieTitle}"

                        >


                        <div>

                            <strong>

                                ${movie.movieTitle}

                            </strong>


                            <span>

                                ⭐

                                ${Number(
                                    movie.movieRating
                                ).toFixed(1)}

                            </span>

                        </div>

                    `;


                    watchlistMovie.addEventListener(

                        "click",

                        () => {

                            openMoviePage(

                                movie.movieId

                            );

                        }

                    );


                    profileWatchlist.appendChild(

                        watchlistMovie

                    );

                }

            );

        },


        (error) => {

            console.error(

                "Watchlist loading error:",

                error

            );


            profileWatchlist.innerHTML = `

                <p class="watchlist-message">

                    Your Watchlist could not load.

                </p>

            `;

        }

    );

}

/* =========================================
   SHOW LANGUAGE MOVIES INSIDE FLOP CORN
========================================= */

const languageMovies =
    document.getElementById("languageMovies");

const selectedLanguageTitle =
    document.getElementById("selectedLanguageTitle");


const languageNames = {

    hi: "🇮🇳 Hindi Movies",

    te: "🔥 Telugu Movies",

    ta: "🎭 Tamil Movies",

    kn: "⭐ Kannada Movies",

    ml: "🎞️ Malayalam Movies"

};


document.querySelectorAll(".language-button").forEach(

    (button) => {

        button.addEventListener("click", () => {

            const selectedLanguage =
                button.dataset.language;


            selectedLanguageTitle.textContent =

                languageNames[selectedLanguage];


            languageMovies.innerHTML = `

                <div class="loading-card"></div>

                <div class="loading-card"></div>

                <div class="loading-card"></div>

                <div class="loading-card"></div>

                <div class="loading-card"></div>

            `;


            getMovies(

                `/discover/movie?with_original_language=${selectedLanguage}&sort_by=popularity.desc`,

                languageMovies

            );


            selectedLanguageTitle.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        });

    }

);

/* =========================================
   FLOP CORN USERNAME SYSTEM 🍿
========================================= */

const usernameOverlay =
    document.getElementById("usernameOverlay");

const usernameInput =
    document.getElementById("usernameInput");

const usernameMessage =
    document.getElementById("usernameMessage");

const saveUsernameButton =
    document.getElementById("saveUsernameButton");


/* CHECK WHETHER USER HAS A USERNAME */

async function checkUserUsername() {

    const user = auth.currentUser;

    if (!user) {
        return;
    }


    try {

        const userReference =
            doc(db, "users", user.uid);

        const userSnapshot =
            await getDoc(userReference);


        /* OPEN POPUP FOR NEW USER */

        if (
            !userSnapshot.exists() ||
            !userSnapshot.data().username
        ) {

            usernameOverlay.classList.add(
                "show"
            );

            document.body.style.overflow =
                "hidden";

            setTimeout(() => {

                usernameInput.focus();

            }, 300);

        }


        /* SHOW SAVED USERNAME */

        else {

            const savedUsername =
                userSnapshot.data().username;

            profileMenuName.textContent =
                `@${savedUsername}`;

            fullProfileName.textContent =
                `@${savedUsername}`;

        }

    }

    catch (error) {

        console.error(
            "Username checking error:",
            error
        );

    }

}


/* SAVE NEW USERNAME */

saveUsernameButton.addEventListener(

    "click",

    async () => {


        const user =
            auth.currentUser;


        if (!user) {

            usernameMessage.textContent =
                "Please sign in first.";

            return;

        }


        const username =

            usernameInput
            .value
            .trim();


        /* USERNAME RULES */

        if (username.length < 3) {

            usernameMessage.textContent =

                "Username must contain at least 3 characters.";

            return;

        }


        if (username.length > 20) {

            usernameMessage.textContent =

                "Username cannot be longer than 20 characters.";

            return;

        }


        if (
            !/^[a-zA-Z0-9_]+$/
            .test(username)
        ) {

            usernameMessage.textContent =

                "Use only letters, numbers and underscores.";

            return;

        }


        try {

            saveUsernameButton.disabled =
                true;

            saveUsernameButton.textContent =
                "Creating username...";


            const usernameId =

                username.toLowerCase();


            const usernameReference =

                doc(
                    db,
                    "usernames",
                    usernameId
                );


            const usernameSnapshot =

                await getDoc(
                    usernameReference
                );


            /* USERNAME ALREADY EXISTS */

            if (
                usernameSnapshot.exists()
            ) {

                usernameMessage.textContent =

                    "This username is already taken. Try another one.";

                saveUsernameButton.disabled =
                    false;

                saveUsernameButton.innerHTML =

                    `<i class="fa-solid fa-check"></i>
                    Create Username`;

                return;

            }

            /* GET OLD USERNAME */

const userProfileReference =

    doc(
        db,
        "users",
        user.uid
    );


const oldUserSnapshot =

    await getDoc(
        userProfileReference
    );


let oldUsernameId = "";


if (
    oldUserSnapshot.exists() &&
    oldUserSnapshot.data().usernameLower
) {

    oldUsernameId =

        oldUserSnapshot
        .data()
        .usernameLower;

}


/* REMOVE OLD USERNAME */

if (
    oldUsernameId &&
    oldUsernameId !== usernameId
) {

    await deleteDoc(

        doc(
            db,
            "usernames",
            oldUsernameId
        )

    );

}

            /* SAVE USER PROFILE */

            await setDoc(
                userProfileReference,

                {

                    username:
                        username,

                    usernameLower:
                        usernameId,

                    email:
                        user.email || "",

                    photoURL:
                        user.photoURL || "",

                    userId:
                        user.uid

                },

                {
                    merge: true
                }

            );


            /* RESERVE UNIQUE USERNAME */

            await setDoc(

                usernameReference,

                {

                    userId:
                        user.uid,

                    username:
                        username

                }

            );


            /* SHOW USERNAME */

            profileMenuName.textContent =
                `@${username}`;

            fullProfileName.textContent =
                `@${username}`;


            usernameOverlay.classList.remove(
                "show"
            );

            document.body.style.overflow =
                "";


            usernameInput.value =
                "";

            usernameMessage.textContent =
                "";


            alert(
                `Welcome @${username}! 🍿`
            );

        }


        catch (error) {

            console.error(

                "Username saving error:",

                error

            );


            usernameMessage.textContent =

                "Username could not be saved. Please try again.";


            saveUsernameButton.disabled =
                false;


            saveUsernameButton.innerHTML =

                `<i class="fa-solid fa-check"></i>
                Create Username`;

        }

    }

);

/* =========================================
   CHECK USERNAME AFTER LOGIN 🍿
========================================= */

onAuthStateChanged(auth, (user) => {

    if (user) {

        checkUserUsername();

    } else {

        usernameOverlay.classList.remove(
            "show"
        );

        document.body.style.overflow = "";

    }

});
/* =========================================
   OPEN CHANGE USERNAME POPUP ✏️
========================================= */

const changeUsernameButton =
    document.getElementById(
        "changeUsernameButton"
    );


if (changeUsernameButton) {

    changeUsernameButton.addEventListener(

        "click",

        async () => {

            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "Please sign in first 🍿"
                );

                return;

            }


            try {

                const userSnapshot =

                    await getDoc(

                        doc(
                            db,
                            "users",
                            user.uid
                        )

                    );


                if (
                    userSnapshot.exists()
                ) {

                    usernameInput.value =

                        userSnapshot
                        .data()
                        .username || "";

                }


                usernameMessage.textContent =
                    "";


                usernameOverlay.classList.add(
                    "show"
                );


                fullProfileOverlay.classList.remove(
                    "show"
                );


                document.body.style.overflow =
                    "hidden";


                setTimeout(() => {

                    usernameInput.focus();

                    usernameInput.select();

                }, 300);

            }


            catch (error) {

                console.error(

                    "Change username error:",

                    error

                );


                alert(

                    "Could not open the username editor."

                );

            }

        }

    );

}
/* =====================================
   FLOP CORN LIGHT & DARK MODE 💡
===================================== */

const themeLamp =
    document.getElementById("themeLamp");


/* LOAD THE SAVED THEME */

const savedTheme =
    localStorage.getItem("flopCornTheme");


if (savedTheme === "light") {

    document.body.classList.add(
        "light-mode"
    );

    themeLamp.classList.add(
        "lamp-on"
    );

    themeLamp.title =
        "Turn the lights off";

}


/* SWITCH THE THEME */

themeLamp.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light-mode"
        );


        const lightModeIsOn =
            document.body.classList.contains(
                "light-mode"
            );


        if (lightModeIsOn) {

            themeLamp.classList.add(
                "lamp-on"
            );

            themeLamp.title =
                "Turn the lights off";

            localStorage.setItem(
                "flopCornTheme",
                "light"
            );

        }

        else {

            themeLamp.classList.remove(
                "lamp-on"
            );

            themeLamp.title =
                "Turn the lights on";

            localStorage.setItem(
                "flopCornTheme",
                "dark"
            );

        }

    }
);
/* =====================================
   CHANGING ICONIC MOVIE DIALOGUES 🍿
===================================== */

const marvelQuotes = [

    {
        quote: "“May the Force be with you.”",
        character: "— Star Wars"
    },

    {
        quote: "“I'll be back.”",
        character: "— The Terminator"
    },

    {
        quote: "“Why so serious?”",
        character: "— The Dark Knight"
    },

    {
        quote: "“I'm the king of the world!”",
        character: "— Titanic"
    },

    {
        quote: "“Life is like a box of chocolates.”",
        character: "— Forrest Gump"
    },

    {
        quote: "“You can't handle the truth!”",
        character: "— A Few Good Men"
    },

    {
        quote: "“Keep your friends close, but your enemies closer.”",
        character: "— The Godfather Part II"
    },

    {
        quote: "“Say hello to my little friend!”",
        character: "— Scarface"
    },

    {
        quote: "“To infinity and beyond!”",
        character: "— Toy Story"
    },

    {
        quote: "“There's no place like home.”",
        character: "— The Wizard of Oz"
    },

    {
        quote: "“Houston, we have a problem.”",
        character: "— Apollo 13"
    },

    {
        quote: "“I see dead people.”",
        character: "— The Sixth Sense"
    },

    {
        quote: "“Carpe diem. Seize the day.”",
        character: "— Dead Poets Society"
    },

    {
        quote: "“Roads? Where we're going, we don't need roads.”",
        character: "— Back to the Future"
    },

    {
        quote: "“You shall not pass!”",
        character: "— The Lord of the Rings"
    },

    {
        quote: "“My precious.”",
        character: "— The Lord of the Rings"
    },

    {
        quote: "“After all this time?”",
        character: "— Harry Potter and the Deathly Hallows"
    },

    {
        quote: "“Always.”",
        character: "— Harry Potter and the Deathly Hallows"
    },

    {
        quote: "“I am Iron Man.”",
        character: "— Iron Man"
    },

    {
        quote: "“Avengers... Assemble!”",
        character: "— Avengers: Endgame"
    },

    {
        quote: "“I can do this all day.”",
        character: "— Captain America: The First Avenger"
    },

    {
        quote: "“Whatever it takes.”",
        character: "— Avengers: Endgame"
    },

    {
        quote: "“Wakanda Forever!”",
        character: "— Black Panther"
    },

    {
        quote: "“With great power comes great responsibility.”",
        character: "— Spider-Man"
    },

    {
        quote: "“I'm Batman.”",
        character: "— Batman"
    },

    {
        quote: "“I am vengeance.”",
        character: "— The Batman"
    },

    {
        quote: "“Why do we fall? So we can learn to pick ourselves up.”",
        character: "— Batman Begins"
    },

    {
        quote: "“Some men just want to watch the world burn.”",
        character: "— The Dark Knight"
    },

    {
        quote: "“You either die a hero or live long enough to become the villain.”",
        character: "— The Dark Knight"
    },

    {
        quote: "“Maximum effort.”",
        character: "— Deadpool"
    },

    {
        quote: "“We are Groot.”",
        character: "— Guardians of the Galaxy"
    },

    {
        quote: "“I am Groot.”",
        character: "— Guardians of the Galaxy"
    },

    {
        quote: "“Dormammu, I've come to bargain.”",
        character: "— Doctor Strange"
    },

    {
        quote: "“We have a Hulk.”",
        character: "— The Avengers"
    },

    {
        quote: "“Puny God.”",
        character: "— The Avengers"
    },

    {
        quote: "“I'm always angry.”",
        character: "— The Avengers"
    },

    {
        quote: "“I am inevitable.”",
        character: "— Avengers: Endgame"
    },

    {
        quote: "“Just keep swimming.”",
        character: "— Finding Nemo"
    },

    {
        quote: "“Ohana means family.”",
        character: "— Lilo & Stitch"
    },

    {
        quote: "“Hakuna Matata.”",
        character: "— The Lion King"
    },

    {
        quote: "“You're gonna need a bigger boat.”",
        character: "— Jaws"
    },

    {
        quote: "“E.T. phone home.”",
        character: "— E.T. the Extra-Terrestrial"
    },

    {
        quote: "“Mogambo khush hua!”",
        character: "— Mr. India"
    },

    {
        quote: "“Kitne aadmi the?”",
        character: "— Sholay"
    },

    {
        quote: "“Jo darr gaya, samjho marr gaya.”",
        character: "— Sholay"
    },

    {
        quote: "“Basanti, in kutton ke saamne mat nachna.”",
        character: "— Sholay"
    },

    {
        quote: "“Bade bade deshon mein aisi chhoti chhoti baatein hoti rehti hain.”",
        character: "— Dilwale Dulhania Le Jayenge"
    },

    {
        quote: "“Palat... Palat... Palat!”",
        character: "— Dilwale Dulhania Le Jayenge"
    },

    {
        quote: "“Don ko pakadna mushkil hi nahi, namumkin hai.”",
        character: "— Don"
    },

    {
        quote: "“Picture abhi baaki hai mere dost.”",
        character: "— Om Shanti Om"
    },

    {
        quote: "“All is well.”",
        character: "— 3 Idiots"
    },

    {
        quote: "“Jaa Simran, jee le apni zindagi.”",
        character: "— Dilwale Dulhania Le Jayenge"
    },

    {
        quote: "“Mere Karan Arjun aayenge.”",
        character: "— Karan Arjun"
    },

    {
        quote: "“Tension lene ka nahi, sirf dene ka.”",
        character: "— Munna Bhai M.B.B.S."
    },

    {
        quote: "“How's the josh?”",
        character: "— Uri: The Surgical Strike"
    },

    {
        quote: "“Main apni favorite hoon.”",
        character: "— Jab We Met"
    },

    {
        quote: "“Zindagi badi honi chahiye, lambi nahi.”",
        character: "— Anand"
    }

];


/* GET THE DIALOGUE ELEMENTS */

const marvelQuote =
    document.getElementById("marvelQuote");

const marvelCharacter =
    document.getElementById("marvelCharacter");


/* START WITH A RANDOM DIALOGUE */

let currentMarvelQuote =
    Math.floor(
        Math.random() * marvelQuotes.length
    );


/* SHOW RANDOM DIALOGUE WHEN WEBSITE OPENS */

marvelQuote.textContent =
    marvelQuotes[currentMarvelQuote].quote;

marvelCharacter.textContent =
    marvelQuotes[currentMarvelQuote].character;


/* CHANGE THE DIALOGUE */

function changeMarvelQuote() {

    marvelQuote.classList.add(
        "quote-changing"
    );

    marvelCharacter.classList.add(
        "quote-changing"
    );


    setTimeout(

        function () {

            let newQuote;


            /* AVOID SHOWING THE SAME DIALOGUE TWICE */

            do {

                newQuote =

                    Math.floor(

                        Math.random()

                        *

                        marvelQuotes.length

                    );

            }

            while (

                newQuote ===
                currentMarvelQuote

            );


            currentMarvelQuote =
                newQuote;


            marvelQuote.textContent =

                marvelQuotes[
                    currentMarvelQuote
                ].quote;


            marvelCharacter.textContent =

                marvelQuotes[
                    currentMarvelQuote
                ].character;


            marvelQuote.classList.remove(
                "quote-changing"
            );

            marvelCharacter.classList.remove(
                "quote-changing"
            );

        },

        400

    );

}


/* CHANGE EVERY 5 SECONDS */

setInterval(

    changeMarvelQuote,

    5000

);
/* =========================================
   FLOP CORN MOVIE RELEASE CALENDAR 📅
========================================= */

const calendarGrid =
    document.getElementById("calendarGrid");

const calendarMonth =
    document.getElementById("calendarMonth");

const previousMonth =
    document.getElementById("previousMonth");

const nextMonth =
    document.getElementById("nextMonth");

const calendarMovies =
    document.getElementById("calendarMovies");

const calendarMoviesTitle =
    document.getElementById("calendarMoviesTitle");


/* CURRENT CALENDAR MONTH */

let calendarDate =
    new Date();


/* STORE MOVIES BY RELEASE DATE */

let releaseMoviesByDate = {};


/* =========================================
   CREATE CALENDAR
========================================= */

async function createMovieCalendar() {

    if (
        !calendarGrid ||
        !calendarMonth
    ) {
        return;
    }


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    calendarMonth.textContent =

        new Intl.DateTimeFormat(

            "en-US",

            {
                month: "long",
                year: "numeric"
            }

        ).format(calendarDate);


    calendarGrid.innerHTML = `

        <p class="search-message">

            <i class="fa-solid fa-spinner fa-spin"></i>

            Loading movie releases...

        </p>

    `;


    await getCalendarMovieReleases(

        year,

        month

    );


    displayCalendar(

        year,

        month

    );

}


/* =========================================
   GET MOVIE RELEASES FROM TMDB
========================================= */

async function getCalendarMovieReleases(
    year,
    month
) {

    releaseMoviesByDate = {};

    const firstDate =
        `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const finalDay =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    const lastDate =
        `${year}-${String(month + 1).padStart(2, "0")}-${String(finalDay).padStart(2, "0")}`;


    try {

        const allMovies = [];


        /*
        GET MOVIES RELEASING
        DURING THIS MONTH
        */

        for (
            let page = 1;
            page <= 5;
            page++
        ) {

            const calendarURL =

                `${BASE_URL}/discover/movie`

                +

                `?api_key=${API_KEY}`

                +

                `&language=en-US`

                +

                `&region=IN`

                +

                `&release_date.gte=${firstDate}`

                +

                `&release_date.lte=${lastDate}`

                +

                `&sort_by=popularity.desc`

                +

                `&include_adult=false`

                +

                `&page=${page}`;


            const response =

                await fetch(
                    calendarURL
                );


            if (!response.ok) {

                throw new Error(

                    "India movie releases could not load"

                );

            }


            const movieData =

                await response.json();


            allMovies.push(

                ...movieData.results

            );


            if (

                page >=
                movieData.total_pages

            ) {

                break;

            }

        }


        /*
        REMOVE DUPLICATE MOVIES
        */

        const uniqueMovies =

            Array.from(

                new Map(

                    allMovies.map(

                        movie => [

                            movie.id,

                            movie

                        ]

                    )

                ).values()

            );


        /*
        ADD MOVIES TO THEIR
        INDIA RELEASE DATE
        */

        uniqueMovies.forEach(

            movie => {


                if (

                    !movie.release_date

                ) {

                    return;

                }


                const movieDate =

                    movie.release_date;


                if (

                    movieDate < firstDate

                    ||

                    movieDate > lastDate

                ) {

                    return;

                }


                if (

                    !releaseMoviesByDate[

                        movieDate

                    ]

                ) {

                    releaseMoviesByDate[

                        movieDate

                    ] = [];

                }


                releaseMoviesByDate[

                    movieDate

                ].push(movie);

            }

        );

    }


    catch (error) {

        console.error(

            "India movie calendar error:",

            error

        );

    }

}
/* =========================================
   DISPLAY CALENDAR DATES
========================================= */

function displayCalendar(

    year,

    month

) {

    calendarGrid.innerHTML = "";


    const firstDay =

        new Date(

            year,

            month,

            1

        ).getDay();


    const totalDays =

        new Date(

            year,

            month + 1,

            0

        ).getDate();


    /* EMPTY BOXES BEFORE FIRST DATE */

    for (

        let emptyDay = 0;

        emptyDay < firstDay;

        emptyDay++

    ) {

        const emptyBox =

            document.createElement(

                "div"

            );


        emptyBox.className =

            "calendar-day empty";


        calendarGrid.appendChild(

            emptyBox

        );

    }


    /* CREATE MONTH DATES */

    for (

        let day = 1;

        day <= totalDays;

        day++

    ) {


        const fullDate =

            `${year}-${String(

                month + 1

            ).padStart(2, "0")}-${String(

                day

            ).padStart(2, "0")}`;


        const dateButton =

            document.createElement(

                "button"

            );


        dateButton.className =

            "calendar-day";


        dateButton.textContent =

            day;
            dateButton.style.setProperty(

    "--calendar-position",

    day

);


        /* HIGHLIGHT TODAY */

        const today =

            new Date();


        if (

            day === today.getDate()

            &&

            month === today.getMonth()

            &&

            year === today.getFullYear()

        ) {

            dateButton.classList.add(

                "today"

            );

        }


        /* SHOW DOT IF MOVIES EXIST */

        if (

            releaseMoviesByDate[

                fullDate

            ]

        ) {

            dateButton.classList.add(

                "has-movie"

            );

        }


        /* OPEN MOVIES WHEN DATE IS CLICKED */

        dateButton.addEventListener(

            "click",

            function () {


                document

                    .querySelectorAll(

                        ".calendar-day"

                    )

                    .forEach(

                        calendarDay =>

                            calendarDay

                            .classList

                            .remove(

                                "selected"

                            )

                    );


                dateButton.classList.add(

                    "selected"

                );


                showCalendarMovies(

                    fullDate

                );

            }

        );


        calendarGrid.appendChild(

            dateButton

        );

    }

}


/* =========================================
   SHOW MOVIES FOR SELECTED DATE
========================================= */

function showCalendarMovies(

    selectedDate

) {

    const movies =

        releaseMoviesByDate[

            selectedDate

        ]

        || [];


    const readableDate =

        new Date(

            selectedDate

            +

            "T00:00:00"

        ).toLocaleDateString(

            "en-IN",

            {

                day: "numeric",

                month: "long",

                year: "numeric"

            }

        );


    calendarMoviesTitle.textContent =

        `Movies releasing on ${readableDate} 🍿`;


    if (

        movies.length === 0

    ) {

        calendarMovies.innerHTML = `

            <p class="search-message">

                No movie releases found

                for this date. 🎬

            </p>

        `;


        return;

    }


    displayMovies(

        movies,

        calendarMovies

    );

}


/* =========================================
   PREVIOUS MONTH
========================================= */

previousMonth.addEventListener(

    "click",

    function () {


        calendarDate.setMonth(

            calendarDate.getMonth()

            -

            1

        );


        createMovieCalendar();

    }

);


/* =========================================
   NEXT MONTH
========================================= */

nextMonth.addEventListener(

    "click",

    function () {


        calendarDate.setMonth(

            calendarDate.getMonth()

            +

            1

        );


        createMovieCalendar();

    }

);


/* START CALENDAR */

createMovieCalendar();
/* =========================================
   LIVE CURSOR SPOTLIGHT ✨
========================================= */

document.addEventListener(

    "mousemove",

    function (event) {

        document.body.style.setProperty(

            "--mouse-x",

            `${event.clientX}px`

        );


        document.body.style.setProperty(

            "--mouse-y",

            `${event.clientY}px`

        );

    }

);
// APP DOWNLOAD POPUP

const appPopup = document.getElementById("appPopup");
const closeAppPopup = document.getElementById("closeAppPopup");
const continueWebsite = document.getElementById("continueWebsite");

// Show popup only once per browser
if (!localStorage.getItem("flopcornAppPopup")) {
    appPopup.style.display = "flex";
} else {
    appPopup.style.display = "none";
}

function closePopup() {
    appPopup.style.display = "none";
    localStorage.setItem("flopcornAppPopup", "true");
}

closeAppPopup.addEventListener("click", closePopup);
continueWebsite.addEventListener("click", closePopup);
