<a href="https://badge.fury.io/js/parsimmon"><img src="https://badge.fury.io/js/parsimmon.svg" alt=""></a>
<a href="https://opensource.org/licenses/MIT"><img alt="" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
<a href="https://coveralls.io/github/jneen/parsimmon?branch=master"><img alt="" src="https://coveralls.io/repos/github/jneen/parsimmon/badge.svg?branch=master"/></a>
<a href="https://travis-ci.org/jneen/parsimmon"><img alt="" src="https://api.travis-ci.org/jneen/parsimmon.svg"></a>

<a href="https://github.com/jneen/parsimmon"><img align="right" src="https://i.imgur.com/wyKOf.png" alt="Parsimmon"></a>

# Parsimmon

**Authors:** [@jneen][] and [@laughinghan][]

**Maintainer:** [@wavebeem][]

Parsimmon is a small library for writing big parsers made up of lots of little parsers. The API is inspired by [parsec][] and [Promises/A+][promises-aplus].

Parsimmon supports IE7 and newer browsers, along with [Node.js][]. It can be used as a standard Node module through [npm][] (named `parsimmon`), or directly in the browser through a script tag, where it exports a global variable called `Parsimmon`. To download the latest browser build, use the [unpkg version][]. For more information on how to use unpkg, see the [unpkg homepage][].

<!--

Parsimmon is officially tested against Node.js 4.x and higher. It should also work in [browsers with ES5 support][es5] (IE9* and up).

If you need IE8 support, you may be able to get Parsimmon to work by using [es5-shim][], but this is **not officially supported**. Alternately, you can use an older version of Parsimmon which supports IE8.

\* _IE9 does not support "strict mode", but Parsimmon does not require it._

## Module usage

```
npm install --save parsimmon
```

## Browser usage

 To download the latest browser build, use the [unpkg version][]. Parsimmon is exposed as a global variable called `Parsimmon`. For more information on how to use unpkg, see the [unpkg homepage][].

-->

## API Documentation

[Full API documentation in `API.md`.][api]

## Examples

See the [examples][] directory for annotated examples of parsing JSON, Lisp, a Python-ish language, and math.

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

Note: If you prefer throwing an error when the parse failed, call [`.tryParse(string)`](API.md#parsertryparseinput) instead. The returned value will be the parsing result itself when succeeded.

## Common Functions

- [`.createLanguage(parsers)`](API.md#parsimmoncreatelanguageparsers)
- [`.string(string)`](API.md#parsimmonstringstring)
- [`.regexp(regexp)`](API.md#parsimmonregexpregexp)
- [`.seq(p1, p2, ...pn)`](API.md#parsimmonseqp1-p2-pn)
- [`.sepBy(content, separator)`](API.md#parsimmonsepbycontent)
- [`.alt(p1, p2, ...pn)`](API.md#parsimmonaltp1-p2-pn)
- [`.node(name)`](API.md#nodename)
- [`.whitespace`](API.md#parsimmonwhitespace)
- [`.index`](API.md#parsimmonindex)
- [`parser.map(fn)`](API.md#parsermapfn)
- [`parser.skip(otherParser)`](API.md#parserskipotherparser)

## Questions

Feel free to ask a question by filing a GitHub Issue. I'm happy to help point you in the right direction with the library, and hopefully improve the documentation so less people get confused in the future.

## Contributing

Contributions are *not* just pull requests.

Issues clearly describing bugs or confusing parts of Parsimmon are welcome! Also, documentation enhancements and examples are very desirable.

Feeling overwhelmed about contributing? Open an issue about what you want to contribute and I'm happy to help you through to completion!

## Performance

Thanks to [@bd82][] we have a good [benchmark comparing Parsimmon CPU performance to several other parser libraries][perf] with a simple JSON parser example.

<a href="https://github.com/fantasyland/fantasy-land"><img align="right" alt="Fantasy Land" src="https://github.com/fantasyland/fantasy-land/raw/master/logo.png"></a>

## Fantasyland

Parsimmon is also compatible with [fantasyland][]. It implements Semigroup, Apply, Applicative, Functor, Chain, and Monad.

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
[es5]: https://kangax.github.io/compat-table/es5/
[es5-shim]: https://github.com/es-shims/es5-shim
