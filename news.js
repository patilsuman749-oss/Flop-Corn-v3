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


// ========================================
// LOAD NEWS
// ========================================

async function loadNews(category = "All") {

    featuredNews.innerHTML = `
        <div class="loading-news">
            🔄 Loading Breaking News...
        </div>
    `;

    newsContainer.innerHTML = `
        <div class="loading-news">
            🔄 Loading Latest News...
        </div>
    `;

    try {

        console.log("🍿 FLOPCORN: Loading movie news...");

        const newsQuery = query(
            collection(db, "movieNews"),
            orderBy("publishedAt", "desc"),
            limit(30)
        );

        const snapshot = await getDocs(newsQuery);

        console.log(
            "🍿 FLOPCORN: News documents:",
            snapshot.size
        );


        // ========================================
        // NO NEWS
        // ========================================

        if (snapshot.empty) {

            featuredNews.innerHTML = `
                <div class="loading-news">
                    No News Available
                </div>
            `;

            newsContainer.innerHTML = "";

            return;
        }


        // ========================================
        // GET DATA
        // ========================================

        let newsList = [];

        snapshot.forEach((doc) => {

            const data = doc.data();

            newsList.push({
                id: doc.id,
                ...data
            });

        });


        // ========================================
        // SORT BY PUBLISHED DATE
        // ========================================

        newsList.sort((a, b) => {

            return getTime(b.publishedAt) -
                   getTime(a.publishedAt);

        });


        // ========================================
        // CATEGORY FILTER
        // ========================================

        if (category !== "All") {

            const search =
                category.toLowerCase();

            newsList = newsList.filter((news) => {

                const title =
                    String(news.title || "")
                    .toLowerCase();

                const description =
                    String(news.description || "")
                    .toLowerCase();

                const source =
                    String(news.source || "")
                    .toLowerCase();

                return (
                    title.includes(search) ||
                    description.includes(search) ||
                    source.includes(search)
                );

            });

        }


        // ========================================
        // NOTHING FOUND
        // ========================================

        if (newsList.length === 0) {

            featuredNews.innerHTML = `
                <div class="loading-news">
                    No News Found
                </div>
            `;

            newsContainer.innerHTML = "";

            return;
        }


        // ========================================
        // FEATURED NEWS
        // ========================================

        const featured = newsList[0];

        featuredNews.innerHTML = `
            <div class="news-card featured-card">

                <img
                    src="${getImage(featured.image)}"
                    alt="Movie news"
                    onerror="this.src='https://via.placeholder.com/900x500?text=FLOPCORN+NEWS'"
                >

                <div class="news-content">

                    <h2>
                        ${escapeHTML(
                            featured.title ||
                            "Untitled News"
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            featured.description ||
                            ""
                        )}
                    </p>

                    <div class="news-source">
                        📰
                        ${escapeHTML(
                            featured.source ||
                            "Unknown"
                        )}

                        ${formatDate(
                            featured.publishedAt
                        )}
                    </div>

                    ${
                        featured.url
                        ? `
                            <a
                                href="${safeURL(featured.url)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Read Full Story →
                            </a>
                        `
                        : ""
                    }

                </div>

            </div>
        `;


        // ========================================
        // LATEST NEWS
        // ========================================

        newsContainer.innerHTML = "";

        newsList.slice(1).forEach((news) => {

            const card =
                document.createElement("div");

            card.className = "news-card";

            card.innerHTML = `
                <img
                    src="${getImage(news.image)}"
                    alt="Movie news"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/500x300?text=FLOPCORN+NEWS'"
                >

                <div class="news-content">

                    <h3>
                        ${escapeHTML(
                            news.title ||
                            "Untitled News"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            news.description ||
                            ""
                        )}
                    </p>

                    <div class="news-source">
                        📰
                        ${escapeHTML(
                            news.source ||
                            "Unknown"
                        )}

                        ${formatDate(
                            news.publishedAt
                        )}
                    </div>

                    ${
                        news.url
                        ? `
                            <a
                                href="${safeURL(news.url)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Read More →
                            </a>
                        `
                        : ""
                    }

                </div>
            `;

            newsContainer.appendChild(card);

        });


        startAnimations();

        console.log(
            "🍿 FLOPCORN: News loaded successfully!"
        );

    }

    catch (error) {

        console.error(
            "🔥 FLOPCORN NEWS ERROR:",
            error
        );

        featuredNews.innerHTML = `
            <div class="loading-news">
                ❌ Failed to load news.
            </div>
        `;

        newsContainer.innerHTML = "";

    }

}


// ========================================
// DATE
// ========================================

function getTime(value) {

    if (!value) return 0;

    // Firestore Timestamp
    if (
        typeof value === "object" &&
        typeof value.toDate === "function"
    ) {
        return value.toDate().getTime();
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return 0;
    }

    return date.getTime();
}


function formatDate(value) {

    const time = getTime(value);

    if (!time) return "";

    return ` • ${new Date(time).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    )}`;
}


// ========================================
// IMAGE
// ========================================

function getImage(image) {

    if (
        typeof image === "string" &&
        image.trim() !== ""
    ) {
        return image;
    }

    return "https://via.placeholder.com/900x500?text=FLOPCORN+NEWS";
}


// ========================================
// HTML SECURITY
// ========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// URL SECURITY
// ========================================

function safeURL(url) {

    if (!url || typeof url !== "string") {
        return "#";
    }

    try {

        const parsed = new URL(url);

        if (
            parsed.protocol === "https:" ||
            parsed.protocol === "http:"
        ) {
            return parsed.href;
        }

    } catch (error) {

        console.warn(
            "Invalid news URL:",
            url
        );

    }

    return "#";
}


// ========================================
// ANIMATIONS
// ========================================

function startAnimations() {

    const cards =
        document.querySelectorAll(".news-card");

    if (!cards.length) return;

    if (
        !("IntersectionObserver" in window)
    ) {

        cards.forEach((card) => {
            card.classList.add("show");
        });

        return;
    }

    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "show"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }

                });

            },
            {
                threshold: 0.15
            }
        );

    cards.forEach((card) => {
        observer.observe(card);
    });
}


// ========================================
// CATEGORY BUTTONS
// ========================================

const filterButtons =
    document.querySelectorAll(
        ".news-filter button"
    );

filterButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach((btn) => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            loadNews(
                button.dataset.category ||
                "All"
            );

        }
    );

});


// ========================================
// START
// ========================================

loadNews("All");