d3.scattergrid = function(data, axesinfo, callback) {

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

    var state = $.bbq.getState("scattergrid");

    // Create background SVG drawing.
    var bgsvg = d3.select("body").append("svg")
        .classed("scattergrid", true)
        .attr("width", total_width)
        .attr("height", total_height)
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0);

    // Create HTML canvas.
    var canvas = d3.select("body").append("canvas")
        .classed("scattergrid", true)
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

    var predicate = alwaysFalse;

    // Create SVG drawing.
    var svg = d3.select("body").append("svg")
        .classed("scattergrid", true)
        .attr("width", total_width)
        .attr("height", total_height)
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0);

    var create_scale = function(axisdata, data) {
        var scale;

        if (axisdata.scale == "log")
            scale = d3.scale.log();
        else
            scale = d3.scale.linear();

        if (axisdata.domain)
            scale.domain(axisdata.domain);
        else
            scale.domain(d3.extent(data, function(d) { return d[axisdata.key]; }));

        if (axisdata.nice)
            scale.nice();

        return scale;
    };

    // Create individual axes.
    axesinfo.forEach(function(xaxisdata, xi) {
        var xscale = create_scale(xaxisdata, data).range([
            PADDING.left + CELLWIDTH * xi + CELLPADDING,
            PADDING.left + CELLWIDTH * (xi + 1) - CELLPADDING]);

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
        }

        axesinfo.forEach(function(yaxisdata, yi) {
            if (xi >= yi) return;

            var yscale = create_scale(yaxisdata, data).range([
                PADDING.top + CELLWIDTH*yi - CELLPADDING,
                PADDING.top + CELLWIDTH*(yi-1) + CELLPADDING]);

            xscale.ticks(5).forEach(function(t) {
                bgsvg.append("line")
                    .classed("x grid", true)
                    .attr("x1", xscale(t))
                    .attr("y1", yscale.range()[0])
                    .attr("x2", xscale(t))
                    .attr("y2", yscale.range()[1]);
            });

            xscale.ticks(5).forEach(function(t) {
                bgsvg.append("line")
                    .classed("x grid rule", true)
                    .attr("x1", xscale(t))
                    .attr("y1", yscale.range()[0])
                    .attr("x2", xscale(t))
                    .attr("y2", yscale.range()[0] + 2*CELLPADDING);
            });

            yscale.ticks(5).forEach(function(t) {
                bgsvg.append("line")
                    .classed("y grid", true)
                    .attr("x1", xscale.range()[0])
                    .attr("y1", yscale(t))
                    .attr("x2", xscale.range()[1])
                    .attr("y2", yscale(t));
            });

            if (xi < yi - 1)
            {
                yscale.ticks(5).forEach(function(t) {
                    svg.append("line")
                        .classed("y grid rule", true)
                        .attr("x1", xscale.range()[1])
                        .attr("y1", yscale(t))
                        .attr("x2", xscale.range()[1] + 2*CELLPADDING)
                        .attr("y2", yscale(t));
                });
            }

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
                    var e = brush.extent();
                    var predicate = function(d) {
                            return d[xaxisdata.key] >= e[0][0]
                                && d[xaxisdata.key] <= e[1][0]
                                && d[yaxisdata.key] >= e[0][1]
                                && d[yaxisdata.key] <= e[1][1];
                        };
                    redraw(predicate);
                    if (callback)
                        callback(predicate);
                })
                .on("brushend", function() {
                    var e = brush.extent();
                    $.bbq.pushState({scattergrid: {extent: e, xi: xi, yi: yi}});
                });

            if (state && state.xi == xi && state.yi == yi)
            {
                var e = state.extent;
                brush.extent(e);
                predicate = function(d) {
                    return d[xaxisdata.key] >= e[0][0]
                        && d[xaxisdata.key] <= e[1][0]
                        && d[yaxisdata.key] >= e[0][1]
                        && d[yaxisdata.key] <= e[1][1];
                }
            }

            var g = svg.append("g")
                .attr("class", "brush")
                .call(brush);
            brush.g = g;

            brushes.push(brush);
        });
    });

    redraw(predicate);
    if (callback)
        callback(predicate);
};
