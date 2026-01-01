async function loadGames() {
	const URL = "https://script.google.com/macros/s/AKfycbw32ei_sPa1yhE9OuKnBAxAvnBcrF_eoipqbUTlNkJJfiZwtNFrI1EjVKgN0B0ZJt8HRA/exec";

	const res = await fetch(URL, {
		method: "GET"
	});

	const data = await res.json();
	console.log("Games:", data);

	document.getElementById("output").textContent =
		JSON.stringify(data, null, 2);
	}