old_xhr = d3.xhr;

var R = 300;
var svg = d3.select("body").append("svg")
	.classed("progress-meter", true)
	.style("position", "fixed")
	.style("top", "50%")
	.style("left", "50%")
	.style("margin-top", -R/2)
	.style("margin-left", -R/2)
	.attr("width", R)
	.attr("height", R)
.append("g")
	.attr("transform", "translate(" + R/2 + "," + R/2 + ")");
var g = svg.append("g");
var arc = d3.svg.arc()
	.startAngle(0)
	.innerRadius(R/2 - 40)
	.outerRadius(R/2);
g.append("path")
	.attr("d", arc.endAngle(2 * Math.PI))
	.style("fill", "#ccc");
var spinner = g.append("path")
	.style("fill", "#000");
g.append("text")
	.style("text-anchor", "middle")
	.text("by your command");

d3.xhr = function(url, mimeType, callback) {

	var xhr = old_xhr(url, mimeType, callback);
	xhr.on("progress", function() {
		var total = d3.event.target.getResponseHeader('Content-Length');
		spinner.attr("d",
			arc.endAngle(2 * Math.PI * d3.event.loaded / total));
	});
	xhr.on("load", function() {
		g.transition().delay(150)
		.attr("transform", "scale(0)")
		.transition(svg).duration(0).remove();
	});

	return xhr;
}
