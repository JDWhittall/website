// js/addgame.js

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("game-form");
  const statusEl = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Submitting…";

    const formData = new FormData(form);
    const body = new URLSearchParams(formData);

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",          // <- IMPORTANT
        body                      // sends as application/x-www-form-urlencoded
      });

      statusEl.textContent = "Game submitted. Check the sheet.";
      form.reset();
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error submitting game.";
    }
  });
});
