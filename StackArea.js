    // Set up chart dimensions
    // const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    // const width = 800 - margin.left - margin.right;
    // const height = 500 - margin.top - margin.bottom;

    // Create svg2 element
    const svg2 = d3.select('#stack')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Load data from CSV file
    d3.csv('cleaned_vgsales.xls').then(function(data) {
    // Parse date and sales values
    const parseYear = d3.timeParse('%Y');
    const regions = data.columns.slice(6); // Extract region names from columns

    data.forEach(function(d) {
      d.date = parseYear(d.Year);
      regions.forEach(function(region) {
        d[region] = +d[region] || 0; // Handle NaN values by assigning 0
      });
    });

    // Stack the data
    const stack = d3.stack().keys(regions);
    const stackedData = stack(data);

    // Set up x and y scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
      .range([height, 0]);


      // Set up color scale for regions
      const color = d3.scaleOrdinal()
        .domain(regions)
        .range(d3.schemeCategory10);

      // Generate area paths
      const area = d3.area()
        .x(d => x(d.data.date))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

      svg2.selectAll('path')
        .data(stackedData)
        .join('path')
        .attr('fill', d => color(d.key))
        .attr('d', area);

      // Add x and y axes
      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      svg2.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

      svg2.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis);

      // Add region legends
      const legend = svg2.selectAll('.region-legend')
        .data(regions)
        .join('g')
        .attr('class', 'region-legend')
        .attr('transform', (d, i) => `translate(0,${i * 20})`);

      legend.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', color);

      legend.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .text(d => d)
        .style('font-size', '12px');

      // Add tooltip
      const tooltip = d3.select('#stack').append('div')
        .attr('class', 'tooltip');

      svg2.selectAll('path')
        .on('mouseover', function() {
          tooltip.style('opacity', 1);
        })
        .on('mousemove', function(d, i) {
          const mouseDate = x.invert(d3.pointer(event)[0]);
          const bisectDate = d3.bisector(d => d.date).right;
          const index = bisectDate(data, mouseDate);
          const salesData = data[index];

          let tooltipContent = `<strong>Date: ${salesData.Year}</strong><br/>`;
          regions.forEach(region => {
            tooltipContent += `${region}: ${salesData[region]}<br/>`;
          });

          tooltip
            .html(tooltipContent)
            .style('left', `${d3.pointer(event)[0] + 10}px`)
            .style('top', `${d3.pointer(event)[1] + 10}px`);
        })
        .on('mouseout', function() {
          tooltip.style('opacity', 0);
        });

// Add x-axis label
svg2.append("text")
  .attr("class", "axis-label")
  .attr("x", width / 2)
  .attr("y", height + margin.top + 30)
  .attr("text-anchor", "middle")
  .text("Year");

// Add y-axis label
svg2.append("text")
  .attr("class", "axis-label")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -margin.left + 20)
  .attr("text-anchor", "middle")
  .text("Sales (in millions)");


    });