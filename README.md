[![Build Status](https://secure.travis-ci.org/jayferd/parsimmon.png)](http://travis-ci.org/jayferd/parsimmon)

# Parsimmon

[![Parsimmon](http://i.imgur.com/wyKOf.png)](http://github.com/jayferd/parsimmon)

(by @jayferd and @laughinghan)

Parsimmon is a small library for writing big parsers made up of lots of little parsers.  The API is inspired by parsec and Promises/A.

## Quick Example

``` js
var regex = Parsimmon.regex;
var string = Parsimmon.string;
var optWhitespace = Parsimmon.optWhitespace;

var id = regex(/^[a-z_]\w*/i);
var number = regex(/^[0-9]+/).map(parseInt);

var atom = number.or(id);

var form = string('(').skip(optWhitespace).then(function() {
  return expr.many().skip(string(')'));
});

var expr = form.or(atom).skip(optWhitespace);

expr.parse('3') // => 3
expr.parse('(add (mul 10 (add 3 4)) (add 7 8))')
  // => ['add', ['mul', 10, ['add', 3, 4]], ['add', 7, 8]]
```

## Explanation

A Parsimmon parser is an object that represents an action on a stream
of text, and the promise of either an object yielded by that action on
success or a message in case of failure.  Under the hood, this is
represented by a function that takes a stream and calls one of two
callbacks with an error or a result.  For example, `string('foo')`
yields the string `'foo'` if the beginning of the stream is `'foo'`,
and otherwise fails.

The combinator method `.map` is used to transform the yielded value.
For example, `string('foo').map(function(x) { return x + 'bar'; })`
will yield `'foobar'` if the stream starts with `'foo'`.  The parser
`digits.map(function(x) { return parseInt(x) * 2; })` will yield
the number 24 when it encounters the string '12'.  The method
`.result` can be used to set a constant result.

The two core ways to combine parsers are `.then` and `.or`.  The
method `.then` provides a way to decide how to continue the parse
based on the result of a previous parser.  For a kind of contrived
example,

``` js
var sentence = regex(/[\w\s]+/).then(function(contents) {
  var ending;

  if (contents.indexOf('bang') >= 0) {
    ending = '!';
  }
  else {
    ending = '.'
  }

  return string(ending).result(contents + ending);
});

sentence.parse('quick brown dogs and things.') // => 'quick brown dogs and things.'
sentence.parse('shebang.') // parse error: expected '!'
sentence.parse('shebang!') // => 'shebang!'
```

For the monad-loving crowd, `.then` is the `bind` operation on
the parser monad (much like Parsec).  For others, this is very
similar to the Promises/A spec, implemented by jQuery's deferred
objects.

The method `.or` allows a parser to continue by trying another parser
if it fails.  So `string('a').or(string('b'))` will yield an `'a'` if
the stream starts with an `'a'`, and a `'b'` if the stream starts with
a `'b'`, and fail otherwise.

## Full API

### Included parsers / parser generators:
  - `Parsimmon.string("my-string")` is a parser that expects to find
    `"my-string"`, and will yield the same.
  - `Parsimmon.regex(/^myregex/)` is a parser that expects the stream
    to match the given regex.  **Due to limitations in javascript's regex
    API, the regex must be anchored (with `^` at the beginning).**
  - `Parsimmon.succeed(result)` is a parser that doesn't consume any of
    the string, and yields `result`.
  - `Parsimmon.seq(parsers)` accepts an array of parsers that it expects to find in order,
    yielding an array of the results.
  - `Parsimmon.lazy(f)` accepts a function that returns a parser, which is evaluated the
    first time the parser is used.  This is useful for referencing parsers that haven't yet
    been defined.
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
  - `Parsimmon.index` is a parser that yields the current index of the parse.

### Parser methods
  - `parser.or(otherParser)`:
    returns a new parser which tries `parser`, and if it fails uses `otherParser`.
  - `parser.then(function(result) { return anotherParser; })`:
    returns a new parser which tries `parser`, and on success calls the
    given function with the result of the parse, which is expected to
    return another parser.
  - `parser.then(anotherParser)`:
    expects `anotherParser` to follow `parser`, and yields the result
    of `anotherParser`.  NB: the result of `parser` here is ignored.
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
  - `parser.mark()` yields an object with `start`, `value`, and `end` keys, where
    `value` is the original value yielded by the parser, and `start` and `end` are
    the indices in the stream that contain the parsed text.

### Fantasyland

[fantasyland]: https://github.com/fantasyland/fantasy-land "Fantasyland"
[fantasyland-logo]: https://github.com/fantasyland/fantasy-land/raw/master/logo.png

![][fantasyland-logo]

Parsimmon is also compatible with [fantasyland][].  It is a Semigroup, an Applicative Functor and a Monad.
