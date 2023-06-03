async function getData() {
  const rawData = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  );
  const data = await rawData.json();

  return data.data;
}

function setToolTip() {
  const bars = document.querySelectorAll(".bar");

  bars.forEach((bar) => {
    bar.addEventListener("mouseover", (event) => {
      document.getElementById("tooltip")?.remove();

      const gdp = event.target.getAttribute("data-gdp");
      const date = event.target.getAttribute("data-date");
      const mousePosition = [event.x, event.y];

      const tooltip = document.createElement("div");
      tooltip.id = "tooltip";
      tooltip.innerHTML = `
        GDP: USD ${Number(gdp).toFixed(2)} <br>
        Date: ${date.replaceAll("-", " / ")}
      `;
      tooltip.style.position = "fixed";
      tooltip.style.zIndex = "9999";
      tooltip.style.background = "#fff";
      tooltip.style.padding = "10px";
      tooltip.style.border = "1px solid #ccc";
      tooltip.style.borderRadius = "4px";
      tooltip.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";

      tooltip.setAttribute("data-gdp", gdp);
      tooltip.setAttribute("data-date", date);

      const tooltipWidth = 200;
      const windowWidth = window.innerWidth;
      const spaceRight = windowWidth - mousePosition[0];

      if (spaceRight >= tooltipWidth) {
        tooltip.style.left = `${mousePosition[0]}px`;
      } else {
        const spaceLeft = mousePosition[0] - tooltipWidth;
        tooltip.style.left = `${spaceLeft}px`;
      }

      tooltip.style.top = `${mousePosition[1]}px`;

      document.body.appendChild(tooltip);
    });
  });
}

function appendChart(data) {
  const width = 5 * data.length;
  const height = d3.max(data.map((item) => item[1] / 30));
  const padding = 50;

  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => {
        return d[0].split("-")[0];
      }),
      d3.max(data, (d) => {
        return d[0].split("-")[0];
      }),
    ])
    .range([padding, width - padding]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[1])])
    .range([height - padding, padding]);

  const xAxis = d3.axisBottom(xScale);

  const yAxis = d3.axisLeft(yScale);

  const svg = d3
    .select("main")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .selectAll("rect")
    .data(data.map((item) => item[1] / 30))
    .enter()
    .append("rect")
    .attr("width", 25)
    .attr("height", (d, i) => d)
    .attr("class", "bar")
    .attr("x", (d, i) => i * 5 + padding)
    .attr("y", (d, i) => {
      return height - d - padding;
    })
    .attr("data-date", function (d, i) {
      return data[i][0];
    })
    .attr("data-gdp", function (d, i) {
      return data[i][1];
    });

  svg
    .append("g")
    .attr("transform", "translate(0," + (height - padding) + ")")
    .call(xAxis)
    .attr("id", "x-axis");
  svg
    .append("g")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis)
    .attr("id", "y-axis");

  setToolTip();
}

getData().then((data) => appendChart(data));
