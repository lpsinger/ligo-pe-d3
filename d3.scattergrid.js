d3.scattergrid = function(data, axesinfo) {

    // Sizing information.
    var CELLWIDTH = 200,
        CELLPADDING = 10,
        PADDING = {top: 0, right: 0, bottom: 30, left: 60};
    var total_width = CELLWIDTH * (axesinfo.length - 1)
            + PADDING.left + PADDING.right;
    var total_height = CELLWIDTH * (axesinfo.length - 1)
            + PADDING.top + PADDING.bottom;

    // List of brushes.
    var brushes = [];
    var redraws = [];

    // Create HTML canvas.
    var canvas = d3.select("body").append("canvas")
        .attr("width", total_width)
        .attr("height", total_height)
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0);

    // Get context for drawing into canvas.
    var context = canvas.node().getContext("2d");

    var redraw = function(predicate) {
        context.clearRect(0, 0, total_width, total_height);
        redraws.forEach(function(func) {
            func(predicate);
        });
    };

    var alwaysFalse = function() {
        return false;
    };

    // Create SVG drawing.
    var svg = d3.select("body").append("svg")
        .attr("width", total_width)
        .attr("height", total_height)
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0);

    // Create individual axes.
    axesinfo.forEach(function(xaxisdata, xi) {
        var xscale = d3.scale.linear()
            .domain(d3.extent(data, function(d) { return d[xaxisdata.key]; }))
            .range([
                PADDING.left + CELLWIDTH * xi + CELLPADDING,
                PADDING.left + CELLWIDTH * (xi + 1) - CELLPADDING])
            .nice();

        var xaxis = d3.svg.axis().scale(xscale).orient("bottom");

        if (xi < axesinfo.length - 1)
        {
            svg.append("g")
                .classed("x axis", true)
                .attr("transform", "translate(0,"
                    + (PADDING.top + CELLWIDTH * (axesinfo.length - 1) - CELLPADDING) + ")")
                .call(xaxis)
                .append("text")
                    .style("text-anchor", "middle")
                    .attr("x", PADDING.left + CELLWIDTH*(xi + 1/2))
                    .attr("y", 30)
                    .text(xaxisdata.key);

            svg.selectAll("line.x.grid." + "i" + xi)
                .data(xscale.ticks(5)).enter().append("line")
                .classed("x grid " + "i" + xi, true)
                .attr("x1", xscale)
                .attr("y1", PADDING.top + xi * CELLWIDTH + CELLPADDING)
                .attr("x2", xscale)
                .attr("y2", PADDING.top + (axesinfo.length - 1) * CELLWIDTH - CELLPADDING);
        }

        axesinfo.forEach(function(yaxisdata, yi) {
            if (xi >= yi) return;

            var yscale = d3.scale.linear()
                .domain(d3.extent(data, function(d) { return d[yaxisdata.key]; }))
                .range([
                    PADDING.top + CELLWIDTH*yi - CELLPADDING,
                    PADDING.top + CELLWIDTH*(yi-1) + CELLPADDING
                ]).nice();

            if (xi == 0)
            {
                var yaxis = d3.svg.axis().scale(yscale).orient("left");

                svg.append("g")
                    .classed("y axis", true)
                    .attr("transform", "translate(" + (PADDING.left + CELLPADDING)
                        + ",0)")
                    .call(yaxis)
                    .append("text")
                        .attr("transform", "rotate(-90)")
                        .style("text-anchor", "middle")
                        .attr("x", -(PADDING.top + CELLWIDTH*(yi - 1/2)))
                        .attr("y", -40)
                        .text(yaxisdata.key);

                svg.selectAll("line.y.grid." + "i" + yi)
                    .data(yscale.ticks(5)).enter().append("line")
                    .classed("y grid " + "i" + yi, true)
                    .attr("x1", PADDING.left + CELLPADDING)
                    .attr("y1", yscale)
                    .attr("x2", PADDING.left + CELLWIDTH * yi - CELLPADDING)
                    .attr("y2", yscale);
            }

            redraws.push(function(predicate) {
                var unchosen = [];
                var chosen = [];
                data.forEach(function(d) {
                    if (predicate(d)) {
                        chosen.push(d);
                    } else {
                        unchosen.push(d);
                    }
                });
                context.fillStyle = "blue";
                unchosen.forEach(function(p) {
                    context.fillRect(
                        xscale(p[xaxisdata.key]) - 0.5,
                        yscale(p[yaxisdata.key]) - 0.5, 1, 1);
                });
                context.fillStyle = "red";
                chosen.forEach(function(p) {
                    context.fillRect(
                        xscale(p[xaxisdata.key]) - 0.5,
                        yscale(p[yaxisdata.key]) - 0.5, 1, 1);
                });
            });

            svg.append("rect")
                .classed("axis", true)
                .attr("x", PADDING.left + CELLWIDTH * xi + CELLPADDING)
                .attr("y", PADDING.top + CELLWIDTH * (yi - 1) + CELLPADDING)
                .attr("width", CELLWIDTH - 2*CELLPADDING)
                .attr("height", CELLWIDTH - 2*CELLPADDING);

            var brush = d3.svg.brush()
                .x(xscale)
                .y(yscale)
                .on("brushstart", function() {
                    brushes.forEach(function(otherBrush) {
                        if (otherBrush !== brush)
                        {
                            otherBrush.clear();
                            otherBrush.g.call(otherBrush);
                        }
                    });
                })
                .on("brush", function() {
                    redraw(function(d) {
                            var e = brush.extent();
                            return d[xaxisdata.key] >= e[0][0]
                                && d[xaxisdata.key] <= e[1][0]
                                && d[yaxisdata.key] >= e[0][1]
                                && d[yaxisdata.key] <= e[1][1];
                        })
                    });

            var g = svg.append("g")
                .attr("class", "brush")
                .call(brush);
            brush.g = g;

            brushes.push(brush);
        });
    });

    redraw(alwaysFalse);
};
