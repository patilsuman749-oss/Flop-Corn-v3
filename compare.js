const API_KEY = "dd2ac99e60038c2254b111f850b49461";
const BASE_URL = "https://flop-corn-tmdb.patilsuman749.workers.dev";
const IMG = "https://image.tmdb.org/t/p/w500";

async function searchMovie(q) {
    const r = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(q)}`
    );

    if (!r.ok) {
        throw new Error("Search failed");
    }

    const j = await r.json();

    if (!j.results || j.results.length === 0) {
        throw new Error("Movie not found");
    }

    return j.results[0];
}

async function details(id) {
    const r = await fetch(
        `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
    );

    if (!r.ok) {
        throw new Error("Movie details failed");
    }

    return await r.json();
}

function money(v) {
    return v ? "$" + Number(v).toLocaleString() : "N/A";
}

function card(m) {
    return `
    <div class="card">

        <img src="${m.poster_path ? IMG + m.poster_path : ""}" alt="${m.title}">

        <h2>${m.title}</h2>

        <table>

            <tr>
                <td>⭐ Rating</td>
                <td>${m.vote_average}</td>
            </tr>

            <tr>
                <td>📅 Release</td>
                <td>${m.release_date}</td>
            </tr>

            <tr>
                <td>⏱ Runtime</td>
                <td>${m.runtime} min</td>
            </tr>

            <tr>
                <td>🎭 Genres</td>
                <td>${m.genres.map(g => g.name).join(", ")}</td>
            </tr>

            <tr>
                <td>🌍 Language</td>
                <td>${m.original_language.toUpperCase()}</td>
            </tr>

            <tr>
                <td>💰 Budget</td>
                <td>${money(m.budget)}</td>
            </tr>

            <tr>
                <td>💵 Revenue</td>
                <td>${money(m.revenue)}</td>
            </tr>

        </table>

    </div>
    `;
}

document.getElementById("compareBtn").addEventListener("click", async () => {

    const movie1 = document.getElementById("movie1").value.trim();
    const movie2 = document.getElementById("movie2").value.trim();
    const results = document.getElementById("results");

    if (!movie1 || !movie2) {
        alert("Please enter both movie names.");
        return;
    }

    results.innerHTML = "<p>Loading comparison...</p>";

    try {

        const firstMovie = await searchMovie(movie1);
        const secondMovie = await searchMovie(movie2);

        const firstDetails = await details(firstMovie.id);
        const secondDetails = await details(secondMovie.id);

        results.innerHTML =
            card(firstDetails) +
            card(secondDetails);

    } catch (error) {

        console.error(error);

        results.innerHTML =
            "<h2>❌ Unable to compare movies.</h2><p>Please try again.</p>";

    }

});
