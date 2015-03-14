var Parsimmon = require('./../index');

function interpretEscapes(str) {
  var escapes = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t'
  };

  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, function(_, escape) {
    var type = escape.charAt(0);
    var hex = escape.slice(1);
    if (type === 'u') return String.fromCharCode(parseInt(hex, 16));
    if (escapes.hasOwnProperty(type)) return escapes[type];
    return type;
  });
}

var json = (function() {
  // local imports
  var string = Parsimmon.string;
  var regex = Parsimmon.regex;
  var succeed = Parsimmon.succeed;
  var seq = Parsimmon.seq;
  var seqMap = Parsimmon.seqMap;
  var alt = Parsimmon.alt;
  var lazy = Parsimmon.lazy;

  // whitespace, etc
  var ignore = regex(/\s*/m);
  function lexeme(p) { return p.skip(ignore); }

  // lexemes
  var lbrace = lexeme(string('{'));
  var rbrace = lexeme(string('}'));
  var lbrack = lexeme(string('['));
  var rbrack = lexeme(string(']'));
  var quoted = lexeme(regex(/"((?:\\.|.)*?)"/, 1))
                .desc('a quoted string');
  var comma = lexeme(string(','));
  var colon = lexeme(string(':'));
  var number = lexeme(regex(/-?(0|[1-9]\d*)([.]\d+)?(e[+-]?\d+)?/i)).desc('a numeral');

  var nullLiteral = lexeme(string('null')).result(null);
  var trueLiteral = lexeme(string('true')).result(true);
  var falseLiteral = lexeme(string('false')).result(false);

  // forward-declared base parser
  var json = lazy('a json element', function() {
    return alt(
      object,
      array,
      stringLiteral,
      numberLiteral,
      nullLiteral,
      trueLiteral,
      falseLiteral
    );
  });

  // domain parsers
  var stringLiteral = quoted.map(interpretEscapes);

  var numberLiteral = number.map(parseFloat)

  function commaSep(parser) {
    var commaParser = comma.then(parser).many()
    return seqMap(parser, commaParser, function(first, rest) {
      return [first].concat(rest);
    }).or(succeed([]));
  }

  var array = seqMap(lbrack, commaSep(json), rbrack, function(_, results, __) {
    return results;
  });

  var pair = seq(stringLiteral.skip(colon), json);

  var object = seqMap(lbrace, commaSep(pair), rbrace, function(_, pairs, __) {
    var out = {};
    for (var i = pairs.length-1; i >= 0; i -= 1) {
      out[pairs[i][0]] = pairs[i][1];
    }
    return out;
  });

  // top-level parser, with whitespace at the beginning
  return ignore.then(json);
})();

var source = process.argv[2] || __dirname+'/../package.json';
var result = json.parse(require('fs').readFileSync(source, 'utf-8'));

console.log(result);
