/*  js for services */

module.exports = function(config){

    this.createTimeline = function(){
        // Clear all svg


    	// Get dimensions of containing box
        var parent_height = d3.select('#timeline-parent').node().getBoundingClientRect().height
        var parent_width  = d3.select('#timeline-parent').node().getBoundingClientRect().width


        var margin = {top: 10, right: 10, bottom: 40, left: 60}; // Margin around visualization, including space for labels
        var width  = parent_width - margin.left - margin.right; // Width of our visualization
        var height = parent_height - margin.top - margin.bottom; // Height of our visualization
        // var transDur = 100; // Transition time in ms

        var dataset = "http://epic-analytics.cs.colorado.edu:9000/jennings/infovis/matthew_tweets_per_day.csv"

        var parseDate  = d3.timeParse("%Y-%m-%d");
        var formatDate = d3.timeFormat("%a %b %d, %Y");
        var formatSimpleDate = d3.timeFormat("%b %-d")


        d3.csv(dataset, function(csvData){

            // Parse data
            var data = csvData;

            data.forEach(function(d,idx){
                d.date = parseDate(d["postedDate2"]);
                d.count = +d["count"];
                d.idx = idx;
            });

            var brushDateStart = new Date(data[0].date) // Sep 25
            var brushDateEnd   = d3.timeDay.offset(new Date(data[data.length-1].date),1) // Oct 22

            console.log(formatSimpleDate(brushDateStart),"-", formatSimpleDate(brushDateEnd))

            // Define scales
            var xScale = d3.scaleTime()
                            .rangeRound([0, width])
                            .domain([new Date(data[0].date),
                                d3.timeDay.offset(new Date(data[data.length-1].date),1)])

            var yScale = d3.scaleLinear()
                            .range([height, 0])
                            .domain([0, d3.max(data, function(d) { return parseFloat(d.count); })+1]);

            // Create an SVG element to contain our visualization.
            var svg = d3.select("#timeline").append("svg")
                                            .attr("width", width+margin.left+margin.right)
                                            .attr("height", height+margin.top+margin.bottom)
                                            .attr("id","timelinesvg")
                                          .append("g")
                                            .attr("transform","translate(" + margin.left + "," + margin.right + ")");

            // Build axes!
            // Specify the axis scale and general position
            var xAxis = d3.axisBottom(xScale).tickSize(2)

            var xAxisG = svg.append('g')
                            .attr('class', 'axis')
                            .attr('id','xaxis')
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis)
                          .selectAll("text")
                            .attr("dy", ".35em")
                            .attr("dx", "-.5em")
                            .attr("transform", "rotate(-45)")
                            .style("text-anchor", "end");

            // // Update width of chart to accommodate long rotated x-axis labels
            // d3.select("#timelinesvg")
            //         .attr("width", d3.select('#timeline').node().getBoundingClientRect().width)

            d3.select("#timelinesvg")
                    .attr("height", d3.select('#timeline').node().getBoundingClientRect().height)

            // Repeat for the y-axis
            var yAxis = d3.axisLeft(yScale).tickSize(5).ticks(5);

            var yAxisG = svg.append('g')
                            .attr('class', 'axis')
                            // .attr('transform', 'translate(' + xOffset + ', 0)')
                            .call(yAxis);

            var yLabel = svg.append("text")
                            .attr('class', 'label')
                            .attr("transform", "rotate(-90)")
                            .attr('y',6)
                            .attr('dy','.4em')
                            .style("text-anchor", "end")
                            .text("# Tweets");

            // Build bar chart
            var bar = svg.selectAll('.rect') // Select elements
                        .data(data); // Bind data to elements

            bar.enter().append("rect")
                .attr("class", "rect")
                .attr("x", function(d) { return xScale(new Date(d.date)); })
                .attr("y", function(d) { return yScale(d.count); })
                .attr("id", function(d) { return "bar-"+d.date; })
                .attr("height", function(d) { return height-yScale(d.count); })
                .attr("width",width/(data.length-1)*.9)
                .style("fill", "lightsteelblue");

            // Brush code from https://bl.ocks.org/mbostock/6232537
            svg.append("g")
                .attr("class", "brush")
                .call(d3.brushX()
                    .extent([[0, 0], [width, height]])
                    .on("end", brushended));

            function brushended() {
                if (!d3.event.sourceEvent) return; // Only transition after input.
                if (!d3.event.selection) return; // Ignore empty selections.
                var date0 = d3.event.selection.map(xScale.invert),
                    date1 = date0.map(d3.timeDay.round);

                // If empty when rounded, use floor & ceil instead.
                if (date1[0] >= date1[1]) {
                    date1[0] = d3.timeDay.floor(date0[0]);
                    date1[1] = d3.timeDay.offset(date1[0]);
                }
                d3.select(this).transition().duration(300).call(d3.event.target.move, date1.map(xScale));
                console.log("new date0",date0)
                console.log("new date1",date1)
            }


        }); //end d3.csv


    } //end createTimeline


    window.onresize = function(event){
        console.log("resizing window")
        // Clear all svg
        // svg.selectAll("*").remove();
        d3.select("timelinesvg").remove();
        createTimeline();
    }


} //end module.exports