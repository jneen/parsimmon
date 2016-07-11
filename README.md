[![Build Status](https://secure.travis-ci.org/jneen/parsimmon.png)](http://travis-ci.org/jneen/parsimmon)

# Parsimmon

[![Parsimmon](http://i.imgur.com/wyKOf.png)](http://github.com/jneen/parsimmon)

**Authors:** [@jneen](https://github.com/jneen) and [@laughinghan](https://github.com/laughinghan)

**Maintainer:** [@wavebeem](https://github.com/wavebeem)

Parsimmon is a small library for writing big parsers made up of lots of little parsers. The API is inspired by parsec and Promises/A.

Parsimmon supports IE7 and newer browsers, along with Node.js. It can be used as a standard Node module through npm, or through `build/parsimmon.browser.min.js` directly in the browser through a script tag, where it exports a global variable called `Parsimmon` (you can also use the `build/parsimmon.browser.js` for local development).

## Examples

See the [`examples`](https://github.com/jneen/parsimmon/tree/master/examples) directory for annotated examples of parsing JSON and Lisp.

## Explanation

A Parsimmon parser is an object that represents an action on a stream of text, and the promise of either an object yielded by that action on success or a message in case of failure. For example, `Parsimmon.string('foo')` yields the string `'foo'` if the beginning of the stream is `'foo'`, and otherwise fails.

The method `.map` is used to transform the yielded value. For example,

```javascript
Parsimmon.string('foo')
  .map(function(x) { return x + 'bar'; })
```

will yield `'foobar'` if the stream starts with `'foo'`. The parser

```javascript
Parsimmon.regexp(/[0-9]+/)
  .map(function(x) { return Number(x) * 2; })
```

will yield the number `24` when it encounters the string `'12'`.

Calling `.parse(string)` on a parser parses the string and returns an object with a boolean `status` flag, indicating whether the parse succeeded. If it succeeded, the `value` attribute will contain the yielded value. Otherwise, the `index` and `expected` attributes will contain the index of the parse error (with `offset`, `line` and `column` properties), and a sorted, unique array of messages indicating what was expected.

The error object can be passed along with the original source to `Parsimmon.formatError(source, error)` to obtain a human-readable error string.

## Full API

### Base parsers and parser generators:

#### `Parsimmon.string("my-string")`

Returns a parser that looks for `"my-string"` and yields that exact value.

#### `Parsimmon.oneOf("abc")`

Returns a parser that looks for exactly one character from the string passed in, and yields that character.

#### `Parsimmon.noneOf("abc")`

Returns a parser that looks for exactly one character *NOT* from the string passed in, and yields that character.

#### `Parsimmon.regexp(/regexp/, group=0)`

Returns a parser that looks for a match to the regexp and yields the given match group (defaulting to the entire match). The regexp will always match starting at the current parse location. The regexp may only use the following flags: `imu`. Any other flag will result in an error being thrown.

#### `Parsimmon.regex`

This was the original name for `Parsimmon.regexp`, but now it is just an alias.

#### `Parsimmon.succeed(result)`

Returns a parser that doesn't consume any of the string, and yields `result`.

#### `Parsimmon.of(result)`

This is an alias for `Parsimmon.succeed(result)`.

#### `Parsimmon.seq(p1, p2, ...pn)`

Accepts any number of parsers and returns a new parser that expects them to match in order, yielding an array of all their results.

#### `Parsimmon.seqMap(p1, p2, ...pn, function(r1, r2, ...rn))`

Matches all parsers sequentially, and passes their results as the arguments to a function. Similar to calling `Parsimmon.seq` and then `.map`, but the values are not put in an array. Example:

```javascript
Parsimmon.seqMap(
  Parsimmon.oneOf('abc'),
  Parsimmon.oneOf('+-*'),
  Parsimmon.oneOf('xyz'),
  function(first, operator, second) {
    console.log(first);    // => 'a'
    console.log(operator); // => '+'
    console.log(second);   // => 'x'
  }
).parse('a+x')
```

#### `Parsimmon.alt(p1, p2, ...pn)`

Accepts any number of parsers, yielding the value of the first one that succeeds, backtracking in between.

This means that the order of parsers matters. If two parsers match the
same prefix, the **longer** of the two must come first. Example:

```javascript
Parsimmon.alt(
  Parsimmon.string('ab'),
  Parsimmon.string('a')
).parse('ab');
// => {status: true, value: 'ab'}

Parsimmon.alt(
  Parsimmon.string('a'),
  Parsimmon.string('ab')
).parse('ab');
// => {status: false, ...}
```

In the second case, `Parsimmon.alt` matches on the first parser, then there are extra characters left over (`'b'`), so Parsimmon returns a failure.

#### `Parsimmon.sepBy(content, separator)`

Accepts two parsers, and expects zero or more matches for `content`, separated by `separator`, yielding an array. Example:

```javascript
Parsimmon.sepBy(
  Parsimmon.oneOf('abc'),
  Parsimmon.string('|')
).parse('a|b|c|c|c|a');
// => {status: true, value: ['a', 'b', 'c', 'c', 'c', 'a']}

Parsimmon.sepBy(
  Parsimmon.oneOf('XYZ'),
  Parsimmon.string('-')
).parse('');
// => {status: true, value: []}
```

#### `Parsimmon.sepBy1(content, separator)`

This  is the same as `Parsimmon.sepBy`, but matches the `content` parser **at least once**.

#### `Parsimmon.lazy(f)`

Accepts a function that returns a parser, which is evaluated the first time the parser is used. This is useful for referencing parsers that haven't yet been defined, and for implementing recursive parsers. Example:

```javascript
var Value = Parsimmon.lazy(function() {
  return Parsimmon.alt(
    Parsimmon.string('x'),
    Parsimmon.string('(')
      .then(Value)
      .skip(Parsimmon.string(')'))
  );
});

Value.parse('X');     // => {status: true, value: 'X'}
Value.parse('(X)');   // => {status: true, value: 'X'}
Value.parse('((X))'); // => {status: true, value: 'X'}
```

#### `Parsimmon.lazy(description, f)`

Equivalent to `Parsimmon.lazy(f).desc(description)`.

#### `Parsimmon.fail(message)`

Returns a failing parser with the given message.

#### `Parsimmon.letter`

Equivalent to `Parsimmon.regexp(/[a-z]/i)`.

#### `Parsimmon.letters`

Equivalent to `Parsimmon.regexp(/[a-z]*/i)`.

#### `Parsimmon.digit`

Equivalent to `Parsimmon.regexp(/[0-9]/)`.

#### `Parsimmon.digits`

Equivalent to `Parsimmon.regexp(/[0-9]*/)`.

#### `Parsimmon.whitespace`

Equivalent to `Parsimmon.regexp(/\s+/)`.

#### `Parsimmon.optWhitespace`

Equivalent to `Parsimmon.regexp(/\s*/)`.

#### `Parsimmon.any`

A parser that consumes and yields the next character of the stream.

#### `Parsimmon.all`

A parser that consumes and yields the entire remainder of the stream.

#### `Parsimmon.eof`

A parser that expects to be at the end of the stream (zero characters left).

#### `Parsimmon.index`

A parser that consumes no text and yields an object an object representing the current offset into the parse: it has a 0-based character `offset` property and 1-based `line` and `column` properties. Example:

```javascript
Parsimmon.seqMap(
  Parsimmon.oneOf('Q\n').many(),
  Parsimmon.string('B'),
  Parsimmon.index,
  function(_prefix, B, index) {
    console.log(index.offset); // => 8
    console.log(index.line);   // => 3
    console.log(index.column); // => 5
    return B;
  }
).parse('QQ\n\nQQQB');
```

#### `Parsimmon.test(predicate)`

Returns a parser that yield a single character if it passes the `predicate` function. Example:

```javascript
var SameUpperLower = Parsimmon.test(function(c) {
  return c.toUpperCase() === c.toLowerCase();
});

SameUpperLower.parse('a'); // => {status: false, ...}
SameUpperLower.parse('-'); // => {status: true, ...}
SameUpperLower.parse(':'); // => {status: true, ...}
```

#### `Parsimmon.takeWhile(predicate)`

Returns a parser yield a string containing all the next characters that pass the `predicate`. Example:

```javascript
var CustomString =
  Parsimmon.string('%')
    .then(Parsimmon.any)
    .chain(function(start) {
      var end = {
        '[': ']',
        '(': ')',
        '{': '}',
        '<': '>'
      }[start] || start;

      return Parsimmon.takeWhile(function(c) {
        return c !== end;
      }).skip(Parsimmon.string(end));
    });

CustomString.parse('%:a string:'); // => {status: true, value: 'a string'}
CustomString.parse('%[a string]'); // => {status: true, value: 'a string'}
CustomString.parse('%{a string}'); // => {status: true, value: 'a string'}
CustomString.parse('%(a string)'); // => {status: true, value: 'a string'}
CustomString.parse('%<a string>'); // => {status: true, value: 'a string'}
```

### Parser methods

#### `parser.or(otherParser)`

Returns a new parser which tries `parser`, and if it fails uses `otherParser`. Example:

```javascript
var numberPrefix =
  Parsimmon.string('+')
    .or(Parsimmin.of('-'))
    .or(Parsimmin.of(''));

maybePlus.parse('+'); // => {status: true, value: '+'}
maybePlus.parse('-'); // => {status: true, value: '-'}
maybePlus.parse('');  // => {status: true, value: ''}
```

#### `parser.chain(newParserFunc)`

Returns a new parser which tries `parser`, and on success calls the function `newParserFunc` with the result of the parse, which is expected to return another parser, which will be tried next. This allows you to dynamically decide how to continue the parse, which is impossible with the other combinators. Example:

```javascript
var CustomString =
  Parsimmon.string('%')
    .then(Parsimmon.any)
    .chain(function(start) {
      var end = {
        '[': ']',
        '(': ')',
        '{': '}',
        '<': '>'
      }[start] || start;

      return Parsimmon.takeWhile(function(c) {
        return c !== end;
      }).skip(Parsimmon.string(end));
    });

CustomString.parse('%:a string:'); // => {status: true, value: 'a string'}
CustomString.parse('%[a string]'); // => {status: true, value: 'a string'}
CustomString.parse('%{a string}'); // => {status: true, value: 'a string'}
CustomString.parse('%(a string)'); // => {status: true, value: 'a string'}
CustomString.parse('%<a string>'); // => {status: true, value: 'a string'}
```

#### `parser.then(anotherParser)`

Expects `anotherParser` to follow `parser`, and yields the result
of `anotherParser`.

```javascript
var parserA = p1.then(p2); // is equivalent to...
var parserB = Parsimmon.seqMap(p1, p2, function(x1, x2) { return x2; });
```

#### `parser.map(function(result) { return anotherResult; })`

Transforms the output of `parser` with the given function. Example:

```javascript
var pNum = Parsimmon.regexp(/[0-9]+/).map(Number);

pNum.parse('9');   // => {status: true, value: 9}
pNum.parse('123'); // => {status: true, value: 123}
pNum.parse('3.1'); // => {status: true, value: 3.1}
```

#### `parser.result(value)`

Returns a new parser with the same behavior, but which yields `value`. Equivalent to `parser.map(function(x) { return x; }.bind(value))`.

#### `parser.skip(otherParser)`

Expects `otherParser` after `parser`, but yields the value of `parser`.


```javascript
var parserA = p1.skip(p2); // is equivalent to...
var parserB = Parsimmon.seqMap(p1, p2, function(x1, x2) { return x1; });
```

#### `parser.many()`

Expects `parser` zero or more times, and yields an array of the results.

#### `parser.times(n)`

Expects `parser` exactly `n` times, and yields an array of the results.

#### `parser.times(min, max)`

Expects `parser` between `min` and `max` times, and yields an array
of the results.

#### `parser.atMost(n)`

Expects `parser` at most `n` times. Yields an array of the results.

#### `parser.atLeast(n)`

Expects `parser` at least `n` times. Yields an array of the results.

#### `parser.mark()`

Yields an object with `start`, `value`, and `end` keys,
where `value` is the original value yielded by the parser, and `start` and
`end` are are objects with a 0-based `offset` and 1-based `line` and
`column` properties that represent the position in the stream that
contained the parsed text. Works like this function:


```javascript
function mark(parser) {
  return Parsimmon.seqMap(
    Parsimmon.index,
    parser,
    Parsimmon.index,
    function(start, value, end) {
      return {
        start: start,
        value: value,
        end: end
      };
    }
  );
}
```

#### `parser.desc(description)`

Returns a new parser whose failure message is `description`. For example, `string('x').desc('the letter x')` will indicate that
`'the letter x'` was expected.


### Adding base parsers

You can add a primitive parser (similar to the included ones) by using `Parsimmon.custom`. This is an example of how to create a parser that matches any character except the one provided:

```js
function notChar(char) {
  return Parsimmon.custom(function(success, failure) {
    return function(stream, i) {
      if (stream.charAt(i) !== char && i <= stream.length) {
        return success(i + 1, stream.charAt(i));
      }
      return failure(i, 'anything different than "' + char + '"');
    };
  });
}
```

This parser can then be used and composed the same way all the existing ones are used and composed, for example:

```js
var parser = Parsimmon.seq(Parsimmon.string('a'), notChar('b').times(5));
console.log(parser.parse('accccc'));
//=> {status: true, value: ['a', ['c', 'c', 'c', 'c', 'c']]}
```

## Fantasyland

[fantasyland]: https://github.com/fantasyland/fantasy-land "Fantasyland"
[fantasyland-logo]: https://github.com/fantasyland/fantasy-land/raw/master/logo.png

![][fantasyland-logo]

Parsimmon is also compatible with [fantasyland][]. It is a Semigroup, an Applicative Functor and a Monad.
