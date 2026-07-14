/* =====================================
   FLOP CORN 🍿 FIREBASE
===================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


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
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =====================================
   FIREBASE CONFIG
===================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyDN_re8pXnNjCBdIx3yKIvbksEiyG4kPLM",

    authDomain:
        "flop-corn.firebaseapp.com",

    projectId:
        "flop-corn",

    storageBucket:
        "flop-corn.firebasestorage.app",

    messagingSenderId:
        "950178590730",

    appId:
        "1:950178590730:web:33aa6cf8035311949e6ff3",

    measurementId:
        "G-658KPKGSWM"

};


const app =
    initializeApp(firebaseConfig);


export const auth =
    getAuth(app);


export const db =
    getFirestore(app);


export {
    signOut,
    onAuthStateChanged
};


const provider =
    new GoogleAuthProvider();


/* =====================================
   BUTTONS
===================================== */

const signInButton =

    document.getElementById(
        "signInButton"
    )

    ||

    document.getElementById(
        "loginButton"
    );


const reviewButton =

    document.getElementById(
        "writeReviewButton"
    )

    ||

    document.getElementById(
        "writeMovieReview"
    );


/* =====================================
   GOOGLE LOGIN
===================================== */

if (signInButton) {

    signInButton.addEventListener(

        "click",

        async () => {


            /* PROFILE MENU IS HANDLED
               BY APP.JS */

            if (auth.currentUser) {

                return;

            }


            try {

                await signInWithPopup(

                    auth,

                    provider

                );

            }


            catch (error) {

                console.error(

                    "Google login error:",

                    error

                );


                alert(

                    error.code +

                    "\n\n" +

                    error.message

                );

            }

        }

    );

}


/* =====================================
   LOGIN STATE
===================================== */

onAuthStateChanged(

    auth,

    (user) => {


        if (!signInButton) {

            return;

        }


        if (user) {


            signInButton.innerHTML = `

                <img

                    src="${user.photoURL || ""}"

                    alt="Profile"

                    style="
                        width:30px;
                        height:30px;
                        border-radius:50%;
                        object-fit:cover;
                    "

                >

            `;

        }


        else {


            signInButton.innerHTML = `

                <i
                    class=
                    "fa-brands fa-google"
                ></i>

                <span>
                    Sign in
                </span>

            `;

        }

    }

);


/* =====================================
   REVIEW BUTTON
===================================== */

if (reviewButton) {

    reviewButton.addEventListener(

        "click",

        () => {


            if (!auth.currentUser) {

                alert(

                    "Please sign in with Google first 🍿"

                );

                return;

            }

        }

    );

}


/* =====================================
   SAVE PUBLIC MOVIE REVIEW 🍿
===================================== */

const submitReviewButton =

    document.getElementById(
        "submitReview"
    );


if (submitReviewButton) {


    submitReviewButton.addEventListener(

        "click",

        async () => {


            if (!auth.currentUser) {

                alert(

                    "Please sign in with Google first 🍿"

                );

                return;

            }


            const ratingInput =

                document.getElementById(
                    "userRating"
                );


            const reviewInput =

                document.getElementById(
                    "userReview"
                );


            const rating =

                Number(
                    ratingInput.value
                );


            const reviewText =

                reviewInput
                .value
                .trim();


            if (
                rating < 1 ||
                rating > 10
            ) {

                alert(

                    "Please give a rating from 1 to 10 ⭐"

                );

                return;

            }


            if (
                reviewText === ""
            ) {

                alert(

                    "Please write your review 🍿"

                );

                return;

            }


            const movieId =

                new URLSearchParams(

                    window.location.search

                ).get("id");


            /* GET CUSTOM USERNAME */

            let flopCornUsername =

                auth.currentUser
                .displayName

                ||

                "Movie Fan";


            try {


                const userProfile =

                    await getDoc(

                        doc(

                            db,

                            "users",

                            auth.currentUser.uid

                        )

                    );


                if (

                    userProfile.exists()

                    &&

                    userProfile
                    .data()
                    .username

                ) {


                    flopCornUsername =

                        userProfile
                        .data()
                        .username;

                }

            }


            catch (error) {

                console.error(

                    "Username loading error:",

                    error

                );

            }


            /* SAVE REVIEW */

            try {


                await addDoc(

                    collection(

                        db,

                        "reviews"

                    ),

                    {

                        movieId:
                            movieId,

                        rating:
                            rating,

                        review:
                            reviewText,

                        userName:
                            flopCornUsername,

                        userId:
                            auth
                            .currentUser
                            .uid,

                        createdAt:
                            serverTimestamp()

                    }

                );


                alert(

                    "Your review is now public! 🍿🔥"

                );


                ratingInput.value =
                    "";


                reviewInput.value =
                    "";

            }


            catch (error) {


                console.error(

                    "Review saving error:",

                    error

                );


                alert(

                    "Review could not be saved.\n\n"

                    +

                    error.message

                );

            }

        }

    );

}


