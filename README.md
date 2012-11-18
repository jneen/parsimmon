# Parsimmon

(by @jayferd and @laughinghan)

Parsimmon is a small library for writing big parsers made up of lots of little parsers.  The API is inspired by parsec and Promises/A.

## Quick Example

``` js
var regex = Parsimmon.regex;
var string = Parsimmon.string;

var id = regex(/^[a-z_]\w*/i);
var number = regex(/^[0-9]+/).map(parseInt);

var atom = number.or(id);
var form = string('(').then(function() { return expr.many().skip(')') });
var expr = form.or(atom);

expr.parse('3') // => 3
expr.parse('(add (mul 10 (add 3 4)) (add 7 8))')
  // => ['add', ['mul', 10, ['add', 3, 4]], ['add', 7, 8]]
```

## Explanation

TODO

## Full API

### Included parsers / parser generators:
  - `Parsimmon.string("my-string")` is a parser that expects to find
    `"mystring"`, and will yield the same.
  - `Parsimmon.regex(/^myregex/)` is a parser that expects the stream
    to match the given regex.  *Due to limitations in javascript's regex
    API, the regex must be anchored (with `^` at the beginning).*
  - `Parsimmon.succeed(result)` is a parser that doesn't consume any of
    the string, and yields `result`.
  - `Parsimmon.fail(message)`
  - `Parsimmon.letter` is equivalent to `Parsimmon.regex(/^[a-z]/i)`
  - `Parsimmon.letters` is equivalent to `Parsimmon.regex(/^[a-z]*/i)`
  - `Parsimmon.digit` is equivalent to `Parsimmon.regex(/^[0-9]/)`
  - `Parsimmon.digits` is equivalent to `Parsimmon.regex(/^[0-9]*/)`
  - `Parsimmon.whitespace` is equivalent to `Parsimmon.regex(/^\s+/)`
  - `Parsimmon.optWhitespace` is equivalent to `Parsimmon.regex(/^\s*/)`
  - `Parsimmon.any` consumes and yields the next character of the stream.
  - `Parsimmon.all` consumes and yields the entire remainder of the stream.
  - `Parsimmon.eof` expects the end of the stream.

### Parser methods
  - `parser.or(otherParser)`:
    returns a new parser which tries `parser`, and if it fails uses `otherParser`.
  - `parser.then(function(result) { return anotherParser; })`:
    returns a new parser which tries `parser`, and on success calls the
    given function with the result of the parse, which is expected to
    return another parser.
  - `parser.map(function(result) { return anotherResult; })`:
    transforms the output of `parser` with the given function.
  - `parser.skip(otherParser)`
    expects `otherParser` after `parser`, but preserves the yield value
    of `parser`.
  - `parser.result(aResult)`:
    returns a new parser with the same behavior, but which yields `aResult`.
  - `parser.many()`:
    expects `parser` zero or more times, and yields an array of the results.
  - `parser.times(n)`:
    expects `parser` exactly `n` times, and yields an array of the results.
  - `parser.times(min, max)`:
    expects `parser` between `min` and `max` times, and yields an array
    of the results.
  - `parser.atMost(n)`:
    expects `parser` at most `n` times.  Yields an array of the results.
  - `parser.atLeast(n)`:
    expects `parser` at least `n` times.  Yields an array of the results.


