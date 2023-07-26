// Set up chart dimensions
// const margin = { top: 20, right: 30, bottom: 30, left: 50 };
// const width = 800 - margin.left - margin.right;
// const height = 500 - margin.top - margin.bottom;

// Create SVG element
const svg3 = d3.select('.scatter')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Load data from CSV file
d3.csv('cleaned_vgsales.xls').then(function(data) {
  // Convert numerical columns to numbers
  data.forEach(function(d) {
    d.Global_Sales = +d.Global_Sales;
    d.Publisher = d.Publisher.trim();
  });

  // Count the number of games published by each company
  const gameCounts = d3.rollup(
    data,
    v => v.length,
    d => d.Publisher
  );

  // Prepare data for scatter plot
  const scatterData = Array.from(gameCounts, ([publisher, count]) => ({
    publisher: publisher,
    count: count,
    sales: d3.sum(data.filter(d => d.Publisher === publisher), d => d.Global_Sales)
  }));

  // Set up scales
  const x = d3.scaleLinear()
    .domain([0, d3.max(scatterData, d => d.count)])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(scatterData, d => d.sales)])
    .range([height, 0]);

  // Add circles to represent data points
  const circles = svg3.selectAll('.circle')
    .data(scatterData)
    .enter()
    .append('circle')
    .attr('class', 'circle')
    .attr('cx', d => x(d.count))
    .attr('cy', d => y(d.sales))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .on('click', function(event, d) {
      // Toggle the "highlighted" class
      const circle = d3.select(this);
      const isHighlighted = circle.classed('highlighted');
      circle.classed('highlighted', !isHighlighted);
    });

  // Function to handle circle click event
  const handleCircleClick = function(event, d) {
    // Reset all circle styles
    circles.attr('class', 'circle');

    // Highlight the clicked circle
    d3.select(this).attr('class', 'circle highlighted');
  };

  // Add click event listener to circles
  circles.on('click', handleCircleClick);

  // Add axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  // Function to update the plot based on the selected xlim
  const updatePlot = function() {
    // Get the value of the button
    const xlim = +this.value;

    // Update X axis with smooth transition
    x.domain([0, xlim]);
    svg3.select('.x-axis').transition().duration(1000).call(xAxis);

    // Update chart with smooth transition
    circles.transition().duration(1000)
      .attr('cx', d => x(d.count))
      .attr('cy', d => y(d.sales));
  };

  // Add an event listener to the button created in the HTML part
  d3.select('#buttonXlim').on('input', updatePlot);

  const tooltip = d3.select('.scatter')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '1px')
    .style('border-radius', '5px')
    .style('padding', '10px');

  svg3.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('.0f')));

  svg3.append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis);

  svg3.append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom)
    .attr('text-anchor', 'middle')
    .text('Number of Games (Count)');

  // Add y-axis label
  svg3.append('text')
    .attr('class', 'axis-label')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 10)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Global Sales (in millions)');

  const handleMouseover = function(event, d) {
    tooltip.style('opacity', 1);
  };

  const handleMousemove = function(event, d) {
    tooltip
      .html( d.publisher +' published '+ d.count + ' games with ' + d.sales.toFixed(2) + ' global sales ')
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY - 10 + 'px');
  };

  const handleMouseleave = function(event, d) {
    tooltip.transition()
      .duration(200)
      .style('opacity', 0);
  };

  circles
    .on('mouseover', handleMouseover)
    .on('mousemove', handleMousemove)
    .on('mouseleave', handleMouseleave);
});
