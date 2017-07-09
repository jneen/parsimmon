## version 1.6.2 (2017-07-08)

* Fixes another bug with match groups outside the correct range in `Parsimmon.regexp(regexp, group)`.

## version 1.6.1 (2017-07-01)

* **100% unit test coverage!** This does not mean bugs won't exist, but it keeps us much safer against regressions in the future.
* **BUGFIX:** `Parsimmon.regexp(regexp, group)` will now correctly fail to parse if the `group` number is out of range for the `regexp` number of groups. This worked correctly in the past, but was broken during a minor code clean up due to missing tests.

## version 1.6.0 (2017-06-26)

* Adds `Parsimmon.seqObj(...args)`

## version 1.5.0 (2017-06-17)

NOTE: Code was completed on 2017-06-17, but due to human error, was not published on npm until 2017-06-26.

* Adds `parser.sepBy(separator)` alias for `Parsimmon.sepBy(parser, separator)`
* Adds `parser.sepBy1(separator)` alias for `Parsimmon.sepBy1(parser, separator)`
* Adds `Parsimmon.range(begin, end)`
* Adds `parser.wrap(before, after)`
* Adds `parser.trim(anotherParser)`
* Adds `parser.tie()`

## version 1.4.0 (2017-06-05)

* Adds `Parsimmon.createLanguage(parsers)`
* Adds `parser.thru(wrapper)`
* Adds `parser.node(name)`

## version 1.3.0 (2017-05-28)

* Adds `Parsimmon.notFollowedBy(parser)`
* Adds `parser.notFollowedBy(anotherParser)`

## version 1.2.0 (2016-12-22)

* Adds `Parsimmon.lookahead(parser)`
* Adds `parser.lookahead(anotherParser)`

## version 1.1.0 (2016-12-21)

* Adds `Parsimmon.lookahead(string)`
* Adds `Parsimmon.lookahead(regexp)`
* Adds `parser.lookahead(string)`
* Adds `parser.lookahead(regexp)`

## version 1.0.0 (2016-11-02)

* **BREAKING:** `parser.empty` is now a function (`parser.empty()`).
* **BREAKING:** `f.ap(x)` is now `x.ap(f)`.
* Adds `parser.tryParse(str)` which either returns the parsed value or throws an exception.
* Adds support for `fantasy-land/*` prefixed versions of methods.
* `Parsimmon.empty()` is a copy of `parser.empty()`.
* Adds `.desc` descriptions for `digits`, `letters`, `optWhitespace`.
* Adds `Parsimmon.isParser`.
* Adds `parser.fallback(value)`.
* Parsimmon now only has one namespace. `Parsimmon.Parser` is equal to `Parsimmon` itself for backwards compatibility purposes.
* Exposes `Parsimmon.makeSuccess` and `Parsimmon.makeFailure`.
* Documentation for `Parsimmon.formatError`, `Parsimmon.parse`, `Parsimmon.Parser`, `Parsimmon.makeSuccess`, `Parsimmon.makeFailure`, `Parsimmon.isParser`, `parser.fallback`.

## version 0.9.2 (2016-08-07)

* Adds `browser` field to `package.json` so unpkg serves the correct file.
* Documentation overhaul in `README.md`.
* Examples overhaul.

## version 0.9.1 (2016-07-08)

* **BREAKING:** `P.seqMap` now throws when passed zero arguments, or when the final argument is not a function.
* `P.regex` is now an alias for `P.regexp`.

## version 0.9.0 (2016-07-07)

* **BREAKING:** `P.regex` throws on regexps with flags other than `imu` now.

## version 0.8.1 (2016-06-30)

* Optimizes internal set union function, which should result in slightly faster parsing

## version 0.8.0 (2016-06-28)

* The `.expected` array on parse results is now unique and sorted
* Updated Mocha and Chai versions
* Updated README a bit (mostly line wrapping stuff)

## version 0.7.2 (2016-06-26)

* No API changes
* Switches to npm-based task running
* Switches to UMD-based code

## version 0.7.1 (2016-06-04)

* Documentation updates
* Adds line/column information to `P.index` and `.mark()`
* Adds additional type assertions

## version 0.7.0 (???)

This release may have been unpublished or something, I'm not exactly sure.

## version 0.6.0 (2015-02-24)

* add a second optional argument to `regex()` indicating group selection
* eliminates pjs dependency
* add seqMap, oneOf, and noneOf

## version 0.5.1 (2014-06-25)

* Added .custom, .test, and .takeWhile for folks who don't like to use regexes.

## version 0.5.0 (2014-06-15)

* Added `.desc()` for custom parse error messages

## version 0.4.0 (2014-04-18)

* **BREAKING:** deprecated use of `.then(function(result) { ... })`.  Use `chain` instead.
* **BREAKING:** errors are no longer thrown on invalid parses.  Instead, `.parse(str)` returns
  an object with a `status` tag, indicating whether the parse was successful.

## version 0.3.2 (2014-04-18)

* never throw strings, always throw error objects
* add the MIT license

## version 0.3.1 (2014-03-12)

* add browser files to the npm package

## version 0.3.0 (2014-03-12)

* started updating the changelog again :x
* **BREAKING:** `seq` and `alt` now take varargs instead of a single list argument.

## version 0.1.0 (2014-01-09)

* Uses less stack space with a non-cps implementation
* Added `Parsimmon.index` and `Parser::mark()`
* fantasyland compatibility

## version 0.0.6 (2013-12-02)

* Better error messages: use the message from the furthest backtrack.

## version 0.0.5 (2013-04-10)

* Fix a "build directory nonexistent" bug :\

## version 0.0.4 (2013-04-09)

* Started a CHANGELOG
* Specify pjs 3.x
* added "use strict"
* Stopped trying to subclass Error (was silencing all parse errors :\ )

(Note: v0.0.3 is completely b0rken, and was unpublished from npm)
