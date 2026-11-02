# Becoming | The Personal Performance Audit

A private, one-question-at-a-time year in review. React + Vite. No backend: answers are saved in the visitor's own browser (localStorage), and the PDF is generated on their device.

## Run locally
```
npm install
npm run dev
```

## Build
```
npm run build
```
Output goes to `dist/`.

## Deploy to Vercel
1. Push this folder to a GitHub repo
2. Go to vercel.com/new and import the repo
3. Keep the project root set to this folder. `vercel.json` configures the build (`npm run build`) and output (`dist`).
4. Click Deploy

## PDF download details
The completed audit asks for a full name, email, and country before downloading the PDF. These details are sent to a Google Sheet; audit answers remain in the visitor's browser and are not submitted.

1. Open the target spreadsheet (`1vH6YwiL3TP7efWBy6tWOCuMzW-SwjCeWEQKt8LW8oAQ`) and open **Extensions → Apps Script**.
2. Replace the editor contents with `google-apps-script/Code.gs` and save. The script writes to the existing tab with ID `0` (the `gid=0` tab in the shared link); it does not create or select a different tab.
3. Deploy the script as a web app, executing as you and allowing access to anyone. Copy the web app URL.
4. In Vercel, add `GOOGLE_APPS_SCRIPT_URL` with that URL for the production environment, then redeploy.
5. If the target tab is empty, the first successful submission adds `Submitted at`, `Full name`, `Email`, and `Country` headers. Each submission is appended to that tab. If the tab already has the previous three headers, the script adds `Country` in column D.

The Vercel API endpoint forwards form submissions to Apps Script and returns a success or error response before allowing the PDF download.

Or with the CLI: `npm i -g vercel`, then run `vercel --prod` in this folder.

## Where things live
- `src/data.js`   questions, parts, badges, ranks, XP logic
- `src/App.jsx`   screens and flow
- `src/pdf.js`    PDF export (jsPDF, loaded only when someone clicks Download)
- `src/styles.css` all styling
# becoming
