D3.js LIGO parameter estimation sandbox
=======================================

Inspired by Jeff Heer's talk at the
[JPL/Caltech visualization symposium](http://www.hi.jpl.nasa.gov/datavis/)
on May 23, 2013, I am experimenting with using [D3.js](http://d3js.org) to
visualize LIGO parameter estimation results.

The nifties example is [scattergrid.html](https://github.com/lpsinger/ligo-pe-d3/blob/master/scattergrid.html),
a grid of all possible pairwise scatter plots of MCMC samples from a particular parameter estimation run.
It is similar to D3's [scatterplot matrixe example](http://mbostock.github.io/d3/talk/20111116/iris-splom.html), but should scale to larger data sets because the scatter points are rendered on an overlaid [HTML5 canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Canvas/Tutorial) instead of being displayed as separate elements of an SVG graphic.

How to test
-----------

These examples are all static web pages. You can try out one of the web pages
by just opening the .html file in your web browser.

However, Chrome and some other browsers are extremely strict about where
JavaScript can load data files from, and don't permit fetching files via
[`XMLHTTPRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
from `file:///` URLs. If the examples don't work for you, try
firing up a little standalone web server with:

	$ python -m SimpleHTTPServer 8000

and then navigate to the page that you were trying to visit at
http://localhost:8000/.
