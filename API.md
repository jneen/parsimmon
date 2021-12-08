# Table of Contents

- [Terminology](#terminology)
  - [Yields](#yields)
  - [Input](#input)
  - [Consumes](#consumes)
- [Base parsers and parser generators](#base-parsers-and-parser-generators)
  - [Parsimmon.createLanguage(parsers)](#parsimmoncreatelanguageparsers)
  - [Parsimmon(fn)](#parsimmonfn)
  - [Parsimmon.Parser(fn)](#parsimmonparserfn)
  - [Parsimmon.makeSuccess(index, value)](#parsimmonmakesuccessindex-value)
  - [Parsimmon.makeFailure(furthest, expectation)](#parsimmonmakefailurefurthest-expectation)
  - [Parsimmon.isParser(obj)](#parsimmonisparserobj)
  - [Parsimmon.string(string)](#parsimmonstringstring)
  - [Parsimmon.oneOf(string)](#parsimmononeofstring)
  - [Parsimmon.noneOf(string)](#parsimmonnoneofstring)
  - [Parsimmon.range(begin, end)](#parsimmonrangebegin-end)
  - [Parsimmon.regexp(regexp)](#parsimmonregexpregexp)
  - [Parsimmon.regexp(regexp, group)](#parsimmonregexpregexp-group)
  - [Parsimmon.regex](#parsimmonregex)
  - [Parsimmon.notFollowedBy(parser)](#parsimmonnotfollowedbyparser)
  - [Parsimmon.lookahead(parser)](#parsimmonlookaheadparser)
  - [Parsimmon.lookahead(string)](#parsimmonlookaheadstring)
  - [Parsimmon.lookahead(regexp)](#parsimmonlookaheadregexp)
  - [Parsimmon.succeed(result)](#parsimmonsucceedresult)
  - [Parsimmon.of(result)](#parsimmonofresult)
  - [Parsimmon.formatError(string, error)](#parsimmonformaterrorstring-error)
  - [Parsimmon.seq(p1, p2, ...pn)](#parsimmonseqp1-p2-pn)
  - [Parsimmon.seqMap(p1, p2, ...pn, function(r1, r2, ...rn))](#parsimmonseqmapp1-p2-pn-functionr1-r2-rn)
  - [Parsimmon.seqObj(...args)](#parsimmonseqobjargs)
  - [Parsimmon.alt(p1, p2, ...pn)](#parsimmonaltp1-p2-pn)
  - [Parsimmon.sepBy(content, separator)](#parsimmonsepbycontent-separator)
  - [Parsimmon.sepBy1(content, separator)](#parsimmonsepby1content-separator)
  - [Parsimmon.lazy(fn)](#parsimmonlazyfn)
  - [Parsimmon.lazy(description, fn)](#parsimmonlazydescription-fn)
  - [Parsimmon.fail(message)](#parsimmonfailmessage)
  - [Parsimmon.letter](#parsimmonletter)
  - [Parsimmon.letters](#parsimmonletters)
  - [Parsimmon.digit](#parsimmondigit)
  - [Parsimmon.digits](#parsimmondigits)
  - [Parsimmon.whitespace](#parsimmonwhitespace)
  - [Parsimmon.optWhitespace](#parsimmonoptwhitespace)
  - [Parsimmon.cr](#parsimmoncr)
  - [Parsimmon.lf](#parsimmonlf)
  - [Parsimmon.crlf](#parsimmoncrlf)
  - [Parsimmon.newline](#parsimmonnewline)
  - [Parsimmon.end](#parsimmonend)
  - [Parsimmon.any](#parsimmonany)
  - [Parsimmon.all](#parsimmonall)
  - [Parsimmon.eof](#parsimmoneof)
  - [Parsimmon.index](#parsimmonindex)
  - [Parsimmon.test(predicate)](#parsimmontestpredicate)
  - [Parsimmon.takeWhile(predicate)](#parsimmontakewhilepredicate)
  - [Parsimmon.custom(fn)](#parsimmoncustomfn)
- [Binary constructors](#binary-constructors)
  - [Parsimmon.byte(int)](#parsimmonbyteint)
  - [Parsimmon.bitSeq(alignments)](#parsimmonbitseqalignments)
  - [Parsimmon.bitSeqObj(namedAlignments)](#parsimmonbitseqobjnamedalignments)
- [Parser methods](#parser-methods)
  - [parser.parse(input)](#parserparseinput)
  - [parser.tryParse(input)](#parsertryparseinput)
  - [parser.or(otherParser)](#parserorotherparser)
  - [parser.chain(newParserFunc)](#parserchainnewparserfunc)
  - [parser.then(anotherParser)](#parserthenanotherparser)
  - [parser.map(fn)](#parsermapfn)
  - [parser.contramap(fn)](#parsercontramapfn)
  - [parser.promap(fn)](#parserpromapfn)
  - [parser.result(value)](#parserresultvalue)
  - [parser.fallback(value)](#parserfallbackvalue)
  - [parser.skip(otherParser)](#parserskipotherparser)
  - [parser.trim(anotherParser)](#parsertrimanotherparser)
  - [parser.wrap(before, after)](#parserwrapbefore-after)
  - [parser.notFollowedBy(anotherParser)](#parsernotfollowedbyanotherparser)
  - [parser.lookahead(anotherParser)](#parserlookaheadanotherparser)
  - [parser.lookahead(string)](#parserlookaheadstring)
  - [parser.lookahead(regexp)](#parserlookaheadregexp)
  - [parser.assert(condition, message)](#parserassertcondition-message)
  - [parser.tie()](#parsertie)
  - [parser.many()](#parsermany)
  - [parser.times(n)](#parsertimesn)
  - [parser.times(min, max)](#parsertimesmin-max)
  - [parser.atMost(n)](#parseratmostn)
  - [parser.atLeast(n)](#parseratleastn)
  - [parser.node(name)](#parsernodename)
  - [parser.mark()](#parsermark)
  - [parser.thru(wrapper)](#parserthruwrapper)
  - [parser.desc(description)](#parserdescdescription)
- [FantasyLand support](#fantasyland-support)
  - [Parsimmon.empty()](#parsimmonempty)
  - [parser.empty()](#parserempty)
  - [parser.concat(otherParser)](#parserconcatotherparser)
  - [parser.ap(otherParser)](#parserapotherparser)
  - [parser.sepBy(separator)](#parsersepbyseparator)
  - [parser.sepBy1(separator)](#parsersepby1separator)
  - [parser.chain(newParserFunc)](#parserchainnewparserfunc-1)
  - [parser.of(result)](#parserofresult)
- [Tips](#tips)
  - [Readability](#readability)
  - [Side effects](#side-effects)

# Terminology

## Yields

When the documentation says a function _yields an array of strings_, it means the function returns a parser that when called with [`.parse`](#parserparseinput) will return an object containing the array of strings.

## Input

The string passed to [`.parse`](#parserparseinput) is called the _input_.

## Consumes

A parser is said to _consume_ the text that it parses, leaving only the unconsumed text for subsequent parsers to check.

# Base parsers and parser generators

These are either parsers or functions that return new parsers. These are the building blocks of parsers. They are all contained in the `Parsimmon` object.

## Parsimmon.createLanguage(parsers)

`createLanguage` is the best starting point for building a language parser in Parsimmon. It organizes all of your parsers, collects them into a single namespace, and removes the need to worry about using `Parsimmon.lazy`.

Each function passed to `createLanguage` receives as its only parameter the entire language of parsers as an object. This is used for referring to other rules from within your current rule.

Example:

```js
var Lang = Parsimmon.createLanguage({
  Value: function(r) {
    return Parsimmon.alt(r.Number, r.Symbol, r.List);
  },
  Number: function() {
    return Parsimmon.regexp(/[0-9]+/).map(Number);
  },
  Symbol: function() {
    return Parsimmon.regexp(/[a-z]+/);
  },
  List: function(r) {
    return Parsimmon.string("(")
      .then(r.Value.sepBy(r._))
      .skip(Parsimmon.string(")"));
  },
  _: function() {
    return Parsimmon.optWhitespace;
  }
});
Lang.Value.tryParse("(list 1 2 foo (list nice 3 56 989 asdasdas))");
```

## Parsimmon(fn)

**NOTE:** You probably will _never_ need to use this function. Most parsing can be accomplished using [`Parsimmon.regexp`](#parsimmonregexpregexp) and combination with [`Parsimmon.seq`](#parsimmonseqp1-p2-pn) and [`Parsimmon.alt`](#parsimmonaltp1-p2-pn).

You can add a primitive parser (similar to the included ones) by using [`Parsimmon(fn)`](#parsimmonfn). This is an example of how to create a parser that matches any character except the one provided:

```js
function notChar(char) {
  return Parsimmon(function(input, i) {
    if (input.charAt(i) !== char) {
      return Parsimmon.makeSuccess(i + 1, input.charAt(i));
    }
    return Parsimmon.makeFailure(i, 'anything different than "' + char + '"');
  });
}
```

This parser can then be used and composed the same way all the existing ones are used and composed, for example:

```js
var parser = Parsimmon.seq(Parsimmon.string("a"), notChar("b").times(5));
parser.parse("accccc");
//=> {status: true, value: ['a', ['c', 'c', 'c', 'c', 'c']]}
```

## Parsimmon.Parser(fn)

Alias of [`Parsimmon(fn)`](#parsimmonfn) for backward compatibility.

## Parsimmon.makeSuccess(index, value)

To be used inside of [`Parsimmon(fn)`](#parsimmonfn). Generates an object describing how far the successful parse went (`index`), and what `value` it created doing so. See documentation for [`Parsimmon(fn)`](#parsimmonfn).

## Parsimmon.makeFailure(furthest, expectation)

To be used inside of [`Parsimmon(fn)`](#parsimmonfn). Generates an object describing how far the unsuccessful parse went (`index`), and what kind of syntax it expected to see (`expectation`). The expected value may also be an array of different values. See documentation for [`Parsimmon(fn)`](#parsimmonfn).

## Parsimmon.isParser(obj)

Returns `true` if `obj` is a Parsimmon parser, otherwise `false`.

## Parsimmon.string(string)

Returns a parser that looks for `string` and yields that exact value.

## Parsimmon.oneOf(string)

Returns a parser that looks for exactly one character from `string`, and yields that character.

## Parsimmon.noneOf(string)

Returns a parser that looks for precisely one character _NOT_ from `string`, and yields that character.

## Parsimmon.range(begin, end)

Parses a single character from `begin` to `end`, inclusive.

Example:

```js
var firstChar = Parsimmon.alt(
  Parsimmon.range("a", "z"),
  Parsimmon.range("A", "Z"),
  Parsimmon.oneOf("_$")
);
var restChar = firstChar.or(Parsimmon.range("0", "9"));
var identifier = P.seq(firstChar, restChar.many().tie()).tie();

identifier.tryParse("__name$cool10__");
// => '__name$cool10__'

identifier.tryParse("3d");
// => Error
```

`Parsimmon.range(begin, end)` is equivalent to:

```js
Parsimmon.test(function(c) {
  return begin <= c && c <= end;
});
```

## Parsimmon.regexp(regexp)

Returns a parser that looks for a match to the regexp and yields the entire text matched. The regexp will always match starting at the current parse location. The regexp may only use the following flags: `imus`. Any other flag will result in an error being thrown.

## Parsimmon.regexp(regexp, group)

Like [`Parsimmon.regexp(regexp)`](#parsimmonregexpregexp), but yields only the text in the specific regexp match `group`, rather than the match of the entire regexp.

## Parsimmon.regex

This is an alias for [`Parsimmon.regexp`](#parsimmonregexpregexp).

## Parsimmon.notFollowedBy(parser)

Parses using `parser`, but does not consume what it parses. Yields `null` if the parser _does not match_ the input. Otherwise, it fails.

## Parsimmon.lookahead(parser)

Parses using `parser`, but does not consume what it parses. Yields an empty string.

## Parsimmon.lookahead(string)

Returns a parser that looks for `string` but does not consume it. Yields an empty string.

## Parsimmon.lookahead(regexp)

Returns a parser that wants the input to match `regexp`. Yields an empty string.

## Parsimmon.succeed(result)

Returns a parser that doesn't consume any input and yields `result`.

## Parsimmon.of(result)

This is an alias for [`Parsimmon.succeed(result)`](#parsimmonsucceedresult).

## Parsimmon.formatError(string, error)

Takes the `string` passed to `parser.parse(string)` and the `error` returned from `parser.parse(string)` and turns it into a human-readable error message string. Note that there are certainly better ways to format errors, so feel free to write your own.

## Parsimmon.seq(p1, p2, ...pn)

Accepts any number of parsers and returns a new parser that expects them to match in order, yielding an array of all their results.

## Parsimmon.seqMap(p1, p2, ...pn, function(r1, r2, ...rn))

Matches all parsers sequentially, and passes their results as the arguments to a function, yielding the return value of that function. Similar to calling [`Parsimmon.seq`](#parsimmonseqp1-p2-pn) and then [`.map`](#parsermapfn), but the values are not put in an array. Example:

```js
Parsimmon.seqMap(
  Parsimmon.oneOf("abc"),
  Parsimmon.oneOf("+-*"),
  Parsimmon.oneOf("xyz"),
  function(first, operator, second) {
    console.log(first); // => 'a'
    console.log(operator); // => '+'
    console.log(second); // => 'x'
    return [operator, first, second];
  }
).parse("a+x");
```

## Parsimmon.seqObj(...args)

Similar to [`Parsimmon.seq(...parsers)`](#parsimmonseqp1-p2-pn), but yields an object of results named based on arguments.

Takes one or more arguments, where each argument is either a parser or a named parser pair (`[stringKey, parser]`).

Requires at least one named parser.

All named parser keys must be unique.

Example:

```js
var _ = Parsimmon.optWhitespace;
var identifier = Parsimmon.regexp(/[a-z_][a-z0-9_]*/i);
var lparen = Parsimmon.string("(");
var rparen = Parsimmon.string(")");
var comma = Parsimmon.string(",");
var functionCall = Parsimmon.seqObj(
  ["function", identifier],
  lparen,
  ["arguments", identifier.trim(_).sepBy(comma)],
  rparen
);
functionCall.tryParse("foo(bar, baz, quux)");
// => { function: 'foo',
//      arguments: [ 'bar', 'baz', 'quux' ] }
```

Tip: Combines well with `.node(name)` for a full-featured AST node.

## Parsimmon.alt(p1, p2, ...pn)

Accepts any number of parsers, yielding the value of the first one that succeeds, backtracking in between.

This means that the order of parsers matters. If two parsers match the
same prefix, the **longer** of the two must come first. Example:

```js
Parsimmon.alt(Parsimmon.string("ab"), Parsimmon.string("a")).parse("ab");
// => {status: true, value: 'ab'}

Parsimmon.alt(Parsimmon.string("a"), Parsimmon.string("ab")).parse("ab");
// => {status: false, ...}
```

In the second case, [`Parsimmon.alt`](#parsimmonaltp1-p2-pn) matches on the first parser, then there are extra characters left over (`'b'`), so Parsimmon returns a failure.

## Parsimmon.sepBy(content, separator)

See [`parser.sepBy(separator)`](#parsersepbyseparator).

## Parsimmon.sepBy1(content, separator)

See [`parser.sepBy1(separator)`](#parsersepby1separator).

## Parsimmon.lazy(fn)

**NOTE:** This is not needed if you're using `createLanguage`.

Accepts a function that returns a parser, which is evaluated the first time the parser is used. This is useful for referencing parsers that haven't yet been defined, and for implementing recursive parsers. Example:

```js
var Value = Parsimmon.lazy(function() {
  return Parsimmon.alt(
    Parsimmon.string("X"),
    Parsimmon.string("(")
      .then(Value)
      .skip(Parsimmon.string(")"))
  );
});

Value.parse("X"); // => {status: true, value: 'X'}
Value.parse("(X)"); // => {status: true, value: 'X'}
Value.parse("((X))"); // => {status: true, value: 'X'}
```

## Parsimmon.lazy(description, fn)

Equivalent to `Parsimmon.lazy(f).desc(description)`.

## Parsimmon.fail(message)

Returns a failing parser with the given message.

## Parsimmon.letter

Equivalent to [`Parsimmon.regexp(/[a-z]/i)`](#parsimmonregexpregexp).

## Parsimmon.letters

Equivalent to [`Parsimmon.regexp(/[a-z]*/i)`](#parsimmonregexpregexp).

## Parsimmon.digit

Equivalent to [`Parsimmon.regexp(/[0-9]/)`](#parsimmonregexpregexp).

## Parsimmon.digits

Equivalent to [`Parsimmon.regexp(/[0-9]*/)`](#parsimmonregexpregexp).

## Parsimmon.whitespace

Equivalent to [`Parsimmon.regexp(/\s+/)`](#parsimmonregexpregexp).

## Parsimmon.optWhitespace

Equivalent to [`Parsimmon.regexp(/\s*/)`](#parsimmonregexpregexp).

## Parsimmon.cr

Equivalent to [`Parsimmon.string("\r")`](#parsimmonstringstring).

This parser checks for the "carriage return" character, which is used as the line terminator for classic Mac OS 9 text files.

## Parsimmon.lf

Equivalent to [`Parsimmon.string("\n")`](#parsimmonstringstring).

This parser checks for the "line feed" character, which is used as the line terminator for Linux and macOS text files.

## Parsimmon.crlf

Equivalent to [`Parsimmon.string("\r\n")`](#parsimmonstringstring).

This parser checks for the "carriage return" character followed by the "line feed" character, which is used as the line terminator for Windows text files and HTTP headers.

## Parsimmon.newline

Equivalent to:

```js
Parsimmon.alt(Parsimmon.crlf, Parsimmon.lf, Parsimmon.cr).desc("newline");
```

This flexible parser will match any kind of text file line ending.

## Parsimmon.end

Equivalent to `Parsimmon.alt(Parsimmon.newline, Parsimmon.eof)`.

This is the most general purpose "end of line" parser. It allows the "end of file" in addition to all three text file line endings from [`Parsimmon.newline`](#parsimmonnewline). This is important because text files frequently do not have line terminators at the end ("trailing newline").

## Parsimmon.any

A parser that consumes and yields the next character of the input.

## Parsimmon.all

A parser that consumes and yields the entire remainder of the input.

## Parsimmon.eof

A parser that expects to be at the end of the input (zero characters left).

## Parsimmon.index

A parser that consumes no input and yields an object representing the current offset into the parse: it has a 0-based character `offset` property and 1-based `line` and `column` properties. Example:

```js
Parsimmon.seqMap(
  Parsimmon.oneOf("Q\n").many(),
  Parsimmon.string("B"),
  Parsimmon.index,
  function(_prefix, B, index) {
    console.log(index.offset); // => 8
    console.log(index.line); // => 3
    console.log(index.column); // => 5
    return B;
  }
).parse("QQ\n\nQQQB");
```

## Parsimmon.test(predicate)

Returns a parser that yield a single character if it passes the `predicate` function. Example:

```js
var SameUpperLower = Parsimmon.test(function(c) {
  return c.toUpperCase() === c.toLowerCase();
});

SameUpperLower.parse("a"); // => {status: false, ...}
SameUpperLower.parse("-"); // => {status: true, ...}
SameUpperLower.parse(":"); // => {status: true, ...}
```

## Parsimmon.takeWhile(predicate)

Returns a parser yield a string containing all the next characters that pass the `predicate`. Example:

```js
var CustomString = Parsimmon.string("%")
  .then(Parsimmon.any)
  .chain(function(start) {
    var end =
      {
        "[": "]",
        "(": ")",
        "{": "}",
        "<": ">"
      }[start] || start;

    return Parsimmon.takeWhile(function(c) {
      return c !== end;
    }).skip(Parsimmon.string(end));
  });

CustomString.parse("%:a string:"); // => {status: true, value: 'a string'}
CustomString.parse("%[a string]"); // => {status: true, value: 'a string'}
CustomString.parse("%{a string}"); // => {status: true, value: 'a string'}
CustomString.parse("%(a string)"); // => {status: true, value: 'a string'}
CustomString.parse("%<a string>"); // => {status: true, value: 'a string'}
```

## Parsimmon.custom(fn)

**Deprecated:** Please use [`Parsimmon(fn)`](#parsimmonfn) going forward.

You can add a primitive parser (similar to the included ones) by using `Parsimmon.custom`. This is an example of how to create a parser that matches any character except the one provided:

```js
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

```js
var parser = Parsimmon.seq(Parsimmon.string("a"), notChar("b").times(5));
parser.parse("accccc");
// => { status: true, value: ['a', ['c', 'c', 'c', 'c', 'c']] }
```

# Binary constructors

The `Parsimmon.Binary` constructors parse binary content using Node.js Buffers. These constructors can be combined with the normal parser combinators such as [`Parsimmon.seq`](#parsimmonseqp1-p2-pn), [`Parsimmon.seqObj`](#parsimmonseqobjargs), and still have all the same methods as text-based parsers (e.g. [`.map`](#parsermapfn), `.node`, etc.).

## Parsimmon.byte(int)

Returns a parser that yields a byte (as a number) that matches the given input; similar to `Parsimmon.digit` and `Parsimmon.letter`.

```js
var parser = Parsimmon.Binary.byte(0x3f);
parser.parse(Buffer.from([0x3f]));
// => { status: true, value: 63 }
```

## Parsimmon.buffer(length)

Returns a parser that will consume some of a buffer and present it as a raw buffer for further transformation. This buffer is cloned, so in case you use a destructive method, it will not corrupt the original input buffer.

```js
var parser = Parsimmon.Binary.buffer(2).skip(Parsimmon.any);
parser.parse(Buffer.from([1, 2, 3]));
// => { status: true, value: <Buffer 01 02> }
```

## Parsimmon.encodedString(encoding, length)

Parse `length` bytes, and then decode with a particular `encoding`.

```js
var parser = Parsimmon.Binary.encodedString("utf8", 17);
parser.parse(
  Buffer.from([
    0x68,
    0x65,
    0x6c,
    0x6c,
    0x6f,
    0x20,
    0x74,
    0x68,
    0x65,
    0x72,
    0x65,
    0x21,
    0x20,
    0xf0,
    0x9f,
    0x98,
    0x84
  ])
);
// => { status: true, value: 'hello there! 😄' }
```

## Parsimmon.uint8

Parse an unsigned integer of 1 byte.

```js
var parser = Parsimmon.Binary.uint8;
parser.parse(Buffer.from([0xff]));
// => { status: true, value: 255 }
```

## Parsimmon.int8

Parse a signed integer of 1 byte.

```js
var parser = Parsimmon.Binary.int8;
parser.parse(Buffer.from([0xff]));
// => { status: true, value: -1 }
```

## Parsimmon.uintBE(length)

Parse an unsigned integer (big-endian) of length bytes. Length cannot exceed 6.

```js
var parser = Parsimmon.Binary.uintBE(4);
parser.parse(Buffer.from([1, 2, 3, 4]));
// => { status: true, value: 16909060 }
```

## Parsimmon.intBE(length)

Parse a signed integer (big-endian) of length bytes. Length cannot exceed 6.

```js
var parser = Parsimmon.Binary.intBE(4);
parser.parse(Buffer.from([0xff, 2, 3, 4]));
// => { status: true, value: -16645372 }
```

## Parsimmon.uintLE(length)

Parse an unsigned integer (little-endian) of length bytes. Length cannot exceed 6.

```js
var parser = Parsimmon.Binary.uintLE(4);
parser.parse(Buffer.from([1, 2, 3, 4]));
// => { status: true, value: 67305985 }
```

## Parsimmon.intLE(length)

Parse a signed integer (little-endian) of length bytes. Length cannot exceed 6.

```js
var parser = Parsimmon.Binary.intLE(4);
parser.parse(Buffer.from([1, 2, 3, 0xff]));
// => { status: true, value: -16580095 }
```

## Parsimmon.uint16BE

Parse an unsigned integer (big-endian) of 2 bytes.

```js
var parser = Parsimmon.Binary.uint16BE;
parser.parse(Buffer.from([0xff, 0xfe]));
// => { status: true, value: 65534 }
```

## Parsimmon.int16BE

Parse a signed integer (big-endian) of 2 bytes.

```js
var parser = Parsimmon.Binary.int16BE;
parser.parse(Buffer.from([0xff, 0xfe]));
// => { status: true, value: -2 }
```

## Parsimmon.uint16LE

Parse an unsigned integer (little-endian) of 2 bytes.

```js
var parser = Parsimmon.Binary.uint16LE;
parser.parse(Buffer.from([0xfe, 0xff]));
// => { status: true, value: 65534 }
```

## Parsimmon.int16LE

Parse a signed integer (little-endian) of 2 bytes.

```js
var parser = Parsimmon.Binary.int16LE;
parser.parse(Buffer.from([0xfe, 0xff]));
// => { status: true, value: -2 }
```

## Parsimmon.uint32BE

Parse an unsigned integer (big-endian) of 4 bytes.

```js
var parser = Parsimmon.Binary.uint32BE;
parser.parse(Buffer.from([0x00, 0x00, 0x00, 0xff]));
// => { status: true, value: 255 }
```

## Parsimmon.int32BE

Parse an signed integer (big-endian) of 4 bytes.

```js
var parser = Parsimmon.Binary.int32BE;
parser.parse(Buffer.from([0xff, 0xff, 0xff, 0xfe]));
// => { status: true, value: -2 }
```

## Parsimmon.uint32LE

Parse an unsigned integer (little-endian) of 4 bytes.

```js
var parser = Parsimmon.Binary.uint32LE;
parser.parse(Buffer.from([0xff, 0x00, 0x00, 0x00]));
// => { status: true, value: 255 }
```

## Parsimmon.int32LE

Parse an signed integer (little-endian) of 4 bytes.

```js
var parser = Parsimmon.Binary.int32LE;
parser.parse(Buffer.from([0xfe, 0xff, 0xff, 0xff]));
// => { status: true, value: -2 }
```

## Parsimmon.floatBE

Parse a float (big-endian) of 4 bytes.

```js
var parser = Parsimmon.Binary.floatBE;
parser.parse(Buffer.from([1, 2, 3, 4]));
// => { status: true, value: 2.387939260590663e-38 }
```

## Parsimmon.floatLE

Parse a float (little-endian) of 4 bytes.

```js
var parser = Parsimmon.Binary.floatLE;
parser.parse(Buffer.from([1, 2, 3, 4]));
// => { status: true, value: 1.539989614439558e-36 }
```

## Parsimmon.doubleBE

Parse a double (big-endian) of 8 bytes.

```js
var parser = Parsimmon.Binary.doubleBE;
parser.parse(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]));
// => { status: true, value: 8.20788039913184e-304 }
```

## Parsimmon.doubleLE

Parse a double (little-endian) of 8 bytes.

```js
var parser = Parsimmon.Binary.doubleLE;
parser.parse(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]));
// => { status: true, value: 5.447603722011605e-270 }
```

## Parsimmon.bitSeq(alignments)

Parse a series of bits that do not have to be byte-aligned and consume them from a Buffer. The maximum number is 48 since more than 48 bits won't fit safely into a JavaScript number without losing precision. Also, the total of all bits in the sequence must be a multiple of 8 since parsing is still done at the byte level.

```js
var parser = Parsimmon.Binary.bitSeq([3, 5, 5, 3]);
parser.parse(Buffer.from([0x04, 0xff]));
//=> { status: true, value: [0, 4, 31, 7] }
```

## Parsimmon.bitSeqObj(namedAlignments)

Works like `Parsimmon.bitSeq` except each item in the array is either a number of bits or pair (array with length = 2) of name and bits. The bits are parsed in order and put into an object based on the name supplied. If there's no name for the bits, it will be parsed but discarded from the returned value.

```js
var parser = Parsimmon.Binary.bitSeqObj([["a", 3], 5, ["b", 5], ["c", 3]]);
parser.parse(Buffer.from([0x04, 0xff]));
//=> { status: true, value: { a: 0, b: 31, c: 7 } }
```

---

# Parser methods

These methods are all called off of existing parsers, not from the `Parsimmon` object itself. They all return new parsers, so you can chain as many of them together as you like.

## parser.parse(input)

Apply `parser` on the provided string `input`, returning an object that contains the status and parsed result.

If the parser succeeds, `status` is set to _true_, and the value will be available in the `value` property.

If the parser fails, `status` will be _false_. Further information on the error can be found at `index` and `expected`. `index` represents the furthest reached offset; it has a 0-based character `offset` and 1-based `line` and `column` properties. `expected` lists all tried parsers that were available at the offset, but the input couldn't continue with any of these.

```js
var parser = Parsimmon.alt(
  // Use `parser.desc(string)` in order to have meaningful failure messages
  Parsimmon.string("a").desc("'a' character"),
  Parsimmon.string("b").desc("'b' character")
);

parser.parse("a");
// => {status: true, value: 'a'}

parser.parse("ccc");
// => {status: false,
//     index: {...},
//     expected: ["'a' character", "'b' character"]}
```

## parser.tryParse(input)

Like `parser.parse(input)` but either returns the parsed value or throws an error on failure. The error object contains additional properties about the error.

```js
var parser = Parsimmon.letters.sepBy1(Parsimmon.whitespace);

parser.tryParse("foo bar baz");
// => ['foo', 'bar', 'baz']

try {
  parser.tryParse("123");
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

## parser.or(otherParser)

Returns a new parser which tries `parser`, and if it fails uses `otherParser`. Example:

```js
var numberPrefix = Parsimmon.string("+")
  .or(Parsimmon.string("-"))
  .fallback("");

numberPrefix.parse("+"); // => {status: true, value: '+'}
numberPrefix.parse("-"); // => {status: true, value: '-'}
numberPrefix.parse(""); // => {status: true, value: ''}
```

## parser.chain(newParserFunc)

Returns a new parser which tries `parser`, and on success calls the function `newParserFunc` with the result of the parse, which is expected to return another parser, which will be tried next. This allows you to dynamically decide how to continue the parse, which is impossible with the other combinators. Example:

```js
var CustomString = Parsimmon.string("%")
  .then(Parsimmon.any)
  .chain(function(start) {
    var end =
      {
        "[": "]",
        "(": ")",
        "{": "}",
        "<": ">"
      }[start] || start;

    return Parsimmon.takeWhile(function(c) {
      return c !== end;
    }).skip(Parsimmon.string(end));
  });

CustomString.parse("%:a string:"); // => {status: true, value: 'a string'}
CustomString.parse("%[a string]"); // => {status: true, value: 'a string'}
CustomString.parse("%{a string}"); // => {status: true, value: 'a string'}
CustomString.parse("%(a string)"); // => {status: true, value: 'a string'}
CustomString.parse("%<a string>"); // => {status: true, value: 'a string'}
```

## parser.then(anotherParser)

Expects `anotherParser` to follow `parser`, and yields the result
of `anotherParser`.

```js
var parserA = p1.then(p2); // is equivalent to...
var parserB = Parsimmon.seqMap(p1, p2, function(x1, x2) {
  return x2;
});
```

## parser.map(fn)

Transforms the output of `parser` with the given function. Example:

```js
var pNum = Parsimmon.regexp(/[0-9]+/)
  .map(Number)
  .map(function(x) {
    return x + 1;
  });

pNum.parse("9"); // => {status: true, value: 10}
pNum.parse("123"); // => {status: true, value: 124}
```

## parser.contramap(fn)

Transforms the input of `parser` with the given function. Example:

```js
var pNum = Parsimmon.string("A").contramap(function(x) {
  return x.toUpperCase();
});

pNum.parse("a"); // => {status: true, value: 'A'}
pNum.parse("A"); // => {status: true, value: 'A'}
```

An important caveat of contramap is that it transforms the remaining input. This means that you cannot expect values after a contramap in general, like the following.

```js
Parsimmon.seq(
  Parsimmon.string("a"),
  Parsimmon.string("c").contramap(function(x) {
    return x.slice(1);
  }),
  Parsimmon.string("d")
)
  .tie()
  .parse("abcd"); //this will fail

Parsimmon.seq(
  Parsimmon.string("a"),
  Parsimmon.seq(Parsimmon.string("c"), Parsimmon.string("d"))
    .tie()
    .contramap(function(x) {
      return x.slice(1);
    })
)
  .tie()
  .parse("abcd"); // => {status: true, value: 'acd'}
```

## parser.promap(fn)

Transforms the input and output of `parser` with the given functions. Example:

```js
var pNum = Parsimmon.string("A").promap(
  function(x) {
    return x.toUpperCase();
  },
  function(x) {
    return x.charCodeAt(0);
  }
);

pNum.parse("a"); // => {status: true, value: 65}
pNum.parse("A"); // => {status: true, value: 65}
```

The same caveat for contramap above applies to promap.

## parser.result(value)

Returns a new parser with the same behavior, but which yields `value`. Equivalent to `parser.map(function(x) { return x; }.bind(null, value))`.

## parser.fallback(value)

Returns a new parser which tries `parser` and, if it fails, yields `value` without consuming any input. Equivalent to `parser.or(Parsimmon.of(value))`.

```js
var digitOrZero = Parsimmon.digit.fallback("0");

digitOrZero.parse("4"); // => {status: true, value: '4'}
digitOrZero.parse(""); // => {status: true, value: '0'}
```

## parser.skip(otherParser)

Expects `otherParser` after `parser`, but yields the value of `parser`.

```js
var parserA = p1.skip(p2); // is equivalent to...
var parserB = Parsimmon.seqMap(p1, p2, function(x1, x2) {
  return x1;
});
```

## parser.trim(anotherParser)

Expects `anotherParser` before and after `parser`, yielding the result of the parser. Useful for trimming comments/whitespace around other parsers.

Example:

```js
Parsimmon.digits
  .map(Number)
  .trim(Parsimmon.optWhitespace)
  .sepBy(Parsimmon.string(","))
  .tryParse("   1, 2,3     , 4  ");
// => [1, 2, 3, 4]
```

It is equivalent to:

```js
anotherParser.then(parser).skip(anotherParser);
```

It is also equivalent to:

```js
Parsimmon.seqMap(anotherParser, parser, anotherParser, function(
  before,
  middle
) {
  return middle;
});
```

## parser.wrap(before, after)

Expects the parser `before` before `parser` and `after` after `parser.

Example:

```js
Parsimmon.letters
  .trim(Parsimmon.optWhitespace)
  .wrap(Parsimmon.string("("), Parsimmon.string(")"))
  .tryParse("(   nice       )");
// => 'nice'
```

It is equivalent to:

```js
before.then(parser).skip(after);
```

It is also equivalent to:

```js
Parsimmon.seqMap(before, parser, after, function(before, middle) {
  return middle;
});
```

## parser.notFollowedBy(anotherParser)

Returns a parser that looks for anything but whatever `anotherParser` wants to parse, and does not consume it. Yields the same result as `parser`. Equivalent to `parser.skip(Parsimmon.notFollowedBy(anotherParser))`.

## parser.lookahead(anotherParser)

Returns a parser that looks for whatever `anotherParser` wants to parse, but does not consume it. Yields the same result as `parser`. Equivalent to `parser.skip(Parsimmon.lookahead(anotherParser))`.

## parser.lookahead(string)

Returns a parser that looks for `string` but does not consume it. Yields the same result as `parser`. Equivalent to `parser.skip(Parsimmon.lookahead(string))`.

## parser.lookahead(regexp)

Returns a parser that wants the input to match `regexp`. Yields the same result as `parser`. Equivalent to `parser.skip(Parsimmon.lookahead(regexp))`.

## parser.assert(condition, message)

Passes the result of `parser` to the function `condition`, which returns a boolean. If the the condition is false, returns a failed parse with the given `message`. Else is returns the original result of `parser`.

```js
var evenLengthNumber = P.digits
  .assert(function(s) {
    return s.length % 2 === 0;
  }, "even length number")
  .map(Number);

evenLengthNumber.parse("34");
// { status: true, value: 34 }

evenLengthNumber.parse("1");
// { status: false,
//   expected: ["even length number"],
//   index: {...} }
```

## parser.tieWith(separator)

When called on a parser yielding an array of strings, yields all their strings concatenated with the `separator`. Asserts that its input is actually an array of strings.

Example:

```js
var number = Parsimmon.seq(
  Parsimmon.digits,
  Parsimmon.string("."),
  Parsimmon.digits
)
  .tieWith("")
  .map(Number);

number.tryParse("1.23");
// => 1.23
```

`parser.tieWith(separator)` is similar to this:

```js
parser.map(function(array) {
  return array.join(separator);
});
```

## parser.tie()

Equivalent to [`parser.tieWith("")`](#parsertiewithseparator).

Note: `parser.tie()` is usually used after [`Parsimmon.seq(...parsers)`](#parsimmonseqp1-p2-pn) or [`parser.many()`](#parsermany).

## parser.many()

Expects `parser` zero or more times, and yields an array of the results.

**NOTE:** If `parser` is capable of parsing an empty string (i.e. `parser.parse("")` succeeds) then [`parser.many()`](#parsermany) will throw an error. Otherwise [`parser.many()`](#parsermany) would get stuck in an infinite loop.

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

```js
var Identifier = Parsimmon.regexp(/[a-z]+/).node("Identifier");

Identifier.tryParse("hey");
// => { name: 'Identifier',
//      value: 'hey',
//      start: { offset: 0, line: 1, column: 1 },
//      end: { offset: 3, line: 1, column: 4 } }
```

## parser.mark()

Yields an object with `start`, `value`, and `end` keys, where `value` is the original value yielded by the parser, and `start` and `end` are are objects with a 0-based `offset` and 1-based `line` and `column` properties that represent the position in the input that contained the parsed text. Works like this function:

```js
var Identifier = Parsimmon.regexp(/[a-z]+/).mark();

Identifier.tryParse("hey");
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
    return Parsimmon.seqMap(Parsimmon.index, parser, Parsimmon.index, function(
      start,
      value,
      end
    ) {
      return Object.freeze({
        type: "myLanguage." + name,
        value: value,
        start: start,
        end: end
      });
    });
  };
}

var Identifier = Parsimmon.regexp(/[a-z]+/).thru(makeNode("Identifier"));

Identifier.tryParse("hey");
// => { type: 'myLanguage.Identifier',
//      value: 'hey',
//      start: { offset: 0, line: 1, column: 1 },
//      end: { offset: 3, line: 1, column: 4 } }
```

## parser.desc(description)

Returns a new parser whose failure message is `description`. For example, `string('x').desc('the letter x')` will indicate that
`'the letter x'` was expected. Alternatively, an array of failure messages can be passed, if the parser represents multiple
options. For example, `oneOf('abc').desc(['a', 'b', 'c'])` will indicate that any of 'a', 'b', or 'c' would be acceptable in
this case.

It is important to only add descriptions to "low-level" parsers; things like numbers and strings. If you add a description to _every_ parser you write then generated error messages will not be very helpful when simple syntax errors occur.

```js
var P = require("parsimmon");

var pNumber = P.regexp(/[0-9]+/)
  .map(Number)
  .desc("a number");

var pPairNorm = P.seq(
  P.string("(")
    .then(pNumber)
    .skip(P.string(",")),
  pNumber.skip(P.string(")"))
);

var pPairDesc = pPairNorm.desc("a pair");

var badInputs = ["(1,2", "1,2)", "(1|2)"];

function report(name, parser, x) {
  var expectations = parser.parse(x).expected.join(", ");
  console.log(name + " | Expected", expectations);
}

badInputs.forEach(function(x) {
  report("pPairNorm", pPairNorm, x);
  report("pPairDesc", pPairDesc, x);
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

See [`Parsimmon.empty()`](#parsimmonempty).

## parser.concat(otherParser)

Equivalent to [`parser.or(otherParser)`](#parserorotherparser).

## parser.ap(otherParser)

Takes `parser` which returns a function and applies it to the parsed value of `otherParser`.

```js
Parsimmon.digit
  .ap(Parsimmon.digit.map(s => t => Number(s) + Number(t)))
  .parse("23");
// => {status: true, value: 5}
```

## parser.sepBy(separator)

Equivalent to `Parsimmon.sepBy(parser, separator)`.

Expects zero or more matches for `parser`, separated by the parser `separator`, yielding an array. Example:

```js
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

See [`parser.chain(newParserFunc)`](#parserchainnewparserfunc) defined earlier.

## parser.of(result)

Equivalent to [`Parsimmon.of(result)`](#parsimmonofresult).

# Tips

## Readability

For the sake of readability in your own parsers, it's recommended to either create a shortcut for the Parsimmon library:

```js
var P = Parsimmon;
var parser = P.digits.sepBy(P.whitespace);
```

Or to create shortcuts for the Parsimmon values you intend to use (when using Babel):

```js
import { digits, whitespace } from "parsimmon";
var parser = digits.sepBy(whitespace);
```

Because it can become quite wordy to repeat Parsimmon everywhere:

```js
var parser = Parsimmon.sepBy(Parsimmon.digits, Parsimmon.whitespace);
```

For clarity's sake, however, `Parsimmon` will refer to the Parsimmon library itself, and `parser` will refer to a parser being used as an object in a method, like `P.string('9')` in `P.string('9').map(Number)`.

## Side effects

Do not perform [side effects](<https://en.wikipedia.org/wiki/Side_effect_(computer_science)>) parser actions. This is potentially unsafe, as Parsimmon will backtrack between parsers, but there's no way to undo your side effects.

Side effects include pushing to an array, modifying an object, `console.log`, reading data from outside sources (an array or object used to track things during parsing), or any random numbers.

Parsimmon expects that parsers and all [`.map`](#parsermapfn) statements do not perform side effects (i.e. they are _pure_).

In this example, the parser `pVariable` is called twice on the same text because of [`Parsimmon.alt`](#parsimmonaltp1-p2-pn) backtracking, and has a side effect (pushing to an array) inside its [`.map`](#parsermapfn) method, so we get two items in the array instead of just one.

```js
var x = 0;
var variableNames = [];
var pVariable = Parsimmon.regexp(/[a-z]+/i).map(function(name) {
  variableNames.push(name);
  return name;
});
var pDeclaration = Parsimmon.alt(
  Parsimmon.string("var ")
    .then(pVariable)
    .then(Parsimmon.string("\n")),
  Parsimmon.string("var ")
    .then(pVariable)
    .then(Parsimmon.string(";"))
);
pDeclaration.parse("var gummyBear;");
console.log(variableNames);
// => ['gummyBear', 'gummyBear']
```
