'use strict';

// Run me with Node to see my output!

let util = require('util');
let P = require('..');

///////////////////////////////////////////////////////////////////////

// LIMITATIONS: Python allows not only multiline blocks, but inline blocks too.
//
//   if x == y: print("nice")
//
// vs.
//
//   if x == y:
//       print("nice")
//
// This parser only supports the multiline indented form.

// NOTE: This is a hack and is not recommended. Maintaining state throughout
// Parsimmon parsers is not reliable since backtracking may occur, leaving your
// state inaccurate. See the relevant GitHub issue for discussion.
//
// https://github.com/jneen/parsimmon/issues/158
//
function indentPeek() {
  return indentStack[indentStack.length - 1];
}

let indentStack = [0];

let Pythonish = P.createLanguage({
  // If this were actually Python, "Block" wouldn't be a statement on its own,
  // but rather "If" and "While" would be statements that used "Block" inside.
  Statement: r =>
    P.alt(r.ExpressionStatement, r.Block),

  // Just a simple `foo()` style function call.
  FunctionCall: () =>
    P.regexp(/[a-z]+/).skip(P.string('()'))
      .node('FunctionCall')
      .desc('a function call'),

  // To make it a statement we just need a newline afterward.
  ExpressionStatement: r =>
    r.FunctionCall.skip(P.string('\n')),

  // The general idea of this is to assume there's "block:" on its own line,
  // then we capture the whitespace used to indent the first statement of the
  // block, and require that every other statement has the same exact string of
  // indentation in front of it.
  Block: r =>
    P.seq(
      P.string('block:\n').then(P.regexp(/[ ]+/)),
      r.Statement
    ).chain(args => {
      // `.chain` is called after a parser succeeds. It returns the next parser
      // to use for parsing. This allows subsequent parsing to be dependent on
      // previous text.
      let [indent, statement] = args;
      let indentSize = indent.length;
      let currentSize = indentPeek();
      // Indentation must be deeper than the current block context. Otherwise
      // you could indent *less* for a block and it would still work. This is
      // not how any language I know of works.
      if (indentSize <= currentSize) {
        return P.fail('at least ' + currentSize + ' spaces');
      }
      indentStack.push(indentSize);
      return P.string(indent)
        .then(r.Statement)
        .many()
        .map(statements => {
          indentStack.pop();
          return [statement].concat(statements);
        });
    })
    .node('Block'),
});

///////////////////////////////////////////////////////////////////////

let text = `\
block:
    a()
    b()
    c()
    block:
      d()
      e()
      f()
    block:
        g()
        h()
        i()
        j()
`;

function prettyPrint(x) {
  let opts = {depth: null, colors: 'auto'};
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = Pythonish.Block.tryParse(text);
prettyPrint(ast);
