"use strict";

// Run me with Node to see my output!

let util = require("util");
let P = require("..");

///////////////////////////////////////////////////////////////////////

// -*- Parser -*-

let Lang = P.createLanguage({
  s0: () => P.regexp(/[ ]*/),
  s1: () => P.regexp(/[ ]+/),
  Whitespace: () => P.regexp(/[ \n]*/),
  NotNewline: () => P.regexp(/[^\n]*/),
  Comma: () => P.string(","),
  Comment: r => r.NotNewline.wrap(P.string("//"), P.string("\n")),
  End: r => P.alt(P.string(";"), r._, P.string("\n"), P.eof),
  _: r => r.Comment.sepBy(r.Whitespace).trim(r.Whitespace),

  Program: r =>
    r.Statement
      .many()
      .trim(r._)
      .node("Program"),

  Statement: r => P.alt(r.Declaration, r.Assignment, r.Call),

  Declaration: r =>
    P.seqObj(
      P.string("var"),
      r.s1,
      ["identifier", r.Identifier],
      r.s0,
      P.string("="),
      r.s0,
      ["initialValue", r.Expression],
      r.End
    ).node("Declaration"),

  Assignment: r =>
    P.seqObj(
      ["identifier", r.Identifier],
      r.s0,
      P.string("="),
      r.s0,
      ["newValue", r.Expression],
      r.End
    ).node("Assignment"),

  Call: r =>
    P.seqObj(
      ["function", r.Expression],
      P.string("("),
      ["arguments", r.Expression.trim(r._).sepBy(r.Comma)],
      P.string(")")
    ).node("Call"),

  Expression: r => P.alt(r.Number, r.Reference),

  Number: () =>
    P.regexp(/[0-9]+/)
      .map(Number)
      .node("Number"),
  Identifier: () => P.regexp(/[a-z]+/).node("Identifier"),
  Reference: r => r.Identifier.node("Reference")
});

// -*- Linter -*-

// NOTE: This simplified language only has global scope. Most real languages
// have layers of scope, so your scope data structure will need to be something
// more complicated than just an object keeping track of variable names.

let scope = null;
let messages = null;

function noLint() {
  // This function intentionally left blank
}

let lintHelpers = {
  Program(node) {
    node.value.forEach(lint_);
  },

  Declaration(node) {
    scope[node.value.identifier.value] = true;
    lint_(node.value.initialValue);
  },

  Reference(node) {
    let name = node.value.value;
    if (!scope.hasOwnProperty(name)) {
      messages.push("undeclared variable " + name);
    }
  },

  Assignment(node) {
    lint_(node.value.newValue);
  },

  Call(node) {
    lint_(node.value.function);
    node.value.arguments.forEach(lint_);
  },

  Number: noLint
};

function lint_(node) {
  if (!node) {
    throw new TypeError("not an AST node: " + node);
  }
  if (!lintHelpers.hasOwnProperty(node.name)) {
    throw new TypeError("no lint helper for " + node.name);
  }
  return lintHelpers[node.name](node);
}

function lint(node) {
  scope = {};
  messages = [];
  lint_(node);
  return messages;
}

///////////////////////////////////////////////////////////////////////

let text = `\
// nice stuff
var x = 1 // declare this one

x = 2

// Notice this variable is undeclared.
y = 3

// And f is undeclared too...
f(x, y, 3)
`;

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = Lang.Program.tryParse(text);
let linterMessages = lint(ast);
prettyPrint(linterMessages);
prettyPrint(ast);
