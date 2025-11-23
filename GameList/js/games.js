async function loadGames() {
	const URL = "https://script.google.com/macros/s/AKfycbxURFaWZ8gz-TZ-Jtep-4zkOiKK95bobxKaCDgfzQU0kPmn3QFKZj24cO6x2BXImM2U8w/exec";

	const res = await fetch(URL, {
		method: "GET"
	});

	const data = await res.json();
	console.log("Games:", data);

	document.getElementById("output").textContent =
		JSON.stringify(data, null, 2);
	}