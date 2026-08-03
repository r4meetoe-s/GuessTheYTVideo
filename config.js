// ---- API configuration ----
//
// To pull truly random videos live from YouTube instead of the curated
// list in videos.js, get a free API key:
//   1. https://console.cloud.google.com/apis/credentials
//   2. Enable "YouTube Data API v3" for your project
//   3. Create an API key, then click "Restrict key" and set
//      Application restrictions -> HTTP referrers -> add:
//        https://yourusername.github.io/*
//      This stops anyone else from using your key/quota even though
//      it's visible in your page's JS (GitHub Pages is static, so the
//      key can't be hidden server-side).
//
// Paste your key below. Leave it as "" to use the curated VIDEO_POOL
// in videos.js instead (no quota limits, always works).

const YOUTUBE_API_KEY = "";

// search.list costs 100 quota units per call, and the free tier gives
// 10,000 units/day -> ~100 rounds/day max. Each round below uses exactly
// one search.list call.
const MIN_VIEW_COUNT = 500; // skip near-invisible videos with nothing to search for
