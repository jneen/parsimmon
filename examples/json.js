// Run me with Node to see my output!

let util = require('util');
let P = require('..');

///////////////////////////////////////////////////////////////////////

// Turn escaped characters into real ones (e.g. "\\n" becomes "\n").
function interpretEscapes(str) {
  let escapes = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t'
  };
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape) => {
    let type = escape.charAt(0);
    let hex = escape.slice(1);
    if (type === 'u') return String.fromCharCode(parseInt(hex, 16));
    if (escapes.hasOwnProperty(type)) return escapes[type];
    return type;
  });
}

// Use the JSON standard's definition of whitespace rather than Parsimmon's.
let whitespace = P.regexp(/\s*/m);

// JSON is pretty relaxed about whitespace, so let's make it easy to ignore
// after most text.
function token(parser) {
  return parser.skip(whitespace);
}

// Several parsers are just strings with optional whitespace.
function word(str) {
  return P.string(str).thru(token);
}

let JSONParser = P.createLanguage({
  // This is the main entry point of the parser: a full JSON value.
  value: r =>
    P.alt(
      r.object,
      r.array,
      r.string,
      r.number,
      r.null,
      r.true,
      r.false
    ).thru(parser => whitespace.then(parser)),

  // The basic tokens in JSON, with optional whitespace afterward.
  lbrace: () => word('{'),
  rbrace: () => word('}'),
  lbracket: () => word('['),
  rbracket: () => word(']'),
  comma: () => word(','),
  colon: () => word(':'),

  // `.result` is like `.map` but it takes a value instead of a function, and
  // `.always returns the same value.
  null: () => word('null').result(null),
  true: () => word('true').result(true),
  false: () => word('false').result(false),

  // Regexp based parsers should generally be named for better error reporting.
  string: () =>
    token(P.regexp(/"((?:\\.|.)*?)"/, 1))
      .map(interpretEscapes)
      .desc('string'),

  number: () =>
    token(P.regexp(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/))
      .map(Number)
      .desc('number'),

  // Array parsing is just ignoring brackets and commas and parsing as many nested
  // JSON documents as possible. Notice that we're using the parser `json` we just
  // defined above. Arrays and objects in the JSON grammar are recursive because
  // they can contain any other JSON document within them.
  array: r =>
    r.lbracket
      .then(P.sepBy(r.value, r.comma))
      .skip(r.rbracket),

  // Object parsing is a little trickier because we have to collect all the key-
  // value pairs in order as length-2 arrays, then manually copy them into an
  // object.
  pair: r =>
    P.seq(r.string.skip(r.colon), r.value),

  object: r =>
    r.lbrace
      .then(P.sepBy(r.pair, r.comma))
      .skip(r.rbrace)
      .map(pairs => {
        let object = {};
        pairs.forEach(pair => {
          let [key, value] = pair;
          object[key] = value;
        });
        return object;
      }),
});


///////////////////////////////////////////////////////////////////////

let text = `\
{
  "id": "a thing\\nice\tab",
  "another property!"
    : "also cool"
  , "weird formatting is ok too........😂": 123.45e1,
  "": [
    true, false, null,
    "",
    " ",
    {},
    {"": {}}
  ]
}
`;

function prettyPrint(x) {
  let opts = {depth: null, colors: 'auto'};
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = JSONParser.value.tryParse(text);
prettyPrint(ast);
