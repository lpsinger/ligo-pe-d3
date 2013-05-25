d3.scattergrid = function(data, axesinfo) {

    // Sizing information.
	var CELLWIDTH = 200,
		CELLPADDING = 10,
		PADDING = {top: 0, right: 0, bottom: 30, left: 60};

    // List of brushes.
    var brushes = [];

    // Create SVG drawing.
	var svg = d3.select("body").append("svg")
	    .attr("width", CELLWIDTH * (axesinfo.length - 1)
            + PADDING.left + PADDING.right)
		.attr("height", CELLWIDTH * (axesinfo.length - 1)
            + PADDING.top + PADDING.bottom);

    // Create container for SVG definitions.
    var defs = svg.append("defs");

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

			// Unique ID for clipping path.
			var id = "clip" + xi + "_" + yi;

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

			// Define clipping path for axes.
			defs.append("clipPath").attr("id", id)
				.append("rect")
				.attr("x", PADDING.left + CELLWIDTH * xi + CELLPADDING)
				.attr("y", PADDING.top + CELLWIDTH * (yi - 1) + CELLPADDING)
				.attr("width", CELLWIDTH - 2*CELLPADDING)
				.attr("height", CELLWIDTH - 2*CELLPADDING);

			svg.append("rect")
				.classed("axis", true)
				.attr("x", PADDING.left + CELLWIDTH * xi + CELLPADDING)
				.attr("y", PADDING.top + CELLWIDTH * (yi - 1) + CELLPADDING)
				.attr("width", CELLWIDTH - 2*CELLPADDING)
				.attr("height", CELLWIDTH - 2*CELLPADDING)
				.style("fill", "white")
				.style("opacity", 0.5);

			svg.append("g")
				.attr("clip-path", "url(#" + id + ")")
				.selectAll("path.scatterpoints").data(data).enter().append("path")
				.classed("scatterpoints", true)
				.attr("transform", function(d) {
					return "translate(" + xscale(d[xaxisdata.key]) + ","
						+ yscale(d[yaxisdata.key]) + ")";
				})
				.style('fill', 'gray')
				.attr("d", d3.svg.symbol().size(4));

			var brush = d3.svg.brush()
				.x(xscale)
				.y(yscale)
				.on("brushstart", function() {
					brushes.forEach(function(otherBrush) {
						if (otherBrush !== brush)
							otherBrush.clear();
							otherBrush.g.call(otherBrush);
					});
				})
				.on("brush", function() {
					svg.selectAll("path.scatterpoints")
						.style('fill', function(d) {
							if (brush.empty())
								return 'gray';
							var e = brush.extent();
							return d[xaxisdata.key] >= e[0][0]
								&& d[xaxisdata.key] <= e[1][0]
								&& d[yaxisdata.key] >= e[0][1]
								&& d[yaxisdata.key] <= e[1][1]
								?  "blue" : "red";
						})
					});

			var g = svg.append("g")
				.attr("class", "brush")
				.call(brush);
			brush.g = g;

			brushes.push(brush);
		});
	});
};
