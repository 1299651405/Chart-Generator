
const localFile = document.getElementById('input');
localFile.addEventListener("change", handleFiles, false);

function handleFiles() {
    const file = this.files[0];

    const reader = new FileReader();
    reader.onload = function (e) {
        gen_chart(d3.csvParse(e.target.result));
    };
    reader.readAsText(file);
}

function example() {
    d3.csv('example.csv').then(function (data) { gen_chart(data); })
}



// set the dimensions and margins of the graph
const margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom,
    innerRadius = 100,
    outerRadius = Math.min(width, height) / 4;   // the outerRadius goes from the middle of the SVG area to the border

// append the svg object to the body of the page

function gen_chart(data) {
    d3.selectAll("svg").remove();

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`); // Add 100 on Y translation, cause upper bars
    // X scale
    const x = d3.scaleBand()
        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0)                  // This does nothing ?
        .domain(data.map(d => d.Category)); // The domain of the X axis is the list of states.

    // Y scale
    const y = d3.scaleLinear()
        .range([innerRadius, outerRadius])   // Domain will be define later.
        .domain([1, 4]); // Domain of Y is from 0 to the max seen in the data

    // Add bars
    svg.append("g")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("fill", "#3366bb")
        .attr("fill-opacity", 0.8)
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(d => y(d['Score']))
            .startAngle(d => x(d.Category))
            .endAngle(d => x(d.Category) + x.bandwidth())
            .padAngle(0.00)
            .padRadius(innerRadius));

    svg.append("g")
        .selectAll("g")
        .data(y.ticks(4).slice(1))
        .join("g")
        .attr("fill", "none")
        .call(g => g.append("circle")
            .attr("stroke", "#333333")
            .attr("stroke-opacity", 0.5)
            .attr("r", y));

    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("text-anchor", function (d) { return (x(d.Category) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("transform", function (d) { return "rotate(" + ((x(d.Category) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (outerRadius + 10) + ",0)"; })
        .append("text")
        .text(function (d) { return (d.Category) })
        .attr("transform", function (d) { return (x(d.Category) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        .style("font-size", "11px")
        .attr("dominant-baseline", "central");

    svg.append("circle").attr('r', innerRadius).attr('fill', '#999999').attr('stroke', '#333333').attr('stroke-opacity', 0.5)
};