var P = require('../src/parsimmon');

// If we simply ignore whitespace *after* everything, we only need to ignore one
// chunk of whitespace at the beginning of the parser, and then all the
// whitespace should be ignored properly. For more complicated grammars, you may
// want to be stricter about where whitespace is actually allowed.
function lexeme(p) {
  return p.skip(P.optWhitespace);
}

var lparen = lexeme(P.string('('));
var rparen = lexeme(P.string(')'));

// We need to use `P.lazy` here since `form` and `atom` aren't defined yet, but
// rely on this parser to already exist.
var expr = P.lazy('an s-expression', function() {
  return P.alt(form, atom);
});

// Just simple integer, with JavaScript's `Number` function to do the actual
// conversion from string to number for us.
var number = lexeme(P.regexp(/[0-9]+/).map(Number));

// Match identifiers that don't start with numbers.
var id = lexeme(P.regexp(/[a-zA-Z_-][a-zA-Z0-9_-]*/));

// `a.or(b)` is just shorthand for `P.alt(a, b)`.
var atom = number.or(id);

// A form (or list) is just parentheses with zero or more expressions inside.
// Remember to ignore possible whitespace at the beginning since this is the
// entry point into our parser.
var form =
  P.optWhitespace
    .then(lparen)
    .then(expr.many())
    .skip(rparen);

console.log(expr.parse('3').value);
// => 3

console.log(expr.parse('(add (mul 10 (add 3 4)) (add 7 8))').value);
// => ['add', ['mul', 10, ['add', 3, 4]], ['add', 7, 8]]
