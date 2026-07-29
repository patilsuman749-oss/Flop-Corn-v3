import {
    db,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "./firebase.js";

const featuredNews = document.getElementById("featuredNews");
const newsContainer = document.getElementById("newsContainer");

async function loadNews(category = "All") {

    featuredNews.innerHTML =
        `<div class="loading-news">Loading Breaking News...</div>`;

    newsContainer.innerHTML =
        `<div class="loading-news">Loading Latest News...</div>`;

    try {

        const newsQuery = query(
            collection(db, "movieNews"),
            orderBy("publishedAt", "desc"),
            limit(30)
        );

        const snapshot = await getDocs(newsQuery);

        if (snapshot.empty) {

            featuredNews.innerHTML =
                `<div class="loading-news">No News Available</div>`;

            newsContainer.innerHTML = "";

            return;
        }

        const newsList = [];

        snapshot.forEach(doc => {

            const news = doc.data();

            if (
                category !== "All" &&
                !(news.title || "").toLowerCase().includes(category.toLowerCase()) &&
                !(news.description || "").toLowerCase().includes(category.toLowerCase())
            ) {
                return;
            }

            newsList.push(news);

        });

        if (newsList.length === 0) {

            featuredNews.innerHTML =
                `<div class="loading-news">No News Found</div>`;

            newsContainer.innerHTML = "";

            return;
        }

        // FEATURED NEWS

        const featured = newsList[0];

        featuredNews.innerHTML = `
        <div class="news-card featured-card">

            <img src="${featured.image || 'https://via.placeholder.com/900x500'}">

            <div class="news-content">

                <h2>${featured.title}</h2>

                <p>${featured.description || ""}</p>

                <div class="news-source">
                    📰 ${featured.source || "Unknown"} •
                    ${new Date(featured.publishedAt).toLocaleDateString()}
                </div>

                <a href="${featured.url}" target="_blank">
                    Read Full Story →
                </a>

            </div>

        </div>
        `;

        // LATEST NEWS

        newsContainer.innerHTML = "";

        newsList.slice(1).forEach(news => {

            newsContainer.innerHTML += `

            <div class="news-card">

                <img src="${news.image || 'https://via.placeholder.com/500x300'}">

                <div class="news-content">

                    <h3>${news.title}</h3>

                    <p>${news.description || ""}</p>

                    <div class="news-source">

                        📰 ${news.source || "Unknown"}

                    </div>

                    <a href="${news.url}" target="_blank">

                        Read More →

                    </a>

                </div>

            </div>

            `;

        });

        startAnimations();

    }

    catch (error) {

        console.error(error);

        featuredNews.innerHTML =
            `<div class="loading-news">Failed to load news.</div>`;

        newsContainer.innerHTML = "";

    }

}


// CATEGORY FILTER

document.querySelectorAll(".news-filter button").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".news-filter button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        loadNews(button.dataset.category);

    });

});


// CARD ANIMATIONS

function startAnimations() {

    const cards = document.querySelectorAll(".news-card");

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    }, {

        threshold:0.15

    });

    cards.forEach(card => observer.observe(card));

}


// LOAD NEWS

loadNews();
