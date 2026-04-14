const API_KEY = "f07a6fa1";
const API_URL = `https://www.omdbapi.com/?type=movie&apikey=${API_KEY}`;

const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const sortSelect = document.getElementById("sortSelect");
const statusMessage = document.getElementById("statusMessage");
const resultsMeta = document.getElementById("resultsMeta");
const quickPickButtons = document.querySelectorAll("[data-query]");
const FALLBACK_POSTER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 445">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a2836" />
        <stop offset="100%" stop-color="#0c1218" />
      </linearGradient>
    </defs>
    <rect width="300" height="445" fill="url(#bg)" />
    <circle cx="150" cy="146" r="52" fill="none" stroke="#cfd7df" stroke-width="8" opacity="0.72" />
    <circle cx="150" cy="146" r="14" fill="#cfd7df" opacity="0.88" />
    <circle cx="120" cy="116" r="8" fill="#cfd7df" opacity="0.58" />
    <circle cx="180" cy="116" r="8" fill="#cfd7df" opacity="0.58" />
    <circle cx="120" cy="176" r="8" fill="#cfd7df" opacity="0.58" />
    <circle cx="180" cy="176" r="8" fill="#cfd7df" opacity="0.58" />
    <text x="150" y="286" fill="#f5f7fb" font-family="Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle">Poster</text>
    <text x="150" y="320" fill="#93a6b8" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">Not Available</text>
  </svg>
`)}`;

let currentMovies = [];
let currentQuery = "";
let currentTotalResults = 0;

function setResultsMeta(text) {
  resultsMeta.textContent = text;
}

function formatSortLabel(sortType) {
  if (sortType === "az") {
    return "A to Z";
  }

  if (sortType === "za") {
    return "Z to A";
  }

  if (sortType === "newest") {
    return "Newest First";
  }

  if (sortType === "oldest") {
    return "Oldest First";
  }

  return "Best Match";
}

function dedupeMovies(movies) {
  const seen = new Set();

  return movies.filter(movie => {
    if (seen.has(movie.imdbID)) {
      return false;
    }

    seen.add(movie.imdbID);
    return true;
  });
}

function renderEmptyState(title, copy) {
  movieGrid.innerHTML = `
    <article class="empty-state">
      <div class="empty-state__icon" aria-hidden="true"></div>
      <h3 class="empty-state__title">${title}</h3>
      <p class="empty-state__copy">${copy}</p>
    </article>
  `;
}

async function searchMovies(query) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    currentMovies = [];
    currentQuery = "";
    currentTotalResults = 0;
    statusMessage.textContent = "Type a real movie title first. Spaces by themselves do not count.";
    setResultsMeta("Waiting for Search");
    renderEmptyState("Give the reel a title", "Try a movie name like Batman, Inception, or Spirited Away.");
    return;
  }

  currentQuery = trimmedQuery;
  showSkeletons();
  statusMessage.textContent = `Searching for \"${trimmedQuery}\"...`;
  setResultsMeta("Loading Results");

  try {
    const response = await fetch(`${API_URL}&s=${encodeURIComponent(trimmedQuery)}`);
    const data = await response.json();

    if (data.Response === "True") {
      currentTotalResults = Number(data.totalResults) || data.Search.length;
      currentMovies = dedupeMovies(data.Search).slice(0, 6);
      const sortedMovies = sortMovies(currentMovies, sortSelect.value);
      renderMovies(sortedMovies);
      statusMessage.textContent = `Found ${currentMovies.length} movie result${currentMovies.length === 1 ? "" : "s"} for \"${trimmedQuery}\".`;
      setResultsMeta(`Showing ${currentMovies.length} of ${currentTotalResults}`);
      return;
    }

    currentMovies = [];
    currentTotalResults = 0;
    statusMessage.textContent = `No matches found for \"${trimmedQuery}\".`;
    setResultsMeta("No Matches");
    renderEmptyState("No results found", "Try a different title or click one of the quick picks above.");
  } catch (error) {
    currentMovies = [];
    currentTotalResults = 0;
    statusMessage.textContent = "The movie feed could not load right now. Try the search again in a moment.";
    setResultsMeta("Connection Issue");
    renderEmptyState("Connection issue", "The OMDb request failed before results could be displayed.");
    console.error(error);
  }
}

function renderMovies(movies) {
  if (!movies.length) {
    renderEmptyState("No results found", "Try another title or use a different sort after searching again.");
    return;
  }

  const moviesHTML = movies.map((movie, index) => movieHTML(movie, index)).join("");
  movieGrid.innerHTML = moviesHTML;
}

function movieHTML(movie, index) {
  const poster = movie.Poster === "N/A"
    ? FALLBACK_POSTER
    : movie.Poster;
  const imdbUrl = `https://www.imdb.com/title/${movie.imdbID}/`;

  return `
    <a class="movie-card" href="${imdbUrl}" target="_blank" rel="noopener" style="--card-index: ${index};">
      <img class="movie-card__poster" src="${poster}" alt="Poster for ${movie.Title}">
      <div class="movie-card__info">
        <div class="movie-card__title">${movie.Title}</div>
        <div class="movie-card__meta">
          <div class="movie-card__year">${movie.Year}</div>
          <div class="movie-card__type">${movie.Type}</div>
        </div>
        <div class="movie-card__cta">Open on IMDb</div>
      </div>
    </a>
  `;
}

function showSkeletons() {
  const skeletonsHTML = Array(6)
    .fill("")
    .map(() => `
      <div class="skeleton">
        <div class="skeleton__poster"></div>
        <div class="skeleton__line"></div>
        <div class="skeleton__line skeleton__line--short"></div>
      </div>
    `)
    .join("");

  movieGrid.innerHTML = skeletonsHTML;
}

function sortMovies(movies, sortType) {
  const sortedMovies = movies.slice();
  const yearValue = movie => parseInt(movie.Year, 10) || 0;

  if (sortType === "az") {
    return sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
  }

  if (sortType === "za") {
    return sortedMovies.sort((a, b) => b.Title.localeCompare(a.Title));
  }

  if (sortType === "newest") {
    return sortedMovies.sort((a, b) => yearValue(b) - yearValue(a));
  }

  if (sortType === "oldest") {
    return sortedMovies.sort((a, b) => yearValue(a) - yearValue(b));
  }

  return sortedMovies;
}

searchInput.addEventListener("keydown", event => {
  const query = searchInput.value.trim();

  if (event.key === "Enter" && query) {
    searchMovies(query);
  }
});

searchButton.addEventListener("click", () => {
  searchMovies(searchInput.value);
});

sortSelect.addEventListener("change", () => {
  if (!currentMovies.length) {
    return;
  }

  const sortedMovies = sortMovies(currentMovies, sortSelect.value);
  renderMovies(sortedMovies);
  statusMessage.textContent = `Showing ${sortedMovies.length} result${sortedMovies.length === 1 ? "" : "s"} for \"${currentQuery}\" sorted ${formatSortLabel(sortSelect.value)}.`;
  setResultsMeta(`Sorted: ${formatSortLabel(sortSelect.value)}`);
});

quickPickButtons.forEach(button => {
  button.addEventListener("click", () => {
    const query = button.dataset.query || "";
    searchInput.value = query;
    searchMovies(query);
  });
});