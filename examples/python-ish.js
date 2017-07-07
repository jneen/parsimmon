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
    P.regexp(/[a-z]+/).skip(P.string('()')).skip(r.End).node('Call'),

  Block: r =>
    P.seqObj(
      P.string('block:'),
      r.End,
      r.IndentMore,
      ['first', r.Statement],
      ['rest', r.IndentSame.then(r.Statement).many()],
      r.IndentLess
    ).map(args => {
      let {first, rest} = args;
      let statements = [first, ...rest];
      return {statements};
    }).node('Block'),

  IndentMore: () => P.indentMore(P.countIndentation),
  IndentLess: () => P.indentLess(P.countIndentation),
  IndentSame: () => P.indentSame(P.countIndentation),

  _: () => P.optWhitespace,
  CR: () => P.string('\r'),
  LF: () => P.string('\n'),
  CRLF: () => P.string('\r\n'),
  NL: r => P.alt(r.CRLF, r.LF, r.CR).desc('newline'),
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
    block:
      aa()
      ab()
      ac()
      block:
        ba()
        bb()
       bc()
      e()
f()
`;

function prettyPrint(x) {
  let opts = {depth: null, colors: 'auto'};
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = Pythonish.Program.tryParse(text);
prettyPrint(ast);
