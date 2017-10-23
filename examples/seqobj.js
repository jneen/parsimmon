"use strict";

// Run me with Node to see my output!

let util = require("util");
let P = require("../");

///////////////////////////////////////////////////////////////////////

let Lang = P.createLanguage({
  _: () => P.optWhitespace,

  LParen: () => P.string("("),
  RParen: () => P.string(")"),
  Comma: () => P.string(","),
  Dot: () => P.string("."),

  Identifier: () => P.letters.node("Identifier"),

  MethodCall: r =>
    P.seqObj(
      ["receiver", r.Identifier],
      r.Dot.trim(r._),
      ["method", r.Identifier],
      r.LParen,
      ["arguments", r.Identifier.trim(r._).sepBy(r.Comma)],
      r.RParen
    ).node("MethodCall")
});

///////////////////////////////////////////////////////////////////////

let text = "console.log(bar, baz, quux)";

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = Lang.MethodCall.tryParse(text);
prettyPrint(ast);
