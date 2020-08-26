## 1.16.0 (2020-08-25)

- Fixes a crash in MS Edge 15-18 when using `Parsimmon.regexp` (thanks @ekilah)

## 1.15.0 (2020-07-27)

- Adds support for the `s` (`dotAll`) flag in `Parsimmon.regexp`

## 1.14.0 (2020-07-08)

- Improves peformance of `parser.mark`, `parser.node`, and `Parsimmon.index`
- Improves performance of `many` and `times`

## 1.13.0 (2019-07-25)

- Adds `parser.assert(condition, message)`

## 1.12.1 (2019-07-07)

- Adds links within documentation
- Fixes standalone browser version to not crash on load because Buffer is not defined

## 1.12.0 (2018-07-12)

- Adds `Parsimmon.Binary.buffer(length)`
- Adds `Parsimmon.Binary.encodedString(encoding, length)`
- Adds `Parsimmon.Binary.uintBE(length)`
- Adds `Parsimmon.Binary.intBE(length)`
- Adds `Parsimmon.Binary.uintLE(length)`
- Adds `Parsimmon.Binary.intLE(length)`
- Adds `Parsimmon.Binary.uint8`
- Adds `Parsimmon.Binary.int8`
- Adds `Parsimmon.Binary.uint16BE`
- Adds `Parsimmon.Binary.uint16LE`
- Adds `Parsimmon.Binary.int16LE`
- Adds `Parsimmon.Binary.int16BE`
- Adds `Parsimmon.Binary.uint32BE`
- Adds `Parsimmon.Binary.uint32LE`
- Adds `Parsimmon.Binary.int32LE`
- Adds `Parsimmon.Binary.int32BE`
- Adds `Parsimmon.Binary.floatBE`
- Adds `Parsimmon.Binary.floatLE`
- Adds `Parsimmon.Binary.doubleBE`
- Adds `Parsimmon.Binary.doubleLE`

## 1.11.1 (2018-06-27)

- Fixes a bug where the error indicator (`^^`) was misaligned on the fifth byte
  in a given visual line for a binary parse error message

## 1.11.0 (2018-06-23)

- Drastically improves error message formatting for `.tryParse` and
  `.formatError` by showing a full preview of the input with surrounding
  context, pointing directly at the error (works for both string and Buffer
  parsers)

## 1.10.0 (2018-06-17)

- Adds `parser.contramap(fn)` and `parser.promap(fn)`

## 1.9.0 (2018-06-15)

- Adds `parser.desc(array)` signature and `Parsimmon.makeFailure(index, array)`
  signature to support starting with an array of expectations

## 1.8.0 (2018-06-04)

- Adds `parser.tieWith(separator)`, a generalized version of `parser.tie()`

## 1.7.3 (2018-04-22)

- Shrinks UMD build from ~33 kb to ~11 kb

## 1.7.2 (2018-04-05)

- Fixes a bug where `seqObj` and `bitSeqObj` wouldn't work with keys that were
  already part of `Object.prototype`

## 1.7.1 (2018-03-22)

- Fixes a bug where `bitSeq` consumed the wrong input

## 1.7.0 (2018-03-10)

- Adds support for binary parsing using Node.js Buffers
- Adds `Parsimmon.Binary.bitSeq`
- Adds `Parsimmon.Binary.bitSeqObj`
- Adds `Parsimmon.Binary.byte`

## 1.6.4 (2018-01-01)

- Fixes `parser.many()` to throw an error if it detects an infinite parse loop.

## 1.6.3 (2018-01-01)

- Unpublished due to a Travis CI build issues.

## 1.6.2 (2017-07-08)

- Fixes another bug with match groups outside the correct range in
  `Parsimmon.regexp(regexp, group)`.

## 1.6.1 (2017-07-01)

- **100% unit test coverage!** This does not mean bugs won't exist, but it keeps
  us much safer against regressions in the future.
- **BUGFIX:** `Parsimmon.regexp(regexp, group)` will now correctly fail to parse
  if the `group` number is out of range for the `regexp` number of groups. This
  worked correctly in the past, but was broken during a minor code clean up due
  to missing tests.

## 1.6.0 (2017-06-26)

- Adds `Parsimmon.seqObj(...args)`

## 1.5.0 (2017-06-17)

NOTE: Code was completed on 2017-06-17, but due to human error, was not
published on npm until 2017-06-26.

- Adds `parser.sepBy(separator)` alias for `Parsimmon.sepBy(parser, separator)`
- Adds `parser.sepBy1(separator)` alias for `Parsimmon.sepBy1(parser, separator)`
- Adds `Parsimmon.range(begin, end)`
- Adds `parser.wrap(before, after)`
- Adds `parser.trim(anotherParser)`
- Adds `parser.tie()`

