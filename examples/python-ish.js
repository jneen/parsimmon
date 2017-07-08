'use strict';

// Run me with Node to see my output!

let util = require('util');
let P = require('..');

///////////////////////////////////////////////////////////////////////

let Pythonish = P.createLanguage({

  // A program is just zero or more statements optionally surrounded by blank
  // lines and comments.
  Program: r =>
    r.Statement.many().trim(r._).node('Program'),

  // We only defined two kinds of statements here, so just collect them and then
  // ignore leading and trailing blank lines
  Statement: r =>
    r.Join0.then(P.alt(r.Call, r.Block)).trim(r._),

  // A simplified version of function call statements
  Call: r =>
    P.regexp(/[a-z]+/)
      .skip(r.Join0)
      .skip(P.string('('))
      .skip(r.AnyWhitespace)
      .skip(P.string(')'))
      .skip(r.Terminator)
      .node('Call'),

  // If this were actually Python we would strip off the parts before
  // `r.IndentMore` and reuse this for all the language structures which take
  // indented blocks. Note that the first statement is preceeded by
  // `r.IndentMore` because the indentation level must increase for it to be a
  // valid block. Also note that there must be *at least* one statement in a
  // block for it to be valid. This is why Python has the `pass` statement which
  // does nothing at all. Every other statement must explicitly use
  // `r.IndentSame` to consume and check its indentation, then finish with
  // `r.IndentLess` to close the block.
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

  // Uses standard Parsimmon indentation tracking. This includes either tabs or
  // spaces, but does not support them mixed. Please note that Python actually
  // allows mixed tabs and spaces, despite it being a not very good idea.
  //
  // https://docs.python.org/3/reference/lexical_analysis.html#indentation
  IndentMore: () => P.indentMore(P.countIndentation),
  IndentLess: () => P.indentLess(P.countIndentation),
  IndentSame: () => P.indentSame(P.countIndentation),

  // Standard Python style comments
  Comment: r =>
    P.seq(
      P.string('#'),
      P.regexp(/[^\r\n]*/),
      r.End
    ),

  // Zero or more blank lines; should be ignore for parsing purposes. This can
  // generally occur between any token in Python and is ignored. The only
  // significant whitespace is the kind to the left of statements.
  _: r => r.BlankLine.many(),

  // Python allows joining physical lines together into logical lines by ending
  // a line with a single backslash. All whitespace after the line join is
  // ignored. You *can* start a line with an explicit line join, but its
  // indentation must be the correct indentation for that block.
  ExplicitLineJoin: r =>
    P.string('\\').then(r.Newline).then(r.Spaces0),

  // Explicit line joins are always optional and can be repeated as many times
  // consecutively as you like, so this helpers is used instead
  Join0: r =>
    r.ExplicitLineJoin.many(),

  // A blank line which should be completely ignored for all parsing purposes
  BlankLine: r =>
    P.seq(
      r.Join0,
      r.Spaces0.then(P.alt(r.Comment, r.Newline)),
      r.Join0
    ),

  // A logical "end" of a line can include spaces or a comment before the end
  Terminator: r => r.Spaces0.then(P.alt(r.Comment, r.End)),

  // Zero or more spaces or tabs. Note that Python actually allows a few more
  // whitespace characters than this.
  Spaces0: () => P.regexp(/[ \t]*/),

  // In Python, once you're inside a grouping structure like (parentheses) or
  // [brackets] or {braces}, whitespace (even newlines) are completely ignored!
  // You can still add explicit line joins, though they are totally unnecessary.
  AnyWhitespace: r =>
    P.optWhitespace
      .then(r.Join0)
      .then(P.optWhitespace),

  // Logical newlines can be:
  //
  // - Windows style ("\r\n" aka CRLF)
  // - UNIX style ("\n" aka LF)
  // - Mac OS 9 style ("\r" aka CR)
  //
  // Realistically, nobody uses Mac OS 9 style any more, but oh well.
  Newline: () => P.alt(P.string('\r\n'), P.oneOf('\r\n')).desc('newline'),

  // Typically text files *end* each line with a newline, rather than just
  // separating them, but many files are malformed, so we should support the
  // "end of file" as a form of newline.
  End: r => P.alt(r.Newline, P.eof),
});

///////////////////////////////////////////////////////////////////////

// We need to test that trailing whitespace doesn't mess up a line, trailing
// whitespace is confusing, so let's make it completely explicit
let SPACE = ' ';

let text = `\


#c0


z() #c1'\r\n\
block:    #   c2\r
  a() #c3

  b() #       c4
  \\
\\
\\
             \\
  c()
  d\\
(
  \\

  \\
)

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

// console.log(new Date().toLocaleTimeString());
// let ast = Pythonish.Program.tryParse(text);
console.log(text);
// console.log('SUCCESS!');
// prettyPrint(ast);
