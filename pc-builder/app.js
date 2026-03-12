let partsData = {};
let selections = {};
let currentCategory = "";

fetch("parts.json")
.then(r => r.json())
.then(data =>
{
    partsData = data;
    buildPage();
});

function buildPage()
{
    const builder = document.getElementById("builder");

    Object.keys(partsData).forEach(category =>
    {
        const row = document.createElement("div");
        row.className = "componentRow";

        const label = document.createElement("div");
        label.textContent = category;

        const button = document.createElement("button");
        button.textContent = "Select " + category;
        button.onclick = () => openModal(category);

        const selected = document.createElement("div");
        selected.id = "selected_" + category;

        row.appendChild(label);
        row.appendChild(button);
        row.appendChild(selected);

        builder.appendChild(row);
    });
}

function openModal(category)
{
    currentCategory = category;

    document.getElementById("modalTitle").textContent = "Select " + category;

    const list = document.getElementById("partList");
    list.innerHTML = "";

    partsData[category].forEach(part =>
    {
        const card = document.createElement("div");
        card.className = "partCard";

        card.innerHTML =
        `
        <img src="${part.image}" alt="">
        <div>${part.name}</div>
        <div class="price">£${part.price}</div>
        `;

        card.onclick = () =>
		{
			selections[category] = part;

			const selectedBox = document.getElementById("selected_" + category);

			selectedBox.innerHTML =
			`
			<div class="selectedPart">
				<img src="${part.image}" alt="">
				<div class="partInfo">
					<div>${part.name}</div>
					<div class="partPrice">£${part.price}</div>
					<a class="buyLink" href="${part.link}" target="_blank">Buy on ${part.store}</a>
				</div>
			</div>
			`;

			updateTotal();
			closeModal();
		};

        list.appendChild(card);
    });

    document.getElementById("modal").classList.remove("hidden");
}

function closeModal()
{
    document.getElementById("modal").classList.add("hidden");
}

function updateTotal()
{
    let total = 0;

    Object.values(selections).forEach(part =>
    {
        total += part.price;
    });

	total += 300; // Add estimated cost for other components (case, PSU, etc.)

    document.getElementById("total").textContent = total.toFixed(2);
}