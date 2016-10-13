# Base parsers and parser generators

These are either parsers or functions that return new parsers. These are the building blocks of parsers. They are all contained in the `Parsimmon` object.

## Parsimmon.isParser(obj)

Returns `true` if `obj` is a Parsimmon parser, otherwise `false`.

## Parsimmon.string(string)

Returns a parser that looks for `string` and yields that exact value.

## Parsimmon.oneOf(string)

Returns a parser that looks for exactly one character from `string`, and yields that character.

## Parsimmon.noneOf(string)

Returns a parser that looks for exactly one character *NOT* from `string`, and yields that character.

## Parsimmon.regexp(regexp, group=0)

Returns a parser that looks for a match to the regexp and yields the given match group (defaulting to the entire match). The regexp will always match starting at the current parse location. The regexp may only use the following flags: `imu`. Any other flag will result in an error being thrown.

## Parsimmon.regex

This was the original name for `Parsimmon.regexp`, but now it is just an alias.

## Parsimmon.succeed(result)

Returns a parser that doesn't consume any of the string, and yields `result`.

## Parsimmon.of(result)

This is an alias for `Parsimmon.succeed(result)`.

## Parsimmon.seq(p1, p2, ...pn)

Accepts any number of parsers and returns a new parser that expects them to match in order, yielding an array of all their results.

## Parsimmon.formatError(string, error)

Takes the `string` passed to `parser.parse(string)` and the `error` returned from `parser.parse(string)` and turns it into a human readable error message string. Note that there are certainly better ways to format errors, so feel free to write your own.

## Parsimmon.seqMap(p1, p2, ...pn, function(r1, r2, ...rn))

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

## Parsimmon.alt(p1, p2, ...pn)

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

## Parsimmon.sepBy(content, separator)

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

## Parsimmon.sepBy1(content, separator)

This  is the same as `Parsimmon.sepBy`, but matches the `content` parser **at least once**.

## Parsimmon.lazy(f)

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

## Parsimmon.lazy(description, f)

Equivalent to `Parsimmon.lazy(f).desc(description)`.

## Parsimmon.fail(message)

Returns a failing parser with the given message.

## Parsimmon.letter

Equivalent to `Parsimmon.regexp(/[a-z]/i)`.

## Parsimmon.letters

Equivalent to `Parsimmon.regexp(/[a-z]*/i)`.

## Parsimmon.digit

Equivalent to `Parsimmon.regexp(/[0-9]/)`.

## Parsimmon.digits

Equivalent to `Parsimmon.regexp(/[0-9]*/)`.

## Parsimmon.whitespace

Equivalent to `Parsimmon.regexp(/\s+/)`.

## Parsimmon.optWhitespace

Equivalent to `Parsimmon.regexp(/\s*/)`.

## Parsimmon.any

A parser that consumes and yields the next character of the stream.

## Parsimmon.all

A parser that consumes and yields the entire remainder of the stream.

## Parsimmon.eof

A parser that expects to be at the end of the stream (zero characters left).

## Parsimmon.index

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

## Parsimmon.test(predicate)

Returns a parser that yield a single character if it passes the `predicate` function. Example:

```javascript
var SameUpperLower = Parsimmon.test(function(c) {
  return c.toUpperCase() === c.toLowerCase();
});

SameUpperLower.parse('a'); // => {status: false, ...}
SameUpperLower.parse('-'); // => {status: true, ...}
SameUpperLower.parse(':'); // => {status: true, ...}
```

## Parsimmon.takeWhile(predicate)

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

## Parsimmon.custom(fn)

You can add a primitive parser (similar to the included ones) by using `Parsimmon.custom`. This is an example of how to create a parser that matches any character except the one provided:

```javascript
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

```javascript
var parser =
  Parsimmon.seq(
    Parsimmon.string('a'),
    notChar('b').times(5)
  );
