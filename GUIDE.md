# Parsimmon Guide

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

## TODO: Performance tips

Some performance tips. Which constructions should be considered dangerous performance-wise?

## TODO: Negative constructions

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

## TODO: Where should whitespace be consumed in parsers

Separator position. Should you try to stick them to the low-level or high-level parser by default.
For example:

```js
let line = P.noneOf("\n\r")
  .atLeast(1)
  .tie()
  .skip(P.end);
// vs
let line = P.noneOf("\n\r")
  .atLeast(1)
  .tie();
// vs
let line = P.noneOf("\n\r")
  .atLeast(1)
  .tie()
  .lookahead(P.end);
```

My experiments suggests that the first version leads to design problems but maybe other people have different opinion.

## TODO

??? Anything else
