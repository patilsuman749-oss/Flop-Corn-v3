/* =====================================
   FLOP CORN 🍿 FIREBASE
===================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
    } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* Firebase Config */

const firebaseConfig = {
    apiKey: "AIzaSyDN_re8pXnNjCBdIx3yKIvbksEiyG4kPLM",
    authDomain: "flop-corn.firebaseapp.com",
    projectId: "flop-corn",
    storageBucket: "flop-corn.firebasestorage.app",
    messagingSenderId: "950178590730",
    appId: "1:950178590730:web:33aa6cf8035311949e6ff3",
    measurementId: "G-658KPKGSWM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { signOut };

const provider = new GoogleAuthProvider();

/* BUTTONS */

const signInButton =
    document.getElementById("signInButton") ||
    document.getElementById("loginButton");

const reviewButton =
    document.getElementById("writeReviewButton") ||
    document.getElementById("writeMovieReview");

/* GOOGLE LOGIN */

if (signInButton) {

    signInButton.addEventListener("click", async () => {

        // If already logged in, app.js will open the profile menu
        if (auth.currentUser) {
            return;
        }

        // If not logged in, open Google login
        try {

            await signInWithPopup(auth, provider);

        } catch (error) {

            console.error(error);

            alert(
                error.code + "\n\n" +
                error.message
            );

        }

    });

}

/* LOGIN STATE */

onAuthStateChanged(auth, (user) => {

    if (!signInButton) return;

    if (user) {

        signInButton.innerHTML = `
            <img src="${user.photoURL}"
                 style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
            <span>${user.displayName}</span>
        `;

    } else {

        signInButton.innerHTML = `
            <i class="fa-brands fa-google"></i>
            <span>Sign in</span>
        `;

    }

});

/* REVIEW BUTTON */

if (reviewButton) {

    reviewButton.addEventListener("click", () => {

        if (!auth.currentUser) {

            alert("Please sign in with Google first 🍿");
            return;

        }

        alert("Welcome " + auth.currentUser.displayName + " ⭐");

    });

}

/* =====================================
   PUBLIC MOVIE REVIEWS 🍿
===================================== */

const submitReviewButton = document.getElementById("submitReview");

if (submitReviewButton) {

    submitReviewButton.addEventListener("click", async () => {

        if (!auth.currentUser) {
            alert("Please sign in with Google first 🍿");
            return;
        }

        const ratingInput = document.getElementById("userRating");
        const reviewInput = document.getElementById("userReview");

        const rating = Number(ratingInput.value);
        const reviewText = reviewInput.value.trim();

        if (rating < 1 || rating > 10) {
            alert("Please give a rating from 1 to 10 ⭐");
            return;
        }

        if (reviewText === "") {
            alert("Please write your review 🍿");
            return;
        }

        const movieId =
            new URLSearchParams(window.location.search).get("id");

        try {

            await addDoc(collection(db, "reviews"), {

                movieId: movieId,

                rating: rating,

                review: reviewText,

                userName:
                    auth.currentUser.displayName || "Movie Fan",

                userPhoto:
                    auth.currentUser.photoURL || "",

                userId:
                    auth.currentUser.uid,

                createdAt:
                    serverTimestamp()

            });

            alert("Your review is now public! 🍿🔥");

            ratingInput.value = "";
            reviewInput.value = "";

        } catch (error) {

            console.error(error);

            alert(
                "Review could not be saved.\n\n" +
                error.message
            );

        }

    });

}

/* =====================================
   SHOW PUBLIC REVIEWS 🍿
===================================== */

const publicReviews = document.getElementById("publicReviews");

if (publicReviews) {

    const movieId =
        new URLSearchParams(window.location.search).get("id");

    const reviewsQuery = query(
        collection(db, "reviews"),
        where("movieId", "==", movieId)
    );

    onSnapshot(reviewsQuery, (snapshot) => {

        publicReviews.innerHTML = "";

        let totalRating = 0;
        let reviewCount = 0;

        if (snapshot.empty) {

            publicReviews.innerHTML = `
                <p>No reviews yet. Be the first to review!</p>
            `;

        } else {

            snapshot.forEach((reviewDocument) => {

                const review = reviewDocument.data();

                totalRating += Number(review.rating);
                reviewCount++;

                publicReviews.innerHTML += `
                    <div class="public-review-card">

                        <div class="public-review-user">

                            ${
                                review.userPhoto
                                ? `<img src="${review.userPhoto}"
                                     alt="User">`
                                : "👤"
                            }

                            <strong>
                                ${review.userName}
                            </strong>

                        </div>

                        <div class="public-review-rating">
                            ⭐ ${review.rating}/10
                        </div>

                        <p>
                            ${review.review}
                        </p>

                    </div>
                `;

            });

        }

        /* UPDATE FLOP CORN METER */

        const meterScore =
            document.getElementById("meterScore");

        const meterFill =
            document.getElementById("meterFill");

        const meterVerdict =
            document.getElementById("meterVerdict");

        if (reviewCount > 0) {

            const average =
                totalRating / reviewCount;

            meterScore.textContent =
                average.toFixed(1);

            meterFill.style.width =
                (average * 10) + "%";

            if (average >= 7) {

                meterVerdict.textContent =
                    "🔥 GO FOR IT";

            } else if (average >= 5) {

                meterVerdict.textContent =
                    "🍿 TIMEPASS";

            } else {

                meterVerdict.textContent =
                    "❌ SKIP IT";

            }

        } else {

            meterScore.textContent = "0.0";
            meterFill.style.width = "0%";

            meterVerdict.textContent =
                "No reviews yet";

        }

    });

}