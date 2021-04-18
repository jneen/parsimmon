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

## Code of Conduct

Everyone is expected to abide by the [Contributor Covenant](CODE_OF_CONDUCT.md). Please send reports to [brian@wavebeem.com](mailto:brian@wavebeem.com).

## API Documentation

- [Full API documentation in `API.md`](API.md)
- [Guide with additional questions](GUIDE.md)
- [Tutorial by Max Tagher](https://medium.com/mercury-bank/a-magic-date-input-using-parser-combinators-in-typescript-3c779741bf4c)

## Examples

See the [examples][] directory for annotated examples of parsing JSON, Lisp, a Python-ish language, and math.

## Common Functions

- [`.createLanguage(parsers)`](API.md#parsimmoncreatelanguageparsers)
- [`.string(string)`](API.md#parsimmonstringstring)
- [`.regexp(regexp)`](API.md#parsimmonregexpregexp)
- [`.seq(p1, p2, ...pn)`](API.md#parsimmonseqp1-p2-pn)
- [`.sepBy(content, separator)`](API.md#parsimmonsepbycontent)
- [`.alt(p1, p2, ...pn)`](API.md#parsimmonaltp1-p2-pn)
- [`.whitespace`](API.md#parsimmonwhitespace)
- [`.index`](API.md#parsimmonindex)
- [`parser.map(fn)`](API.md#parsermapfn)
- [`parser.node(name)`](API.md#parsernodename)
- [`parser.skip(otherParser)`](API.md#parserskipotherparser)

## Questions

Feel free to ask a question by filing a GitHub Issue. I'm happy to help point you in the right direction with the library, and hopefully improve the documentation so less people get confused in the future.

## Contributing

Contributions are _not_ just pull requests.

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
[examples]: https://github.com/jneen/parsimmon/tree/master/examples
[unpkg homepage]: https://unpkg.com/#/
[unpkg version]: https://unpkg.com/parsimmon
[npm]: https://www.npmjs.com/
[node.js]: https://nodejs.org/en/
[promises-aplus]: https://promisesaplus.com/
[parsec]: https://hackage.haskell.org/package/parsec
[fantasyland]: https://github.com/fantasyland/fantasy-land
[perf]: https://chevrotain.io/performance/
[es5]: https://kangax.github.io/compat-table/es5/
[es5-shim]: https://github.com/es-shims/es5-shim
