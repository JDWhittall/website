const BASE_URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec";
const GAME_URL = `${BASE_URL}?type=games`;
const OWNERS_URL = `${BASE_URL}?type=owners`;

const allowedOwners = new Set();
let ownersLoaded = false;

async function loadOwnersOptions() {
  const statusEl = document.getElementById("form-status");
  try {
    const res = await fetch(OWNERS_URL);
    const owners = await res.json();
    const datalist = document.getElementById("ownerOptions");
    datalist.innerHTML = "";

    owners.forEach((o) => {
      const name = (o.name || "").trim();
      if (!name) return;
      allowedOwners.add(name.toLowerCase());
      const opt = document.createElement("option");
      opt.value = name;
      datalist.appendChild(opt);
    });

    ownersLoaded = true;
  } catch (err) {
    ownersLoaded = false;
    statusEl.textContent = "Error loading owners; please refresh.";
  }
}

loadOwnersOptions();

// Load base games to populate the ExpansionOf datalist
async function loadParentOptions() {
  try {
    const res = await fetch(GAME_URL);
    const games = await res.json();
    const datalist = document.getElementById("parentOptions");
    datalist.innerHTML = "";

    (games || [])
      .filter(g => !(g.expansionOf || g.ExpansionOf))
      .forEach(g => {
        const name = (g.gameName || '').trim();
        if (!name) return;
        const opt = document.createElement('option');
        opt.value = name;
        datalist.appendChild(opt);
      });
  } catch (err) {
    // Non-fatal
    console.error('Error loading parent game options', err);
  }
}

loadParentOptions();

document.getElementById("game-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const statusEl = document.getElementById("form-status");

  if (!ownersLoaded) {
    statusEl.textContent = "Owner list not loaded yet. Please wait or refresh.";
    return;
  }

  const ownerList = (formData.get("owners") || "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  if (!ownerList.length) {
    statusEl.textContent = "Please add at least one owner.";
    return;
  }

  const invalidOwners = ownerList.filter(
    (name) => !allowedOwners.has(name.toLowerCase())
  );

  if (invalidOwners.length) {
    statusEl.textContent = `Unknown owner(s): ${invalidOwners.join(", ")}`;
    return;
  }

  const payload = {
    name: formData.get("gameName") || "",
    description: formData.get("description") || "",
    owners: ownerList.join(", "),
    expansionOf: formData.get("expansionOf") || "",
    // Send both `playerCount` and `players` as plain text to be compatible
    // with different sheet headers and parsers.
    playerCount: String(formData.get("playerCount") || ""),
    players: String(formData.get("playerCount") || ""),
    playtime: String(formData.get("playtime") || ""),
    genre: formData.get("genre") || "",
    notes: formData.get("notes") || "",
    imageUrl: formData.get("imageUrl") || "",
    scoreSheet: formData.get("scoreSheet") || "",
    timestamp: Date.now()
  };

  console.log("Payload being sent:", payload); // for debugging

  statusEl.textContent = "Sending...";

  try {
    await fetch(GAME_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    statusEl.textContent = "Success! Game added.";
    form.reset();
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
  }
});
