# Claims Shell prototype

A clickable prototype of the Claims experience in Air, with agents working claims. All data is made up and lives in the browser tab. Nothing is sent anywhere.

Demo controls: open the site with `?present` to hide the demo controls, or `?role=manager` to start as a billing manager. In the app, Shift+M switches between biller and manager, Shift+P hides the controls.

## Run it on your computer

You need Node 18 or newer.

```
npm install
npm run dev
```

Then open the address it prints, usually http://localhost:5173.

## Put it on GitHub

1. Create an empty repository on GitHub (no README, no .gitignore).
2. In this folder:

```
git init
git add .
git commit -m "Claims Shell prototype"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPO.git
git push -u origin main
```

Or drag the files into the repository on github.com with "Add file", then "Upload files". Do not upload `node_modules` or `dist`.

## Deploy on Vercel

1. On vercel.com, choose Add New, then Project, and import the GitHub repository.
2. Vercel detects Vite. Keep the defaults: build command `npm run build`, output directory `dist`.
3. Deploy. Every push to `main` deploys again.

## Files

- `src/ClaimsShell.jsx`: the prototype (`Claims_Shell.jsx`)
- `src/main.jsx`: mounts it on the page
