clean:
	@rm -rf build components

install:
	@component install

build:
	@component build -d -v

.PHONY: build clean install