let WINDOW_INNER_WIDTH;
let IS_TOOLBAR_ACTIVE = false;
const ELEMENTS = ["four-years", "one-year", "half-year", "month", "week", "four-years-individual", "one-year-individual", "half-year-individual", "month-individual", "week-individual"];

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
            // .domain([d3.min(data, function(d) { return (+d.value*modifierLow)}), d3.max(data, function(d) { return (+d.value*modifierHigh); })])
            .domain([d3.min(data, function(d) { return 0}), d3.max(data, function(d) { return (+d.value*modifierHigh); })])
            .range([ height, 0 ]);
}

function addTrendline(svgElement, data, x, y, type, heightGraph, widthGraph) {
    const startEndValues = data.filter((element, index, array) => index === 0 || index === array.length - 1); 
    const profitPercentage = calculatePercentage(startEndValues[0].value, startEndValues[1].value);

    const trendTextColor = type ==='personal' ? '#00A383FF' : '#7A0000';
    let trendTextX = type === 'personal' ? 0 : widthGraph - 300;
    let trendTextY = 50;
    
    // Add the trendline
     svgElement
        .append("path")
        .datum(startEndValues)
        .attr("fill", "none")
        .attr("stroke", "#858585FF")
        .attr("stroke-dasharray", "12")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
        );
}

function calculatePercentage(startValue, endValue) {
    return Math.floor(((endValue / startValue) * 100) - 100);
}

function addPerformanceLine(svgElement, data, x, y, lineColor, type) {
    const path = svgElement.append("path")
            .datum(data)
            .attr("d", 
                d3.line()
                    .x(function(d) { return x(d.date) })
                    .y(function(d) { return y(d.value) })
                );
    const pathTotalLength = path.node().getTotalLength();


    let stockText = svgElement.append("text")
        .attr("x", window.innerWidth / 2)             
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")  
        .style("font-family", "sans-serif")
        .style("opacity", 0.5)
        .style("font-size", window.innerWidth / 4) 
        .style("fill", "white");

    let profitText = svgElement.append("text")
        .attr("x", window.innerWidth / 3)             
        .attr("y", "80%") 
        .style("font-size", window.innerWidth / 8) 
        .style("font-family", "sans-serif")
        .style("webkitTextStroke", "2px green")
        .style("text-align", "center")
        .style("pointer-events", "none")
        .style("stroke", lineColor) 
        .style("stroke-width", "2px")
        .style("fill", lineColor)  
        .style("opacity", 0.9);

    function showTicker() {
        stockText.text(data[0].symbol);
        profitText.text(`${calculatePercentage(data[0].value, data[data.length - 1].value)  > 0 ? '+' : ''}${calculatePercentage(data[0].value, data[data.length - 1].value)}%`);
        path.attr("stroke-width", 8);
        stockText.style("display", "block");
        profitText.style("display", "block");
        IS_TOOLBAR_ACTIVE = true;
    }

    function hideTicker() {
        IS_TOOLBAR_ACTIVE = false;  
        path.attr("stroke-width", 4); 
        stockText.style("display", "none");
        profitText.style("display", "none");
    }

    path.attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 4)
        .attr("stroke-dasharray", `${pathTotalLength} ${pathTotalLength}`)
        .attr("stroke-dashoffset", pathTotalLength)
        .on('mouseover', () => {
            if (!IS_TOOLBAR_ACTIVE) {
                showTicker();
            }
        })
        .on('mouseout', () => {
            if (IS_TOOLBAR_ACTIVE) {
                hideTicker();
            }
        })
        .on('touchstart', () => {
            if (!IS_TOOLBAR_ACTIVE) {
                showTicker();
            }
        }, {passive: true})
        .on('touchend', () => {
            if (IS_TOOLBAR_ACTIVE) {
                hideTicker();
            }
        })
    .transition()
        .duration(4000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    if (type !== 'individual') {
        const glowPath = svgElement.append("path")
        .datum(data)
        .attr("d", 
            d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d.value) })
        );

        glowPath.attr("fill", "none")
            .attr("stroke", lineColor)
            .attr("stroke-width", 12)
            .attr("class", "neon")
            .attr("stroke-dasharray", `${pathTotalLength} ${pathTotalLength}`)
            .attr("stroke-dashoffset", pathTotalLength)
            .style("opacity", 0.2)
            .style("pointer-events", "none")
        .transition()
            .duration(12000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
    }
    return path;   
}


