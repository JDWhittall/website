// Same base URL, but point to type=owners
const OWNER_URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec?type=owners";

document.getElementById("owner-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const payload = {
    name: formData.get("ownerName") || "",
    avatarUrl: formData.get("avatarUrl") || ""
    // If you later add more owner fields in Apps Script,
    // extend this object to match.
  };

  console.log("Owner payload being sent:", payload);

  const statusEl = document.getElementById("form-status");
  statusEl.textContent = "Sending…";

  try {
    await fetch(OWNER_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    statusEl.textContent = "Success! Owner added.";
    form.reset();
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
  }
});
