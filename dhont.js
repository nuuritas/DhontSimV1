function createTable() {
  const n = window.n;
  const tableContainer = document.getElementById("table-container");
  const previousTable = tableContainer.querySelector("table");
  let previousLogos = [];
  if (previousTable) {
    const partyCells = previousTable.querySelectorAll("tbody tr td:first-child");
    previousLogos = Array.from(partyCells).map((cell) => {
      return Array.from(cell.querySelectorAll("img"));
    });
  }

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
  headerRow.appendChild(seatsHeader);
  thead.appendChild(headerRow);

  for (let i = 1; i <= 5; i++) {
    const row = document.createElement("tr");
    const partyCell = document.createElement("td");
    const votesCell = document.createElement("td");
    const seatsCell = document.createElement("td");

    partyCell.classList.add("party-cell");
    votesCell.innerHTML = '<input type="number" name="votes' + i + '" min="0" max="100" step="1">';
    seatsCell.textContent = 0;

    previousLogos.forEach((logos, index) => {
      const logo = logos[i - 1];
      if (logo) {
        partyCell.appendChild(logo);
        previousLogos[index][i - 1] = null;
      }
    });

    partyCell.addEventListener("dragover", allowDrop);
    partyCell.addEventListener("drop", drop);

    row.appendChild(partyCell);
    row.appendChild(votesCell);
    row.appendChild(seatsCell);
    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);

  function allowDrop(ev) {
    ev.preventDefault();
  }

  function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }

  function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
  }

  const logos = document.querySelectorAll("#logos img");
  logos.forEach((logo) => {
    logo.setAttribute("draggable", "true");
    logo.addEventListener("dragstart", drag);
  });
}




function loadPartyLogos() {
  fetch("parti_logo.json")
    .then(response => response.json())
    .then(logos => {
      const container = document.getElementById("logos");
      logos.forEach((logo) => {
        const logoImg = document.createElement("img");
        logoImg.classList.add("party-logo");
        logoImg.setAttribute("src", logo.link);
        logoImg.setAttribute("alt", logo.id);
        logoImg.setAttribute("id", logo.id);
        container.appendChild(logoImg);
      });
    })
    .catch(error => console.error(error));
}



// Charts and Calculations

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
              console.log(selectedCity);
              if (selectedCity) {
                const n = parseInt(selectedCity.value);
                window.n = n;
                const mvSayisi = document.querySelector("#mv-sayisi");
                mvSayisi.textContent = selectedCity.name + " Toplam Milletvekili Sayısı: " + n;
                createTable();
                createTableTop5Parties(data, data2, selectedCity);
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

function createColumnChart() {
  // Get the table element
  const table = document.getElementById("table-container");

  // Get the table rows
  const rows = table.querySelectorAll("tbody tr");

  // console.log(rows);

  // Initialize an empty data array for Highcharts
  const data = [];

  // Loop through the rows starting from the second row
  
  for (let i = 1; i < rows.length; i++) {

    // Get the party name and seat count
    const parties = rows[i].querySelector("td:nth-child(1)").textContent;
    const seats = rows[i].querySelector("td:last-child").textContent;

    if (seats != 0) {
      data.push({ name: parties, y: parseInt(seats) });
    }
  }

  // console.log(data);
  // Create the Highcharts chart
  Highcharts.chart("chart-container1", {
    chart: {
      type: "column",
    },
    title: {
      text: "Seçim Sonuçları",
    },
    xAxis: {
      type: "category",
      labels: {
        rotation: 0,
      },
    },
    yAxis: {
      title: {
        text: "Milletvekili Sayısı",
      },
    },
    series: [
      {
        name: "Parti:",
        data: data,
      },
    ],
  });
}

function createItemChart() {
  // Get the table element
  const table = document.getElementById("table-container");

  // Get the table rows
  const rows = table.querySelectorAll("tbody tr");

  // Initialize an empty data array for Highcharts
  const data = [];

  // Loop through the rows starting from the second row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Get the columns in the row
    const columns = row.querySelectorAll("td");

    // Get the party name, seat count, and color
    const parties = rows[i].querySelector("td:nth-child(1)").textContent;
    const seats = rows[i].querySelector("td:last-child").textContent;
    

    // Add the party, seat count, and color to the data array
    data.push({ name: parties, y: parseInt(seats), label: parties, color: "#" + Math.floor(Math.random()*16777215).toString(16)});
  }


  // Create the Highcharts chart
  Highcharts.chart("chart-container2", {
    chart: {
      type: "item",
    },
    title: {
      text: "Seçim Sonuçları",
    },
    legend: {
      labelFormat: '{name} <span style="opacity: 0.4">{y}</span>'
    },
    series: [
      {
        name: "Partiler",
        keys: ["name", "y", "color", "label"],
        data: data,
        dataLabels: {
          enabled: true,
          format: "{point.label}",
          style: {
            textOutline: "3px contrast",
          },
        },

        // Circular options
        center: ["50%", "88%"],
        size: "170%",
        startAngle: -100,
        endAngle: 100,
      },
    ],

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 600,
          },
          chartOptions: {
            series: [
              {
                dataLabels: {
                  distance: -30,
                },
              },
            ],
          },
        },
      ],
    },
  });
}

