
import {
    auth,
    db,
    onAuthStateChanged,
    doc,
    getDoc,
    collection,
    getDocs
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

await loadUsers();
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
