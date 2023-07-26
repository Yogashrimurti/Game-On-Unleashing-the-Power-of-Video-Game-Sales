var result = d3.csv("vgsales.csv").then(function(data) {
  // Group data by genre and calculate the total sales for each genre
  var genreSales = d3.group(data, d => d.Genre);
  var genreSalesTotal = new Map([...genreSales].map(([genre, sales]) => [genre, sales.length]));

  // Convert genre sales data to an array of objects
  var pieData = Array.from(genreSalesTotal, ([label, value]) => ({ label, value }));

  // Set up the dimensions and radius of the pie chart
  var width = 400;
  var height = 400;
  var radius = Math.min(width, height) / 2;
  var innerRadius = radius * 0.5; // Set the inner radius for the donut chart

  var svg = d3
    .select("#PieChartBody")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  const tooltip = d3
    .select("#PieChartBody")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // Define the colors for the pie chart slices
  var color = function(i){
    return d3.interpolateRainbow(i/12);
  }


  // Define the pie layout
  var pie = d3.pie()
    .value(function(d) {
      return d.value;
    })
    .sort(null);

  // Generate the pie chart slices
  var arcs = svg
    .selectAll("arc")
    .data(pie(pieData))
    .enter()
    .append("g");

  // Draw each arc as a path
  arcs
    .append("path")
    .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius))
    .attr("fill", function(d, i) {
      return color(i);
    })
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .on("mouseover", function(d) {
      d3.select(this).style("opacity", 0.7);
      tooltip.style("opacity", 0.9);
    })
    .on("mousemove", function(event, d) {
      var genreLabel = d.data.label;
      var salesValue = d.data.value;
      tooltip
        .html("Genre: " + genreLabel + "<br>Sales: " + salesValue)
        .attr("id", "tooltip")
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY) + "px");
    })
    .on("mouseout", function(d) {
      d3.select(this).style("opacity", 1);
      // Remove the following line to keep the tooltip visible indefinitely
      tooltip.style("opacity", 0);
    })
    .transition() // Apply the bounce animation to arcs
    .duration(1000)
    .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius + 10))
    .transition()
    .duration(1000)
    .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius));

  // Add labels to the pie chart slices
  arcs
    .append("text")
    .attr("transform", function(d) {
      var centroid = d3.arc().innerRadius(innerRadius).outerRadius(radius).centroid(d);
      return "translate(" + centroid[0] + "," + centroid[1] + ")";
    })
    .attr("text-anchor", "middle")
    .style("font-size", 16)
    .text(function(d) {
      return d.data.label;
    })
    .style("opacity", 0) // Set initial opacity to 0
    .transition() // Apply the same bounce animation to labels
    .delay(1000) // Delay the label animation to synchronize with arcs
    .duration(1000)
    .style("opacity", 1) // Fade in the labels
    .attr("transform", function(d) {
      var centroid = d3.arc().innerRadius(innerRadius).outerRadius(radius + 10).centroid(d);
      return "translate(" + centroid[0] + "," + centroid[1] + ")";
    })
    .transition()
    .duration(1000)
    .attr("transform", function(d) {
      var centroid = d3.arc().innerRadius(innerRadius).outerRadius(radius).centroid(d);
      return "translate(" + centroid[0] + "," + centroid[1] + ")";
    });

  // Add title to the donut chart
  svg
    .append("text")
    .attr("text-anchor", "middle")
    .style("font-size", 20)
    .style("font-weight", "bold")
    .text("Genre Distribution")
    .attr("y", -10); // Adjust the position of the title vertically as needed
});
