const margin = { top: 20, right: 20, bottom: 50, left: 60 };
const width = 500 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

// Create SVG element
const svg = d3.select('#barchart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Load data from CSV file
d3.csv('cleaned_vgsales.xls').then(function(data) {
  // Convert sales values to numbers
  data.forEach(function(d) {
    d.NA_Sales = +d.NA_Sales;
    d.EU_Sales = +d.EU_Sales;
    d.JP_Sales = +d.JP_Sales;
    d.Other_Sales = +d.Other_Sales;
    d.Global_Sales = +d.Global_Sales;
  });

  // Extract unique years from the data and sort in descending order
  const years = Array.from(new Set(data.map(d => d.Year))).sort((a, b) => b - a);

  // Create year dropdown options
  const yearDropdown = d3.select('#year-select');
  yearDropdown
    .selectAll('option')
    .data(years)
    .enter()
    .append('option')
    .text(d => d);

  // Function to update chart based on selected year
function updateChart(selectedYear) {
  // Filter data based on selected year
  const filteredData = data.filter(d => d.Year === selectedYear);

  // Sort the data by global sales in descending order
  filteredData.sort((a, b) => b.Global_Sales - a.Global_Sales);

  // Take top platforms by sales (you can adjust the number as needed)
  const topPlatforms = filteredData.slice(0, 10);

  // Create x and y scales
  const x = d3.scaleBand()
    .range([0, width])
    .padding(0.1)
    .domain(topPlatforms.map(d => d.Platform));

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(topPlatforms, d => d.Global_Sales)]);

  // Add x and y axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y).ticks(5);

  svg.selectAll('.axis').remove(); // Remove existing axes before updating
  svg.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .transition()
    .duration(500) // Add transition duration
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.15em')
    .attr('transform', 'rotate(-45)');

  svg.append('g')
    .attr('class', 'axis y-axis')
    .transition()
    .duration(500) // Add transition duration
    .call(yAxis);

  svg.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 10)
    .text('Global Sales');

  svg.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .text('Platform');

  // Remove existing bars before updating
  svg.selectAll('.bar').remove();

  // Add bars with transitions
  const bars = svg.selectAll('.bar')
    .data(topPlatforms)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('fill', '#69b3a2')
    .attr('x', d => x(d.Platform))
    .attr('width', x.bandwidth())
    .on('mouseover', showTooltip)
    .on('mouseout', hideTooltip)
    .attr('y', height) // Initial y position at the bottom of the chart
    .attr('height', 0) // Initial height of 0
    .transition()
    .duration(500) // Add transition duration
    .attr('y', d => y(d.Global_Sales))
    .attr('height', d => height - y(d.Global_Sales));


    // Add tooltips
    function showTooltip(d) {
      const tooltip = d3.select('#tooltip');
      tooltip
        .style('display', 'block')
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY + 'px')
        .html(`<strong>Platform:</strong> ${d.Platform}<br><strong>Global Sales:</strong> ${d.Global_Sales}`);
    }

    function hideTooltip() {
      const tooltip = d3.select('#tooltip');
      tooltip.style('display', 'none');
    }
  }

  // Initial chart rendering with the first year as default
  updateChart(years[0]);

  // Event listener for year dropdown change
  yearDropdown.on('change', function() {
    const selectedYear = this.value;
    updateChart(selectedYear);
  });
});
