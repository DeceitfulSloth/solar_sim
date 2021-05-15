/* TASK: Retrieve the node of the div element declared within the index.html by its identifier */
var visContainerNode = d3.select("#vis-container");

// Specify margins such that the visualization is clearly visible and no elements are invisible due to the svg border
var margins = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 50
};

// Specify the width and height of the svg as well as the width height of the viewport of the visualization.
var width = 800;
var height = 400;
var visWidth = width - margins.left - margins.right;
var visHeight = height - margins.top - margins.bottom;

/* TASK: Append an svg element to the vis-container, set its width and height (in pixels), add it to the vis-container, and save the element to variable called 'svg' */
var svg = visContainerNode.append("svg").attr("width", width).attr("height", height);

// TASK: Add a group element to the svg to realize the margin by translating the group, and save the element to variable called 'viewport'.
var viewport = svg.append("g").attr("transform", "translate(" + margins.left + "," + margins.top + ")");


// We use the d3.dsv method, which uses the fetchAPI internally, to retrieve the data
d3.dsv(";", "pr_1991_2015.csv", function(d) {
    return {
        month: parseInt(d.Month),
        year: parseInt(d.Year),
        rain: parseFloat(d.pr),
        temperature: parseFloat(d.tas)
    };
}).then(function(data) {
    console.log("Raw Data:", data);

    // Data Preparation: For each year we want the average rain and temperature
    // TASK: Use d3.nest() to group the data entries by year (see https://github.com/d3/d3-collection/blob/master/README.md#nest)
    var dataByYears = d3.nest()
        .key(function(d) { return d.year; }).sortKeys(d3.ascending)
        .entries(data);
    console.log("Data Grouped by Years:", dataByYears);

    // We intialize an empty array 'avgData' which will hold the average values and the respective years
    var avgData = [];

    // TASK: iterate through the data by years and use the d3.mean() function to calculate the mean values of temperature and rainfall for each year
    // Similarly to Ex. 1: Push one object for each year onto the 'avgData' array
    dataByYears.forEach(function(d) {
        avgData.push({
            year: parseInt(d.key),
            temperature: d3.mean(d.values.map(function(t) { return t.temperature; })),
            rain: d3.mean(d.values.map(function(t) { return t.rain; }))
        });
    });
    console.log("Average Data per Year:", avgData);

    // TASK: Initialize Scales using d3.linearScale function (see https://github.com/d3/d3-scale/blob/master/README.md#continuous-scales)
    // You can make use of the d3.extent and d3.max function to calculate the domains. (see https://github.com/d3/d3-array/blob/master/README.md#statistics)
    var x = d3.scaleLinear().domain(d3.extent(avgData.map(function(d) { return d.year }))).range([0, visWidth]);
    var yRain = d3.scaleLinear().domain([0, d3.max(avgData.map(function(d) { return d.rain}))]).range([visHeight, 0]);
    var yTemp = d3.scaleLinear().domain([0, d3.max(avgData.map(function(d) { return d.temperature }))]).range([visHeight, 0]);

    // In order to organize our code, we add another group which will hold all elements (circles and paths) of the visualization
    var visualization = viewport.append("g");
    var circles = visualization.selectAll("circle")
        .data(avgData).enter();

    console.log("Entered Data:", circles);

    // TASK: Append one blue circle for each rain data point. Make use of the previously initialized scales and anonymous functions.
    circles
        .append("circle")
        .attr("class", "dot-rain")
        .attr("r", 2.5)
        .attr("cx", function(d) { return x(d.year); })
        .attr("cy", function(d) { return yRain(d.rain); })
        .attr("fill", "blue");

    // TASK: Append one red circle for each tempera data point. Make use of the previously initialized scales and anonymous functions.
    circles
        .append("circle")
        .attr("class", "dot-temp")
        .attr("r", 2.5)
        .attr("cx", function(d) { return x(d.year); })
        .attr("cy", function(d) { return yTemp(d.temperature); })
        .attr("fill", "red");

    // TASK: Initialize a line generator for each line (rain and temperature) and define the generators x and y value.
    // Save the line-generator to a variable
    var rainLine = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return yRain(d.rain); });

    var tempLine = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return yTemp(d.temperature); });

    // TASK: Append two path elements to the 'visualization' group. Set its 'd' attribute respectively using the linegenerators from above
    // Do not forget to set the correct class attributes in order to have the stylesheet applied (.line-temp, .line-rain, .line)
    visualization.append("path")
        .datum(avgData)
        .attr("class", "line line-rain")
        .attr("d", rainLine);
    visualization.append("path")
        .datum(avgData)
        .attr("class", "line line-temp")
        .attr("d", tempLine);

    // At this point we have similar state as in Exercise 1

    // Lets add some axis (check https://github.com/d3/d3-axis for an example)
    var axisG = viewport.append("g");

    // Add X Axis for years
    axisG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + visHeight + ")")
        .call(d3.axisBottom(x)); // Create an axis component with d3.axisBottom

    // TASK: append a group for the axis of the temperature on the left side (d3.axisLeft)
    axisG.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yTemp));

    // TASK: append a group for the axis of the rain on the right side (d3.axisRight)
    axisG.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + visWidth + ", 0)")
        .call(d3.axisRight(yRain));

    // TASK: append three text elements to the axisG group and label the axes respectively
    axisG.append("text").text("Temperature").attr("x", -50).attr("y", -5).attr("fill", "red");
    axisG.append("text").text("Rain").attr("x", visWidth-10).attr("y", -5).attr("fill", "blue");
    axisG.append("text").text("Years").attr("x", visWidth/2).attr("y", visHeight+30);
});