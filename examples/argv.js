"use strict";

// Run me with Node to see my output!
// $ node examples/argv.js "foo -x"
// $ node examples/argv.js "-x=1 bar"
// $ node examples/argv.js "--some --thing=x"

let util = require("util");
let P = require("..");

let CLI = P.createLanguage({
  expression: function(r) {
    // whitespace-separated words, strings and options
    return P.alt(r.word, r.string, r.option)
      .sepBy(P.whitespace)
      .trim(P.optWhitespace);
  },

  option: function(r) {
    // one of possible quotes, then sequence of anything except that quote (unless escaped), then the same quote
    return P.seq(
      P.alt(P.string("-").then(P.regex(/[a-z]/)), P.string("--").then(r.word)),
      P.alt(P.string("=").then(r.word), P.of(true))
    );
  },

  word: function() {
    // 1 char of anything except forbidden symbols and dash, then 0+ chars of anything except forbidden symbols
    return P.regex(/[^-=\s"'][^=\s"']*/);
  },

  string: function() {
    // one of possible quotes, then sequence of anything except that quote (unless escaped), then the same quote
    return P.oneOf(`"'`).chain(function(q) {
      return P.alt(
        P.noneOf(`\\${q}`)
          .atLeast(1)
          .tie(), // everything but quote and escape sign
        P.string(`\\`).then(P.any) // escape sequence like \"
      )
        .many()
        .tie()
        .skip(P.string(q));
    });
  }
});

let expression = process.argv[2] || "";

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = CLI.expression.tryParse(expression);
prettyPrint(ast);

/*
 #### Intentionally not supported

 1) Space-delemited flag values

 ```
 $ command --foo FOO
 as	+  as
 $ command --foo=FOO
 ```

 because it's non-context-free. It's impossible to tell if `FOO` related to `command` or `--foo`
 without an intimate knowledge of exact flags (which couples parser and application).

 2) Flag joining

 ```
 $ command -fgh
 as
 $ command -f -g -h
 ```

 I just don't like this style. It's easy to confuse `-any` and `--any`.

 #### Nesting

 Commands can be nested but the exact meaning of WORD is up to an application. For example:

 ```
 $ git pull origin master
 ```

 can be seen as one of:

 ```
 $ git arg1 arg2 arg3
 or
 $ git (pull arg1 arg2) -- you want this one
 or
 $ git (pull (origin arg))
 ```

 So the parser does what it does.
*/
