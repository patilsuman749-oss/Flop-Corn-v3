/* =====================================
   FLOP CORN — SURPRISE MOVIE 🍿
===================================== */

const surpriseMovieButton =
    document.getElementById("surpriseMovieButton");

if (surpriseMovieButton) {

    surpriseMovieButton.addEventListener("click", () => {

        const surpriseCategories = [
            "bollywood",
            "south",
            "kannada",
            "indianGems",
            "hidden",
            "underrated",
            "topRated",
            "classics",
            "marvel",
            "superhero",
            "comedy",
            "horror",
            "action",
            "thriller",
            "family",
            "scifi"
        ];

        const randomCategory =
            surpriseCategories[
                Math.floor(
                    Math.random() * surpriseCategories.length
                )
            ];

        window.location.href =
            `category.html?type=${randomCategory}`;
    });

}
