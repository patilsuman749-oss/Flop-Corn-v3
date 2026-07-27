import {
    db,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "./firebase.js";

const newsContainer = document.getElementById("newsContainer");

async function loadNews(category = "All") {
    newsContainer.innerHTML = "<p>Loading latest news...</p>";

    try {
        const newsQuery = query(
            collection(db, "movieNews"),
            orderBy("publishedAt", "desc"),
            limit(30)
        );

        const snapshot = await getDocs(newsQuery);

        newsContainer.innerHTML = "";

        if (snapshot.empty) {
            newsContainer.innerHTML =
                "<p>No movie news available.</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const news = doc.data();

            if (
                category !== "All" &&
                !(news.title || "").toLowerCase().includes(category.toLowerCase()) &&
                !(news.description || "").toLowerCase().includes(category.toLowerCase())
            ) {
                return;
            }

            const card = document.createElement("div");
            card.className = "news-card";

            card.innerHTML = `
                <img src="${news.image || 'https://via.placeholder.com/500x280?text=FLOP+CORN'}"
                     alt="${news.title}">

                <div class="news-content">
                    <h3>${news.title}</h3>

                    <p>${news.description || ""}</p>

                    <small>
                        📰 ${news.source || "Unknown"} •
                        ${new Date(news.publishedAt).toLocaleDateString()}
                    </small>

                    <br><br>

                    <a href="${news.url}" target="_blank">
                        Read Full Story →
                    </a>
                </div>
            `;

            newsContainer.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        newsContainer.innerHTML =
            "<p>Failed to load movie news.</p>";
    }
}

document.querySelectorAll(".news-filter button").forEach(button => {
    button.addEventListener("click", () => {
        loadNews(button.dataset.category);
    });
});

loadNews();
