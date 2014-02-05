# -*- globals -*- #
SRC_DIR = src
BUILD_DIR = build
CLEAN += $(BUILD_DIR)/*
SRC = $(SRC_DIR)/parsimmon.js

.PHONY: all
all: browser commonjs report

# -*- minification -*- #
UGLIFYJS ?= ./node_modules/.bin/uglifyjs
UGLIFY_OPTS += --lift-vars --unsafe --mangle

%.min.js: %.js
	$(UGLIFYJS) $(UGLIFY_OPTS) < $< > $@

# special builds
COMMONJS = $(BUILD_DIR)/parsimmon.commonjs.js
BROWSER = $(BUILD_DIR)/parsimmon.browser.js
UGLY = $(BUILD_DIR)/parsimmon.browser.min.js

$(BUILD_DIR)/parsimmon.%.js: $(SRC_DIR)/%/pre.js $(SRC) $(SRC_DIR)/%/post.js
	@mkdir -p $(dir $@)
	cat $^ > $@

.PHONY: commonjs
commonjs: $(COMMONJS)

.PHONY: browser
browser: $(BROWSER) $(UGLY)

$(BROWSER): $(SRC_DIR)/browser/pre.js node_modules/pjs/src/p.js $(SRC) $(SRC_DIR)/browser/post.js
	mkdir -p $(dir $@)
	cat $^ > $@

# -*- testing -*- #
MOCHA ?= ./node_modules/.bin/mocha
MOCHA_OPTS += -u tdd
TESTS = ./test/*.test.js
.PHONY: test
test: $(COMMONJS)
	$(MOCHA) $(MOCHA_OPTS) ./test/intro.js $(TESTS)

.PHONY: report
report: $(UGLY)
	wc -c $(UGLY)

# -*- packaging -*- #

# XXX this is kind of awful, but hey, it keeps the version info in the right place.
VERSION = $(shell node -p 'require("./package.json").version')
PACKAGE = tmp/parsimmon-$(VERSION).tgz
DISTDIR = parsimmon-$(VERSION)
DIST = $(DISTDIR).tgz
CLEAN += parsimmon-*.tgz

$(PACKAGE): all
	mkdir -p tmp
	cd tmp/ && npm pack ../

$(DIST): all
	tar -czf $(DIST) \
		--xform 's:^\./build:$(DISTDIR):' \
		--exclude='\.gitkeep' \
		./build/

.PHONY: dist
dist: $(DIST)

.PHONY: package
package: $(PACKAGE)

.PHONY: publish
publish: clean test $(PACKAGE)
	npm publish $(PACKAGE)

# -*- cleanup -*- #
.PHONY: clean
clean:
	rm -f $(CLEAN)
