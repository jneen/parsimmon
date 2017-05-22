var util = require('util');
var P = require('../');

///////////////////////////////////////////////////////////////////////

// A little helper to wrap a parser with optional whitespace.
function spaced(parser) {
  return P.optWhitespace.then(parser).skip(P.optWhitespace);
}

// We need to use `P.lazy` here because the other parsers don't exist yet. We
// can't just declare this later though, because `LList` references this parser!
var LExpression =
  P.lazy(function() {
    return P.alt(
      LSymbol,
      LNumber,
      LList
    );
  });

// The basic parsers (usually the ones described via regexp) should have a
// description for error message purposes.
var LSymbol = P.regexp(/[a-zA-Z_-][a-zA-Z0-9_-]*/).desc('symbol');
var LNumber = P.regexp(/[0-9]+/).map(Number).desc('number');

// `.then` throws away the first value, and `.skip` throws away the second
// `.value, so we're left with just the `spaced(LExpression).many()` part as the
// `.yielded value from this parser.
var LList =
  P.string('(')
    .then(spaced(LExpression).many())
    .skip(P.string(')'));

// Let's remember to throw away whitesapce at the top level of the parser.
var Lisp = spaced(LExpression);

///////////////////////////////////////////////////////////////////////

var text = `\
(list 1 2 (cons 1 (list)))
`;

function prettyPrint(x) {
  var opts = {depth: null, colors: 'auto'};
  var s = util.inspect(x, opts);
  console.log(s);
}

var ast = Lisp.tryParse(text);
prettyPrint(ast);
