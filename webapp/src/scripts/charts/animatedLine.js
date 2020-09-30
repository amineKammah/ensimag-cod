
import dataProcessingUtils from '../dataTreatment/dataProcessingUtils';

class AnimatedLines {
  /*
  * Draws animated lines of the number of shootings the USA per race monthly
  */
  constructor() {
    const button = document.getElementById("resetButton");
    button.addEventListener('click', _ => this.reset())
  }

  reset() {
    this.drawLines();
  }

  loadData() {
    [this.data, this.maxValue, this.beginDate, this.endDate] = dataProcessingUtils.PrepAnimatedLinesData();
    // Labels are the different races
    this.labels = [];
    this.data.forEach(element => {
      this.labels.push(element[0]['Ethnie']);
    });

    // Maps each race to a specific color
    this.colors = {
      "Blanc": "#024E82", "Noir": "#8F8F8F", "Hispanique": "#D55E00",
      "Asiatique": "#000000", "Natif": "#56B4E9", "Autre": "#F0E442"
    };
  }

  render() {
    this.loadData();
    this.drawLines();
  }

  drawLines() {
    var margin = { top: 80, right: 80, bottom: 80, left: 80 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // Scales and axes. Note the inverted domain for the y-scale: bigger is up!
    var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      xAxis = d3.axisBottom(x).tickSize(-height),
      yAxis = d3.axisLeft(y).tickArguments(4);

    // An area generator, for the light fill.
    var area = d3.area()
      .curve(d3.curveMonotoneX)
      .x(function (d) { return x(d.Date); })
      .y0(height)
      .y1(function (d) { return y(d.groupCount); });

    // A line generator, for the dark stroke.
    var line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(function (d) { return x(d.Date); })
      .y(function (d) { return y(d.groupCount); });

    x.domain([this.beginDate, this.endDate]);
    y.domain([0, this.maxValue]).nice();

    // Add an SVG element with the desired dimensions and margin.
    var svg = d3.select("#svglines")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Add the clip path.
    svg.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // Add the x-axis.
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + height + ")")
      .call(xAxis);

    // Add the y-axis.
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0, 0)")
      .call(yAxis);

    svg.selectAll('.line')
      .data(this.data)
      .enter()
      .append('path')
      .attr('class', 'line')
      .style('stroke', d => this.colors[d[0]["Ethnie"]])
      .attr('clip-path', 'url(#clip)')
      .attr('d', function (d) {
        return line(d);
      })

    /* Add 'curtain' rectangle to hide entire graph */
    var curtain = svg.append('rect')
      .attr('x', -1 * width)
      .attr('y', -1 * height)
      .attr('height', height)
      .attr('width', width)
      .attr('class', 'curtain')
      .attr('transform', 'rotate(180)')
      .style('fill', '#E9ECEF');

    /* Optionally add a guideline */
    var guideline = svg.append('line')
      .attr('stroke', '#333')
      .attr('stroke-width', 0)
      .attr('class', 'guide')
      .attr('x1', 1)
      .attr('y1', 1)
      .attr('x2', 1)
      .attr('y2', height)

    /* Create a shared transition for anything we're animating */
    var t = svg.transition()
      .delay(750)
      .duration(6000)
      .ease(d3.easeLinear)
      .on('end', function () {
        d3.select('line.guide')
          .transition()
          .style('opacity', 0)
          .remove()
      });

    t.select('rect.curtain')
      .attr('width', 0);
    t.select('line.guide')
      .attr('transform', 'translate(' + width + ', 0)')

    d3.select("#show_guideline").on("change", function (e) {
      guideline.attr('stroke-width', this.checked ? 1 : 0);
      curtain.attr("opacity", this.checked ? 0.75 : 1);
    })

    var lineLegend = svg.selectAll(".lineLegend").data(this.labels)
      .enter().append("g")
      .attr("class", "lineLegend")
      .attr("transform", function (d, i) {
        return "translate(" + width + "," + (i * 20) + ")";
      });

    lineLegend.append("text").text(function (d) { return d; })
      .attr("transform", "translate(15,9)"); //align texts with boxes

    lineLegend.append("rect")
      .attr("fill", (race, _) => this.colors[race])
      .attr("width", 10).attr("height", 10);
  }

}

new AnimatedLines().render();