export PATH := $(shell npm bin):$(PATH)

.PHONY: all
all:

.PHONY: test
test: test.js
	mocha -u tdd test.js

.PHONY: publish
publish: test
	npm publish
