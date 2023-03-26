function createTable() {
  const n = window.n;
  const tableContainer = document.getElementById("table-container");
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");
  const partyHeader = document.createElement("th");
  const votesHeader = document.createElement("th");
  const seatsHeader = document.createElement("th");

  partyHeader.textContent = "Parti";
  votesHeader.textContent = "Oy (%)";
  seatsHeader.textContent = "Mv. Sayısı";
  headerRow.appendChild(partyHeader);
  headerRow.appendChild(votesHeader);

  for (let i = 1; i <= n; i++) {
    const divHeader = document.createElement("th");
    divHeader.textContent = "Mv. " + i;
    headerRow.appendChild(divHeader);
  }

  headerRow.appendChild(seatsHeader);
  thead.appendChild(headerRow);

  for (let i = 1; i <= 5; i++) {
    const row = document.createElement("tr");
    const partyCell = document.createElement("td");
    const votesCell = document.createElement("td");
    const seatsCell = document.createElement("td");

    partyCell.textContent = 'Parti ' + i;
    votesCell.innerHTML = '<input type="number" name="votes' + i + '" min="0" max="100" step="1">';
    seatsCell.textContent = 0;

    row.appendChild(partyCell);
    row.appendChild(votesCell);

    for (let j = 1; j <= n; j++) {
      const divCell = document.createElement("td");
      divCell.textContent = (parseFloat(votesCell.querySelector('input').value) / n).toFixed(2);
      row.appendChild(divCell);
    }

    row.appendChild(seatsCell);
    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);
}

function calculateDivision() {
  const n = window.n;
  const rows = document.querySelectorAll("tbody tr");

  let totalVotes = 0;
  for (let i = 0; i < rows.length; i++) {
    const voteCell = rows[i].querySelector("td:nth-child(2) input");
    const vote = parseFloat(voteCell.value);
    totalVotes += vote;

    for (let j = 0; j < n; j++) {
      const divCell = rows[i].querySelector(`td:nth-child(${j + 3})`);
      const divValue = (vote / (j+1)).toFixed(2);
      divCell.textContent = divValue;
    }
  }

  if (totalVotes !== 100) {
    alert("Oylar Toplamı 100 Olmalıdır!");
  }
  else{
    // Create an array of div values for each column after the 3rd
  const divArrays = [];
  for (let i = 0; i < n; i++) {
    const divValues = [];
    for (let j = 0; j < rows.length; j++) {
      const divCell = rows[j].querySelector(`td:nth-child(${i + 3})`);
      const divValue = parseFloat(divCell.textContent);
      divValues.push(divValue);
    }
    divArrays.push(divValues);
  }

  // Extend divArrays to include all the div values in a single array
  const sortedDivValues = [];
  for (let i = 0; i < divArrays.length; i++) {
    for (let j = 0; j < divArrays[i].length; j++) {
      sortedDivValues.push(divArrays[i][j]);
    }
  }

  // Get the index of max n values in the sortedDivValues array
  const topIndices = sortedDivValues.map((val, idx) => ({ val, idx })).sort((a, b) => b.val - a.val).slice(0, n).map(item => item.idx);
  const maxDivValues = [];
  for (let i = 0; i < topIndices.length; i++) {
    const divValue = sortedDivValues[topIndices[i]];
    maxDivValues.push(divValue);
  }

  // Apply the green background color to the appropriate division cells
  for (let i = 0; i < rows.length; i++) {
    let greenCount = 0;
    for (let j = 0; j < n; j++) {
      const divCell = rows[i].querySelector(`td:nth-child(${j + 3})`);
      const divValue = parseFloat(divCell.textContent);
      if (maxDivValues.includes(divValue)) {
        divCell.style.backgroundColor = "green";
        greenCount += 1;
      } else {
        divCell.style.backgroundColor = "white";
      }
    }
    
    const seatsCell = rows[i].querySelector(`td:nth-child(${parseInt(n) + 3})`);
    seatsCell.textContent = parseInt(greenCount);
  }
  }

  
}

function getCityName(cityTitle) {
  console.log(cityTitle);
}


function loadMap() {
  fetch("city_location.json")
    .then(response => response.json())
    .then(cities => {
      cities.forEach(city => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.id = city.id;
        path.setAttribute("data-city-name", city["data-city-name"]);
        path.title = city.title;
        path.className = "city";
        path.setAttribute("d", city.d);
        path.addEventListener("click", () => {
          const selected = document.querySelector(".selected");
          if (selected) {
            selected.classList.remove("selected");
          }
          path.classList.add("selected");
          // document.getElementById("city-title").textContent = "Seçili Şehir: " + city.title;
          fetch("cities.json")
            .then(response => response.json())
            .then(cities => {
              const selectedCity = cities.find(c => c.name === city.title);
              if (selectedCity) {
                const n = parseInt(selectedCity.value);
                window.n = n;
                const mvSayisi = document.querySelector("#mv-sayisi");
                mvSayisi.textContent = selectedCity.name + " Toplam Milletvekili Sayısı: " + n;
                createTable();
              }
            })
            .catch(error => console.error(error));
          
        });
        path.addEventListener("mouseenter", () => {
          path.classList.add("hovered");
        });
        path.addEventListener("mouseleave", () => {
          path.classList.remove("hovered");
        });
        document.getElementById("turkey-map").appendChild(path);
      });
    })
    .catch(error => console.error(error));
}

function loadPartyLogos() {
  fetch("parti_logo.json")
    .then(response => response.json())
    .then(logos => {
      const container = document.createElement("div");
      container.classList.add("party-logo-container");
      logos.forEach((logo) => {
        const logoImg = document.createElement("img");
        logoImg.classList.add("party-logo");
        logoImg.setAttribute("src", logo.link);
        logoImg.setAttribute("alt", logo.id);
        container.appendChild(logoImg);
      });
      document.body.appendChild(container);
    })
    .catch(error => console.error(error));
}