## 1.4.0 (2017-06-05)

- Adds `Parsimmon.createLanguage(parsers)`
- Adds `parser.thru(wrapper)`
- Adds `parser.node(name)`

## 1.3.0 (2017-05-28)

- Adds `Parsimmon.notFollowedBy(parser)`
- Adds `parser.notFollowedBy(anotherParser)`

## 1.2.0 (2016-12-22)

- Adds `Parsimmon.lookahead(parser)`
- Adds `parser.lookahead(anotherParser)`

## 1.1.0 (2016-12-21)

- Adds `Parsimmon.lookahead(string)`
- Adds `Parsimmon.lookahead(regexp)`
- Adds `parser.lookahead(string)`
- Adds `parser.lookahead(regexp)`

## 1.0.0 (2016-11-02)

- **BREAKING:** `parser.empty` is now a function (`parser.empty()`).
- **BREAKING:** `f.ap(x)` is now `x.ap(f)`.
- Adds `parser.tryParse(str)` which either returns the parsed value or throws an
  exception.
- Adds support for `fantasy-land/*` prefixed versions of methods.
- `Parsimmon.empty()` is a copy of `parser.empty()`.
- Adds `.desc` descriptions for `digits`, `letters`, `optWhitespace`.
- Adds `Parsimmon.isParser`.
- Adds `parser.fallback(value)`.
- Parsimmon now only has one namespace. `Parsimmon.Parser` is equal to
  `Parsimmon` itself for backwards compatibility purposes.
- Exposes `Parsimmon.makeSuccess` and `Parsimmon.makeFailure`.
- Documentation for `Parsimmon.formatError`, `Parsimmon.parse`,
  `Parsimmon.Parser`, `Parsimmon.makeSuccess`, `Parsimmon.makeFailure`,
  `Parsimmon.isParser`, `parser.fallback`.

## 0.9.2 (2016-08-07)

- Adds `browser` field to `package.json` so unpkg serves the correct file.
- Documentation overhaul in `README.md`.
- Examples overhaul.

## 0.9.1 (2016-07-08)

- **BREAKING:** `P.seqMap` now throws when passed zero arguments, or when the
  final argument is not a function.
- `P.regex` is now an alias for `P.regexp`.

## 0.9.0 (2016-07-07)

- **BREAKING:** `P.regex` throws on regexps with flags other than `imu` now.

## 0.8.1 (2016-06-30)

- Optimizes internal set union function, which should result in slightly faster
  parsing

## 0.8.0 (2016-06-28)

- The `.expected` array on parse results is now unique and sorted
- Updated Mocha and Chai versions
- Updated README a bit (mostly line wrapping stuff)

## 0.7.2 (2016-06-26)

- No API changes
- Switches to npm-based task running
- Switches to UMD-based code

## 0.7.1 (2016-06-04)

- Documentation updates
- Adds line/column information to `P.index` and `.mark()`
- Adds additional type assertions

## 0.7.0 (???)

This release may have been unpublished or something, I'm not exactly sure.

## 0.6.0 (2015-02-24)

- add a second optional argument to `regex()` indicating group selection
- eliminates pjs dependency
- add seqMap, oneOf, and noneOf

## 0.5.1 (2014-06-25)

- Added .custom, .test, and .takeWhile for folks who don't like to use regexes.

## 0.5.0 (2014-06-15)

- Added `.desc()` for custom parse error messages

## 0.4.0 (2014-04-18)

- **BREAKING:** deprecated use of `.then(function(result) { ... })`. Use `chain`
  instead.
- **BREAKING:** errors are no longer thrown on invalid parses. Instead,
  `.parse(str)` returns an object with a `status` tag, indicating whether the
  parse was successful.

## 0.3.2 (2014-04-18)

- never throw strings, always throw error objects
- add the MIT license

## 0.3.1 (2014-03-12)

- add browser files to the npm package

## 0.3.0 (2014-03-12)

- started updating the changelog again :x
- **BREAKING:** `seq` and `alt` now take varargs instead of a single list
  argument.

## 0.1.0 (2014-01-09)

- Uses less stack space with a non-cps implementation
- Added `Parsimmon.index` and `Parser::mark()`
- fantasyland compatibility

## 0.0.6 (2013-12-02)

- Better error messages: use the message from the furthest backtrack.

## 0.0.5 (2013-04-10)

- Fix a "build directory nonexistent" bug :\

## 0.0.4 (2013-04-09)

- Started a CHANGELOG
- Specify pjs 3.x
- added "use strict"
- Stopped trying to subclass Error (was silencing all parse errors :\ )

(Note: v0.0.3 is completely b0rken, and was unpublished from npm)
