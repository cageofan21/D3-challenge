// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "In Poverty";
var chosenYAxis = "Healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(Circledata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Circledata, d => d[chosenXAxis]) * 0.8,
      d3.max(Circledata, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(Circledata, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(Circledata, d => d[chosenYAxis]) * 0.8,
        d3.max(Circledata, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisBottom(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}
//function used for updating text in circles group 
function renderText(circlesTextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesTextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return circlesTextGroup
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // If conditions for X axis
  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty(%)";
  }
  else if (chosenXAxis === "income") {
    var xlabel = "Household Income (Median)";
  }
  else {
    var xlabel = "Age (Median)";
  }
    // If conditions for Y axis
  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare(%)";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokers (%)"
  }
  else {
    var ylabel = "Obesity (%)"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      if (chosenXAxis === "age") {
        return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
        return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
      } else {
        return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
      }
});

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(Circledata, err) {
  if (err) throw err;

  // parse data
  Circledata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.abbr = data.abbr;
  });

  // Create x scale function
  // xLinearScale function above csv import
  var xLinearScale = xScale(Circledata, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(Circledata, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);


  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Circledata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("opacity", ".6");

  var circlesTextGroup = chartGroup.select("g")
  .selectAll("circle")
    .data(Circledata)
    .enter()
    .append("text")
    .text(data => data.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy",-395)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black");


  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var PovertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var AgeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age(Median)");

   var IncomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener.
    .classed("inactive", true)
    .text("Household Income (Median)");



  // append y axis
    var obesitylabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("active", true)
    .text("Obese(%)");

    var smokelabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left)
    .attr("dy", "2em")
    .attr("value", "smokes") // value to grab for event listener.
    .classed("inactive", true)
    .text("Smokes (%)");

    var healthcarelabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left)
    .attr("dy", "3em")
    .attr("value", "healthcare") // value to grab for event listener.
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");

      if (true) {
        if (value === "poverty" || value === "age" || value === "income") {

            // Replaces chosenXAxis with value.
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // Update x scale for new data.
            xLinearScale = xScale(Circledata, chosenXAxis);

            // Updates x axis with transition.
            xAxis = renderXAxes(xLinearScale, xAxis);

            // Changes classes to change bold text.
            if (chosenXAxis === "poverty") {
                PovertyLabel
                    .classed("active", true)
                    .classed("inactive", false);

                AgeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                
                IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "age"){
                PovertyLabel
                    .classed("active", false)
                    .classed("inactive", true);

                AgeLabel
                    .classed("active", true)
                    .classed("inactive", false);

                IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                PovertyLabel
                    .classed("active", false)
                    .classed("inactive", true);

                AgeLabel
                    .classed("active", false)
                    .classed("inactive", true)

                IncomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            };
        
        } 


        // Update circles with new x values.
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // Update tool tips 
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Update circles text with new values.
        circlesTextGroup = renderText(circlesTextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    }
    
});

});


