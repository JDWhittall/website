    const URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec";

    document.getElementById("game-form").addEventListener("submit", async (e) => {
      e.preventDefault();

		const payload = {
		name: document.getElementByName("gameName").value,
    description: document.getElementByName("description").value,
    owners: document.getElementsByName("owners").value,
    playerCount: document.getElementByName("playerCount").value,
    playtime: document.getElementsByName("playtime").value,
    genre: document.getElementsByName("genre").value,
    notes: document.getElementsByName("notes").value,
    imageUrl: document.getElementsByName("imageUrl").value,
		timestamp: Date.now()
		};

      document.getElementById("status").textContent = "Sending…";

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