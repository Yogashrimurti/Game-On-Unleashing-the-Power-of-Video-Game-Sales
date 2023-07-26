var width = window.innerWidth - 100,
    size = window.innerHeight - 100,
    padding = 20;
    
var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(6);

var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(6);

var single = false;

d3.csv("Video_Game_Sales_as_of_Jan_2017.csv", function(error, data) {
  if (error) throw error;

  var color = d3.scaleOrdinal(d3.schemeCategory20)
    .domain(d3.map(data, function(d) { return d["Genre"]; }).keys().sort());

  var xval = d3.select("#xaxis").property("value");
  var yval = d3.select("#yaxis").property("value");

  var isZoom = false;

  realData = data;
  data = realData.filter((d) => d.Global_Sales >= 0.5);

  // format the data
  data.forEach(function(d) {
      d.NA_Sales = +d.NA_Sales;
      d.EU_Sales = +d.EU_Sales;
      d.JP_Sales = +d.JP_Sales;
      d.Other_Sales = +d.Other_Sales;
      d.Global_Sales = +d.Global_Sales;
      d.Year_of_Release = +d.Year_of_Release;
      d.Critic_Score = +d.Critic_Score;
      d.Critic_Count = +d.Critic_Count;
      d.User_Score = +d.User_Score;
      d.User_Count = +d.User_Count;
  });

  var domainByTrait = {},
      traits = d3.keys(data[0]),
      n = 1;

  var div = d3.select("#chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
  });
  var startTraits = ["Year_of_Release", "Global_Sales"];

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);

  var brush = d3.brush()
      .extent([[x.range()[0], y.range()[1]], [x.range()[1], y.range()[0]]])
      .on("start", brushstart)
      .on("brush", brushmove)
      .on("end", brushend);

  var svg = d3.select("#chart").insert("svg", ":first-child")
      .style("display", "table-cell")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
    .append("g")
      .attr("transform", "translate(" + padding + "," + (padding - 30) / 2 + ")");

  var xAxisLabel = svg.append("text")             
      .attr("transform",
            "translate(" + (size/2) + " ," + 
                            (size + 30) + ")")
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .text("Year_of_Release (Years)");

  var yAxisLabel = svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("x",0 - (size / 2))
      .attr("dy", "1em")
      .style("font-size", "20px")
      .style("text-anchor", "middle")
      .text("Global_Sales (Millions)"); 

  svg.selectAll(".x.axis")
      .data(startTraits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[xval]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(startTraits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[yval]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data([{'i':0, 'j':0, 'x':startTraits[0], 'y':startTraits[1]}])
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);
  
  var ordinal = d3.scaleOrdinal()
    .domain(d3.map(data, function(d) { return d["Genre"]; }).keys().sort())
    .range(d3.schemeCategory20);
  
  svg.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform","translate(40,40)");

  var legendOrdinal = d3.legendColor()
    .scale(ordinal);
  
  svg.select(".legendOrdinal")
    .call(legendOrdinal);

  // barchart variables

  var margin2 = {top: 20, right: 20, bottom: 30, left: 40},
      width2 = width / 2 - margin2.left - margin2.right,
      height2 = size - margin2.top - margin2.bottom;

  var x2 = d3.scaleBand()
            .range([0, width2])
            .padding(0.1);
  var y2 = d3.scaleLinear()
            .range([height2, 0]);

  var svg2 = d3.select("#chart2").append("svg")
      .attr("width", width2 + margin2.left + margin2.right)
      .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin2.left + "," + margin2.top + ")");

  svg2.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "#ffffff");

  // end barchart variables
  

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 4)
        .style("fill", function(d) { return color(d.Genre); })
        .on("mousemove", function(d) {
            if (this.style.opacity == "0") {
              return
            }
            div.transition()
                .duration(50)
                .style("opacity", .9);
            div.html("<b>Title</b>: " + d.Name
              + "<br/><b>Genre</b>: " + d.Genre
              + "<br/><b>Platform</b>: " + d.Platform
              + "<br/><b>Release Year</b>: " + d.Year_of_Release
              + "<br/><b>Publisher</b>: " + d.Publisher
              + "<br/><b>Global Sales</b>: " + d.Global_Sales + " Million"
              + "<br/><b>Critic Score</b>: " + d.Critic_Score)
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 50) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(50)
                .style("opacity", 0);
        });
  }

  function filtOptions(num) {
    var domain = {};
    data.forEach(d => domain[d[d3.select("#filter" + num).property("value")]] = 1);
    var keys = Object.keys(domain);
    var newOptions = [""];
    for (var i = 0; i < keys.length; i++) {
      newOptions.push({'value':i, 'text':keys[i]});
    }
    d3.select("#filterOptions" + num)
      .selectAll("option")
      .remove();
    d3.select("#filterOptions" + num)
      .selectAll("option")
      .data(newOptions)
      .enter()
      .append("option")
      .text(d => d.text);
  }

  filtOptions(1);
  filtOptions(2);

  d3.select("#filter1")
    .on("change", d => filtOptions(1));
  d3.select("#filter2")
    .on("change", d => filtOptions(2));

  function filter() {
    cell.selectAll("circle")
        .style("opacity", 1);
    cell.selectAll("circle")
        .data(data).filter(d => {
          return (d[d3.select("#filter1").property("value")] != d3.select("#filterOptions1").property("value") && d3.select("#filterOptions1").property("value") != "")
            || (d[d3.select("#filter2").property("value")] != d3.select("#filterOptions2").property("value") && d3.select("#filterOptions2").property("value") != "");
        })
        .style("opacity", 0);
  }

  d3.selectAll(".filterOptions")
    .on("change", filter);

  function changed() {
    single = true;
    xval = d3.select("#xaxis").property("value");
    yval = d3.select("#yaxis").property("value");
    if (xval.indexOf("Sales") != -1) {
      xAxisLabel.text(xval + " (Millions)");
    } else if (xval.indexOf("Year") != -1) {
      xAxisLabel.text(xval + " (Years)");
    } else {
      xAxisLabel.text(xval);
    }
    if (yval.indexOf("Sales") != -1) {
      yAxisLabel.text(yval + " (Millions)");
    } else if (yval.indexOf("Year") != -1) {
      yAxisLabel.text(yval + " (Years)");
    } else {
      yAxisLabel.text(yval);
    }
    x.domain(domainByTrait[xval]);
    y.domain(domainByTrait[yval]);
    d3.selectAll(".x.axis").call(xAxis);
    d3.selectAll(".y.axis").call(yAxis);
    cell.selectAll("circle")
      .attr("cx", (d) => x(d[xval]))
      .attr("cy", (d) => y(d[yval]));
  }

  d3.select("#xaxis")
    .on("change", changed);
  d3.select("#yaxis")
    .on("change", changed);

  function colorify(attrib) {
    color.domain(d3.map(data, function(d) { return d[attrib]; }).keys().sort())
    cell.selectAll("circle")
      .style("fill", (d) => color(d[attrib]));
    ordinal.domain(d3.map(data, function(d) { return d[attrib]; }).keys().sort());
    legendOrdinal.scale(ordinal);
    svg.select(".legendOrdinal")
      .call(legendOrdinal);
  }

  d3.select("#color")
    .on("change", () => colorify(d3.select("#color").property("value")));

  var brushOn = false;
  function toggleBrush() {
    if (brushOn) {
      d3.select("#brush")
        .text("Brush Disabled");
      cell.select('.overlay').remove();
      cell.select('.selection').remove();
    } else {
      d3.select("#brush")
        .text("Brush Enabled");
      cell.call(brush);
    }
    brushOn = !brushOn
  }

  d3.select("#brush")
    .on("click", toggleBrush);

  function toggleZoom() {
    if (isZoom) {
      d3.select("#zoom")
        .text("Zoom Disabled");
    } else {
      d3.select("#zoom")
        .text("Zoom Enabled");
    }
    isZoom = !isZoom;
  }

  d3.select("#zoom")
    .on("click", toggleZoom);

  function reset() {
    x.domain(domainByTrait[xval]);
    y.domain(domainByTrait[yval]);
    cell.select('.overlay').remove();
    cell.select('.selection').remove();
    var t = svg.transition().duration(750);
    svg.select(".x.axis").transition(t).call(xAxis);
    svg.select(".y.axis").transition(t).call(yAxis);
    svg.selectAll("circle").transition(t)
        .attr("cx", function(d) { return x(d[xval]); })
        .attr("cy", function(d) { return y(d[yval]); });
    svg.selectAll(".hidden").classed("hidden", false);
  }

  d3.select("#reset")
    .on("click", reset);
  
  var selectedData = [];

  function barchart() {
    build(selectedData, svg2, x2, y2, margin2, width2, height2, color, div);
  }

  d3.select("#barChart")
    .on("click", barchart);

  var brushCell;

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brushCell !== this) {
      brush.extent();
      d3.selectAll(".selection").style('opacity', 1);
      d3.select('brushCell').selectAll('.selection').style('opacity', 0);
      brushCell = this;
    }
  }

  var curp;
  // Highlight the selected circles.
  function brushmove(p) {
    var e = d3.event.selection;
    if (p != curp) {
      if (!single) {
        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);
      } else {
        x.domain(domainByTrait[xval]);
        y.domain(domainByTrait[yval]);
      }
      curp = p;
    }
    svg.selectAll("circle").classed("hidden", function(d) {
      if (!single) {
        return e[0][0] > x(d[p.x]) || x(d[p.x]) > e[1][0]
            || e[0][1] > y(d[p.y]) || y(d[p.y]) > e[1][1];
      } else {
        return e[0][0] > x(d[xval]) || x(d[xval]) > e[1][0]
            || e[0][1] > y(d[yval]) || y(d[yval]) > e[1][1];
      }
    });
  }

  function zoom(e) {
    x.domain([e[0][0], e[1][0]].map(x.invert, x));
    y.domain([e[1][1], e[0][1]].map(y.invert, y));
    cell.select('.overlay').remove();
    cell.select('.selection').remove();
    var t = svg.transition().duration(750);
    svg.select(".x.axis").transition(t).call(xAxis);
    svg.select(".y.axis").transition(t).call(yAxis);
    svg.selectAll("circle").transition(t)
        .attr("cx", function(d) { return x(d[xval]); })
        .attr("cy", function(d) { return y(d[yval]); });
  }

  // If the brush is empty, select all circles.
  function brushend() {
    var e = d3.event.selection;
    if (!isZoom) {
      if (!e) {
        svg.selectAll(".hidden").classed("hidden", false);
      } else {
        var selectedNodes = svg.selectAll("circle").filter(function(d) {
          return this.style.opacity != "0" && (e[0][0] < x(d[xval]) && x(d[xval]) < e[1][0]
              && e[0][1] < y(d[yval]) && y(d[yval]) < e[1][1]);
        });
        // These are the nodes that are selected
        selectedData = selectedNodes.data();
      }
    } else {
      zoom(e);
    }
  }
});

function cross(a, b) {
  var c = [], n = a.length, m = b.length, i, j;
  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
  return c;
}