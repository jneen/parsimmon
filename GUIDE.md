# TODO

Parsing languages with context like Python or Markdown which use indentation to keep track of nesting structure works best with creating a constructor function around your call to `Parsimmon.createLanguage`:

```js
const MyLanguageX = ({ indentSize }) =>
  Parsimmon.createLanguage({
    Indent: () => P.string(" ").times(indentSize),
    ForLoop: l =>
      l.SomeBlockStart.chain(block => {
        MyLanguageX({ indentSize: block.newIndentSize }).Item.atLeast(1);
      })
  });

const MyLanguage = MyLanguageX({ indentSize: 0 });
```

The general idea is to take context in at the top level and construct new languages inside of your language each time you nest indentation. For a complete example, [please read](examples/python-ish.js).

---

Some performance tips. Which constructions should be considered dangerous performance-wise?

---

Why there're so few negative constructions out of the box. I can count only notFollowedBy and noneOf. For example, I find myself lacking something like P.not:

```js
let line = P.noneOf("\n\r")
  .atLeast(1)
  .tie()
  .desc("line");
// want something like
let line = P.not(P.end)
  .atLeast(1)
  .tie()
  .desc("line");
```

README features custom notChar but I wonder if it's a bad style, or causes a bad performance – that something like this is avoided in core API. Some sort of clarification would be great.

---

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

---

??? Anything else
