function drawLines() {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 860 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#animatedLine")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("animatedLineRace.csv", function(data) {

      // group the data: I want to draw one line per group
      var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.Ethnie;})
        .entries(data);
      // console.log(sumstat)
      // Add X axis --> it is a date format
      var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.Mois; }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.nTirs; })])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // color palette
      var res = sumstat.map(function(d){ return d.key }) // list of group names
      var color = d3.scaleOrdinal()
        .domain(res)
        .range(['#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

      // Prepare the lines
      var linePaths = svg.selectAll(".line")
          .data(sumstat)
          .enter()
          .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
              return d3.line()
                .x(function(d) { return x(d.Mois); })
                .y(function(d) { return y(+d.nTirs); })
                (d.values)
            });

      var linePathLength = linePaths.node().getTotalLength() * 2; // LIGNE 20
        linePaths
            .attr("stroke-dasharray", linePathLength)
            .attr("stroke-dashoffset", linePathLength)
            .transition()
                .duration(80000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);

    })
}