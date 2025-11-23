    const URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec";

    document.getElementById("game-form").addEventListener("submit", async (e) => {
      e.preventDefault();

		const payload = {
		name: document.getElementById("gameName").value,
    description: document.getElementById("description").value,
    owners: document.getElementById("owners").value,
    playerCount: document.getElementById("playerCount").value,
    playtime: document.getElementById("playtime").value,
    genre: document.getElementById("genre").value,
    notes: document.getElementById("notes").value,
    imageUrl: document.getElementById("imageUrl").value,
		timestamp: Date.now()
		};

      document.getElementById("form-status").textContent = "Sending…";

      try {
        // Must use no-cors to bypass Apps Script CORS restrictions
        await fetch(URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        document.getElementById("form-status").textContent = "Success! Game added.";
      } catch (err) {
        document.getElementById("form-status").textContent = "Error: " + err.message;
      }
    });