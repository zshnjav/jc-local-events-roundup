# Local Events Roundup — Workflow

A shareable, static snapshot of Zeeshan's curated local-events roundup, deployed on Vercel.
Family context: based in Jersey City, with his wife and their ~2.5-year-old daughter.
Coverage: Jersey City, Hoboken, Bayonne, Newark, Staten Island, Manhattan,
plus major NJ draws (American Dream, Garden State Plaza, Jersey Gardens,
Liberty Science Center).

This site is a **weekly static snapshot**. The private self-updating app
(Muse artifact `local-events-roundup-2`) remains the live source of truth;
this repo publishes a frozen copy every Thursday.

## The weekly loop (Thursdays)

1. **Scout** — Muse researches events for the coming 3 weeks.
   - Social sources (he follows none himself; the scout watches them):
     Facebook groups — JCFamilies Meetup, Jersey City Moms, New Jersey Moms,
     Hoboken/JC Moms Uncensored, "free stuff jersey city nj area",
     Hudson County Mommy Group, Jersey City Mamas.
     Instagram — @jcfamilies, @nyc_forfree, @mama_deals, @thefreebieguy,
     @riverviewfarmersmarket, @hobokengirl.
   - Plus press, official venue/organizer pages, and ticketing sites.
   - Legitimacy bar: named organizer, real venue, confirmed date/time,
     PLUS a sign of substance (past editions, vendors, ticketing, press).
     No random unverified listings.
   - Freebies get verified as real giveaways: exactly what's free and the
     catch (RSVP required? limited quantity? age limits?) are recorded.
2. **Digest** — a chat roundup goes to the events side chat: the coming week
   in full, weeks 2–3 condensed as "on the radar", plus a Freebies section
   (exactly what's free + the catch).
3. **Artifact refresh** — the private fullstack artifact self-refreshes
   (weekly scheduled `refreshevents` action; manual refresh available too).
4. **Vercel push** — Muse pulls the event list via the artifact's
   `listevents` action, regenerates `data/events.json` in this repo,
   commits, and pushes to `main`. Vercel auto-deploys on push.
   The site's "last updated" line reflects the data pull time.

## Manual updates

Outside the Thursday loop, just ask Muse in chat ("refresh the events site")
and steps 3–4 run on demand. Nothing is ever sent or published on his behalf
without his explicit sign-off; the site itself is read-only.

## Data model (`data/events.json`)

```json
{
  "events": [
    {
      "id": 115,
      "title": "Brick or Treat at LEGOLAND Discovery Center NJ",
      "summary": "...",
      "category": "Theme Park Event",
      "city": "East Rutherford",
      "venue": "LEGOLAND Discovery Center New Jersey, American Dream",
      "region": "local_nj | destination_nj | nyc",
      "start_at": "2026-10-01",
      "end_at": null,
      "date_key": "2026-10-01",
      "timezone": "America/New_York",
      "cost_label": "Included with admission; admission from $29.99",
      "is_free": false,
      "is_freebie": false,
      "freebie_what": null,
      "freebie_catch": null,
      "is_arts": false,
      "is_date_night": false,
      "is_featured": true,
      "audience": "family | date_night | both",
      "toddler_fit": "high | moderate | low | not_applicable",
      "source_name": "LEGOLAND Discovery Center New Jersey",
      "source_url": "https://...",
      "legitimacy_note": "...",
      "caveat": null,
      "verification": "verified | provisional",
      "editorial_rank": 3
    }
  ],
  "refresh": { "as_of": "...", "window_start": "...", "window_end": "..." },
  "generated_at": "..."
}
```

## Filters and tags

- **Freebie hunt** (`is_freebie`) — actual free stuff: giveaways,
  make-and-takes, free samples/demos. Cards show "What's free" + "The catch".
- **Free entry** (`is_free`) — free-admission events. Independent from
  Freebie hunt; a farmers market is free entry, not a freebie.
- **Hide artsy** (`is_arts`, on by default) — hides gallery openings,
  painting exhibitions, studio tours. History museums and cultural
  festivals stay.
- **Date night**, **Toddler picks** (`toddler_fit: high`), region filter
  (Jersey City & nearby / NJ day trips / NYC), and text search.

## Who does what

- **Muse**: research, verify against the legitimacy bar, write the data,
  push to `main`, keep this doc current.
- **Zeeshan**: reviews the Thursday digest, taps Freebie hunt when he wants
  the free stuff, corrects anything off — corrections become the spec.
