import {
    auth,
    db,
    onAuthStateChanged,
    doc,
    getDoc,
    collection,
    getDocs
} from "./firebase.js";
console.log("NEW ADMIN.JS LOADED");
onAuthStateChanged(auth, async (user) => {

    console.log("Step 1: Auth changed");

    if (!user) {
        console.log("No user");
        window.location.href = "index.html";
        return;
    }

    console.log("Logged in:", user.uid);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    console.log("User doc exists:", userSnap.exists());

    if (!userSnap.exists()) {
        window.location.href = "index.html";
        return;
    }

    const userData = userSnap.data();
    console.log(userData);

   const adminEmails = [
    "patilsuman749@gmail.com",
    "fcbayernmunich2010@gmail.com"
];

if (!adminEmails.includes(user.email)) {
    console.log("Not admin");
    window.location.href = "index.html";
    return;
}
    

    console.log("Admin verified");

    document.getElementById("loading").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";

    await loadUsers();
    await loadReviewCount();
    await loadMovieCount();

});
   
  


async function loadUsers() {

    const usersSnapshot = await getDocs(collection(db, "users"));

    const table = document.getElementById("usersTable");

    table.innerHTML = "";

    document.getElementById("userCount").textContent =
        usersSnapshot.size;

    usersSnapshot.forEach((userDoc) => {

        const user = userDoc.data();

        table.innerHTML += `
            <tr>
                <td>
                    <img
                        src="${user.photoURL || ""}"
                        style="width:45px;height:45px;border-radius:50%;object-fit:cover;">
                </td>

                <td>${user.username || "-"}</td>

                <td>${user.email || "-"}</td>

                <td>-</td>

            </tr>
        `;

    });

}

async function loadReviewCount() {

    const reviewsSnapshot = await getDocs(
        collection(db, "reviews")
    );

    document.getElementById("reviewCount").textContent =
        reviewsSnapshot.size;

}

async function loadMovieCount() {

    const reviewsSnapshot = await getDocs(
        collection(db, "reviews")
    );

    const uniqueMovies = new Set();

    reviewsSnapshot.forEach((reviewDoc) => {

        const review = reviewDoc.data();

        if (review.movieId) {
            uniqueMovies.add(String(review.movieId));
        }

    });

    document.getElementById("movieCount").textContent =
        uniqueMovies.size;

}

function updateTime() {
    document.getElementById("currentTime").textContent =
        new Date().toLocaleTimeString();
}

updateTime();
setInterval(updateTime, 1000);
