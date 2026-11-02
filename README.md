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
3. Vercel detects Vite automatically (build: `npm run build`, output: `dist`)
4. Click Deploy

Or with the CLI: `npm i -g vercel`, then run `vercel --prod` in this folder.

## Where things live
- `src/data.js`   questions, parts, badges, ranks, XP logic
- `src/App.jsx`   screens and flow
- `src/pdf.js`    PDF export (jsPDF, loaded only when someone clicks Download)
- `src/styles.css` all styling
# becoming
