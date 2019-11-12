/**
 * Call our functions on window load event
 */
window.onload = function(){
    setup();
};

/**
 * Global variables
 */
var _vis;
const MARGINS = {top:10, bottom: 60, left:60, right:10};
const STACKVALUES = ["HP", "Attack", "Defense", "SpAtk", "SpDef", "Speed"];
const COLOURORDINAL = ["#fcf11c", "#ffba19", "#ff8046", "#ff496e", "#e52991", "#9e32a8"];

/**
 * Function setup: sets up our visualization environment.
 * You can change the code to not have static paths and elementID's
 */
function setup(){
    _vis = new stackedBarChart();
    _vis.svgContainer = d3.select("#vis");
    let w = _vis.svgContainer.node().getBoundingClientRect().width;
    let h = _vis.svgContainer.node().getBoundingClientRect().height;

    if(w !== undefined)
        _vis.width = w;

    if(h !== undefined)
        _vis.height = h;

    d3.select("#vis").append("div").attr("class", "tooltip").attr("id", "tooltip")
        .append("div").attr("class", "tooltip-text").attr("id", "tooltip-t");

    loadData();
}

/**
 * All credit to https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * for this code snippet
 * @param array: array that is to be shuffled
 * @returns array: the shuffled array
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 * Function loadData: loads data from a given CSV file path/url
 * @param path string location of the CSV data file
 */
function loadData(){
    d3.csv("Pokemon.csv", function(d) {
        return {
            name: d.Name,
            total: d.Total,
            hp: d.HP,
            attack: d.Attack,
            defense: d.Defense,
            spAttack: d.SpAtk,
            spDefense: d.SpDef,
            speed: d.Speed,
            generation: d.Generation
        };
    }).then(function(data) {
        shuffle(data);
        _vis.data = data.slice(0, 8); // take 8 random items from the data
        console.log(_vis.data);
        var keys = Object.keys(_vis.data[0]).filter(filterStackedValues);
        var stack = d3.stack()
            .keys(keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);
        _vis.series = stack(_vis.data);
        _vis.setupScales();
        _vis.renderLegend();
        _vis.update();
    });


}

function filterStackedValues(value) {
    return !(value === 'name' || value === 'total' || value === 'generation');
}

var stackedBarChart = function() {
    this.data;
    this.series;
    this.width = 800;
    this.height = 500;
    this.svgContainer;
    this.toolTip;
    this.datapoints;
    this.xAxis;
    this.yAxis;
    this.xAxisScale;
    this.yAxisScale;
    this.ordinalColoredScale;

    this.setupScales = function () {
        var xLabel = "Sampled Pokemon";
        var yLabel = "Sum of Stats";

        this.ordinalColoredScale = d3.scaleOrdinal()
            .domain(STACKVALUES)
            .range(COLOURORDINAL);

        this.xAxisScale = d3.scaleBand()
            .range([MARGINS.left, this.width - MARGINS.right - 150])
            .padding(.4);

        this.yAxisScale = d3.scaleLinear()
            .rangeRound([_vis.height - MARGINS.bottom, MARGINS.top]);

        this.svgContainer.append("g")
            .attr("transform", `translate(0,${_vis.height - MARGINS.bottom})`)
            .attr("class", "x-axis");

        this.svgContainer.append("g")
            .attr("transform", `translate(${MARGINS.left}, 0)`)
            .attr("class", "y-axis");

        this.svgContainer.append("text")
            .attr("x", MARGINS.left)
            .attr("y", (this.height) / 2)
            .attr("transform", `rotate(-90, ${MARGINS.left / 3}, ${this.height / 2})`)
            .style("text-anchor", "middle")
            .text(yLabel);

        this.svgContainer.append("text")
            .attr("x", (this.width + MARGINS.left - 150) / 2)
            .attr("y", (this.height - MARGINS.top))
            .style("text-anchor", "middle")
            .text(xLabel);
    }

    this.renderLegend = function () {
        var legend = _vis.svgContainer.selectAll(".legend")
            .data(_vis.ordinalColoredScale.domain().slice())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 24 + ")";
            });

        legend.append("rect")
            .attr("class", "rect")
            .attr("x", _vis.width * .95)
            .attr("y", 1)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", _vis.ordinalColoredScale);

        legend.append("text")
            .attr("x", (_vis.width * .95) - 10)
            .attr("y", 11)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) {
                return d;
            });
    }

    this.update = function () {
        var xDomain = [this.data[0].name, this.data[1].name, this.data[2].name, this.data[3].name,
            this.data[4].name, this.data[5].name, _vis.data[6].name, _vis.data[7].name];
        this.yAxisScale.domain([0, 800]);
        _vis.svgContainer.selectAll(".y-axis")
            .call(d3.axisLeft(this.yAxisScale).ticks(null, "s"));

        this.xAxisScale.domain(xDomain);
        _vis.svgContainer.selectAll(".x-axis")
            .call(d3.axisBottom(this.xAxisScale).tickSizeOuter(0));

        var group = _vis.svgContainer.selectAll("g.layer")
            .data(_vis.series, d => d.key);

        group.exit().remove();

        group.enter().append("g")
            .classed("layer", true)
            .attr("fill", d => this.ordinalColoredScale(d.key));

        var bars = _vis.svgContainer.selectAll("g.layer").selectAll("rect")
            .data(d => d, e => e.data.Name);

        bars.exit().remove();

        bars.enter().append("rect")
            .attr("width", this.xAxisScale.bandwidth())
            .merge(bars)
            .transition().duration(0)
            .attr("x", d => this.xAxisScale(d.data.name))
            .attr("y", d => this.yAxisScale(d[1]))
            .attr("height", d => this.yAxisScale(d[0]) - this.yAxisScale(d[1]))
            .attr('pointer-events', 'all');

        _vis.svgContainer.selectAll("g.layer").selectAll("rect")
            .append("svg:title")
            .text(d => d[1] - d[0]);

    }
}