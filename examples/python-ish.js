var util = require('util');
var P = require('..');

///////////////////////////////////////////////////////////////////////

// If this were actually Python, "Block" wouldn't be a statement on its own,
// but rather "If" and "While" would be statements that used "Block" inside.
var Statement =
  P.lazy(function() {
    return P.alt(ExpressionStatement, Block);
  });

// Just a simple `foo()` style function call.
var FunctionCall =
  P.regexp(/[a-z]+/).skip(P.string('()'))
    .map(function(s) { return ['FunctionCall', s]; })
    .desc('a function call');

// To make it a statement we just need a newline afterward.
var ExpressionStatement =
  FunctionCall.skip(P.string('\n'));

// The general idea of this is to assume there's "block:" on its own line,
// then we capture the whitespace used to indent the first statement of the
// block, and require that every other statement has the same exact string of
// indentation in front of it.
var Block =
  P.seq(
    P.string('block:\n'),
    P.regexp(/[ ]+/),
    Statement
  ).chain(function(args) {
    // `.chain` is called after a parser succeeds. It returns the next parser
    // to use for parsing. This allows subsequent parsing to be dependent on
    // previous text.
    var indent = args[1];
    var statement = args[2];
    return P.string(indent).then(Statement).many()
      .map(function(statements) {
        return [statement].concat(statements);
      });
  })
  .map(function(statements) {
    return ['Block', statements];
  });

///////////////////////////////////////////////////////////////////////

var text = `\
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
  var opts = {depth: null, colors: 'auto'};
  var s = util.inspect(x, opts);
  console.log(s);
}

var ast = Block.tryParse(text);
prettyPrint(ast);
