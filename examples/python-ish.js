'use strict';

// Run me with Node to see my output!

let util = require('util');
let P = require('..');

///////////////////////////////////////////////////////////////////////

let sneak = P((str, i, state) => {
  console.log('\n\n\n----');
  // console.log(JSON.stringify(str.slice(i)));
  console.log(str.slice(i));
  console.log(i, state);
  return P.makeSuccess(i, null, state);
});

let Pythonish = P.createLanguage({
  Program: r =>
    r.Statement.many().trim(r._).node('Program'),

  Statement: r =>
    P.alt(r.Call, r.Block).trim(r._),

  Call: r =>
    P.regexp(/[a-z]+/)
      .skip(P.string('()'))
      .skip(r.Terminator)
      .node('Call'),

  Block: r =>
    P.seqObj(
      P.string('block:'),
      r.Terminator,
      r._,
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

  Comment: r =>
    P.seq(
      P.string('#'),
      P.regexp(/[^\r\n]*/),
      r.End
    ),
  _: r => r.BlankLine.many(),
  BlankLine: r => r.Spaces0.then(P.alt(r.Comment, r.NL)),
  Terminator: r =>
    r.Spaces0.then(P.alt(r.Comment, r.End)),
  Spaces0: () => P.regexp(/[ \t]*/),
  CR: () => P.string('\r'),
  LF: () => P.string('\n'),
  CRLF: () => P.string('\r\n'),
  NL: r => P.alt(r.CRLF, r.LF, r.CR).desc('newline'),
  End: r => P.alt(r.NL, P.eof),
});

///////////////////////////////////////////////////////////////////////

let SPACE = ' ';

let text = `\


#c0


z() #c1'\r\n\
block:    #   c2\r
  a() #c3

  b() #       c4

${SPACE}${SPACE}
${SPACE}${SPACE}# comment
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
f()#c
`;

function prettyPrint(x) {
  let opts = {depth: null, colors: 'auto'};
  let s = util.inspect(x, opts);
  console.log(s);
}

console.log(new Date().toTimeString());
console.log();
let ast = Pythonish.Program.tryParse(text);
prettyPrint(ast);
