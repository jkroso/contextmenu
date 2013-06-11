REPORTER=dot

serve: node_modules
	@node_modules/serve/bin/serve

test:
	@node_modules/mocha/bin/_mocha test/*.test.js \
		--reporter $(REPORTER) \
		--timeout 500 \
		--check-leaks \
		--bail

node_modules: component.json
	@packin install --meta deps.json,component.json,package.json \
		--folder node_modules \
		--executables \
		--no-retrace

clean:
	rm -r node_modules

.PHONY: clean serve test