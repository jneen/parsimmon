# Terminology

## Yields

When the documentation says a function *yields an array of strings*, it means the function returns a parser that when called with `.parse` will return an object containing the array of strings.

## Input

The string passed to `.parse` is called the *input*.

## Consumes

A parser is said to *consume* the text that it parses, leaving only the unconsumed text for subsequent parsers to check.

# Tips

## Readability

For the sake of readability in your own parsers, it's recommended to either create a shortcut for the Parsimmon library:

```javascript
var P = Parsimmon;
var parser = P.digits.sepBy(P.whitespace);
```

Or to create shortcuts for the Parsimmon values you intend to use (when using Babel):

```javascript
import { digits, whitespace } from 'parsimmon';
var parser = digits.sepBy(whitespace);
```

Because it can become quite wordy to repeat Parsimmon everywhere:

```javascript
var parser = Parsimmon.sepBy(Parsimmon.digits, Parsimmon.whitespace);
```

For clarity's sake, however, `Parsimmon` will refer to the Parsimmon library itself, and `parser` will refer to a parser being used as an object in a method, like `P.string('9')` in `P.string('9').map(Number)`.

## Side effects

Do not perform [side effects](https://en.wikipedia.org/wiki/Side_effect_(computer_science)) parser actions. This is potentially unsafe, as Parsimmon will backtrack between parsers, but there's no way to undo your side effects.

Side effects include pushing to an array, modifying an object, or `console.log`.

In this example, the parser `pVariable` is called twice on the same text because of `Parsimmon.alt` backtracking, and has a side effect (pushing to an array) inside its `.map` method, so we get two items in the array instead of just one.

```js
var x = 0;
var variableNames = [];
var pVariable =
  Parsimmon.regexp(/[a-z]+/i)
    .map(function(name) {
      variableNames.push(name);
      return name;
    });
var pDeclaration =
  Parsimmon.alt(
    Parsimmon.string('var ').then(pVariable).then(Parsimmon.string('\n')),
    Parsimmon.string('var ').then(pVariable).then(Parsimmon.string(';'))
  );
pDeclaration.parse('var gummyBear;');
console.log(variableNames);
// => ['gummyBear', 'gummyBear']
```

## Custom parsers

`Parsimmon.custom(fn)` is no longer recommended, please use `Parsimmon(fn)` instead. That being said, *most* of the time you will not need to ever create a custom parser using `Parsimmon(fn)`. Custom parsers have access to internal parsing state, which is primarily useful if you are parsing an indentation-sensitive language, such as Python. That being said, the functions `Parsimmon.indentMore`, `Parsimmon.indentLess`, and `Parsimmon.indentSame` are designed to handle that sort of thing for you anyway, so you still might not need to do it.

# Base parsers and parser generators

These are either parsers or functions that return new parsers. These are the building blocks of parsers. They are all contained in the `Parsimmon` object.

## Parsimmon.createLanguage(parsers)

`createLanguage` is the best starting point for building a language parser in Parsimmon. It organizes all of your parsers, collects them into a single namespace, and removes the need to worry about using `Parsimmon.lazy`.

Each function passed to `createLanguage` receives as its only parameter the entire language of parsers as an object. This is used for referring to other rules from within your current rule.

Example:

```js
var Lang = Parsimmon.createLanguage({
  Value: function(r) {
    return Parsimmon.alt(
      r.Number,
      r.Symbol,
      r.List
    );
  },
  Number: function() {
    return Parsimmon.regexp(/[0-9]+/).map(Number);
  },
  Symbol: function() {
    return Parsimmon.regexp(/[a-z]+/);
  },
  List: function(r) {
    return Parsimmon.string('(')
      .then(r.Value.sepBy(r._))
      .skip(Parsimmon.string(')'));
  },
  _: function() {
    return Parsimmon.optWhitespace;
  }
});
Lang.Value.tryParse('(list 1 2 foo (list nice 3 56 989 asdasdas))');
```

## Parsimmon(fn)

**NOTE:** You probably will never need to use this function. Most parsing can be accomplished using `Parsimmon.regexp` and combination with `Parsimmon.seq` and `Parsimmon.alt`, and friends.

You can add a primitive parser (similar to the included ones) by using `Parsimmon(fn)`. This is an example of how to create a parser that matches any character except the one provided:

- The parameter `input` is the entire string passed to `.parse` or `.tryParse`.
- The paremter `i` is the current parsing index into the `input` string.
- The parameter `state` is the current parsing state. Generally this is not necessary, but parsing indentation-sensitive languages such as Python requires maintaining some state during parsing, so this is provided for such tasks.

The return value from a custom parser should is somewhat complicated, so `Parsimmon.makeSuccess(i, value, state)` and `Parsimmon.makeFailure(i, expected, state)` are provided to ease implementation.

**NOTE**: You should not modify `state`. Parsimmon does not track changes to it, so if your parser backtracks at any point, you may end up with incorrect state. Example:

```js
// -*- BAD -*-
// Do not modify state
state[key] = value;
state.member = value;
state.push(value);
state.unshift(value);
state.number++;

// -*- GOOD -*-
// Use new state based on old state
var newState = Object.assign({}, state, {[key]: value});
var newState = Object.assign({}, state, {member: value});
var newState = state.concat([value]);
var newState = [value].concat(state);
var newState = Object.assign({}, state, {number: state.number + 1});
```

That example uses some ES6 features for the sake of brevity, but rest assured that libraries like Lodash can provide similar functionality as `Object.assign` if you need to target ES5 environments.

```javascript
function notChar(char) {
  return Parsimmon(function(input, i, state) {
    if (input.charAt(i) !== char) {
      return Parsimmon.makeSuccess(i + 1, input.charAt(i), state);
    }
    var expected = 'anything different than "' + char + '"';
    return Parsimmon.makeFailure(i, expected, state);
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

## Parsimmon.Parser(fn)

Alias of `Parsimmon(fn)` for backwards compatibility.

## Parsimmon.makeSuccess(index, value, state)

To be used inside of `Parsimmon(fn)`. Generates an object describing how far the successful parse went (`index`), what `value` it created doing so, and the new `state` after it's done. See documentation for `Parsimmon(fn)`.

## Parsimmon.makeFailure(furthest, expectation, state)

To be used inside of `Parsimmon(fn)`. Generates an object describing how far the unsuccessful parse went (`index`), what kind of syntax it expected to see (`expectation`), and what the parsing `state` before it failed. See documentation for `Parsimmon(fn)`.

## Parsimmon.isParser(obj)

Returns `true` if `obj` is a Parsimmon parser, otherwise `false`.

## Parsimmon.string(string)

Returns a parser that looks for `string` and yields that exact value.

## Parsimmon.oneOf(string)

Returns a parser that looks for exactly one character from `string`, and yields that character.

## Parsimmon.noneOf(string)

Returns a parser that looks for exactly one character *NOT* from `string`, and yields that character.

## Parsimmon.range(begin, end)

Parsers a single character in from `begin` to `end`, inclusive.

Example:

```js
var firstChar =
  Parsimmon.alt(
    Parsimmon.range('a', 'z'),
    Parsimmon.range('A', 'Z'),
    Parsimmon.oneOf('_$'),
  );
var restChar = firstChar.or(Parsimmon.range('0', '9'));
var identifier = P.seq(
  firstChar,
  restChar.many().tie()
).tie();

identifier.tryParse('__name$cool10__');
// => '__name$cool10__'

identifier.tryParse('3d');
// => Error
```

`Parsimmon.range(begin, end)` is equivalent to:

```js
Parsimmon.test(function(c) {
  return begin <= c && c <= end;
});
```

## Parsimmon.regexp(regexp)

Returns a parser that looks for a match to the regexp and yields the entire text matched. The regexp will always match starting at the current parse location. The regexp may only use the following flags: `imu`. Any other flag will result in an error being thrown.

## Parsimmon.regexp(regexp, group)

Like `Parsimmon.regexp(regexp)`, but yields only the text in the specific regexp match `group`, rather than the match of the entire regexp.

## Parsimmon.regex

This is an alias for `Parsimmon.regexp`.

## Parsimmon.notFollowedBy(parser)

Parses using `parser`, but does not consume what it parses. Yields `null` if the parser *does not match* the input. Otherwise it fails.

## Parsimmon.lookahead(parser)

Parses using `parser`, but does not consume what it parses. Yields an empty string.

## Parsimmon.lookahead(string)

Returns a parser that looks for `string` but does not consume it. Yields an empty string.

## Parsimmon.lookahead(regexp)

Returns a parser that wants the input to match `regexp`. Yields an empty string.

## Parsimmon.succeed(result)

Returns a parser that doesn't consume any input, and yields `result`.

## Parsimmon.of(result)

This is an alias for `Parsimmon.succeed(result)`.

## Parsimmon.formatError(string, error)

Takes the `string` passed to `parser.parse(string)` and the `error` returned from `parser.parse(string)` and turns it into a human readable error message string. Note that there are certainly better ways to format errors, so feel free to write your own.

## Parsimmon.seq(p1, p2, ...pn)

Accepts any number of parsers and returns a new parser that expects them to match in order, yielding an array of all their results.


## Parsimmon.seqMap(p1, p2, ...pn, function(r1, r2, ...rn))

Matches all parsers sequentially, and passes their results as the arguments to a function, yielding the return value of that function. Similar to calling `Parsimmon.seq` and then `.map`, but the values are not put in an array. Example:

```javascript
Parsimmon.seqMap(
  Parsimmon.oneOf('abc'),
  Parsimmon.oneOf('+-*'),
  Parsimmon.oneOf('xyz'),
  function(first, operator, second) {
    console.log(first);    // => 'a'
    console.log(operator); // => '+'
    console.log(second);   // => 'x'
    return [operator, first, second];
  }
).parse('a+x')
```

## Parsimmon.seqObj(...args)

Similar to `Parsimmon.seq(...parsers)`, but yields an object of results named based on arguments.

Takes one or more arguments, where each argument is either a parser or a named parser pair (`[stringKey, parser]`).

Requires at least one named parser.

All named parser keys must be unique.

Example:

```js
var _ = Parsimmon.optWhitespace;
var identifier = Parsimmon.regexp(/[a-z_][a-z0-9_]*/i);
var lparen = Parsimmon.string('(');
var rparen = Parsimmon.string(')');
var comma = Parsimmon.string(',');
var functionCall =
  Parsimmon.seqObj(
    ['function', identifier],
    lparen,
    ['arguments', identifier.trim(_).sepBy(comma)],
    rparen
  );
functionCall.tryParse('foo(bar, baz, quux)');
// => { function: 'foo',
//      arguments: [ 'bar', 'baz', 'quux' ] }
```

Tip: Combines well with `.node(name)` for a full-featured AST node.

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

See `parser.sepBy(separator)`.

## Parsimmon.sepBy1(content, separator)

See `parser.sepBy1(separator)`.

## Parsimmon.lazy(fn)

**NOTE:** This is not needed if you're using `createLanguage`.

Accepts a function that returns a parser, which is evaluated the first time the parser is used. This is useful for referencing parsers that haven't yet been defined, and for implementing recursive parsers. Example:

```javascript
var Value = Parsimmon.lazy(function() {
  return Parsimmon.alt(
    Parsimmon.string('X'),
    Parsimmon.string('(')
      .then(Value)
      .skip(Parsimmon.string(')'))
  );
});

Value.parse('X');     // => {status: true, value: 'X'}
Value.parse('(X)');   // => {status: true, value: 'X'}
Value.parse('((X))'); // => {status: true, value: 'X'}
```

## Parsimmon.lazy(description, fn)

Equivalent to `Parsimmon.lazy(f).desc(description)`.

## Parsimmon.fail(message)

Returns a failing parser with the given message.

## Parsimmon.countSpaces

Parser that expectes zero or more spaces and yields the number of spaces consumed. Intended to be used with the `Parsimmon.indent*` family of functions.

Equivalent to:

```js
Parsimmon.regexp(/[ ]*/).map(function(str) {
  return str.length;
})
```

## Parsimmon.initialStateIndent

**TODO**

## Parsimmon.countIndentation

**TODO**

## Parsimmon.indentMore(parser)

**TODO**


## Parsimmon.indentLess(parser)

**TODO**


## Parsimmon.indentSame(parser)

**TODO**

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

A parser that consumes and yields the next character of the input.

## Parsimmon.all

A parser that consumes and yields the entire remainder of the input.

## Parsimmon.eof

A parser that expects to be at the end of the input (zero characters left).

## Parsimmon.index

A parser that consumes no input and yields an object an object representing the current offset into the parse: it has a 0-based character `offset` property and 1-based `line` and `column` properties. Example:

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

**DEPRECATED:** Please use `Parsimmon(fn)` going forward.

You can add a primitive parser (similar to the included ones) by using `Parsimmon.custom`. This is an example of how to create a parser that matches any character except the one provided:

```javascript
function notChar(char) {
  return Parsimmon.custom(function(success, failure) {
    return function(input, i) {
      if (input.charAt(i) !== char) {
        return success(i + 1, input.charAt(i));
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

## parser.parse(input)

Apply `parser` on the provided string `input`, returning an object that contains the status and parsed result.

If the parser succeeds, `status` is set to *true*, and the value will be available in the `value` property.

If the parser fails, `status` will be *false*. Further information on the error can be found at `index` and `expected`. `index` represents the furthest reached offset; it has a 0-based character `offset` and 1-based `line` and `column` properties. `expected` lists all tried parsers that were available at the offset, but the input couldn't continue with any of these.

```javascript
var parser =
  Parsimmon.alt(
    // Use `parser.desc(string)` in order to have meaningful failure messages
    Parsimmon.string('a').desc("'a' character"),
    Parsimmon.string('b').desc("'b' character")
  );

parser.parse('a');
// => {status: true, value: 'a'}

parser.parse('ccc');
// => {status: false,
//     index: {...},
//     expected: ["'a' character", "'b' character"]}
```

## parser.parse(input, initialState)

Like `.parse(input)`, but passes `initialState` to the parser. When omitted, `initialState` is set to `[0]` for use with `Parsimmon.indentMore`, `Parsimmon.indentLess`, and `Parsimmon.indentSame`.

## parser.tryParse(input)

Like `parser.parse(input)` but either returns the parsed value or throws an error on failure. The error object contains additional properties about the error.

```javascript
var parser = Parsimmon.letters.sepBy1(Parsimmon.whitespace);

parser.tryParse('foo bar baz');
// => ['foo', 'bar', 'baz']

try {
  parser.tryParse('123')
} catch (err) {
  err.message;
  // => 'expected one of EOF, whitespace at line 1 column 1, got \'123\''

  err.type;
  // => 'ParsimmonError'

  err.result;
  // => {status: false,
  //     index: {offset: 0, line: 1, column: 1},
  //     expected: ['EOF', 'whitespace']}
}
```

## parser.tryParse(input, initialState)

Like `.tryParse(input)`, but passes `initialState` to the parser. When omitted, `initialState` is set to `[0]` for use with `Parsimmon.indentMore`, `Parsimmon.indentLess`, and `Parsimmon.indentSame`.

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

## parser.map(fn)

Transforms the output of `parser` with the given function. Example:

```javascript
var pNum =
  Parsimmon.regexp(/[0-9]+/)
    .map(Number)
    .map(function(x) {
      return x + 1;
    });

pNum.parse('9');   // => {status: true, value: 10}
pNum.parse('123'); // => {status: true, value: 124}
pNum.parse('3.1'); // => {status: true, value: 4.1}
```

## parser.result(value)

Returns a new parser with the same behavior, but which yields `value`. Equivalent to `parser.map(function(x) { return x; }.bind(value))`.

## parser.fallback(value)

Returns a new parser which tries `parser` and, if it fails, yields `value` without consuming any input. Equivalent to `parser.or(Parsimmon.of(value))`.

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

## parser.trim(anotherParser)

Expects `anotherParser` before and after `parser`, yielding the result of parser. Useful for trimming comments/whitespace around other parsers.

Example:

```js
Parsimmon.digits
  .map(Number)
  .trim(Parsimmon.optWhitespace)
  .sepBy(Parsimmon.string(','))
  .tryParse('   1, 2,3     , 4  ')
// => [1, 2, 3, 4]
```

It is equivalent to:

```js
anotherParser
  .then(parser)
  .skip(anotherParser)
```

It is also equivalent to:

```js
Parsimmon.seqMap(
  anotherParser,
  parser,
  anotherParser,
  function(before, middle) {
    return middle;
  }
)
```

## parser.wrap(before, after)

Expects the parser `before` before `parser` and `after` after `parser.

Example:

```js
Parsimmon.letters
  .trim(Parsimmon.optWhitespace)
  .wrap(Parsimmon.string('('), Parsimmon.string(')'))
  .tryParse('(   nice       )')
// => 'nice'
```

It is equivalent to:

```js
before
  .then(parser)
  .skip(after)
```

It is also equivalent to:

```js
Parsimmon.seqMap(
  before,
  parser,
  after,
  function(before, middle) {
    return middle;
  }
)
```

## parser.notFollowedBy(anotherParser)

Returns a parser that looks for anything but whatever `anotherParser` wants to parse, and does not consume it. Yields the same result as `parser`. Equivalent to `parser.skip(Parsimmon.notFollowedBy(anotherParser))`.

## parser.lookahead(anotherParser)

Returns a parser that looks for whatever `anotherParser` wants to parse, but does not consume it. Yields the same result as `parser`. Equivalent to `parser.skip(Parsimmon.lookahead(anotherParser))`.

## parser.lookahead(string)

Returns a parser that looks for `string` but does not consume it. Yields the same result as `parser`. Equivalent to `parser.skip(Parsimmon.lookahead(string))`.

## parser.lookahead(regexp)

Returns a parser that wants the input to match `regexp`. Yields the same result as `parser`. Equivalent to `parser.skip(Parsimmon.lookahead(regexp))`.

## parser.tie()

When called on a parser yielding an array of strings, yields all their strings concatenated. Asserts that its input is actually an array of strings.

Example:

```js
var number = Parsimmon.seq(
  Parsimmon.digits,
  Parsimmon.string('.'),
  Parsimmon.digits
).tie().map(Number);

number.tryParse('1.23');
// => 1.23
```

`parser.tie()` is similar to this:

```js
parser.map(function(array) {
  return array.join('');
});
```

Note: `parser.tie()` is usually used after `Parsimmon.seq(...parsers)` or `parser.many()`.

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

## parser.node(name)

Yields an object with `name`, `value`, `start`, and `end` keys, where `value` is the original value yielded by the parser, `name` is the argument passed in, and `start` and `end` are are objects with a 0-based `offset` and 1-based `line` and `column` properties that represent the position in the input that contained the parsed text.

Example:

```javascript
var Identifier =
  Parsimmon.regexp(/[a-z]+/).node('Identifier');

Identifier.tryParse('hey');
// => { name: 'Identifier',
//      value: 'hey',
//      start: { offset: 0, line: 1, column: 1 },
//      end: { offset: 3, line: 1, column: 4 } }
```

## parser.mark()

Yields an object with `start`, `value`, and `end` keys, where `value` is the original value yielded by the parser, and `start` and `end` are are objects with a 0-based `offset` and 1-based `line` and `column` properties that represent the position in the input that contained the parsed text. Works like this function:

```javascript
var Identifier =
  Parsimmon.regexp(/[a-z]+/).mark();

Identifier.tryParse('hey');
// => { start: { offset: 0, line: 1, column: 1 },
//      value: 'hey',
//      end: { offset: 3, line: 1, column: 4 } }
```

## parser.thru(wrapper)

Simply returns `wrapper(this)` from the parser. Useful for custom functions used to wrap your parsers, while keeping with Parsimmon chaining style.

Example:

```js
function makeNode(name) {
  return function(parser) {
    return Parsimmon.seqMap(
      Parsimmon.index,
      parser,
      Parsimmon.index,
      function(start, value, end) {
        return Object.freeze({
          type: 'myLanguage.' + name,
          value: value,
          start: start,
          end: end
        });
      }
    );
  };
}

var Identifier =
  Parsimmon.regexp(/[a-z]+/)
    .thru(makeNode('Identifier'));

Identifier.tryParse('hey');
// => { type: 'myLanguage.Identifier',
//      value: 'hey',
//      start: { offset: 0, line: 1, column: 1 },
//      end: { offset: 3, line: 1, column: 4 } }
```

## parser.desc(description)

Returns a new parser whose failure message is `description`. For example, `string('x').desc('the letter x')` will indicate that
`'the letter x'` was expected.

It is important to only add descriptions to "low-level" parsers; things like numbers and strings. If you add a description to *every* parser you write then generated error messages will not be very helpful when simple syntax errors occur.

```javascript
var P = require('parsimmon');

var pNumber =
  P.regexp(/[0-9]+/).map(Number).desc('a number');

var pPairNorm =
  P.seq(
    P.string('(').then(pNumber).skip(P.string(',')),
    pNumber.skip(P.string(')'))
  );

var pPairDesc =
  pPairNorm.desc('a pair');

var badInputs = [
  '(1,2',
  '1,2)',
  '(1|2)',
];

function report(name, parser, x) {
  var expectations = parser.parse(x).expected.join(', ');
  console.log(name + ' | Expected', expectations);
}

badInputs.forEach(function(x) {
  report('pPairNorm', pPairNorm, x);
  report('pPairDesc', pPairDesc, x);
});
```

`pPairNorm` will output much more useful information than `pPairDesc`, as seen below:

```
pPairNorm | Expected ')'
pPairDesc | Expected a pair
pPairNorm | Expected '('
pPairDesc | Expected a pair
pPairNorm | Expected ','
pPairDesc | Expected a pair
```

# FantasyLand support

Parsimmon parsers are Semigroups, Applicative Functors, and Monads. Both the old-style (`concat`) and new-style (`fantasy-land/concat`) method names are supported.

## Parsimmon.empty()

Returns `Parsimmon.fail("fantasy-land/empty")`.

## parser.empty()

See `Parsimmon.empty()`.

## parser.concat(otherParser)

Equivalent to `parser.or(otherParser)`.

## parser.ap(otherParser)

Takes `parser` which returns a function and applies it to the parsed value of `otherParser`.

```javascript
Parsimmon.digit
  .ap(Parsimmon.of(function(x) { return Number(x) + 1; }))
  .parse('4')
// => {status: true, value: 5}
```

## parser.sepBy(separator)

Equivalent to `Parsimmon.sepBy(parser, separator)`.

Expects zero or more matches for `parser`, separated by the parser `separator`, yielding an array. Example:

```javascript
Parsimmon.oneOf('abc')
  .sepBy(Parsimmon.string('|'))
  .parse('a|b|c|c|c|a');
// => {status: true, value: ['a', 'b', 'c', 'c', 'c', 'a']}

Parsimmon.oneOf('XYZ'),
  .sepBy(Parsimmon.string('-'))
  .parse('');
// => {status: true, value: []}
```

## parser.sepBy1(separator)

Equivalent to `Parsimmon.sepBy1(parser, separator)`.

This is the same as `Parsimmon.sepBy`, but matches the `content` parser **at least once**.

## parser.chain(newParserFunc)

See `parser.chain(newParserFunc)` defined earlier.

## parser.of(result)

Equivalent to `Parsimmon.of(result)`.
