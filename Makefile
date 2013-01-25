all: build Readme.md

clean:
	@rm -rf build components

install:
	@component install

build:
	@component build -d -v

Readme.md: src/index.js docs/head.md docs/tail.md
	@cat docs/head.md > Readme.md
	@cat src/index.js\
	 | sed s/.*=.$$//\
	 | sed s/proto\./ContextMenu.prototype./\
	 | dox -a >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: build clean install