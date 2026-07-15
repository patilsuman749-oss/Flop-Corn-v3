/* =========================================
   FLOP CORN CATEGORY PAGE 🍿
========================================= */

const API_KEY =
    "dd2ac99e60038c2254b111f850b49461";

const BASE_URL =
    "https://flop-corn-tmdb.patilsuman749.workers.dev";

const IMAGE_URL =
    "https://image.tmdb.org/t/p/w500";


/* =========================================
   GET CATEGORY FROM URL
========================================= */

const urlParameters =
    new URLSearchParams(
        window.location.search
    );


const selectedCategory =
    urlParameters.get("type")
    || "bollywood";


/* =========================================
   CATEGORY DETAILS
========================================= */

const categoryDetails = {

    bollywood: {

        smallTitle:
            "🇮🇳 HINDI CINEMA",

        title:
            "Bollywood",

        description:
            "Discover popular Hindi movies, modern favourites and unforgettable stories.",

        query:
            "&with_original_language=hi"
            +
            "&region=IN"
            +
            "&sort_by=popularity.desc"

    },


    south: {

        smallTitle:
            "🔥 SOUTH INDIAN CINEMA",

        title:
            "South Indian",

        description:
            "Explore popular Telugu, Tamil, Kannada and Malayalam movies.",

        languages: [
            "te",
            "ta",
            "kn",
            "ml"
        ]

    },


    kannada: {

        smallTitle:
            "💛 SANDALWOOD",

        title:
            "Kannada Gems",

        description:
            "Discover popular movies and hidden gems from Kannada cinema.",

        query:
            "&with_original_language=kn"
            +
            "&region=IN"
            +
            "&sort_by=popularity.desc"

    },


    indianGems: {

        smallTitle:
            "💎 STORIES WORTH DISCOVERING",

        title:
            "Indian Hidden Gems",

        description:
            "Highly rated Indian movies that deserve more attention.",

        languages: [
            "hi",
            "te",
            "ta",
            "kn",
            "ml"
        ],

        extraQuery:
            "&vote_average.gte=7"
            +
            "&vote_count.gte=50"
            +
            "&sort_by=vote_average.desc"

    },


    hidden: {

        smallTitle:
            "🔍 MOVIES YOU MAY HAVE MISSED",

        title:
            "Hidden Gems",

        description:
            "Great movies from around the world waiting to be discovered.",

        query:
            "&vote_average.gte=7"
            +
            "&vote_count.gte=150"
            +
            "&vote_count.lte=3000"
            +
            "&sort_by=vote_average.desc"

    },


    underrated: {

        smallTitle:
            "🔥 DESERVES MORE ATTENTION",

        title:
            "Underrated Movies",

        description:
            "Good movies that deserve more appreciation and attention.",

        query:
            "&vote_average.gte=6.5"
            +
            "&vote_count.gte=100"
            +
            "&vote_count.lte=2000"
            +
            "&sort_by=vote_average.desc"

    },


    topRated: {

        smallTitle:
            "⭐ AUDIENCE FAVOURITES",

        title:
            "Top Rated",

        description:
            "Highly rated movies loved by audiences around the world.",

        query:
            "&vote_average.gte=7.5"
            +
            "&vote_count.gte=1000"
            +
            "&sort_by=vote_average.desc"

    },


    classics: {

        smallTitle:
            "🏆 TIMELESS CINEMA",

        title:
            "Cult Classics",

        description:
            "Iconic movies that continue to inspire loyal fans.",

        query:
            "&primary_release_date.lte=2005-12-31"
            +
            "&vote_average.gte=7"
            +
            "&vote_count.gte=1000"
            +
            "&sort_by=popularity.desc"

    },


    marvel: {

        smallTitle:
            "⚡ HEROES ASSEMBLE",

        title:
            "Marvel Universe",

        description:
            "Enter the world of Avengers, Iron Man, Spider-Man, Thor and more.",

        company:
            "420"

    },


    superhero: {

        smallTitle:
            "🦸 HEROES AND VILLAINS",

        title:
            "Superhero Movies",

        description:
            "Explore heroic adventures from Marvel, DC and beyond.",

        query:
            "&with_genres=28,14"
            +
            "&sort_by=popularity.desc"

    },


    comedy: {

        smallTitle:
            "😂 FEEL-GOOD MOVIES",

        title:
            "Comedy",

        description:
            "Funny movies for a lighter mood and a good laugh.",

        query:
            "&with_genres=35"
            +
            "&sort_by=popularity.desc"

    },


    horror: {

        smallTitle:
            "😱 WATCH WITH THE LIGHTS OFF",

        title:
            "Horror",

        description:
            "Scary stories, supernatural mysteries and chilling movies.",

        query:
            "&with_genres=27"
            +
            "&sort_by=popularity.desc"

    },


    action: {

        smallTitle:
            "💥 HIGH-ENERGY CINEMA",

        title:
            "Action",

        description:
            "Blockbusters filled with action, adventure and excitement.",

        query:
            "&with_genres=28"
            +
            "&sort_by=popularity.desc"

    },


    thriller: {

        smallTitle:
            "🕵️ EXPECT THE UNEXPECTED",

        title:
            "Thriller",

        description:
            "Suspenseful stories filled with mystery and unexpected turns.",

        query:
            "&with_genres=53"
            +
            "&sort_by=popularity.desc"

    },


    family: {

        smallTitle:
            "👨‍👩‍👧 WATCH TOGETHER",

        title:
            "Family Movies",

        description:
            "Entertaining movies that everyone can enjoy together.",

        query:
            "&with_genres=10751"
            +
            "&sort_by=popularity.desc"

    },


    scifi: {

        smallTitle:
            "🚀 BEYOND IMAGINATION",

        title:
            "Science Fiction",

        description:
            "Explore futuristic worlds, space adventures and new possibilities.",

        query:
            "&with_genres=878"
            +
            "&sort_by=popularity.desc"

    }

};


