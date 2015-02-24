## version 0.6.0 (2015-02-24)

  * add a second optional argument to `regex()` indicating group selection
  * eliminates pjs dependency
  * add seqMap, oneOf, and noneOf

## version 0.5.1 (2014-06-25)

  * Added .custom, .test, and .takeWhile for folks who don't like to use regexes.

## version 0.5.0 (2014-06-15)

* Added `.desc()` for custom parse error messages

## version 0.4.0 (2014-04-18)

* breaking: deprecated use of `.then(function(result) { ... })`.  Use `chain` instead.
* breaking: errors are no longer thrown on invalid parses.  Instead, `.parse(str)` returns
  an object with a `status` tag, indicating whether the parse was successful.

## version 0.3.2 (2014-04-18)

* never throw strings, always throw error objects
* add the MIT license

## version 0.3.1 (2014-03-12)

* add browser files to the npm package

## version 0.3.0 (2014-03-12)

* started updating the changelog again :x
* breaking from 0.2.x: `seq` and `alt` now take varargs instead of a single list argument.

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
