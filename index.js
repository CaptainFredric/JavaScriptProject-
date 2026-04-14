const API_KEY = "f07a6fa1";
const API_URL = `https://www.omdbapi.com/?type=movie&apikey=${API_KEY}`;

const movieGrid = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const sortSelect = document.getElementById("sortSelect");
const statusMessage = document.getElementById("statusMessage");
const quickPickButtons = document.querySelectorAll("[data-query]");

let currentMovies = [];

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
    statusMessage.textContent = "Type a real movie title first. Spaces by themselves do not count.";
    renderEmptyState("Give the reel a title", "Try a movie name like Batman, Inception, or Spirited Away.");
    return;
  }

  showSkeletons();
  statusMessage.textContent = `Searching for \"${trimmedQuery}\"...`;

  try {
    const response = await fetch(`${API_URL}&s=${encodeURIComponent(trimmedQuery)}`);
    const data = await response.json();

    if (data.Response === "True") {
      currentMovies = data.Search.slice(0, 6);
      const sortedMovies = sortMovies(currentMovies, sortSelect.value);
      renderMovies(sortedMovies);
      statusMessage.textContent = `Found ${currentMovies.length} movie result${currentMovies.length === 1 ? "" : "s"} for \"${trimmedQuery}\".`;
      return;
    }

    currentMovies = [];
    statusMessage.textContent = `No matches found for \"${trimmedQuery}\".`;
    renderEmptyState("No results found", "Try a different title or click one of the quick picks above.");
  } catch (error) {
    currentMovies = [];
    statusMessage.textContent = "The movie feed could not load right now. Try the search again in a moment.";
    renderEmptyState("Connection issue", "The OMDb request failed before results could be displayed.");
    console.error(error);
  }
}

function renderMovies(movies) {
  if (!movies.length) {
    renderEmptyState("No results found", "Try another title or use a different sort after searching again.");
    return;
  }

  const moviesHTML = movies.map(movie => movieHTML(movie)).join("");
  movieGrid.innerHTML = moviesHTML;
}

function movieHTML(movie) {
  const poster = movie.Poster === "N/A"
    ? "https://via.placeholder.com/300x445?text=No+Image"
    : movie.Poster;

  return `
    <article class="movie-card">
      <img class="movie-card__poster" src="${poster}" alt="Poster for ${movie.Title}">
      <div class="movie-card__info">
        <div class="movie-card__title">${movie.Title}</div>
        <div class="movie-card__meta">
          <div class="movie-card__year">${movie.Year}</div>
          <div class="movie-card__type">${movie.Type}</div>
        </div>
      </div>
    </article>
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
  statusMessage.textContent = `Showing ${sortedMovies.length} sorted movie result${sortedMovies.length === 1 ? "" : "s"}.`;
});

quickPickButtons.forEach(button => {
  button.addEventListener("click", () => {
    const query = button.dataset.query || "";
    searchInput.value = query;
    searchMovies(query);
  });
});