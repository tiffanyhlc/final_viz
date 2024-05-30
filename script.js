// Load the data
const cities = ['CLT', 'CQT', 'IND', 'JAX', 'MDW', 'PHL', 'PHX'];
const cityNames = {
    CLT: 'Charlotte, North Carolina',
    CQT: 'Los Angeles, California',
    IND: 'Indianapolis, Indiana',
    JAX: 'Jacksonville, Florida',
    MDW: 'Chicago, Illinois',
    PHL: 'Philadelphia, Pennsylvania',
    PHX: 'Phoenix, Arizona'
};
const promises = cities.map(city => d3.csv(`Weather_Data/${city}.csv`));

// Parsing date and setting up the chart dimensions
const parseDate = d3.timeParse("%Y-%m-%d");

Promise.all(promises).then(data => {
    // Combine all city data into one dataset
    const allData = {};
    data.forEach((cityData, i) => {
        const city = cities[i];
        cityData.forEach(d => {
            d.date = parseDate(d.date);
            d.actual_mean_temp = +d.actual_mean_temp;
            d.actual_min_temp = +d.actual_min_temp;
            d.actual_max_temp = +d.actual_max_temp;
        });
        allData[city] = cityData;
    });

    // Set up SVG dimensions
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add a title element
    const title = svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text("Weather");

    // Set up scales
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Set up axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // Set up line generators
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.actual_mean_temp));

    // Create axis elements
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`);

    svg.append("g")
        .attr("class", "y axis");

    // Add x-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .text("Mean Temperature (°F)");

    // Function to update the chart
    function update(city) {
        const data = allData[city];
        
        // Update title
        title.text(`Weather for ${cityNames[city]}`);
        
        // Update domains
        x.domain(d3.extent(data, d => d.date));
        y.domain(d3.extent(data, d => d.actual_mean_temp));
        
        // Update axes
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        // Bind data to the line
        const path = svg.selectAll(".line")
            .data([data]);

        // Update the path
        path.enter().append("path")
            .attr("class", "line")
          .merge(path)
            .transition()
            .duration(750)
            .attr("d", line);

        // Remove old paths
        path.exit().remove();
    }

    // Initial update with the first city
    update(cities[0]);

    // Dropdown menu for selecting city
    const select = d3.select("#city-selector")
        .on("change", function() {
            const city = this.value;
            update(city);
        });

    select.selectAll("option")
        .data(cities)
      .enter().append("option")
        .attr("value", d => d)
        .text(d => cityNames[d]);
});
