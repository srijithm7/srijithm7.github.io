function formatData(d) {
  return {
    Year: parseInt(d.Year),
    Round: parseInt(d.Round),
    Season: parseInt(d.Season),
    HomeTeam: d.HomeTeam,
    Score: d.Score,
    AwayTeam: d.AwayTeam,
    Win: d.Win,
    WinCountry: d.WinCountry
  }
}

// Plot bar chart and line charts
var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  },
  width = 700,
  height = 600;
var masterdata;
var dataset;
var teams;
var svg;
var g;
var bar;
var xScale;
var yScale;
var linechart;
var circleChart;
var year = 0;
d3.csv("https://raw.githubusercontent.com/srijithm7/filearchive/master/master_data.csv", formatData)
  .then((data) => {
    masterdata = data;

    teams = d3.map(data, function(d) {
      return d.Win;
    }).keys();

    update_barchart(0);
    // axis-x
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + (height - 100) + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("font-size", "12px")
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");

    // axis-y
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(yScale));
  });

function update_barchart(value) {
  // summary data
  dataset = [];
  var wins;
  teams.forEach((team) => {
    if (value > 0) {
      wins = masterdata.filter((d) => {
        return d.Win == team && d.Year == value;
      });
    } else {
      wins = masterdata.filter((d) => {
        return d.Win == team;
      });
    }
    var country = wins[0].WinCountry;
    dataset.push([team, country, wins.length])
  })
  var rankingDS = dataset.slice().sort(function(a, b) {
    return b[2] - a[2]
  });

    dataset = dataset.map((d, i) => {
    var rank = rankingDS.indexOf(d);
    return [
      d[0],
      d[1],
      d[2],
      10 - rank
    ];
  })

  xScale = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1)
    .domain(dataset.map(function(d) {
      return d[0];
    }));
  yScale = d3.scaleLinear()
    .rangeRound([height - 100, 0])
    .domain([0, d3.max(dataset, (function(d) {
      return d[3];
    }))]);

  svg = d3.select("body").select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  bar = g.selectAll("rect")
    .data(dataset)
    .enter().append("g");

  // bar chart
  bar.append("rect")
    .attr("x", function(d) {
      return xScale(d[0]);
    })
    .attr("y", function(d) {
      return height - 100;
    })
    .attr("width", xScale.bandwidth())
    .attr("class", function(d) {
      var s = "bar ";
      if (d[1] == "New Zealand") {
        return s + "bar1";
      } else if (d[1] == "Australia") {
        return s + "bar2";
      }
    })
    .on("mouseover", function(d) {

      //Get this bar's x/y values, then augment for the tooltip
      var xPosition = xScale(d[0]) + 300;
      var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;

      //Update the tooltip position and value
      d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#team")
        .text(d[0] + " (" + d[1] + ")");

        var ranking = 11 - d[3];
      d3.select("#rank")
        .text(ranking);
        d3.select("#win")
          .text(d[2]);

      //Show the tooltip
      d3.select("#tooltip").classed("hidden", false);

    })
    .on("mouseout", function() {

      //Hide the tooltip
      d3.select("#tooltip").classed("hidden", true);

    })
    .attr("height", 0)
    .transition()
    .duration(1000)
    .delay(function(d, i) {
      return i * 50;
    })
    .attr("y", function(d) {
      return yScale(d[3]);
    })
    .attr("height", function(d) {
      return (height - 100) - yScale(d[3]);
    });

  bar.append("text")
    .attr("x", function(d) {
      return xScale(d[0]) + xScale.bandwidth() / 2;
    })
    .attr("y", function(d) {
      return height - 100;
    })
    .transition()
    .duration(1500)
    .attr("dy", "1.3em")
    .attr("x", function(d) {
      return xScale(d[0]) + xScale.bandwidth() / 2;
    })
    .attr("y", function(d) {
      return yScale(d[3]);
    })
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .attr("fill", "black")
    .text(function(d) {
      return 11 - d[3];
    });
}

// Plot line charts
d3.selectAll("input[name='year']").on("change", function() {
  bar.remove();
  year = this.value;
  update_barchart(this.value);
  if (typeof linechart != 'undefined') {
    linechart.remove();
    circleChart.remove();
    document.querySelector('input[name="season"]:checked').checked = false;
  }
});

d3.selectAll("input[name='season']").on("change", function() {
  // line chart early
  if (typeof linechart != 'undefined') {
    linechart.remove();
    circleChart.remove();
  }
  var wins;
  dataset = dataset.map((data, i) => {
    if (year == 0) {
      wins = masterdata.filter((d) => {
        return d.Win == data[0] && d.Season == this.value;
      });
    } else {
      wins = masterdata.filter((d) => {
        return d.Win == data[0] && d.Season == this.value && d.Year == year;
      });
    }


    return [
      data[0],
      data[1],
      data[2],
      wins.length
    ];
  })

  var rankingDS = dataset.slice().sort(function(a, b) {
    return b[3] - a[3]
  });

  dataset = dataset.map((d, i) => {
    var rank = rankingDS.indexOf(d);
    return [
      d[0],
      d[1],
      d[2],
      10 - rank
    ];
  })

  line = d3.line()
    .x(function(d, i) {
      return xScale(d[0]) + xScale.bandwidth() / 2;
    })
    .y(function(d) {
      return yScale(d[3]);
    })
    .curve(d3.curveMonotoneX);

  linechart = bar.append("path")
    .attr("id", "line")
    .attr("class", "line1") // Assign a class for styling
    .attr("d", line(dataset)); // 11. Calls the line generator

  circleChart = bar.data(dataset).append("circle") // Uses the enter().append() method
    .attr("class", "dot1") // Assign a class for styling
    .attr("cx", function(d, i) {
      return xScale(d[0]) + xScale.bandwidth() / 2;
    })
    .attr("cy", function(d) {
      return yScale(d[3]);
    })
    .attr("r", 5);
});
