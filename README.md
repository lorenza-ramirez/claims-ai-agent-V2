# Air prototype

A clickable prototype of the Air Hub, the My Claims worklist, agent pages and the agent builder.

All data is synthetic and lives in memory. Nothing is saved, sent or posted. No patient information is used. Reloading the page resets everything.

## What is in it

- **Hub (the first screen):** six stats, then a list of agents.
  - **Today's tasks** comes first. It is your own worklist (not an agent), with a count badge. Open it to go to My Claims.
  - Four example agents follow: Medicare, Coding, Eligibility and Posting, each with real example tasks. Click a row to see **What the system did** and **Why these claims are yours**. **Open** goes to the agent's own page.
  - Tabs: All, Running, Waiting on schedule, Paused. **Yours | Discover** switches to agents you can add.
- **My Claims:** your claims in groups. One group is open at a time.
  - Open a claim to see "Where things stand", "What to do next" and a two-step path of suggested actions. Accept the first and the second activates. Accept the second and the claim leaves the list. The next claim and group open on their own.
  - The five claims at the top are denied claims that follow the Figma design.
  - After the last Full Denial is solved, a notification offers to build an agent. **Build Agent** creates it on the spot, hands it the Full Denials nobody owns, and shows setup checks with live progress. You stay in My Claims.
  - When every claim is solved, a celebration replaces the list.
  - Select claims to get the Bulk Actions bar. **Assign** works from the bar and from a claim's assignee.
- **Workable Claims and All Claims:** the grouped list with flat claim rows.
- **Agent pages:** Tasks and Activity, a claim panel, and Approve, Edit and Reject.
- **Agent builder:** describe an agent in plain words and a draft fills in.

### Keyboard

- **Jump to claims list** appears when you press Shift+Tab from the Claims tabs.
- On a row's chevron: **arrow keys** move between rows, **Right** opens and **Left** closes, **Home** and **End** jump to the first and last row.
- A claim opened with the keyboard moves focus into its panel.

### Demo controls

- A small **Demo state** pill (bottom left on Claims) forces the loading, empty, **All clear** (the celebration) and error states.
- **Presentation mode hides the pill.** Open the page with `?present` at the end of the address, or press **Shift+P** to turn it on and off.

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
- For a clean demo, share the link with `?present` at the end so the Demo state pill is hidden.

## Where things are

- `src/App.jsx`: the whole prototype (screens, data, styles).
- `src/main.jsx`: starts the app.
- `index.html`: page shell and title.
- `public/favicon.svg`: browser tab icon.
- `vercel.json`: Vercel settings.

## Switches in the code (`src/App.jsx`)

- `CLAIMS_PANEL`: `true` also opens the claim detail panel from the Claims page. It is `false` now.
- `MY_PER_GROUP`: how many claims in each group are yours (the first group gets 6). Full Denials in My Claims are only the five designed claims.
- `MIN_PER_RESULT` and `MIN_SAVED_PER_CLAIM`: the minutes behind the "Time saved" numbers in the Hub and the celebration.
- `SCHEDULE`: the run schedule shown for every agent ("weekdays at 6:00 AM").
- The first screen is set in the `useState("agents")` line in `App`. The default Claims tab is set in `ClaimsPage` (`useState("mine")`).
- Fonts (Geist) load from Google Fonts. Offline, the prototype falls back to the system font.
