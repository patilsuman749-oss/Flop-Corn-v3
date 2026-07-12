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
    getFirestore
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

        if (auth.currentUser) {

            if (confirm("Sign out?")) {
                await signOut(auth);
            }

            return;
        }

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