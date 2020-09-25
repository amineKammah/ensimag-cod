var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#animatedLine")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var xLine = d3.scaleBand()
    .range([0, 800])
    .padding(0.1);
var yLine = d3.scaleLinear()
    .range([100, 0]);
var line = d3.line()
    .x(d => xLine(d.year))
    .y(d => yLine(d.n));
var data = d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered.csv", function(data) {

    xLine.domain(data.map(d => d.year));
    yLine.domain(d3.extent(data, d => d.n));
    var linePath = svg.append("path")
        .datum(data)
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "#3498db")
        .style("stroke-width", "1px")
        .attr("transform", "translate(150, 0)");

    var linePathLength = linePath.node().getTotalLength(); // LIGNE 20
    linePath
        .attr("stroke-dasharray", linePathLength)
        .attr("stroke-dashoffset", linePathLength)
        .transition()
            .duration(4000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
});