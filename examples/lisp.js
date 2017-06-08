// Run me with Node to see my output!

var util = require('util');
var P = require('../');

///////////////////////////////////////////////////////////////////////

// A little helper to wrap a parser with optional whitespace. Helper functions
// that take a parser can be passed to the .thru(wrapper) method.
function spaced(parser) {
  return P.optWhitespace
    .then(parser)
    .skip(P.optWhitespace);
}

var Lisp = P.createLanguage({
  Expression: function(r) {
    return P.alt(
      r.Symbol,
      r.Number,
      r.List
    );
  },

// The basic parsers (usually the ones described via regexp) should have a
// description for error message purposes.
  Symbol: function() {
    return P.regexp(/[a-zA-Z_-][a-zA-Z0-9_-]*/)
      .desc('symbol');
  },

  // Note that Number("10") === 10, Number("9") === 9, etc in JavaScript.
  // This is not a recursive parser. Number(x) is similar to parseInt(x, 10).
  Number: function() {
    return P.regexp(/[0-9]+/)
      .map(Number)
      .desc('number');
  },

// `.then` throws away the first value, and `.skip` throws away the second
// `.value, so we're left with just the `Expression.thru(spaced).many()` part as
// the `.yielded value from this parser.
  List: function(r) {
    return P.string('(')
      .then(r.Expression.thru(spaced).many())
      .skip(P.string(')'));
  },

  // Let's remember to throw away whitesapce at the top level of the parser.
  File: function(r) {
    return r.Expression.thru(spaced).many();
  }
});

///////////////////////////////////////////////////////////////////////

var text = `\
(list 1 2 (cons 1 (list)))
(print 5 golden rings)
`;

function prettyPrint(x) {
  var opts = {depth: null, colors: 'auto'};
  var s = util.inspect(x, opts);
  console.log(s);
}

var ast = Lisp.File.tryParse(text);
prettyPrint(ast);
