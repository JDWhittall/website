// js/addgame.js

// Same URL as in games.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("game-form");
  const statusEl = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Submitting…";

    const formData = Object.fromEntries(new FormData(form));

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script doesn't send CORS headers; this still appends the row
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      statusEl.textContent = "Game added.";
      form.reset();
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error adding game.";
    }
  });
});