parser.parse('accccc');
//=> {status: true, value: ['a', ['c', 'c', 'c', 'c', 'c']]}
```

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

# Parser methods

These methods are all called off of existing parsers, not from the `Parsimmon` object itself. They all return new parsers, so you can chain as many of them together as you like.

## parser.parse(stream)

Apply `parser` on the provided string `stream`, yielding an object that contains the status and parsed result.

If the parser succeeds, `status` is set to *true*, and the value will be available in the `value` property.

If the parser fails, `status` will be *false*. Further information on the error can be found at `index` and `expected`. `index` represents the furthest reached offset; it has a 0-based character `offset` and 1-based `line` and `column` properties. `expected` lists all tried parsers that were available at the offset, but the stream couldn't continue with any of these.

```javascript
var parser =
  Parsimmon.alt(
    // Use `parser.desc(string)` in order to have meaningful failure messages
    Parsimmon.string('a').desc("'a' character"),
    Parsimmon.string('b').desc("'b' character")
  );

parser.parse('a');    //=> {status:true, value:'a'}
parser.parse('ccc');  //=> {status:false, index:{...}, expected:["'a' character", "'b' character"]}
```

## parser.or(otherParser)

Returns a new parser which tries `parser`, and if it fails uses `otherParser`. Example:

```javascript
var numberPrefix =
  Parsimmon.string('+')
    .or(Parsimmon.string('-'))
    .fallback('');

numberPrefix.parse('+'); // => {status: true, value: '+'}
numberPrefix.parse('-'); // => {status: true, value: '-'}
numberPrefix.parse('');  // => {status: true, value: ''}
```

## parser.chain(newParserFunc)

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

## parser.then(anotherParser)

Expects `anotherParser` to follow `parser`, and yields the result
of `anotherParser`.

```javascript
var parserA = p1.then(p2); // is equivalent to...
var parserB = Parsimmon.seqMap(p1, p2, function(x1, x2) { return x2; });
```

## parser.map(function(result) { return anotherResult; })

Transforms the output of `parser` with the given function. Example:

```javascript
var pNum = Parsimmon.regexp(/[0-9]+/).map(Number);

pNum.parse('9');   // => {status: true, value: 9}
pNum.parse('123'); // => {status: true, value: 123}
pNum.parse('3.1'); // => {status: true, value: 3.1}
```

## parser.result(value)

Returns a new parser with the same behavior, but which yields `value`. Equivalent to `parser.map(function(x) { return x; }.bind(value))`.

## parser.fallback(value)

Returns a new parser which tries `parser` and, if it fails, yields `value` without consuming any character of the stream. Equivalent to `parser.or(Parsimmon.of(value))`.

```js
var digitOrZero = Parsimmon.digit.fallback('0');

digitOrZero.parse('4'); // => {status: true, value: '4'}
digitOrZero.parse('');  // => {status: true, value: '0'}
```

## parser.skip(otherParser)

Expects `otherParser` after `parser`, but yields the value of `parser`.


```javascript
var parserA = p1.skip(p2); // is equivalent to...
var parserB = Parsimmon.seqMap(p1, p2, function(x1, x2) { return x1; });
```

## parser.many()

Expects `parser` zero or more times, and yields an array of the results.

## parser.times(n)

Expects `parser` exactly `n` times, and yields an array of the results.

## parser.times(min, max)

Expects `parser` between `min` and `max` times, and yields an array
of the results.

## parser.atMost(n)

Expects `parser` at most `n` times. Yields an array of the results.

## parser.atLeast(n)

Expects `parser` at least `n` times. Yields an array of the results.

## parser.mark()

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

## parser.desc(description)

Returns a new parser whose failure message is `description`. For example, `string('x').desc('the letter x')` will indicate that
`'the letter x'` was expected.

# FantasyLand support

The following methods are provided for FantasyLand compatibility.

## Parsimmon.empty()

Returns `Parsimmon.fail("fantasy-land/empty")`.

## parser.empty()

Returns `Parsimmon.fail("fantasy-land/empty")`.
