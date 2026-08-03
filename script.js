let currentId = null;
let score = 0;
let total = 0;

const player = document.getElementById("player");
const guessInput = document.getElementById("guessInput");
const submitBtn = document.getElementById("submitGuess");
const nextBtn = document.getElementById("nextBtn");
const resultEl = document.getElementById("result");
const scoreEl = document.getElementById("score");
const totalEl = document.getElementById("total");

// Extracts a YouTube video ID from most common URL shapes:
// watch?v=, youtu.be/, /embed/, /shorts/, with or without extra query params
function extractVideoId(url) {
  try {
    const trimmed = url.trim();
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const re of patterns) {
      const match = trimmed.match(re);
      if (match) return match[1];
    }
    // Fallback: maybe they just pasted a bare 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    return null;
  } catch {
    return null;
  }
}

const RANDOM_SEARCH_WORDS = [
  "music", "tutorial", "review", "vlog", "cooking", "travel", "science",
  "gaming", "news", "comedy", "sports", "history", "nature", "technology",
  "documentary", "unboxing", "highlights", "interview", "how to", "live",
];

// Builds a randomized ISO date to bias search results toward a random
// slice of YouTube's upload history (spreads results out over ~15 years).
function randomPublishedAfter() {
  const start = new Date("2010-01-01").getTime();
  const end = Date.now();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString();
}

// Uses YouTube Data API v3 search.list with a random query + random date
// window, then picks one random result from the returned batch.
async function fetchRandomVideoFromApi() {
  const word = RANDOM_SEARCH_WORDS[Math.floor(Math.random() * RANDOM_SEARCH_WORDS.length)];
  const publishedAfter = randomPublishedAfter();
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&q=${encodeURIComponent(word)}&publishedAfter=${publishedAfter}&key=${YOUTUBE_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();
  const items = data.items || [];
  if (!items.length) throw new Error("No results from API");

  const pick = items[Math.floor(Math.random() * items.length)];
  return {
    id: pick.id.videoId,
    title: pick.snippet.title,
  };
}

async function loadRandomVideo() {
  resultEl.textContent = "";
  resultEl.className = "result";
  guessInput.value = "";
  guessInput.disabled = true;
  submitBtn.disabled = true;
  nextBtn.hidden = true;
  player.src = "";

  if (YOUTUBE_API_KEY) {
    try {
      const video = await fetchRandomVideoFromApi();
      currentId = video.id;
    } catch (err) {
      console.warn("API fetch failed, falling back to curated list:", err);
      currentId = VIDEO_POOL[Math.floor(Math.random() * VIDEO_POOL.length)];
    }
  } else {
    currentId = VIDEO_POOL[Math.floor(Math.random() * VIDEO_POOL.length)];
  }

  player.src = `https://www.youtube-nocookie.com/embed/${currentId}?modestbranding=1&rel=0&controls=1`;
  guessInput.disabled = false;
  submitBtn.disabled = false;
  guessInput.focus();
}

async function fetchTitle(videoId) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) throw new Error("oEmbed failed");
    const data = await res.json();
    return data.title;
  } catch {
    return null;
  }
}

async function handleGuess() {
  const guessedId = extractVideoId(guessInput.value);
  if (!guessedId) {
    resultEl.textContent = "That doesn't look like a valid YouTube link. Try again.";
    resultEl.className = "result wrong";
    return;
  }

  guessInput.disabled = true;
  submitBtn.disabled = true;
  total++;

  const title = await fetchTitle(currentId);
  const titleText = title ? `"${title}"` : "(title unavailable)";
  const watchUrl = `https://www.youtube.com/watch?v=${currentId}`;

  if (guessedId === currentId) {
    score++;
    resultEl.innerHTML = `✅ Correct! It was ${titleText}. <a href="${watchUrl}" target="_blank" rel="noopener">Watch on YouTube</a>`;
    resultEl.className = "result correct";
  } else {
    resultEl.innerHTML = `❌ Not quite. The real video was ${titleText}. <a href="${watchUrl}" target="_blank" rel="noopener">Watch on YouTube</a>`;
    resultEl.className = "result wrong";
  }

  scoreEl.textContent = score;
  totalEl.textContent = total;
  nextBtn.hidden = false;
}

submitBtn.addEventListener("click", handleGuess);
guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !guessInput.disabled) handleGuess();
});
nextBtn.addEventListener("click", loadRandomVideo);

loadRandomVideo();
