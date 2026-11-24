# Air prototype

A clickable prototype of the Air Claims worklist, the Agents hub, agent pages and the agent builder.

All data is synthetic and lives in memory. Nothing is saved, sent or posted. No patient information is used. Reloading the page resets everything.

## What is in it

- **My Claims (first screen):** 33 groups, each a card with a summary, a suggested action and a collapsible "Claims" table. The first card opens by default.
  - **Accept** solves the group, takes it off the list and opens the next one. The app then offers to **build an agent** for that action.
  - **More actions** on each card header, and **More Actions** in the Bulk Actions bar, open a command palette (also **Command K** or **Ctrl K** with claims selected).
  - Select claims to get the Bulk Actions bar. **Assign** works from the bar and from the palette.
- **Workable Claims and All Claims:** the earlier group list with flat claim rows.
- **Agents hub:** stats, agent cards, pause, resume and delete.
- **Medicare Agent page:** Tasks and Activity, with a claim panel and Approve, Edit and Reject.
- **Agent builder:** describe an agent in plain words, or arrive from the Accept prompt with a draft already filled in.
- A small **Demo state** switch (bottom left on Claims) forces the loading, empty and error states. It is not part of the product.

## Run it on your computer

```bash
npm install
npm run dev
```

Open the address that Vite prints (usually http://localhost:5173).

## Put it on GitHub

```bash
git init
git add .
git commit -m "Air prototype"
git branch -M main
git remote add origin https://github.com/YOUR-ORG/air-claims-prototype.git
git push -u origin main
```

Create the empty repository on GitHub first, and make it **private**.

To update it later, replace the files, then:

```bash
git add .
git commit -m "Update prototype"
git push
```

## Deploy it on Vercel

1. Go to vercel.com and choose **Add New, Project**.
2. Import the GitHub repository.
3. Keep the detected settings: Framework **Vite**, build command `npm run build`, output folder `dist`.
4. Choose **Deploy**.

Every push to `main` then deploys again on its own. Other branches get their own preview link.

Or from the terminal:

```bash
npx vercel        # preview link
npx vercel --prod # production link
```

## Before you share the link

- The prototype uses payer and vendor names taken from product screenshots. Turn on **Deployment Protection** in Vercel (Project, Settings, Deployment Protection) so only people you choose can open it.
- The site asks search engines not to index it (a `noindex` tag and header). Protection is still the real safeguard.
- "Copy Claim IDs" and "Copy Claim URLs" use the browser clipboard, which needs the https link that Vercel gives you.

## Where things are

- `src/App.jsx`: the whole prototype (screens, data, styles).
- `src/main.jsx`: starts the app.
- `index.html`: page shell and title.
- `public/favicon.svg`: browser tab icon.
- `vercel.json`: Vercel settings.

## Switches in the code (top of `src/App.jsx`)

- `CLAIMS_PANEL`: `true` also opens the claim detail panel from the Claims page. It is `false` now.
- `NESTED_HEADER`: the column header row inside each card's Claims table.
- `ROW_MORE`: `true` adds a "More actions" button on every claim row. It is `false` now.
- The first screen is set in the `useState("claims")` line in `App`. The default tab is set in `ClaimsPage` (`useState("mine")`).
- Fonts (Geist) load from Google Fonts. Offline, the prototype falls back to the system font.