function filterOnLastDays(data, type) {
    switch(type) {
        case 'one-year':
            return data.slice(Math.max(data.length - 365, 1));
            break;
        case 'one-year-individual':
            return data.slice(Math.max(data.length - 365, 1));
            break;
        case 'half-year':
            return data.slice(Math.max(data.length - 183, 1));
            break;
        case 'half-year-individual':
            return data.slice(Math.max(data.length - 183, 1));
            break;
        case 'month':
            return data.slice(Math.max(data.length - 30, 1));
            break;
        case 'month-individual':
            return data.slice(Math.max(data.length - 30, 1));
            break;
        case 'week':
            return data.slice(Math.max(data.length - 7, 1));
            break;
        case 'week-individual':
            return data.slice(Math.max(data.length - 7, 1));
            break;
        default:
            return data;
    }
}

function addPaths(data, svgElement, elementId, x, y) {
    const uniqueSymbols = [... new Set(data.map(({symbol}) => symbol))];
    const paths = [];
    let writtenPortfolio = '| ';
    uniqueSymbols.map((symbolName) => {
        let symbolData = filterOnLastDays(data.filter(({symbol}) => symbol === symbolName), elementId);
        writtenPortfolio = writtenPortfolio + `Symbol: ${symbolData[0].symbol}, Percentage: ${Math.floor(((symbolData[symbolData.length - 1].value/lastValuePersonal)*100))}% | `;
        console.log(writtenPortfolio);
        console.log(data[data.length - 1].value);
        // Add the line
        paths.push({symbol: symbolName, path: addPerformanceLine(svgElement, symbolData, x, y, "#"+((1<<24)*Math.random()|0).toString(16), 'individual')});
    });
    return paths;
}

function draw(elementId) { 
    // set the dimensions and margins of the graph
    var margin = {top: 50, right: 30, bottom: 30, left: 45},
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - margin.bottom;
    // append the svg object to the body of the page
    var svg = selectAndAppendElement(elementId, margin, width, height);
    function generateOverviewGraph() {
    //Read the data
    d3.csv("./data/personal.csv",

        // When reading the csv, I must format variables:
        function(d){
            return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value, symbol: d.symbol }
        },

        // Now I can use this dataset:
        function(dataPersonal) {
            let initialValuePersonal;
            dataPersonal = filterOnLastDays(dataPersonal, elementId)
            initialValuePersonal = dataPersonal[0].value;
            lastValuePersonal = dataPersonal[dataPersonal.length -1].value;
            console.log(lastValuePersonal = dataPersonal[dataPersonal.length -1].value);
        // Add X axis --> it is a date format
        var x = setXAxis(dataPersonal, width);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = setYAxis(dataPersonal, height, elementId);
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));
        // Add the line
        addPerformanceLine(svg, dataPersonal, x, y, "green");
        
        // Add the trendline
        addTrendline(svg, dataPersonal, x, y, 'personal', height, width);

        d3.csv("./data/individual.csv", 
            // When reading the csv, I must format variables:
            function(d){
                return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value, symbol: d.symbol }
            },

            function(dataIndividual) {
                addPaths(dataIndividual, svg, elementId, x, y);
            }
        );

        d3.csv("./data/spy.csv",

            // When reading the csv, I must format variables:
            function(d){
                return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value, symbol: d.symbol }
            },

            function(dataSPY) {
                let initialValueSPY;
                let amountSharesSPY;
                dataSPY = filterOnLastDays(dataSPY, elementId)
                initialValueSPY = dataSPY[0].value;
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
    function generateIndividualGraph() {
        //Read the data
        d3.csv("./data/individual.csv",
    
            // When reading the csv, I must format variables:
            function(d){
                return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value, symbol : d.symbol }
            },
            
            function(dataIndividual) {
                const uniqueSymbols = [... new Set(dataIndividual.map(({symbol}) => symbol))];
                dataIndividualFiltered = filterOnLastDays(dataIndividual, elementId)
            // Add X axis --> it is a date format
            var x = setXAxis(dataIndividualFiltered, width);
    
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class", "axis")
                .call(d3.axisBottom(x));
            // Add Y axis
            var y = setYAxis(dataIndividualFiltered, height, elementId);
            svg.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y));

                uniqueSymbols.map((symbolName) => {
                    // Add the line
                    addPerformanceLine(svg, filterOnLastDays(dataIndividual.filter(({symbol}) => symbol === symbolName), elementId), x, y, "#"+((1<<24)*Math.random()|0).toString(16), 'individual');
                })
            })
    };
    if (elementId.includes('individual')) {
        generateIndividualGraph();
    } else {
        generateOverviewGraph();
    }
    
    
}

function start() {
        ELEMENTS.forEach((elementName) => {
            draw(elementName);
        });
        WINDOW_INNER_WIDTH = window.innerWidth;
}

function reset() {
    if (WINDOW_INNER_WIDTH === window.innerWidth) {
        return;
    } else {
        WINDOW_INNER_WIDTH = window.innerWidth;
        ELEMENTS.forEach((elementName) => {
            const element = document.getElementById(elementName);
            if (element) {
                element.removeChild(element.childNodes[0]);
            }
        });
        start();
    }
}

start();
window.onresize = reset;