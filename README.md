# Air prototype

A clickable prototype of the Air Claims page, the Agents hub, the Medicare Agent page and the agent builder.

All data is synthetic and lives in memory. Nothing is saved, sent or posted. No patient information is used.

## What is in it

- **Medicare Agent page** (first screen): Tasks, Activity, claim detail panel with Approve, Edit and Reject.
- **Agents hub**: stats, agent cards, pause, resume, delete.
- **Agent builder**: describe an agent in plain words and a draft fills in.
- **Claims page**: groups, selection, assign to a person, queue or agent. A small "Demo state" switch at the bottom right forces the loading, empty and error states. It is not part of the product.

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

## Where things are

- `src/App.jsx`: the whole prototype (screens, data, styles).
- `src/main.jsx`: starts the app.
- `index.html`: page shell and title.
- `public/favicon.svg`: browser tab icon.
- `vercel.json`: Vercel settings.

## Switches in the code

- `CLAIMS_PANEL` in `src/App.jsx`: set to `true` to also open the claim detail panel from the Claims page. It is `false` now.
- The first screen is set in the `useState("agent:" + ...)` line in `App`. Change it to `"claims"` or `"agents"` to start elsewhere.
- Fonts (Geist) load from Google Fonts. Offline, the prototype falls back to the system font.
