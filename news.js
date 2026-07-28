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

    featuredNews.innerHTML = "";
    newsContainer.innerHTML = "<p>Loading latest news...</p>";

    try {

        const newsQuery = query(
            collection(db, "movieNews"),
            orderBy("publishedAt", "desc"),
            limit(30)
        );

        const snapshot = await getDocs(newsQuery);

        if (snapshot.empty) {
            featuredNews.innerHTML = "<p>No movie news available.</p>";
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

            featuredNews.innerHTML = "<p>No news found.</p>";
            newsContainer.innerHTML = "";
            return;

        }

        const first = newsList[0];

        featuredNews.innerHTML = `
            <div class="news-card">

                <img src="${first.image || "https://via.placeholder.com/900x500"}">

                <div class="news-content">

                    <h2>${first.title}</h2>

                    <p>${first.description || ""}</p>

                    <div class="news-source">
                        📰 ${first.source || "Unknown"} •
                        ${new Date(first.publishedAt).toLocaleDateString()}
                    </div>

                    <a href="${first.url}" target="_blank">
                        Read Full Story →
                    </a>

                </div>

            </div>
        `;

        newsContainer.innerHTML = "";

        newsList.slice(1).forEach(news => {

            newsContainer.innerHTML += `

            <div class="news-card">

                <img src="${news.image || "https://via.placeholder.com/500x300"}">

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

    }

    catch (error) {

        console.error(error);

        featuredNews.innerHTML = "";

        newsContainer.innerHTML =
            "<p>Failed to load movie news.</p>";

    }

}

document.querySelectorAll(".news-filter button").forEach(button => {

    button.addEventListener("click", () => {

        document
            .querySelectorAll(".news-filter button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        loadNews(button.dataset.category);

    });

});

loadNews();
