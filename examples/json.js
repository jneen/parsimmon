var Parsimmon = require('./../index');
var string = Parsimmon.string;
var regex = Parsimmon.regex;
var succeed = Parsimmon.succeed;

var json = (function() {
  var escapes = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t'
  }

  var stringLiteral = regex(/^"(\\.|.)*?"/).map(function(str) {
    return str.slice(1, -1).replace(/\\u(\d{4})/, function(_, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    }).replace(/\\(.)/, function(_, ch) {
      return escapes.hasOwnProperty(ch) ? escapes[ch] : ch
    });
  });

  var numberLiteral = regex(/^\d+(([.]|e[+-]?)\d+)?/i).map(parseFloat)

  function commaSep(parser) {
    return parser.then(function(x) {
      return regex(/^,\s*/m).then(parser).many().map(function(xs) {
        return [x].concat(xs);
      });
    }).or(succeed([]));
  }

  var array = regex(/^\[\s*/m).then(function() {
    return commaSep(json).skip(string(']'));
  });

  var pair = stringLiteral.then(function(key) {
    return regex(/^\s*:\s*/m).then(json).map(function(res) { return [key, res]; });
  });

  var object = regex(/^[{]\s*/m).then(commaSep(pair)).skip(string('}'))
    .map(function(pairs) {
      var out = {};
      for (var i = pairs.length-1; i >= 0; i -= 1) {
        out[pairs[i][0]] = pairs[i][1]
      }
      return out;
    });

  var nullLiteral = string('null').result(null);
  var trueLiteral = string('true').result(true);
  var falseLiteral = string('false').result(false);

  var json = object
    .or(array)
    .or(stringLiteral)
    .or(numberLiteral)
    .or(nullLiteral)
    .or(trueLiteral)
    .or(falseLiteral)
    .skip(regex(/^\s*/m));

  return json;
})();

console.log(json.parse(require('fs').readFileSync(__dirname+'/../package.json', 'utf-8')));
