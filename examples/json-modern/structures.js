import parseEscape from './parseEscape';
import { succeed, seq, seqMap, lazy, alt, string, regex, optWhitespace } from '../..';

let lexeme = p => p.skip(optWhitespace);

let json = lazy('a json element', () => alt(
	object,
	array,
	stringLiteral,
	numberLiteral,
	nullLiteral,
	trueLiteral,
	falseLiteral
));

let commaDelimited = parser =>
	seqMap(parser, comma.then(parser).many(),
		(first, rest) => [first].concat(rest)
	).or(succeed([]));

let [lbrace, rbrace, lbrack, rbrack, comma, colon] =
	['{', '}', '[', ']', ',', ':'].map(x => lexeme(string(x)));

let [nullLiteral, trueLiteral, falseLiteral] =
	[null, true, false].map(x => lexeme(string(String(x))).result(x));

let quoted = lexeme(regex(/"((?:\\.|.)*?)"/, 1))
	.desc('a quoted string');

let number = lexeme(regex(/-?(0|[1-9]\d*)([.]\d+)?(e[+-]?\d+)?/i))
	.desc('a numeral');

let stringLiteral = quoted.map(parseEscape);

let numberLiteral = number.map(parseFloat);

let pair = seq(stringLiteral.skip(colon), json);

let array = seqMap(lbrack, commaDelimited(json), rbrack, (_, results) => {
	return results;
});

let object = seqMap(lbrace, commaDelimited(pair), rbrace, (_, pairs) => {
	let out = {};
	for (let pair of pairs) {
		out[pair[0]] = pair[1];
	}
	return out;
});

export default json;
