# Parsimmon Guide

## Basics

A Parsimmon parser is an object that represents an action on a stream of text, and the promise of either an object yielded by that action on success or a message in case of failure. For example, `Parsimmon.string('foo')` yields the string `'foo'` if the beginning of the stream is `'foo'`, and otherwise fails.

The method `.map` is used to transform the yielded value. For example,

```javascript
Parsimmon.string("foo").map(function(x) {
  return x + "bar";
});
```

will yield `'foobar'` if the stream starts with `'foo'`. The parser

```javascript
Parsimmon.regexp(/[0-9]+/).map(function(x) {
  return Number(x) * 2;
});
```

will yield the number `24` when it encounters the string `'12'`.

Calling `.parse(string)` on a parser parses the string and returns an object with a boolean `status` flag, indicating whether the parse succeeded. If it succeeded, the `value` attribute will contain the yielded value. Otherwise, the `index` and `expected` attributes will contain the index of the parse error (with `offset`, `line` and `column` properties), and a sorted, unique array of messages indicating what was expected.

The error object can be passed along with the original source to `Parsimmon.formatError(source, error)` to obtain a human-readable error string.

Note: If you prefer throwing an error when the parse failed, call [`.tryParse(string)`](API.md#parsertryparseinput) instead. The returned value will be the parsing result itself when succeeded.

## Parsing indentation sensitive languages

Parsing languages with context like Python or Markdown which use indentation to keep track of nesting structure works best with creating a constructor function around your call to `Parsimmon.createLanguage`:

```js
const createMyLanguage = ({ indentSize }) =>
  Parsimmon.createLanguage({
    Indent: () => Parsimmon.string(" ").times(indentSize),
    ForLoop: l =>
      l.SomeBlockStart.chain(block => {
        const lang = createMyLanguage({
          indentSize: block.newIndentSize
        });
        // `lang` here is a different language instance than `l`, which has a
        // different `indentSize` so it looks for a different level of
        // indentation. You only need to know about your current indentation
        // level for everything to work out in this example, but you could
        // include more information
        return lang.Item.atLeast(1);
      })
  });

const MyLanguage = createMyLanguage({ indentSize: 0 });
const ast = MyLanguage.File.tryParse(/* ... */);
console.log(ast);
```

The general idea is to take context in at the top level and construct new languages inside of your language each time you nest indentation. For a complete example, [please read](examples/python-ish.js).

## Handling Bad Input

It's always a good idea to get line number information when parsing so that if there's a problem later on you can tell users which line of input caused the problem.

In general, you should keep parsing everything and label everything with line information, then have a separate phase where error checking is performed.

Only fail a parse if the rest of the document couldn't possibly make sense.

## RegExp Matching

`Parsimmon.regexp` is fast. If you need to match a large chunk of characters like whitespace, use it instead of character-oriented parsers:

```js
// Fast! Capture as much text using a RegExp as possible
const fastWhitespace = Parsimmon.regexp(/[ \t\r\n]*/);

// Slow! Have to examine one character at a time and make an array
const slowWhitespace = Parsimmon.oneOf(" \t\r\n")
  .many()
  .tie();
```

## Negative constructions

Many users have request a parser combinator like `Parsimmon.not` which would "invert" the success/failure of a parser.

Consider the following hypothetical Parsimmon code:

```js
const audioCodec = Parsimmon.alt(
  Parsimmon.string("aac"),
  Parsimmon.string("mp3"),
  Parsimmon.string("ogg"),
  Parsimmon.string("flac"),
  Parsimmon.string("wav")
);
const notAudioCodec = Parsimmon.not(audioCodec);
```

Now what happens if the underlying parser matches? That will make `not` version fail, and we don't really have any good error message to report. We can't in a general sense describe _what_ we were looking for since we only described what we were not looking for. So at the very least we would need custom error messages supplied with `.desc` to make debugging this case make sense.

Additionally, what if the underlying parser _doesn't_ match? What would the `not` version return there? And more importantly, how much input would it consume? The only reasonable answer I can find to this question is it returns `null` or `undefined` and consumes zero characters, but this isn't any different from `Parsimmon.notFollowedBy`.

So if you want avoid parsing things you can use `Parsimmon.notFollowedBy` or `.notFollowedBy`, but you still need to specify _what_ you actually want to parse. It may be possible to prove things by contradiction, but for parsing we still need some kind of positive construction in order to consume the characters and yield a result.

As a note: `notChar` and `.notFollowedBy(Parsimmong.regexp(...))` are not bad style necessarily. But there is a balance on negative features and Parsimmon strives to have a sensible API, so they often don't find their way in.

## Where should whitespace be consumed in parsers

In general, putting off whitespace parsing until the highest point in your parser is @wavebeem's preferred strategy. It allows you the most flexiblity overall, and often makes more sense.

Consider this example that pushes whitespace parsing up to the level of variable definition:

```js
const JS = Parsimmon.createLanguage({
  // Normally whitespace also includes comments, but a parser for JSDoc for
  // example will choose not to ignore comments so it can use the comments.
  _: () => Parsimmon.regexp(/[ \t]*/),
  __: () => Parsimmon.regexp(/[ \t]+/),
  Var: () => Parsimmon.string("var"),
  "=": () => Parsimmon.string("="),
  Identifier: () => Parsimmon.regexp(/[a-z]+/),
  Definition: r =>
    Parsimmon.seqObj(
      r.Var,
      r.__,
      ["name", r.Identifier],
      r._,
      r["="],
      r._,
      ["value", r.Expression],
      r._,
      r[";"]
    ),
  Expression: () => Parsimmon.fail("TODO: Implement expressions")
});
```

Also this let's you easily see where whitespace goes in your language instead of pretending it doesn't exist.

You could make a helper function to wrap `r._` around everything... but then you have other scenarios where you need mandatory whitespace. And you can't have mandatory whitespace following optional whitespace because the optional whitespace will consume it and then the mandatory whitespace will fail to find any whitespace.

The same sort of situation can easily apply to parsing leading whitespace and newlines to separate lines of code, especially when comments get in the mix.

Overall, I would suggest making each parser parse the smallest thing possible that makes sense for its name.