/* =========================================
   SELECT CATEGORY
========================================= */

const activeCategory =

    categoryDetails[
        selectedCategory
    ]

    ||

    categoryDetails.bollywood;


/* =========================================
   UPDATE PAGE TEXT
========================================= */

document.getElementById(
    "categorySmallTitle"
).textContent =

    activeCategory.smallTitle;


document.getElementById(
    "categoryTitle"
).textContent =

    activeCategory.title;


document.getElementById(
    "categoryDescription"
).textContent =

    activeCategory.description;


document.getElementById(
    "categoryResultsTitle"
).textContent =

    activeCategory.title;


document.title =

    `${activeCategory.title} | Flop Corn 🍿`;


/* =========================================
   GET MOVIES
========================================= */

async function getCategoryMovies() {

    try {

        let allMovies = [];


        /*
        MULTIPLE INDIAN LANGUAGES
        */

        if (
            activeCategory.languages
        ) {

            const requests =

                activeCategory.languages.map(

                    language => {

                        const requestURL =

                            `${BASE_URL}/discover/movie`

                            +

                            `?api_key=${API_KEY}`

                            +

                            `&language=en-US`

                            +

                            `&include_adult=false`

                            +

                            `&with_original_language=${language}`

                            +

                            `&region=IN`

                            +

                            (
                                activeCategory.extraQuery

                                ||

                                "&sort_by=popularity.desc"
                            );


                        return fetch(
                            requestURL
                        )

                        .then(

                            response => {

                                if (
                                    !response.ok
                                ) {

                                    throw new Error(

                                        "Movie request failed"

                                    );

                                }


                                return response.json();

                            }

                        );

                    }

                );


            const movieResponses =

                await Promise.all(
                    requests
                );


            movieResponses.forEach(

                movieData => {

                    allMovies.push(

                        ...movieData.results

                    );

                }

            );


            allMovies.sort(

                (
                    firstMovie,
                    secondMovie
                ) =>

                    secondMovie.popularity

                    -

                    firstMovie.popularity

            );

        }


        /*
        MARVEL MOVIES
        */

        else if (
            activeCategory.company
        ) {

            const requestURL =

                `${BASE_URL}/discover/movie`

                +

                `?api_key=${API_KEY}`

                +

                `&language=en-US`

                +

                `&include_adult=false`

                +

                `&with_companies=${activeCategory.company}`

                +

                `&sort_by=popularity.desc`;


            const response =

                await fetch(
                    requestURL
                );


            if (
                !response.ok
            ) {

                throw new Error(

                    "Marvel movies could not load"

                );

            }


            const movieData =

                await response.json();


            allMovies =

                movieData.results;

        }


        /*
        NORMAL CATEGORY
        */

        else {

            const requestURL =

                `${BASE_URL}/discover/movie`

                +

                `?api_key=${API_KEY}`

                +

                `&language=en-US`

                +

                `&include_adult=false`

                +

                `&page=1`

                +

                activeCategory.query;


            const response =

                await fetch(
                    requestURL
                );


            if (
                !response.ok
            ) {

                throw new Error(

                    "Movies could not load"

                );

            }


            const movieData =

                await response.json();


            allMovies =

                movieData.results;

        }


        /*
        REMOVE DUPLICATES
        */

        const uniqueMovies =

            [

                ...new Map(

                    allMovies.map(

                        movie => [

                            movie.id,

                            movie

                        ]

                    )

                ).values()

            ];


        displayCategoryMovies(

            uniqueMovies

            .filter(

                movie =>

                    movie.poster_path

                    &&

                    movie.title

            )

            .slice(
                0,
                20
            )

        );

    }


    catch (error) {

        console.error(

            "Category page error:",

            error

        );


        document.getElementById(

            "categoryMovieGrid"

        ).innerHTML = `

            <div class="category-error">

                <i class="fa-solid fa-film"></i>

                <h3>
                    Movies could not load
                </h3>

                <p>
                    Please check your connection
                    and refresh the page.
                </p>

            </div>

        `;

    }

}


/* =========================================
   DISPLAY MOVIE CARDS
========================================= */

function displayCategoryMovies(

    movies

) {

    const movieGrid =

        document.getElementById(

            "categoryMovieGrid"

        );


    movieGrid.innerHTML = "";


    movies.forEach(

        (
            movie,
            index
        ) => {


            const movieCard =

                document.createElement(
                    "article"
                );


            movieCard.className =

                "category-movie-card";


            movieCard.style

                .setProperty(

                    "--card-number",

                    index

                );


            const movieYear =

                movie.release_date

                ?

                movie.release_date

                .slice(
                    0,
                    4
                )

                :

                "Coming Soon";


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

                <div class="category-poster">

                    <img

                        src="${IMAGE_URL}${movie.poster_path}"

                        alt="${movie.title}"

                        loading="lazy"

                    >


                    <span class="category-rating">

                        <i class="fa-solid fa-star"></i>

                        ${rating}

                    </span>


                    <div class="category-card-overlay">

                        <span>

                            View Movie

                            <i class="fa-solid fa-arrow-right"></i>

                        </span>

                    </div>

                </div>


                <div class="category-card-info">

                    <h3>

                        ${movie.title}

                    </h3>


                    <p>

                        ${movieYear}

                    </p>

                </div>

            `;


            movieCard.addEventListener(

                "click",

                () => {

                    window.location.href =

                        `movie.html?id=${movie.id}`;

                }

            );


            movieGrid.appendChild(

                movieCard

            );

        }

    );

}


/* =========================================
   START
========================================= */

getCategoryMovies();
