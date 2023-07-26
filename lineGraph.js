// Load the data from the CSV file
d3.csv("cleaned_vgsales.xls").then(function(data) {
  // Parse the sales data
  data.forEach(function(d) {
    d.Year = parseInt(d.Year);
    d.Global_Sales = parseFloat(d.Global_Sales);
  });

  // Prepare the data for the line chart
  var years = Array.from(new Set(data.map(function(d) { return d.Year; })));
  var salesByYear = years.map(function(year) {
    var totalSales = d3.sum(data, function(d) {
      if (d.Year === year) {
        return d.Global_Sales;
      } else {
        return 0;
      }
    });
    return { year: year, sales: totalSales };
  });

  // Sort the data by year
  salesByYear.sort(function(a, b) {
    return a.year - b.year;
  });

  // Set up the dimensions of the line chart
  var marginLineChart = { top: 50, right: 50, bottom: 50, left: 50 };
  var widthLineChart = 800 - marginLineChart.left - marginLineChart.right;
  var heightLineChart = 400 - marginLineChart.top - marginLineChart.bottom;

  // Create the SVG element
  var svgLineChart = d3.select("#linechart")
    .append("svg")
    .attr("width", widthLineChart + marginLineChart.left + marginLineChart.right)
    .attr("height", heightLineChart + marginLineChart.top + marginLineChart.bottom)
    .append("g")
    .attr("transform", "translate(" + marginLineChart.left + "," + marginLineChart.top + ")");

  // Set up the scales for the x-axis and y-axis
  var xScaleLineChart = d3.scaleLinear()
    .range([0, widthLineChart])
    .domain(d3.extent(salesByYear, function(d) { return d.year; }));

  var yScaleLineChart = d3.scaleLinear()
    .range([heightLineChart, 0])
    .domain([0, d3.max(salesByYear, function(d) { return d.sales; })]);

  // Set up the line generator
  var line = d3.line()
    .x(function(d) { return xScaleLineChart(d.year); })
    .y(function(d) { return yScaleLineChart(d.sales); });

  // Create the line path
  svgLineChart.append("path")
    .datum(salesByYear)
    .attr("class", "line")
    .attr("d", line);

  // Create the x-axis
  svgLineChart.append("g")
    .attr("transform", "translate(0," + heightLineChart + ")")
    .call(d3.axisBottom(xScaleLineChart).tickFormat(d3.format("d")));

  // Create the y-axis
  svgLineChart.append("g")
    .call(d3.axisLeft(yScaleLineChart));


  // Create the x-axis label
svgLineChart.append("text")
.attr("class", "axis-label")
.attr("x", widthLineChart / 2)
.attr("y", heightLineChart + marginLineChart.top + 0.5 )
.attr("text-anchor", "middle")
.text("Year");

// Create the y-axis label
svgLineChart.append("text")
.attr("class", "axis-label")
.attr("x", -marginLineChart.left)
.attr("y", heightLineChart / 8)
.attr("text-anchor", "middle")
.attr("transform", "rotate(-90)")
.text("Global Sales (in millions)");

});
