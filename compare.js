/* =========================================================
   FLOP CORN
   Premium Compare Movies
   Part 1 - Core
========================================================= */

const CONFIG = {

    API_KEY: "dd2ac99e60038c2254b111f850b49461",

    BASE_URL: "https://flop-corn-tmdb.patilsuman749.workers.dev",

    IMAGE_SMALL: "https://image.tmdb.org/t/p/w185",

    IMAGE_MEDIUM: "https://image.tmdb.org/t/p/w342",

    IMAGE_LARGE: "https://image.tmdb.org/t/p/w500"

};

const state = {

    movie1: null,

    movie2: null,

    searching: false,

    debounce: null

};

const elements = {

    movie1Input: document.getElementById("movie1"),

    movie2Input: document.getElementById("movie2"),

    suggestion1: document.getElementById("movie1Suggestions"),

    suggestion2: document.getElementById("movie2Suggestions"),

    compareBtn: document.getElementById("compareBtn"),

    movie1Card: document.getElementById("movie1Card"),

    movie2Card: document.getElementById("movie2Card"),

    winnerTitle: document.getElementById("winnerTitle"),

    winnerReason: document.getElementById("winnerReason")

};

function formatMoney(value){

    if(!value) return "N/A";

    return "$"+Number(value).toLocaleString();

}

function formatYear(date){

    if(!date) return "Unknown";

    return date.substring(0,4);

}

function clearSuggestions(box){

    box.innerHTML="";

    box.style.display="none";

}

async function api(endpoint){

    const response=await fetch(

`${CONFIG.BASE_URL}${endpoint}`

    );

    if(!response.ok){

        throw new Error("API Error");

    }

    return await response.json();

}
/* =========================================================
   FLOP CORN
   Premium Compare Movies
   Part 2 - Live Search & Suggestions
========================================================= */

let activeSuggestionBox = null;

elements.movie1Input.addEventListener("input", () => {

    debounceSearch(
        elements.movie1Input.value,
        1
    );

});

elements.movie2Input.addEventListener("input", () => {

    debounceSearch(
        elements.movie2Input.value,
        2
    );

});

function debounceSearch(query, side){

    clearTimeout(state.debounce);

    state.debounce = setTimeout(()=>{

        searchMovies(query, side);

    },300);

}

async function searchMovies(query, side){

    if(query.trim().length < 2){

        clearSuggestions(

            side===1 ?
            elements.suggestion1 :
            elements.suggestion2

        );

        return;

    }

    try{

        const data = await api(

`/search/movie?api_key=${CONFIG.API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`

        );

        renderSuggestions(

            data.results || [],

            side

        );

    }

    catch(err){

        console.error(err);

    }

}

function renderSuggestions(list, side){

    const box = side===1 ?
        elements.suggestion1 :
        elements.suggestion2;

    box.innerHTML="";

    if(list.length===0){

        clearSuggestions(box);

        return;

    }

    list

    .filter(movie=>movie.poster_path)

    .slice(0,8)

    .forEach(movie=>{

        const item=document.createElement("div");

        item.className="suggestion";

        item.innerHTML=`

<img
src="${CONFIG.IMAGE_SMALL}${movie.poster_path}"
>

<div class="suggestionInfo">

<h4>

${movie.title}

</h4>

<p>

📅 ${formatYear(movie.release_date)}

&nbsp;&nbsp;

⭐ ${movie.vote_average.toFixed(1)}

</p>

</div>

`;

        item.onclick=()=>{

            loadMovie(movie.id,side);

        };

        box.appendChild(item);

    });

    box.style.display="block";

    activeSuggestionBox=box;

}

document.addEventListener("click",(e)=>{

    if(!e.target.closest(".movie-search-card")){

        clearSuggestions(elements.suggestion1);

        clearSuggestions(elements.suggestion2);

    }

});
/* =========================================================
   FLOP CORN
   Premium Compare Movies
   Part 3 - Load Movie & Render Cards
========================================================= */

async function loadMovie(movieId, side){

    try{

        const movie = await api(

`/movie/${movieId}?api_key=${CONFIG.API_KEY}&language=en-US`

        );

        if(side===1){

            state.movie1 = movie;

            elements.movie1Input.value = movie.title;

            clearSuggestions(elements.suggestion1);

            renderMovie(movie,1);

        }

        else{

            state.movie2 = movie;

            elements.movie2Input.value = movie.title;

            clearSuggestions(elements.suggestion2);

            renderMovie(movie,2);

        }

        enableCompare();

    }

    catch(err){

        console.error(err);

    }

}

