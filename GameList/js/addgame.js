const URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec";

document.getElementById("game-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const payload = {
    name: formData.get("gameName") || "",
    description: formData.get("description") || "",
    owners: formData.get("owners") || "",
    playerCount: formData.get("playerCount") || "",
    playtime: formData.get("playtime") || "",
    genre: formData.get("genre") || "",
    notes: formData.get("notes") || "",
    imageUrl: formData.get("imageUrl") || "",
    timestamp: Date.now()
  };

  console.log("Payload being sent:", payload); // for debugging

  document.getElementById("form-status").textContent = "Sending…";

  try {
    await fetch(URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    document.getElementById("form-status").textContent = "Success! Game added.";
    form.reset();
  } catch (err) {
    document.getElementById("form-status").textContent = "Error: " + err.message;
  }
});
