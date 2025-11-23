const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec";

let allGames = [];

// Entry point
document.addEventListener("DOMContentLoaded", () => {
  const ownerFilter = document.getElementById("owner-filter");
  const searchInput = document.getElementById("search-input");

  ownerFilter.addEventListener("change", renderGames);
  searchInput.addEventListener("input", renderGames);

  loadGames();
});

function loadGames() {
  const statusEl = document.getElementById("games-status");
  statusEl.textContent = "Loading games…";

  // JSONP: we add a <script> tag with ?callback=handleGames
  const script = document.createElement("script");
  const callbackName = "handleGamesFromSheet";

  // Remove any previous script to avoid duplicates
  const oldScript = document.getElementById("games-jsonp-script");
  if (oldScript) {
    oldScript.remove();
  }

  script.id = "games-jsonp-script";
  script.src = `${WEB_APP_URL}?callback=${callbackName}`;
  script.onerror = () => {
    statusEl.textContent = "Error loading games.";
  };

  document.body.appendChild(script);
}

// JSONP callback – must be global
window.handleGamesFromSheet = function(rows) {
  const statusEl = document.getElementById("games-status");
  allGames = Array.isArray(rows) ? rows : [];

  if (!allGames.length) {
    statusEl.textContent = "No games found.";
  } else {
    statusEl.textContent = `Loaded ${allGames.length} games.`;
  }

  populateOwnerFilter();
  renderGames();
};

function populateOwnerFilter() {
  const ownerFilter = document.getElementById("owner-filter");

  // Clear existing (keep the "All owners" option)
  ownerFilter.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All owners";
  ownerFilter.appendChild(allOption);

  const ownerSet = new Set();

  allGames.forEach(game => {
    const ownersField = (game.owners || game.Owners || "").toString();
    ownersField.split(",").forEach(raw => {
      const o = raw.trim();
      if (o) ownerSet.add(o);
    });
  });

  Array.from(ownerSet).sort().forEach(owner => {
    const opt = document.createElement("option");
    opt.value = owner;
    opt.textContent = owner;
    ownerFilter.appendChild(opt);
  });
}

function renderGames() {
  const listEl = document.getElementById("games-list");
  const ownerFilter = document.getElementById("owner-filter");
  const searchInput = document.getElementById("search-input");

  const ownerFilterValue = ownerFilter.value.trim().toLowerCase();
  const query = searchInput.value.trim().toLowerCase();

  listEl.innerHTML = "";

  const filtered = allGames.filter(game => {
    const name = (game.name || game.Name || "").toString();
    const description = (game.description || game.Description || "").toString();
    const owners = (game.owners || game.Owners || "").toString();
    const genre = (game.genre || game.Genre || "").toString();
    const notes = (game.notes || game.Notes || "").toString();

    // Owner filter
    if (ownerFilterValue) {
      const ownerMatch = owners
        .split(",")
        .map(o => o.trim().toLowerCase())
        .includes(ownerFilterValue);
      if (!ownerMatch) return false;
    }

    // Search filter
    if (query) {
      const haystack = [
        name,
        description,
        owners,
        genre,
        notes
      ].join(" ").toLowerCase();

      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  filtered.forEach(game => {
    const card = document.createElement("article");
    card.className = "game-card";

    const imageUrl = game.imageUrl || game.ImageUrl || game["Image URL"] || "";
    if (imageUrl) {
      const img = document.createElement("img");
      img.className = "game-cover";
      img.src = imageUrl;
      img.alt = (game.name || game.Name || "Game cover").toString();
      card.appendChild(img);
    }

    const title = document.createElement("h2");
    title.textContent = (game.name || game.Name || "Untitled game").toString();
    card.appendChild(title);

    const metaParts = [];

    const owners = (game.owners || game.Owners || "").toString();
    if (owners) metaParts.push(`Owners: ${owners}`);

    const playerCount = (game.playerCount || game.PlayerCount || "").toString();
    if (playerCount) metaParts.push(`Players: ${playerCount}`);

    const playtime = (game.playtime || game.Playtime || "").toString();
    if (playtime) metaParts.push(`Playtime: ${playtime}`);

    if (metaParts.length) {
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = metaParts.join(" · ");
      card.appendChild(meta);
    }

    const genre = (game.genre || game.Genre || "").toString();
    if (genre) {
      const tags = document.createElement("div");
      tags.className = "tags";

      genre.split(",").forEach(raw => {
        const g = raw.trim();
        if (!g) return;
        const pill = document.createElement("span");
        pill.className = "pill";
        pill.textContent = g;
        tags.appendChild(pill);
      });

      card.appendChild(tags);
    }

    const notes = (game.notes || game.Notes || "").toString();
    if (notes) {
      const notesEl = document.createElement("div");
      notesEl.className = "notes";
      notesEl.textContent = notes;
      card.appendChild(notesEl);
    }

    listEl.appendChild(card);
  });

  const statusEl = document.getElementById("games-status");
  if (!filtered.length && allGames.length) {
    statusEl.textContent = "No games match your filters.";
  } else if (!allGames.length) {
    statusEl.textContent = "No games found.";
  } else {
    statusEl.textContent = `Showing ${filtered.length} of ${allGames.length} games.`;
  }
}
