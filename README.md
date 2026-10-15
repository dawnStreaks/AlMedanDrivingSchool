# Al Medan Driving School

A multi-page Bootstrap driving school website (based on the "Drivin" HTML Codex template), with pages for Home, About, Courses, Team, Testimonials, Appointment, and Contact.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static web server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

Push this folder to a public GitHub repository and enable **Settings > Pages > Deploy from a branch**. Select the `main` branch and `/ (root)` folder.

The site is fully static (HTML/CSS/JS, local assets and libraries) and requires no server-side code.

## Firebase ratings and reviews

The review page reads and writes the `reviews` collection in Firebase Cloud Firestore directly from browser JavaScript. GitHub Pages continues hosting the website; no server deployment or Firebase Hosting is required.

### One-time setup

1. Open https://console.firebase.google.com/ and create a project on the free **Spark** plan. Analytics is optional.
2. In Project settings, register a web app (`</>`) and copy its `firebaseConfig` values into `js/firebase-config.js`. These values are public configuration, not administrator credentials.
3. In Build > Firestore Database, create the default database in **production mode**, choosing the region you want to keep.
4. In Firestore > Rules, replace the rules with the contents of `firestore.rules` and click **Publish**. Do not use unrestricted test-mode rules.
5. Push the site changes to GitHub Pages and submit a review to verify the connection. Refresh the page or open it in another browser to verify persistence.

Reviews publish immediately without approval. Visitors can create valid reviews and read them, but cannot edit or delete existing reviews. Remove inappropriate submissions using the Firebase console. These rules allow public submissions; the honeypot does not provide server-side rate limiting or prevent repeat ratings. Firebase App Check can provide additional abuse protection if configured separately.

The page loads the newest 100 Firebase reviews plus the existing reviews in `data/reviews.txt`. The displayed average describes only those displayed reviews. Existing reviews remain in the static file; do not duplicate them in Firestore. Reviews refresh when the page opens and after a successful submission, rather than using a continuously billed live listener.

Until configuration is supplied, existing reviews still display and submission is disabled. Connection failures show an error and preserve existing reviews. Review text is rendered as plain text to prevent submitted HTML from executing.

For local development, use the HTTP server above; JavaScript modules require HTTP rather than opening the HTML as a local file.

The older `worker/` and `wrangler.toml` Cloudflare files are retained but are no longer used by the review page.

## Kuwait location metadata

The homepage JSON-LD lists Kuwait, all six governorates, and 143 named areas, districts, islands and housing developments. Common English spellings are recorded as `alternateName` values rather than duplicate places. `data/kuwait-areas.json` stores the grouped location list, research date and sources:

- https://en.wikipedia.org/wiki/Areas_of_Kuwait
- https://www.pahw.gov.kw/en/South-Saad-Al-Abdullah
- https://www.pahw.gov.kw/Sabah-Al-Ahmad/

This is a researched geographic list, not an exhaustive official PACI address register; individual blocks, streets and landmarks are outside its scope. Keep the homepage JSON-LD and the JSON registry synchronized when updating coverage. Service-area entries describe geographic coverage, not branch addresses. Meta descriptions remain concise instead of repeating the entire directory.
