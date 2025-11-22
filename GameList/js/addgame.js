// js/addgame.js

// Same URL as in games.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec"; // your URL

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("game-form");
  const statusEl = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Submitting…";

    const formData = new FormData(form);

    try {
      // Send as a regular form POST (no custom headers, no JSON)
      const body = new URLSearchParams(formData);

      await fetch(SCRIPT_URL, {
        method: "POST",
        body // application/x-www-form-urlencoded, which is CORS-simple
      });

      statusEl.textContent = "Game added.";
      form.reset();
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error adding game.";
    }
  });
});
