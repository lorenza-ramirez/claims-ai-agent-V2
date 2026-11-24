# Air prototype

A clickable prototype of the Air My Claims worklist, the Agents hub, agent pages and the agent builder.

All data is synthetic and lives in memory. Nothing is saved, sent or posted. No patient information is used. Reloading the page resets everything.

## What is in it

- **My Claims (the first screen):** your claims in groups, each group with a header (status, payer and reason chips, amount and count).
  - Open a claim to see "Where things stand", "What to do next" and a two-step path of suggested actions. Accept the first action and the second activates. Accept the second and the claim leaves the list. The next group and claim open on their own.
  - The five claims at the top are denied claims that follow the Figma design.
  - After the last Full Denial is solved, a notification offers to build an agent. **Build Agent** creates it on the spot, starts it on the Full Denials nobody owns, and shows setup checks with live progress. You stay in My Claims.
  - When every claim is solved, a celebration replaces the list.
  - Select claims to get the Bulk Actions bar. **Assign** works from the bar and from a claim's assignee.
- **Workable Claims and All Claims:** the grouped list with flat claim rows.
- **Agents hub:** stats, agent cards, pause, resume and delete. Tap a card and that agent's page (Tasks, Activity, Instructions, Auto-assign, Memory, Context) opens below the cards. **Open** goes to the agent's own page.
- **Medicare Agent page:** Tasks and Activity, with a claim panel and Approve, Edit and Reject.
- **Agent builder:** describe an agent in plain words and a draft fills in.
- A small **Demo state** switch (bottom left on Claims) forces the loading, empty, **All clear** (the celebration) and error states. It is not part of the product.

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

## Where things are

- `src/App.jsx`: the whole prototype (screens, data, styles).
- `src/main.jsx`: starts the app.
- `index.html`: page shell and title.
- `public/favicon.svg`: browser tab icon.
- `vercel.json`: Vercel settings.

## Switches in the code (`src/App.jsx`)

- `CLAIMS_PANEL`: `true` also opens the claim detail panel from the Claims page. It is `false` now.
- `MY_PER_GROUP`: how many claims in each group are yours (the first group gets 6). Full Denials are only the five designed claims.
- `MIN_PER_RESULT` and `MIN_SAVED_PER_CLAIM`: the minutes behind the "Time saved (est)" numbers in the Hub and the celebration.
- The first screen is set in the `useState("claims")` line in `App`. The default tab is set in `ClaimsPage` (`useState("mine")`).
- Fonts (Geist) load from Google Fonts. Offline, the prototype falls back to the system font.
