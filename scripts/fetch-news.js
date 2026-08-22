import axios from "axios";
import { db } from "../firebase-admin.js";
import admin from "firebase-admin";

const API_KEY = process.env.GNEWS_API_KEY;

async function fetchMovieNews() {
  try {
    console.log("Fetching latest movie news...");

    const url =
      `https://gnews.io/api/v4/search?q=movie OR cinema OR Bollywood OR Hollywood OR Tollywood&lang=en&country=in&max=10&apikey=${API_KEY}`;

    const response = await axios.get(url);

    const articles = response.data.articles || [];

    console.log(`Found ${articles.length} articles`);

    for (const article of articles) {

      const docId = Buffer.from(article.url).toString("base64");

      const docRef = db.collection("movieNews").doc(docId);

      const doc = await docRef.get();

      if (doc.exists) {
        console.log("Already exists:", article.title);
        continue;
      }

      await docRef.set({
        title: article.title,
        description: article.description || "",
        image: article.image || "",
        url: article.url,
        source: article.source?.name || "",
        publishedAt: article.publishedAt,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log("Saved:", article.title);
    }

    console.log("Finished.");

  } catch (err) {
    console.error(err);
  }
}

fetchMovieNews();
