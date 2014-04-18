var Parsimmon = require('./../index');
var string = Parsimmon.string;
var regex = Parsimmon.regex;
var succeed = Parsimmon.succeed;
var seq = Parsimmon.seq;
var alt = Parsimmon.alt;
var lazy = Parsimmon.lazy;

var json = (function() {
  var json = lazy(function() {
    return alt(
      object,
      array,
      stringLiteral,
      numberLiteral,
      nullLiteral,
      trueLiteral,
      falseLiteral
    ).skip(regex(/^\s*/m));
  });

  var escapes = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t'
  }

  var stringLiteral = regex(/"(\\.|.)*?"/).map(function(str) {
    return str.slice(1, -1).replace(/\\u(\d{4})/, function(_, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    }).replace(/\\(.)/, function(_, ch) {
      return escapes.hasOwnProperty(ch) ? escapes[ch] : ch
    });
  });

  var numberLiteral = regex(/\d+(([.]|e[+-]?)\d+)?/i).map(parseFloat)

  function commaSep(parser) {
    var commaParser = regex(/^,\s*/m).then(parser).many()
    return seq(parser, commaParser).map(function(results) {
      return [results[0]].concat(results[1]);
    }).or(succeed([]));
  }

  var array = seq(regex(/\[\s*/m), commaSep(json), string(']')).map(function(results) {
    return results[1];
  });

  var pair = seq(stringLiteral.skip(regex(/^\s*:\s*/m)), json);

  var object = seq(regex(/^[{]\s*/m), commaSep(pair), string('}')).map(function(results) {
    var pairs = results[1];
    var out = {};
    for (var i = pairs.length-1; i >= 0; i -= 1) {
      out[pairs[i][0]] = pairs[i][1];
    }
    return out;
  });

  var nullLiteral = string('null').result(null);
  var trueLiteral = string('true').result(true);
  var falseLiteral = string('false').result(false);

  return json;
})();

var source = process.argv[2] || __dirname+'/../package.json';
var result = json.parse(require('fs').readFileSync(source, 'utf-8'));

console.log(result);
