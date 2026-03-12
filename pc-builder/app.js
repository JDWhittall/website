let partsData = {};
let total = 0;

fetch("parts.json")
  .then(res => res.json())
  .then(data => {
    partsData = data;
    buildUI();
  });

function buildUI() {
  const builder = document.getElementById("builder");

  Object.keys(partsData).forEach(category => {

    const select = document.createElement("select");

    partsData[category].forEach((part, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${part.name} (£${part.price})`;
      select.appendChild(option);
    });

    select.onchange = updateTotal;

    const label = document.createElement("label");
    label.textContent = category;

    builder.appendChild(label);
    builder.appendChild(select);
    builder.appendChild(document.createElement("br"));
  });

  updateTotal();
}

function updateTotal() {
  total = 0;

  document.querySelectorAll("select").forEach((select, i) => {
    const category = Object.keys(partsData)[i];
    const part = partsData[category][select.value];
    total += part.price;
  });

  document.getElementById("total").textContent = total;
}