function renderMovie(movie, side){

    const card = side===1
        ? elements.movie1Card
        : elements.movie2Card;

    card.innerHTML = `

<img
class="comparePoster"
src="${CONFIG.IMAGE_LARGE}${movie.poster_path}"
>

<div class="movie-card-content">

<h2>

${movie.title}

</h2>

<div class="movieBadges">

<span>

⭐ ${movie.vote_average.toFixed(1)}

</span>

<span>

📅 ${formatYear(movie.release_date)}

</span>

<span>

⏱ ${movie.runtime} min

</span>

</div>

<p>

${movie.overview}

</p>

<div class="movieButtons">

<button
class="movieButton"
onclick="openTrailer('${movie.title}')">

▶ Trailer

</button>

<a

href="movie.html?id=${movie.id}"

class="movieButton"

>

🎬 Details

</a>

</div>

</div>

`;

}

function enableCompare(){

    if(state.movie1 && state.movie2){

        elements.compareBtn.disabled = false;

        elements.compareBtn.classList.add("enabled");

    }

}

elements.compareBtn.addEventListener("click",()=>{

    if(!state.movie1 || !state.movie2){

        alert("Please select two movies.");

        return;

    }

    compareMovies();

});

function compareMovies(){

    updateTable();

    calculateWinner();

}

function update(id,value){

    const el=document.getElementById(id);

    if(el){

        el.textContent=value;

    }

}

function updateTable(){

    update("leftMovieName",state.movie1.title);
    update("rightMovieName",state.movie2.title);

    update("rating1",state.movie1.vote_average.toFixed(1));
    update("rating2",state.movie2.vote_average.toFixed(1));

    update("release1",state.movie1.release_date);
    update("release2",state.movie2.release_date);

    update("runtime1",state.movie1.runtime+" min");
    update("runtime2",state.movie2.runtime+" min");

    update("budget1",formatMoney(state.movie1.budget));
    update("budget2",formatMoney(state.movie2.budget));

    update("revenue1",formatMoney(state.movie1.revenue));
    update("revenue2",formatMoney(state.movie2.revenue));

    update(
        "genre1",
        state.movie1.genres.map(g=>g.name).join(", ")
    );

    update(
        "genre2",
        state.movie2.genres.map(g=>g.name).join(", ")
    );

    update(
        "language1",
        state.movie1.original_language.toUpperCase()
    );

    update(
        "language2",
        state.movie2.original_language.toUpperCase()
    );

    update(
        "popularity1",
        Math.round(state.movie1.popularity)
    );

    update(
        "popularity2",
        Math.round(state.movie2.popularity)
    );

    update(
        "votes1",
        state.movie1.vote_count.toLocaleString()
    );

    update(
        "votes2",
        state.movie2.vote_count.toLocaleString()
    );

}
/* =========================================================
   FLOP CORN
   Premium Compare Movies
   Part 4 - Winner Engine
========================================================= */

function calculateWinner(){

    let score1 = 0;
    let score2 = 0;

    const reasons = [];

    compareStat(
        state.movie1.vote_average,
        state.movie2.vote_average,
        "rating1",
        "rating2",
        "⭐ Better Rating"
    );

    compareStat(
        state.movie1.runtime,
        state.movie2.runtime,
        "runtime1",
        "runtime2",
        "⏱ Longer Runtime"
    );

    compareStat(
        state.movie1.revenue,
        state.movie2.revenue,
        "revenue1",
        "revenue2",
        "💵 Higher Revenue"
    );

    compareStat(
        state.movie1.budget,
        state.movie2.budget,
        "budget1",
        "budget2",
        "💰 Bigger Budget"
    );

    compareStat(
        state.movie1.popularity,
        state.movie2.popularity,
        "popularity1",
        "popularity2",
        "🔥 More Popular"
    );

    compareStat(
        state.movie1.vote_count,
        state.movie2.vote_count,
        "votes1",
        "votes2",
        "🗳 More Votes"
    );

    function compareStat(a,b,id1,id2,reason){

        const left=document.getElementById(id1);
        const right=document.getElementById(id2);

        left.classList.remove("winnerValue");
        right.classList.remove("winnerValue");

        if(a>b){

            score1++;

            left.classList.add("winnerValue");

            reasons.push(reason);

        }

        else if(b>a){

            score2++;

            right.classList.add("winnerValue");

        }

    }

    let winner = null;

    if(score1>score2){

        winner = state.movie1;

    }

    else if(score2>score1){

        winner = state.movie2;

    }

    document.getElementById("movie1Card")
        .classList.remove("winnerCard");

    document.getElementById("movie2Card")
        .classList.remove("winnerCard");

    if(winner){

        if(winner.id===state.movie1.id){

            document
                .getElementById("movie1Card")
                .classList
                .add("winnerCard");

        }

        else{

            document
                .getElementById("movie2Card")
                .classList
                .add("winnerCard");

        }

        elements.winnerTitle.innerHTML =

        `👑 ${winner.title}`;

        elements.winnerReason.innerHTML =

        `
        <strong>FLOP CORN Score</strong>

        <br><br>

        ${winner.id===state.movie1.id ? score1 : score2}
        / 6

        <br><br>

        ${reasons.join("<br>")}
        `;

    }

    else{

        elements.winnerTitle.innerHTML="🤝 It's a Tie";

        elements.winnerReason.innerHTML=

        "Both movies performed equally well.";

    }

}
