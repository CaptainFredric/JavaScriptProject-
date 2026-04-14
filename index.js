// ── OMDB API ─────────────────────────────────────────────────────────────────
// Base URL: https://www.omdbapi.com/?s=QUERY&type=movie&apikey=YOUR_KEY
// Replace the empty string below with your API key once you have it.
const API_KEY = "f07a6fa1";
const API_URL = `https://www.omdbapi.com/?type=movie&apikey=${API_KEY}`;

// ── DOM References ────────────────────────────────────────────────────────────
const movieGrid  = document.getElementById("movieGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect  = document.getElementById("sortSelect");

// ── State ─────────────────────────────────────────────────────────────────────
// This array will hold the current list of movies so sorting can work
// without re-fetching from the API.
let currentMovies = [];

// ── FUNCTION 1: searchMovies ──────────────────────────────────────────────────
// TODO:
//  1. Call showSkeletons() to display loading cards while we wait
//  2. Fetch from the API using the search query (hint: &s=query)
//  3. Await and parse the JSON response
//  4. Pull the Search array off the response (check if Response === "True" first)
//  5. Slice the array to the first 6 results
//  6. Store them in currentMovies
//  7. Call renderMovies(currentMovies)
async function searchMovies(query) {
showSkeletons();

const response = await fetch(`${API_URL}&s=${encodeURIComponent(query)}`);
const data = await response.json();

if (data.Response === "True"){
    currentMovies = data.Search.slice(0,6);
}
else{
    currentMovies = [];
}
renderMovies(currentMovies);
}


// ── FUNCTION 2: renderMovies ──────────────────────────────────────────────────
// TODO:
//  1. Map over the movies array, calling movieHTML(movie) on each one
//  2. Join the array into a single string
//  3. Set movieGrid.innerHTML to that string
function renderMovies(movies) {

}

// ── FUNCTION 3: movieHTML ─────────────────────────────────────────────────────
// TODO: Return a template literal string that builds a single movie card.
// The card should include:
//  - An <img> tag for the poster  (movie.Poster — if it's "N/A", use a placeholder)
//  - A div for the title          (movie.Title)
//  - A div for the year           (movie.Year)
// Classes to use (already styled): movie-card, movie-card__poster,
//   movie-card__info, movie-card__title, movie-card__year
function movieHTML(movie) {

}

// ── FUNCTION 4: showSkeletons ─────────────────────────────────────────────────
// TODO:
//  1. Create an array of 6 items (hint: Array(6).fill(""))
//  2. Map each one to a skeleton card HTML string
//  3. Set movieGrid.innerHTML to the joined result
// Classes to use (already styled): skeleton, skeleton__poster,
//   skeleton__line, skeleton__line--short
function showSkeletons() {

}

// ── FUNCTION 5: sortMovies ────────────────────────────────────────────────────
// TODO: Return a SORTED COPY of the movies array (don't mutate the original).
// sortType values come from the <select> in index.html:
//   "az"     → alphabetical A to Z   by movie.Title
//   "za"     → alphabetical Z to A   by movie.Title
//   "newest" → year descending       by movie.Year (convert to Number)
//   "oldest" → year ascending        by movie.Year (convert to Number)
// Hint: use .slice() first to copy, then .sort() with a compare function.
function sortMovies(movies, sortType) {

}

// ── EVENT LISTENER 1: Enter key on the search input ──────────────────────────
// TODO:
//  Listen for the "keydown" event on searchInput.
//  When event.key === "Enter" and the input value is not empty,
//  call searchMovies() with the trimmed input value.


// ── EVENT LISTENER 2: Sort dropdown change ────────────────────────────────────
// TODO:
//  Listen for the "change" event on sortSelect.
//  When it fires, call sortMovies(currentMovies, sortSelect.value)
//  and pass the result to renderMovies().
//  (Only do anything if currentMovies has items in it.)