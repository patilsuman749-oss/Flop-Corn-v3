# FlopCorn Android App (WebView wrapper)

This is a minimal Android app that opens **https://flopcorn.in** in a full-screen
WebView. It has no build tools bundled — the actual `.apk` gets compiled for you
automatically by GitHub Actions (GitHub's own servers, which have internet access),
so you don't need Android Studio or a local SDK.

## What's in here

```
build.gradle                 -> root Gradle config
settings.gradle               -> declares the "app" module
gradle.properties
app/
  build.gradle                 -> Android app config (package name, SDK versions)
  src/main/AndroidManifest.xml -> app permissions + entry point
  src/main/java/com/flopcorn/app/MainActivity.java  -> loads flopcorn.in in a WebView
.github/workflows/build-apk.yml -> the CI pipeline that builds the APK
```

## One-time setup

1. Unzip this into the **root** of your `Flop-Corn-v3` GitHub repo — right alongside
   your existing `index.html`, `app.js`, etc. (It's fine for the website files and
   this Android project to live in the same repo.)
2. Commit and push:
   ```bash
   git add build.gradle settings.gradle gradle.properties app .github
   git commit -m "Add Android WebView app + CI build"
   git push
   ```
3. Go to your repo on GitHub → the **Actions** tab. You should see a workflow run
   called "Build FlopCorn APK" start automatically (it triggers on every push).
4. When it finishes (usually 2–4 minutes), open that run → scroll down to
   **Artifacts** → download **FlopCorn-apk**. Unzip it to get `app-debug.apk`.
5. Transfer that `.apk` to your Android phone and install it (you'll need to allow
   "install unknown apps" for whatever app you use to open it — Files, Chrome, etc.).

## Re-running the build any time

- Every push to `main` that touches the `app/` folder re-triggers the build
  automatically.
- You can also trigger it manually: **Actions** tab → **Build FlopCorn APK** →
  **Run workflow**.

## Notes

- This produces a **debug-signed APK** — perfectly fine for installing on your own
  phone or sharing informally, but it is **not** signed for the Google Play Store.
  If you ever want to publish it there, you'd need to generate a release keystore
  and sign a release build — a different, more involved step. Ask if you want help
  with that later.
- The site URL is hardcoded in `MainActivity.java`
  (`private static final String SITE_URL = "https://flopcorn.in";`). If you ever
  change domains, update that one line.
- The app has no offline support — it's just a thin wrapper that loads your live
  website, so anything you change on flopcorn.in shows up immediately, no rebuild
  needed. You only need to rebuild the APK if you change app-level things (name,
  icon, permissions, the wrapped URL, etc.).
