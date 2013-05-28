d3.xhr = function() {

    var old_xhr = d3.xhr;
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
    var text = g.append("text")
        .style("text-anchor", "middle")
        .text("loading");
    var sizeformat = d3.format(".2s");
    var pctformat = d3.format(".2p");

    return function(url, mimeType, callback) {
        var xhr = old_xhr(url, mimeType, null);
        xhr.on("progress", function() {
            var completeness = d3.event.loaded / d3.event.total;
            spinner.attr("d",
                arc.endAngle(2 * Math.PI * completeness));
            text.text("loaded " + sizeformat(d3.event.loaded) + " of "
                + sizeformat(d3.event.total) + " (" + pctformat(completeness)
                + ")");
        });
        xhr.on("load", function(request) {
            g.transition().delay(250)
            .attr("transform", "scale(0)")
            .transition(svg).remove();
            if (callback)
                callback(request);
        });
        return xhr;
    };
}();