function calculateDivision() {
  const n = window.n;
  const table = document.getElementById("table-container");
  const rows = table.querySelectorAll("tbody tr");

  let totalVotes = 0;
  for (let i = 0; i < rows.length; i++) {
    const voteCell = rows[i].querySelector("td:nth-child(2) input[type='number']");
    console.log(voteCell);
    const vote = parseFloat(voteCell.value);
    totalVotes += vote;
  }

  console.log(totalVotes);
  if (totalVotes !== 100) {
    alert("Oylar Toplamı 100 Olmalıdır!");
  } else {
    
    function dhondt(partiesPercentages, seats = n) {
      const partyCount = partiesPercentages.length;
      const seatsAllocated = new Array(partyCount).fill(0);
      const quotients = [...partiesPercentages];
    
      for (let i = 0; i < seats; i++) {
        const maxQuotientIndex = quotients.indexOf(Math.max(...quotients));
        seatsAllocated[maxQuotientIndex]++;
        quotients[maxQuotientIndex] = partiesPercentages[maxQuotientIndex] / (seatsAllocated[maxQuotientIndex] + 1);
      }
    
      return seatsAllocated;
    }
          
    const partiesPercentages = Array.from(rows).map(row => {
      const voteCell = row.querySelector("td:nth-child(2) input");
      const vote = parseFloat(voteCell.value);
      return vote;
    });
    const selectedPersonNumbers = dhondt(partiesPercentages);
    console.log(selectedPersonNumbers); 
    
    const maxSeats = Math.max(...selectedPersonNumbers);

    // Add columns to the table based on the maxSeats value
    const table = document.getElementById("table-container");
    const thead = table.querySelector("thead");
    const headerRow = thead.querySelector("tr");

    const secondColumnValues = Array.from(rows).map(row => {
      const secondColumnInput = row.querySelector("td:nth-child(2) input[type='number']");
      return parseFloat(secondColumnInput.value);
    });

    // console.log(secondColumnValues[1]);

    for (let i = 1; i <= maxSeats; i++) {
      const divHeader = document.createElement("th");
      divHeader.textContent = "Mv. " + i;
      headerRow.insertBefore(divHeader, headerRow.querySelector("th:last-child"));
    }
      
    rows.forEach((row, rowIndex) => {
      for (let i = 1; i <= maxSeats; i++) {
        const divCell = document.createElement("td");
        divCell.textContent = (secondColumnValues[rowIndex] / i).toFixed(2); // Keep 2 decimal places
        row.insertBefore(divCell, row.querySelector("td:last-child"));
      }
    });
    

    selectedPersonNumbers.forEach((personCount, rowIndex) => {
      for (let i = 0; i < personCount; i++) {
        const divCell = rows[rowIndex].querySelector(`td:nth-child(${i + 3})`);
        divCell.style.backgroundColor = "green";
      }
    });
    
    // SeatCell column will be equal to selectedPersonNumbers
    rows.forEach((row, rowIndex) => {
      const lastCell = row.querySelector("td:last-child");
      lastCell.textContent = selectedPersonNumbers[rowIndex];
    });
      }
}


function old_voting_fetch() {
  let jsonData = {};
  fetch("secim_viki.json")
    .then(response => response.json())
    .then(data => {
      window.data = data;
      // console.log(data);
    })
    .catch(error => console.error("Error while fetching data:", error));
}

function old_mv_fetch() {
  let jsonData = {};
  fetch("mv_sonuc.json")
    .then(response => response.json())
    .then(data => {
      window.data2 = data;
    })
    .catch(error => console.error("Error while fetching data:", error));
}

function createTableTop5Parties(data, data2, selectedCity) {
  // Find the city data
  const cityData = data.find(city => city.il_adi === selectedCity.name);
  const cityData2 = data2.find(city => city.il_adi === selectedCity.name);

  // Extract party information and sort by vote percentage
  const parties = Object.entries(cityData)
    .filter(([key, _]) => key !== "il_adi")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const table = document.createElement("table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const emptyHeader = document.createElement("th");
  emptyHeader.textContent = "2018 Seçim Sonucu";
  headerRow.appendChild(emptyHeader);

  parties.forEach(([party, _]) => {
    const partyHeader = document.createElement("th");
    const logoImg = document.createElement("img");
    logoImg.src = `logos/${party}.png`;
    logoImg.width = 40;
    logoImg.height = 40;
    partyHeader.appendChild(logoImg);
    headerRow.appendChild(partyHeader);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  // Add row for "Oy Oranı"
  const voteRow = document.createElement("tr");
  const voteHeader = document.createElement("td");
  voteHeader.textContent = "Oy Oranı";
  voteRow.appendChild(voteHeader);

  parties.forEach(([party, votePercentage]) => {
    const voteCell = document.createElement("td");
    voteCell.textContent = votePercentage;
    voteRow.appendChild(voteCell);
  });

  tbody.appendChild(voteRow);

  // Add row for "Mv. Sayısı"
  const mvRow = document.createElement("tr");
  const mvHeader = document.createElement("td");
  mvHeader.textContent = "Mv. Sayısı";
  mvRow.appendChild(mvHeader);

  parties.forEach(([party, _]) => {
    const mvCell = document.createElement("td");
    mvCell.textContent = cityData2[party] || "0"; // If the party is not in data2, display "0"
    mvRow.appendChild(mvCell);
  });

  tbody.appendChild(mvRow);

  table.appendChild(tbody);

  const tableContainer = document.getElementById("table-container2");
  tableContainer.innerHTML = ""; // Clear any previous content
  tableContainer.appendChild(table);
}
