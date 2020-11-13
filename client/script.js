function selectAndAppendElement(elementId, margin, width, height) {
    return d3.select(`#${elementId}`)
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
}

function setXAxis(data, width) {
    return d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.date; }))
            .range([ 0, width ]);
}

function setYAxis(data, height, elementId) {
    let modifierHigh = 1;
    let modifierLow = 0.9;
    if (elementId !== 'month') {
        modifierHigh = 1.2;
        modifierLow = 0.9;
    }
    if (elementId === 'week') {
        modifierHigh = 1;
        modifierLow = 0.99;
    }
    return d3.scaleLinear()
            .domain([d3.min(data, function(d) { return (+d.value*modifierLow)}), d3.max(data, function(d) { return (+d.value*modifierHigh); })])
            .range([ height, 0 ]);
}

function addTrendline(svgElement, data, x, y, type, heightGraph, widthGraph) {
    const startEndValues = data.filter((element, index, array) => index === 0 || index === array.length - 1); 
    const profitPercentage = calculatePercentage(startEndValues[0].value, startEndValues[1].value);

    const trendTextColor = type ==='personal' ? '#00a383ff' : '#7A0000';
    let trendTextX;
    let trendTextY = 100;

    if (window.innerWidth < 876) {
        trendTextX = 0;
        trendTextY = type === 'personal' ? 100 : 300;
    } else {
        trendTextX = type === 'personal' ? (0 + (widthGraph / 25)) : (widthGraph - (widthGraph / 4));
        trendTextY = 100;
    }
    
    // Add the trendline
     svgElement
            .append("path")
            .datum(startEndValues)
            .attr("fill", "none")
            .attr("stroke", "#858585ff")
            .attr("stroke-dasharray", "12")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.value) })
            );

    svgElement.append("text")
            .attr("x", trendTextX)             
            .attr("y", trendTextY) 
            .style("font-size", `${heightGraph / 4}px`) 
            .style("font-family", "sans-serif")
            .style("stroke", trendTextColor) 
            .style("stroke-width", "2px")
            .style("fill", "none")  
            .style("opacity", 0.75)  
            .text(`${profitPercentage >= 0 ? '+' : ''}${profitPercentage}%`)
}

function calculatePercentage(startValue, endValue) {
    return Math.floor(((startValue / endValue) * 100) - 100);
}

function addPerformanceLine(svgElement, data, x, y, lineColor) {
    svgElement.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", lineColor)
            .attr("stroke-width", 1)
            .attr("class", "line-graph")
            .attr("d", 
                d3.line()
                    .x(function(d) { return x(d.date) })
                    .y(function(d) { return y(d.value) })
                );

    svgElement.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 8)
        .attr("class", "neon")
        .style("opacity", 0.2)
        .attr("d", 
            d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d.value) })
        );
}


function filterOnLastDays(data, type) {
    switch(type) {
        case 'one-year':
            return data.slice(0, 365);
            break;
        case 'half-year':
            return data.slice(0, 183);
            break;
        case 'month':
            return data.slice(0, 30);
            break;
        case 'week':
            return data.slice(0, 7);
            break;
        default:
            return data;
    }
}

function draw(elementId) { 
    // set the dimensions and margins of the graph
    var margin = {top: 50, right: 30, bottom: 30, left: 60},
        width = window.innerWidth - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    // append the svg object to the body of the page
    var svg = selectAndAppendElement(elementId, margin, width, height);

            //Read the data
    d3.csv("./data/personal.csv",

        // When reading the csv, I must format variables:
        function(d){
            return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
        },

        // Now I can use this dataset:
        function(dataPersonal) {
            let initialValuePersonal;
            dataPersonal = filterOnLastDays(dataPersonal, elementId)
            initialValuePersonal = dataPersonal[dataPersonal.length - 1].value;
        // Add X axis --> it is a date format
        var x = setXAxis(dataPersonal, width);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis")
            .call(d3.axisBottom(x));

        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("fill", "white")  
            .text((elementId.charAt(0).toUpperCase() + elementId.slice(1)).replace('-', ' ') + ' performance');
        // Add Y axis
        var y = setYAxis(dataPersonal, height, elementId);
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));
        // Add the line
        addPerformanceLine(svg, dataPersonal, x, y, "#00a383ff");
        
        // Add the trendline
        addTrendline(svg, dataPersonal, x, y, 'personal', height, width);

        d3.csv("./data/spy.csv",

            // When reading the csv, I must format variables:
            function(d){
                return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
            },

            function(dataSPY) {
                let initialValueSPY;
                let amountSharesSPY;
                dataSPY = filterOnLastDays(dataSPY, elementId)
                initialValueSPY = dataSPY[dataSPY.length -1].value;
                amountSharesSPY = Math.floor(initialValuePersonal / initialValueSPY);
                dataSPY = dataSPY.map(function(dataSPY) {
                    dataSPY.value *= amountSharesSPY;
                    return dataSPY;
                })

                // Add the line                        
                addPerformanceLine(svg, dataSPY, x, y, "#7A0000");
                // Add the trendline
                addTrendline(svg, dataSPY, x, y, 'spy', height, width);
            }
        );  
    });
}

function start() {
    draw('four-years');
    draw('one-year');
    draw('half-year');
    draw('month');
    draw('week');
}

function reset() {
    const elements = ["four-years", "one-year", "half-year", "month", "week"];
    elements.forEach((elementName) => {
        const element = document.getElementById(elementName);
        element.removeChild(element.childNodes[0]);
    })
    start();
}

start();
window.onresize = reset;