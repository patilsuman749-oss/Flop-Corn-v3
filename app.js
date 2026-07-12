import { auth } from "./firebase.js";
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

            `?api_key=${API_KEY}` +

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

        "loginButton"

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
        alert("Sign in with Google to write a movie review 🍿");
        return;
    }

    alert("Welcome " + user.displayName + "! Review feature coming soon ⭐");

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


/* LOAD NEW MOVIES */

getMovies(

    "/movie/now_playing",

    newMovies

);