/* =====================================
   SHOW PUBLIC REVIEWS 🍿
===================================== */

const publicReviews =

    document.getElementById(
        "publicReviews"
    );


if (publicReviews) {


    const movieId =

        new URLSearchParams(

            window.location.search

        ).get("id");


    const reviewsQuery =

        query(

            collection(

                db,

                "reviews"

            ),

            where(

                "movieId",

                "==",

                movieId

            )

        );


    onSnapshot(

        reviewsQuery,

        (snapshot) => {


            publicReviews.innerHTML =
                "";


            let totalRating =
                0;


            let reviewCount =
                0;


            if (
                snapshot.empty
            ) {


                publicReviews.innerHTML = `

                    <p>

                        No reviews yet.
                        Be the first to review!

                    </p>

                `;

            }


            else {


                snapshot.forEach(

                    (
                        reviewDocument
                    ) => {


                        const review =

                            reviewDocument
                            .data();


                        totalRating +=

                            Number(

                                review.rating

                            );


                        reviewCount++;


                        const canDelete =

                            auth.currentUser

                            &&

                            auth
                            .currentUser
                            .uid

                            ===

                            review.userId;


                        publicReviews
                        .innerHTML += `


                            <div

                                class=
                                "public-review-card"

                            >


                                <strong>

                                    ${

                                        review
                                        .userName

                                        ||

                                        "Movie Fan"

                                    }

                                </strong>


                                <div

                                    class=
                                    "public-review-rating"

                                >

                                    ⭐

                                    ${review.rating}/10

                                </div>


                                <p>

                                    ${review.review}

                                </p>


                                ${

                                    canDelete

                                    ?

                                    `

                                    <button

                                        class=
                                        "delete-review-button"

                                        data-review-id=
                                        "${reviewDocument.id}"

                                    >

                                        🗑️ Delete Review

                                    </button>

                                    `

                                    :

                                    ""

                                }


                            </div>

                        `;

                    }

                );

            }


            /* DELETE REVIEW */

            document

            .querySelectorAll(

                ".delete-review-button"

            )

            .forEach(

                (button) => {


                    button
                    .addEventListener(

                        "click",

                        async () => {


                            const confirmed =

                                confirm(

                                    "Are you sure you want to delete this review?"

                                );


                            if (
                                !confirmed
                            ) {

                                return;

                            }


                            try {


                                await deleteDoc(

                                    doc(

                                        db,

                                        "reviews",

                                        button
                                        .dataset
                                        .reviewId

                                    )

                                );

                            }


                            catch (
                                error
                            ) {


                                console.error(

                                    "Delete review error:",

                                    error

                                );


                                alert(

                                    "Review could not be deleted."

                                );

                            }

                        }

                    );

                }

            );


            /* =====================================
               UPDATE FLOP CORN METER
            ===================================== */


            const meterScore =

                document.getElementById(

                    "meterScore"

                );


            const meterFill =

                document.getElementById(

                    "meterFill"

                );


            const meterVerdict =

                document.getElementById(

                    "meterVerdict"

                );


            if (

                meterScore

                &&

                meterFill

                &&

                meterVerdict

            ) {


                if (
                    reviewCount > 0
                ) {


                    const average =

                        totalRating

                        /

                        reviewCount;


                    meterScore
                    .textContent =

                        average
                        .toFixed(1);


                    meterFill
                    .style
                    .width =

                        (
                            average
                            *
                            10
                        )

                        +

                        "%";


                    if (

                        average >= 7

                    ) {


                        meterVerdict
                        .textContent =

                            "🔥 GO FOR IT";

                    }


                    else if (

                        average >= 5

                    ) {


                        meterVerdict
                        .textContent =

                            "🍿 TIMEPASS";

                    }


                    else {


                        meterVerdict
                        .textContent =

                            "❌ SKIP IT";

                    }

                }


                else {


                    meterScore
                    .textContent =

                        "0.0";


                    meterFill
                    .style
                    .width =

                        "0%";


                    meterVerdict
                    .textContent =

                        "No reviews yet";

                }

            }

        }

    );

}
