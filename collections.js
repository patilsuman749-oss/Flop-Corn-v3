/* =========================================
   FLOP CORN 🍿
   MOVIE COLLECTIONS (shared module)
   Spotify-playlist style movie collections.
   Used by app.js (profile popup) and
   movie.html (add-to-collection + reviewer
   public collections).
========================================= */

import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    deleteField,
    onSnapshot,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export const COLLECTIONS_PATH = "movieCollections";

const POSTER_IMAGE_URL = "https://image.tmdb.org/t/p/w200";

/* ---------- CREATE ---------- */

export function createCollection({ name, description, isPublic }) {

    const user = auth.currentUser;

    if (!user) {
        return Promise.reject(new Error("Not signed in"));
    }

    return addDoc(
        collection(db, COLLECTIONS_PATH),
        {
            userId: user.uid,
            userName: user.displayName || "Flop Corn User",
            userPhoto: user.photoURL || "",
            name: (name || "Untitled Collection").trim(),
            description: (description || "").trim(),
            isPublic: !!isPublic,
            movies: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }
    );

}

/* ---------- ADD / REMOVE MOVIES ---------- */

export function addMovieToCollection(collectionId, movie) {

    const ref = doc(db, COLLECTIONS_PATH, collectionId);

    return updateDoc(ref, {
        [`movies.${movie.id}`]: {
            title: movie.title || "",
            poster: movie.poster_path || "",
            rating: movie.vote_average || 0,
            addedAt: Date.now()
        },
        updatedAt: serverTimestamp()
    });

}

export function removeMovieFromCollection(collectionId, movieId) {

    const ref = doc(db, COLLECTIONS_PATH, collectionId);

    return updateDoc(ref, {
        [`movies.${movieId}`]: deleteField(),
        updatedAt: serverTimestamp()
    });

}

/* ---------- UPDATE / DELETE COLLECTION ---------- */

export function updateCollectionMeta(collectionId, { name, description, isPublic }) {

    const ref = doc(db, COLLECTIONS_PATH, collectionId);

    const data = { updatedAt: serverTimestamp() };

    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description.trim();
    if (isPublic !== undefined) data.isPublic = !!isPublic;

    return updateDoc(ref, data);

}

export function deleteCollection(collectionId) {

    return deleteDoc(doc(db, COLLECTIONS_PATH, collectionId));

}

/* ---------- LISTEN ---------- */

export function listenUserCollections(userId, callback, onError) {

    const collectionsQuery = query(
        collection(db, COLLECTIONS_PATH),
        where("userId", "==", userId)
    );

    return onSnapshot(
        collectionsQuery,
        (snapshot) => {

            const items = [];

            snapshot.forEach((docSnap) => {
                items.push({ id: docSnap.id, ...docSnap.data() });
            });

            items.sort((a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );

            callback(items);

        },
        onError
    );

}

export function listenPublicCollections(userId, callback, onError) {

    const collectionsQuery = query(
        collection(db, COLLECTIONS_PATH),
        where("userId", "==", userId),
        where("isPublic", "==", true)
    );

    return onSnapshot(
        collectionsQuery,
        (snapshot) => {

            const items = [];

            snapshot.forEach((docSnap) => {
                items.push({ id: docSnap.id, ...docSnap.data() });
            });

            items.sort((a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            );

            callback(items);

        },
        onError
    );

}

/* ---------- HELPERS ---------- */

export function collectionMoviesArray(coll) {

    const movies = coll.movies || {};

    return Object.entries(movies)
        .map(([movieId, movie]) => ({ movieId, ...movie }))
        .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

}

export function collectionCoverPosters(coll, limitCount = 4) {

    return collectionMoviesArray(coll)
        .slice(0, limitCount)
        .map((m) => m.poster);

}

export function collectionMovieCount(coll) {

    return Object.keys(coll.movies || {}).length;

}

function escapeHtml(str) {

    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;

}

/* ---------- RENDERING ---------- */

export function renderCollectionCardHTML(coll) {

    const posters = collectionCoverPosters(coll, 4);
    const count = collectionMovieCount(coll);

    const posterHTML = posters.length
        ? posters.map((p) => `
            <img
                src="${p ? POSTER_IMAGE_URL + p : "flopcorn-logo.jpeg.jpeg"}"
                alt=""
                loading="lazy"
            >
          `).join("")
        : `
            <div class="collection-cover-empty">
                <i class="fa-solid fa-film"></i>
            </div>
        `;

    return `
        <div class="collection-card" data-collection-id="${coll.id}">

            <div class="collection-cover cover-count-${Math.min(posters.length, 4)}">
                ${posterHTML}
            </div>

            <div class="collection-card-info">

                <strong>${escapeHtml(coll.name)}</strong>

                <span>
                    ${count} movie${count === 1 ? "" : "s"}
                    ${coll.isPublic
                        ? ""
                        : ' &middot; <i class="fa-solid fa-lock"></i> Private'}
                </span>

            </div>

        </div>
    `;

}

export { escapeHtml, POSTER_IMAGE_URL };
