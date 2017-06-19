'use strict';

// Run me with Node to see my output!

let util = require('util');
let P = require('..');

///////////////////////////////////////////////////////////////////////

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
      P.string('block:\n'),
      P.regexp(/[ ]+/),
      r.Statement
    ).chain(args => {
      // `.chain` is called after a parser succeeds. It returns the next parser
      // to use for parsing. This allows subsequent parsing to be dependent on
      // previous text.
      let [indent, statement] = args;
      return P.string(indent)
        .then(r.Statement)
        .many()
        .map(statements => [statement].concat(statements));
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
