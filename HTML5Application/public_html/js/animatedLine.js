
import { shootings_df, race_df } from './dataLoader';

function init() {
  const button = document.getElementById("resetButton");
  button.addEventListener('click', e => drawLines())
}

function getPerRaceData() {
  const races = shootings_df.unique('Ethnie').toArray().flat();

  let selectDf = shootings_df.select('Annee', 'Mois', 'Ethnie');
  selectDf = selectDf.cast('Annee', String);
  selectDf = selectDf.cast('Mois', String);
  selectDf = selectDf.withColumn('Date', row => new Date(row.get('Mois') + "/01/" + row.get("Annee")));
  selectDf = selectDf.groupBy('Date', 'Ethnie').aggregate(group => group.count()).rename('aggregation', 'groupCount')

  const USracePct = race_df.filter(row => row.get('Code Etat') == 'US').toCollection()[0];

  // Divide by race percentage in the US
  selectDf = selectDf.map(row => row.set('groupCount', row.get('groupCount') / USracePct[row.get('Ethnie')]))
  const maxShootings = selectDf.stat.max('groupCount');

  const perRaceData = []
  for (const race of races) {
    perRaceData.push(selectDf.filter(row => row.get("Ethnie") == race).toCollection());
  }

  return [perRaceData, maxShootings]
}

function drawLines() {
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


  const [perRaceData, maxShootings] = getPerRaceData();
  const labels = [];
  perRaceData.forEach(element => {
    labels.push(element[0]['Ethnie']);
  });

  // Compute the minimum and maximum date, and the maximum price.
  x.domain([perRaceData[0][0].Date, perRaceData[0][perRaceData[0].length - 1].Date]);
  y.domain([0, maxShootings]).nice();

  // Add an SVG element with the desired dimensions and margin.
  var svg = d3.select("svg")
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


  var colors_generator = d3.scaleOrdinal(d3.schemeCategory10);
  const colors = {};
  labels.forEach(race => {
    colors[race] = colors_generator(Math.random() * 50)
  });
  svg.selectAll('.line')
    .data(perRaceData)
    .enter()
    .append('path')
    .attr('class', 'line')
    .style('stroke', d => colors[d[0]["Ethnie"]])
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
    .style('fill', '#ffffff');

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


  var lineLegend = svg.selectAll(".lineLegend").data(labels)
      .enter().append("g")
      .attr("class","lineLegend")
      .attr("transform", function (d,i) {
              return "translate(" + width + "," + (i*20)+")";
          });

  lineLegend.append("text").text(function (d) {return d;})
      .attr("transform", "translate(15,9)"); //align texts with boxes

  lineLegend.append("rect")
      .attr("fill", (race, _)  => colors[race])
      .attr("width", 10).attr("height", 10);
}

init();
drawLines();
