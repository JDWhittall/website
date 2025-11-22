// js/games.js

// Replace this with your deployed Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec";

let allGames = [];

async function fetchGames() {
  const statusEl = document.getElementById("games-status");
  try {
    statusEl.textContent = "Loading games…";
    const response = await fetch(SCRIPT_URL);
    const games = await response.json();

    allGames = games || [];
    statusEl.textContent = `${allGames.length} game${allGames.length === 1 ? "" : "s"} loaded.`;
    populateOwnerFilter();
    renderGames();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to load games.";
  }
}

function populateOwnerFilter() {
  const ownerSet = new Set();

  allGames.forEach(game => {
    const ownersRaw = game["Owners"] || "";
    ownersRaw.split(",").forEach(o => {
      const trimmed = o.trim();
      if (trimmed) ownerSet.add(trimmed);
    });
  });

  const filter = document.getElementById("owner-filter");
  // Clear existing (keep first "All owners")
  while (filter.options.length > 1) {
    filter.remove(1);
  }

  Array.from(ownerSet)
    .sort((a, b) => a.localeCompare(b))
    .forEach(owner => {
      const opt = document.createElement("option");
      opt.value = owner;
      opt.textContent = owner;
      filter.appendChild(opt);
    });
}

function renderGames() {
  const container = document.getElementById("games-list");
  container.innerHTML = "";

  const ownerFilter = document.getElementById("owner-filter").value.trim();
  const search = document.getElementById("search-input").value.trim().toLowerCase();

  const filtered = allGames.filter(game => {
    // Owner filter
    if (ownerFilter) {
      const ownersRaw = (game["Owners"] || "").toLowerCase();
      if (!ownersRaw.split(",").map(o => o.trim()).includes(ownerFilter.toLowerCase())) {
        return false;
      }
    }

    // Text search
    if (search) {
      const fields = [
        game["Game Name"],
        game["Description"],
        game["Owners"],
        game["Genre"],
        game["Notes"]
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!fields.includes(search)) return false;
    }

    return true;
  });

  filtered.forEach(game => {
    const card = document.createElement("article");
    card.className = "game-card";

    const name = game["Game Name"] || "Untitled";
    const description = game["Description"] || "";
    const owners = game["Owners"] || "";
    const playerCount = game["Player Count"] || "";
    const playtime = game["Playtime"] || "";
    const genre = game["Genre"] || "";
    const notes = game["Notes"] || "";
    const imageUrl = game["Image URL"] || "";

    let metaParts = [];
    if (playerCount) metaParts.push(`${playerCount} players`);
    if (playtime) metaParts.push(playtime);

    const metaText = metaParts.join(" • ");

    card.innerHTML = `
      ${imageUrl ? `<img src="${imageUrl}" alt="${name} cover" class="game-cover">` : ""}
      <h2>${name}</h2>
      ${description ? `<p class="meta">${description}</p>` : ""}
      <p class="meta"><strong>Owners:</strong> ${owners || "—"}</p>
      ${metaText ? `<p class="meta">${metaText}</p>` : ""}
      ${
        genre
          ? `<p class="tags">
               <span class="pill">${genre}</span>
             </p>`
          : ""
      }
      ${notes ? `<p class="notes"><strong>Notes:</strong> ${notes}</p>` : ""}
    `;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const ownerFilter = document.getElementById("owner-filter");
  const searchInput = document.getElementById("search-input");

  ownerFilter.addEventListener("change", renderGames);
  searchInput.addEventListener("input", () => {
    // Simple debounce not strictly necessary; list is small
    renderGames();
  });

  fetchGames();
});
