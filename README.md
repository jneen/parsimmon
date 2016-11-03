<a href="https://travis-ci.org/jneen/parsimmon"><img alt="Build Status" src="https://api.travis-ci.org/jneen/parsimmon.svg"></a>

<a href="https://github.com/jneen/parsimmon"><img align="right" src="https://i.imgur.com/wyKOf.png" alt="Parsimmon"></a>

# Parsimmon

**Authors:** [@jneen][] and [@laughinghan][]

**Maintainer:** [@wavebeem][]

Parsimmon is a small library for writing big parsers made up of lots of little parsers. The API is inspired by [parsec][] and [Promises/A+][promises-aplus].

Parsimmon supports IE7 and newer browsers, along with [Node.js][]. It can be used as a standard Node module through [npm][] (named `parsimmon`), or directly in the browser through a script tag, where it exports a global variable called `Parsimmon`. To download the latest browser build, use the [unpkg version][]. For more information on how to use unpkg, see the [unpkg homepage][].

## API Documentation

[Full API documentation in `API.md`.][api]

## Examples

See the [examples][] directory for annotated examples of parsing JSON, Lisp, and math.

## Basics

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

## Questions

Feel free to ask a question by filing a GitHub Issue. I'm happy to help point you in the right direction with the library, and hopefully improve the documentation so less people get confused in the future.

## Contributing

Contributions are *not* just pull requests. Issues clearly describing bugs or confusing parts of Parsimmon are welcome! Also, documentation enhancements and examples are very desirable. Feeling overwhelmed about contributing? Open an issue about what you want to contribute and I'm happy to help you through to completion!

## Performance

Thanks to [@bd82][] we have a good [benchmark comparing Parsimmon CPU performance to several other parser libraries][perf] with a simple JSON parser example.

<a href="https://github.com/fantasyland/fantasy-land"><img align="right" alt="Fantasy Land" src="https://github.com/fantasyland/fantasy-land/raw/master/logo.png"></a>

## Fantasyland

Parsimmon is also compatible with [fantasyland][]. It is a Semigroup, an Applicative Functor, and a Monad.

[@bd82]: https://github.com/bd82
[@laughinghan]: https://github.com/laughinghan
[@jneen]: https://github.com/jneen
[@wavebeem]: https://github.com/wavebeem

[api]: https://github.com/jneen/parsimmon/blob/master/API.md
[examples]: https://github.com/jneen/parsimmon/tree/master/examples

[unpkg homepage]: https://unpkg.com/#/
[unpkg version]: https://unpkg.com/parsimmon
[npm]: https://www.npmjs.com/
[node.js]: https://nodejs.org/en/
[promises-aplus]: https://promisesaplus.com/
[parsec]: https://hackage.haskell.org/package/parsec
[fantasyland]: https://github.com/fantasyland/fantasy-land
[perf]: https://sap.github.io/chevrotain/performance/
