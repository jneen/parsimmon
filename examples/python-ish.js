'use strict';

// Run me with Node to see my output!

let util = require('util');
let P = require('..');

///////////////////////////////////////////////////////////////////////

let Pythonish = P.createLanguage({
  Program: r =>
    r.Statement.many().trim(r._).node('Program'),

  Statement: r =>
    P.alt(r.Call, r.Block),

  Call: r =>
    P.letter.skip(P.string('()')).skip(r.End).node('Call'),

  Block: r =>
    P.seqObj(
      P.string('block:'),
      r.End,
      P.indentMore,
      ['first', r.Statement],
      ['rest', P.indentSame.then(r.Statement).many()],
      P.indentLess
    ).map(args => {
      let {first, rest} = args;
      let statements = [first, ...rest];
      return {statements};
    }).node('Block'),

  _: () => P.optWhitespace,
  NL: () => P.string('\n'),
  End: r => P.alt(r.NL, P.eof),
});

///////////////////////////////////////////////////////////////////////

let text = `\
z()
block:
  a()
  b()
  block:
    c()
    d()
e()
`;

function prettyPrint(x) {
  let opts = {depth: null, colors: 'auto'};
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = Pythonish.Program.tryParse(text);
prettyPrint(ast);
