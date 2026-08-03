# Guess the Video 🎬

A tiny static web game: it embeds a random YouTube video from a list you control,
hides the title, and you try to identify it by searching for it yourself.
Paste the link you found and it tells you if you're right — then reveals the real title.

## How it works

- `videos.js` — a plain array of YouTube video IDs. This is your "pool" of possible
  mystery videos. Edit this file to add/remove videos.
- `script.js` — picks a random ID from the pool, embeds it via
  `youtube-nocookie.com` (with `modestbranding=1&rel=0` so YouTube doesn't show the
  title overlay or suggest related videos), and checks your guess.
- Guess checking works with basically any YouTube URL format: `watch?v=`,
  `youtu.be/...`, `/shorts/...`, `/embed/...`, or even a bare 11-character video ID.
- After you guess, it calls YouTube's public **oEmbed** endpoint
  (`https://www.youtube.com/oembed?...`) to fetch and reveal the real title —
  no API key needed.

## Running locally

Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploying with GitHub Pages

1. Create a new repo (or use an existing one) and push these files to it.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch".
4. Pick your branch (e.g. `main`) and the folder these files live in
   (`/ (root)` or `/guess-the-video` if you keep the subfolder — in that case
   move the files to the repo root, or point Pages at that subfolder if your
   plan supports it).
5. Save. GitHub will give you a URL like `https://yourusername.github.io/yourrepo/`.

Simplest setup: put `index.html`, `style.css`, `script.js`, and `videos.js`
directly in the repo root and select `/ (root)` as the Pages source.

## Using the real YouTube API for truly random videos

By default the game picks from the curated `VIDEO_POOL` in `videos.js`. If you
want genuinely random videos pulled live from YouTube instead:

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials)
   and create a project (or use an existing one).
2. Enable the **YouTube Data API v3** for that project.
3. Create an API key.
4. **Restrict the key** — click "Restrict key" → Application restrictions →
   HTTP referrers → add `https://yourusername.github.io/*`. This is important:
   GitHub Pages is static, so your key will be visible in the page source.
   Restricting it stops other sites from burning your quota.
5. Paste the key into `config.js`:
   ```js
   const YOUTUBE_API_KEY = "your-key-here";
   ```
6. Commit and push. The game will now call `search.list` with a random
   search term and a random date window each round, then pick one random
   result from the batch — no true "random video" endpoint exists, so this
   is the standard trick.

**Quota note:** `search.list` costs 100 units per call, and the free daily
quota is 10,000 units — about **100 rounds/day**. If the API call fails
(quota exhausted, bad key, network issue), the game automatically falls
back to the curated `videos.js` list so it never breaks.

## Customizing the video pool

Open `videos.js` and edit the `VIDEO_POOL` array. Use the ID from any YouTube URL:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
                                 ^^^^^^^^^^^ this part
```

Tips for good rounds:
- Pick videos that are genuinely searchable/identifiable (well-known songs,
  speeches, viral clips) so people have a real shot at finding them.
- Very obscure or generic videos (e.g. a random vlog with no distinguishing
  audio/visuals) make the game frustrating since there's nothing to search for.

## Notes / limitations

- There's no YouTube Data API key involved, so "random from all of YouTube" isn't
  possible — the pool is curated by you in `videos.js`. This also keeps the game
  fair and solvable.
- Hiding the title is done via player embed options; a very determined player
  could still reverse-image-search a frame or inspect network requests. That's
  fine for a casual game, just not airtight anti-cheat.
