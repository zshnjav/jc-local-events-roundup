# Local Events Roundup (Vercel site)

Shareable static snapshot of the family's curated local-events roundup:
Jersey City, Hoboken, Bayonne, Newark, Staten Island, Manhattan, and major
NJ draws — refreshed every Thursday.

- `index.html`, `styles.css`, `app.js` — the site (vanilla, no build step).
- `data/events.json` — the event data, regenerated weekly. See `WORKFLOW.md`
  for the full workflow: research sources, the Thursday loop, data model,
  and filter/tag definitions.

Deploys automatically on push to `main` via Vercel.
