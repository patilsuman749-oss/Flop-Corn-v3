
import {
    auth,
    db,
    onAuthStateChanged,
    doc,
    getDoc
} from "./firebase.js";

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        window.location.href = "index.html";
        return;
    }

    const userData = userSnap.data();

    if (!userData.isAdmin) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("loading").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";

    alert("Welcome Admin 🍿");
});
