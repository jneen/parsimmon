"use strict";

// Run me with Node to see my output!

let util = require("util");
let P = require("..");

///////////////////////////////////////////////////////////////////////

// This parser handles a small subset of Extensible Markup Language (XML)
// syntax for illustrative purposes.  Specifically, it handles full and empty
// nested tags with attributes and text content.

// The most interesting part of this example is probably how end tags can be
// parsed by extracting the name of the start tag first, then using P.chain to
// parse for an end tag with a matching name.

///////////////////////////////////////////////////////////////////////

let XML = P.createLanguage({
  Word: () => P.regex(/[a-zA-Z]+/),

  // Both types of opening tag (`<x>` and `<x/>`) contain a name followed by
  // optional attributes
  OpeningTagInsides: r =>
    P.seqObj(
      ["name", r.Word],
      [
        "attributes",
        P.whitespace.then(r.Attribute.sepBy(P.whitespace)).or(P.succeed([]))
      ]
    ),

  OpeningTag: r =>
    P.string("<")
      .then(r.OpeningTagInsides)
      .skip(P.string(">")),

  EmptyTag: r =>
    P.string("<")
      .then(r.OpeningTagInsides)
      .skip(P.string("/>")),

  // Each attribute is of the form `name="value"`.
  Attribute: r =>
    P.seqObj(["name", r.Word], P.string("="), ["value", r.AttributeValue]),

  AttributeValue: () =>
    P.string('"')
      .then(P.regex(/[^"]+/))
      .skip(P.string('"')),

  // "Full elements" have an opening and closing tag (e.g. `<a></a>`) while
  // "empty elements" just have an empty tag (e.g. `<a/>`).
  Element: r => P.alt(r.FullElement, r.EmptyElement).skip(P.optWhitespace),

  // Construct an appropriate output object, and use the parsed tag name to
  // create a closing tag parser on the fly, to check that a matching end tag
  // is found.
  FullElement: r =>
    r.OpeningTag.chain(({ name, attributes }) =>
      r.Content.map(content => {
        return { type: "element", name, attributes, content };
      }).skip(P.string(`</${name}>`))
    ),

  // Empty elements have it easier; we don't have to handle contents or a
  // possible end tag.
  EmptyElement: r =>
    r.EmptyTag.map(({ name, attributes }) => {
      return { type: "element", name, attributes, content: [] };
    }),

  // An element can contain other elements, or text.
  Content: r => P.alt(r.Element, r.TextContent).many(),

  // Text can contain any string without the characters `<` or `>`.
  TextContent: () =>
    P.regex(/[^<>]+/).map(text => {
      return { type: "text", text };
    })
});

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

let text = `\
<a attr="x">
  <b>inside B</b>
  inside A
</a>
<empty />`;

let ast = XML.Element.many().tryParse(text);
prettyPrint(ast);
