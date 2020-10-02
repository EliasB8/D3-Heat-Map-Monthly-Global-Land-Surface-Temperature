
// Setting footer date
document.getElementById("Date").textContent = new Date().getFullYear();

// Fecthing the data
fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
.then(res => res.json())
.then(data => {
  
//   Getting the data
  const {baseTemperature, monthlyVariance} = data;
  
//   Passing important data we need to our function
  renderHeatMap(monthlyVariance.map(d => ({...d, temp: baseTemperature + d.variance})));
});

function renderHeatMap(dataset) {  
  
  const width = 1300;
  const height = 500;
  const padding = 40;
  
//   Setting cell height and weight
  const cellHeight = (height - padding) /12 ;
  const cellWidth = width / (dataset.length/12);
  
  //   colors
  const colors = ['#a50026','#d73027','#f46d43','#fdae61','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
 
//   Scaling temps
  const tempScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.temp), d3.max(dataset, d => d.temp)])
    .range([0, 8]);

//   Accessing svg
  const svg = d3.select("svg");

//   Creating tooltip
  const tooltip = d3.select("body").append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .attr("id", "tooltip");
  
//   Creating xScale
  const xScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
    .range([0, width]);
  
    //Creating xAxis 
  const xAxis = d3.axisBottom(xScale).tickFormat(d => d).ticks(20);

  // Generating xAxis
  svg.append("g")
    .attr("transform", `translate(${padding*2},${height})`)
    .attr("class", "axis")
    .attr("id", "x-axis")
    .call(xAxis);
  
//   Creating yScale
  const yScale = d3.scaleBand()
    .domain([0,1,2,3,4,5,6,7,8,9,10,11])
    .range([0, height - padding]);
  
//   Creating yAxis
  const yAxis = d3.axisLeft(yScale).tickFormat( month => {
    const date = new Date("0");
    date.setMonth(month);
    return d3.timeFormat("%B")(date);
  });
  
//Generating yAxis
  svg.append("g")
    .attr("transform", `translate(${padding*1.975},${padding})`)
    .attr("class", "axis")
    .attr("id", "y-axis")
    .call(yAxis);
  
// Generating the heat map
  svg.selectAll("rect")
     .data(dataset)
     .enter()
     .append("rect")
     .attr("data-month", d => d.month - 1)
     .attr("data-year", d => d.year)
     .attr("data-temp", d => d.temp)
     .attr("class", "cell")
     .attr("width", cellWidth)
     .attr("height", cellHeight)
     .attr("x", d => xScale(d.year))
     .attr("y", d => yScale(d.month - 1))
     .attr("transform", `translate(${padding*2},${padding})`)
     .attr("fill", d => {
                 return (colors[Math.floor(tempScale(d.temp))])
     })
     .on("mouseover", (event, d) => {
        tooltip.style("opacity", 0.9);
        tooltip.attr("data-year", d.year);
        const date = new Date(d.year, d.month - 1);
        tooltip.html("<span class='hover-info'>" + d3.timeFormat("%Y - %B")(date) + "</span><span class='hover-info'>Temp: "+ d3.format('.1f')(d.temp) + "&#8451;</span><span class='hover-info'>Variance: " + (d.variance > 0 ? "+" : "") + d3.format('.1f')(d.variance) + "&#8451;</span>");

        tooltip.style("left", (event.pageX + 10) + "px");
        tooltip.style("top", (event.pageY - 28) + "px");})
      .on("mouseout", () => tooltip.style("opacity", 0));
  
  const legendHeight = 50;
  const legendWidth = 300 / colors.length;
  
  const legend = d3.select(".legend")
                   .append("svg")
                   .attr("id","legend")
                   .attr("width", 300)
                   .attr("height", 70);
  
  legend.selectAll("rect")
        .data(colors.reverse())
        .enter()
        .append("rect")
        .attr("height", legendHeight)
        .attr("width", legendWidth )
        .attr("x", (c, i) => i * legendWidth )
        .attr("y",0)
        .attr("fill", c => c);
  
//   Creating the Legend Scale
  const legendScale = d3.scaleLinear()
    .domain([d3.max(dataset, d => d.temp), d3.min(dataset, d => d.temp)])
    .range([0, 300]);
  
//   creating legend axis
  const legendAxis = d3.axisBottom(legendScale);
  
//   Generating the legend axis
  legend.append("g")
        .attr("transform", `translate(${0},${legendHeight})`)
        .call(legendAxis);

}