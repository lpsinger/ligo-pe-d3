UGLIFYJS = $(shell npm bin)/uglifyjs
UGLIFIED = d3.scattergrid.min.js

%.min.js: %.js
	$(UGLIFYJS) $< -c -m -o $@

all: $(UGLIFIED)

clean:
	rm -f $(UGLIFIED)