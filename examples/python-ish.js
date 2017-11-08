"use strict";

// Run me with Node to see my output!

let util = require("util");
let P = require("..");

///////////////////////////////////////////////////////////////////////

// Because parsing indentation-sensitive languages such as Python requires
// tracking state, all of our parsers are created inside a function that takes
// the current parsing state. In this case it's just the current indentation
// level, but a real Python parser would also *at least* need to keep track of
// whether the current parsing is inside of () or [] or {} so that you can know
// to ignore all whitespace, instead of further tracking indentation.
//
// Implementing all of Python's various whitespace requirements, including
// comments and line continuations (backslash at the end of the line) is left as
// an exercise for the reader. I've tried and frankly it's pretty tricky.
function PyX(indent) {
  return P.createLanguage({
    // This is where the magic happens. Basically we need to parse a deeper
    // indentation level on the first statement of the block and keep track of
    // new indentation level. Then we make a whole new set of parsers that use
    // that new indentation level for all their parsing. Each line past the
    // first is required to be indented to the same level as that new deeper
    // indentation level.
    Block: r =>
      P.seqObj(
        P.string("block:"),
        r.NL,
        ["n", r.IndentMore],
        ["first", r.Statement]
      ).chain(args => {
        const { n, first } = args;
        return PyX(n)
          .RestStatement.many()
          .map(rest => ["BLOCK", first, ...rest]);
      }),

    // This is just a statement in our language. To simplify, this is either a
    // block of code or just an identifier
    Statement: r => P.alt(r.Block, r.Ident),

    // This is a statement which is indented to the level of the current parse
    // state. It's called RestStatement because the first statement in a block
    // is indented more than the previous state, but the *rest* of the
    // statements match up with the new state.
    RestStatement: r => r.IndentSame.then(r.Statement),

    // Just a variable and then the end of the line.
    Ident: r => P.regexp(/[a-z]+/i).skip(r.End),

    // Consume zero or more spaces and then return the number consumed. For a
    // more Python-like language, this parser would also accept tabs and then
    // expand them to the correct number of spaces
    //
    // https://docs.python.org/3/reference/lexical_analysis.html#indentation
    CountSpaces: () => P.regexp(/[ ]*/).map(s => s.length),

    // Count the current indentation level and assert it's more than the current
    // parse state's desired indentation
    IndentSame: r =>
      r.CountSpaces.chain(n => {
        if (n === indent) {
          return P.of(n);
        }
        return P.fail(`${n} spaces`);
      }),

    // Count the current indentation level and assert it's equal to the current
    // parse state's desired indentation
    IndentMore: r =>
      r.CountSpaces.chain(n => {
        if (n > indent) {
          return P.of(n);
        }
        return P.fail(`more than ${n} spaces`);
      }),

    // Support all three standard text file line endings
    NL: () => P.alt(P.string("\r\n"), P.oneOf("\r\n")),

    // Lines should always end in a newline sequence, but many files are missing
    // the final newline
    End: r => P.alt(r.NL, P.eof)
  });
}

// Start parsing at zero indentation
let Pythonish = PyX(0);

///////////////////////////////////////////////////////////////////////

let text = `\
block:
  alpha
  bravo
  block:
         charlie
         delta
         echo
         block:
          foxtrot
  golf
`;

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = Pythonish.Statement.tryParse(text);
prettyPrint(ast);
