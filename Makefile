export PATH := $(shell npm bin):$(PATH)

.PHONY: all
all:

.PHONY: test
test:
	mocha -u tdd ./test/*.test.js

.PHONY: publish
publish: clean test
	npm publish
