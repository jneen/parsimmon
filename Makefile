# -*- globals -*- #
SRC_DIR = src
BUILD_DIR = build
CLEAN += $(BUILD_DIR)/*
SRC = $(SRC_DIR)/parsimmon.js

.PHONY: all
all: minify commonjs report

# -*- minification -*- #
UGLIFYJS ?= ./node_modules/.bin/uglifyjs
UGLIFY_OPTS += --lift-vars --unsafe
UGLY = $(BUILD_DIR)/parsimmon.min.js

$(UGLY): $(SRC)
	$(UGLIFYJS) $(UGLIFY_OPTS) $< > $@

%.min.js: %.js
	$(UGLIFYJS) $(UGLIFY_OPTS) $< > $@

minify: $(UGLY)

# special builds
COMMONJS = $(BUILD_DIR)/parsimmon.commonjs.js

$(BUILD_DIR)/parsimmon.%.js: $(SRC_DIR)/%/pre.js $(SRC) $(SRC_DIR)/%/post.js
	cat $^ > $@

.PHONY: commonjs
commonjs: $(COMMONJS)

.PHONY: amd
amd: $(BUILD_DIR)/parsimmon.amd.js $(BUILD_DIR)/parsimmon.amd.min.js

.PHONY: report
report: $(UGLY)
	wc -c $(UGLY)

# -*- testing -*- #
MOCHA ?= ./node_modules/.bin/mocha
MOCHA_OPTS += -u tdd
TESTS = ./test/*.test.js
.PHONY: test
test: $(COMMONJS)
	$(MOCHA) $(MOCHA_OPTS) $(TESTS)

# -*- packaging -*- #

# XXX this is kind of awful, but hey, it keeps the version info in the right place.
VERSION = $(shell node -e 'console.log(require("./package.json").version)')
PACKAGE = parsimmon-$(VERSION).tgz
CLEAN += parsimmon-*.tgz

$(PACKAGE): clean commonjs test
	npm pack .

.PHONY: package
package: $(PACKAGE)

.PHONY: publish
publish: $(PACKAGE)
	npm publish $(PACKAGE)

# -*- cleanup -*- #
.PHONY: clean
clean:
	rm -f $(CLEAN)
