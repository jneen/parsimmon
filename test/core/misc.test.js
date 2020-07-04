"use strict";

function ezTest(options) {
  var name = options.name;
  var parser = options.parser;
  var good = options.good;
  var bad = options.bad;
  describe(name, function() {
    good.forEach(function(c) {
      it('should parse "' + c + '"', function() {
        assert.strictEqual(parser.tryParse(c), c);
      });
    });
    bad.forEach(function(c) {
      it('should not parse "' + c + '"', function() {
        assert.strictEqual(parser.parse(c).status, false);
      });
    });
  });
}

var whitespace = [
  " ",
  "\f",
  "\n",
  "\r",
  "\t",
  "\v",
  "\u00a0",
  "\u1680",
  "\u2000",
  "\u2001",
  "\u2002",
  "\u2003",
  "\u2004",
  "\u2005",
  "\u2006",
  "\u2007",
  "\u2008",
  "\u2009",
  "\u200a",
  "\u2028",
  "\u2029",
  "\u202f",
  "\u205f",
  "\u3000",
  "\ufeff"
];

var whitespaces = whitespace.concat([
  "\f\f",
  "   ",
  "\r\n",
  "\v\v\t",
  " \t \t "
]);

testSetScenario(function() {
  describe("(misc)", function() {
    describe("Parsimmon.end", function() {
      var newlineSequences = ["\n", "\r", "\r\n"];

      it("should parse a newline", function() {
        newlineSequences.forEach(function(c) {
          assert.strictEqual(Parsimmon.end.tryParse(c), c);
        });
        assert.strictEqual(Parsimmon.end.tryParse(""), null);
      });

      it("should not parse the letter A", function() {
        assert.deepStrictEqual(Parsimmon.end.parse("A"), {
          status: false,
          index: { offset: 0, line: 1, column: 1 },
          expected: ["EOF", "newline"]
        });
      });
    });

    ezTest({
      name: "Parsimmon.cr",
      parser: Parsimmon.cr,
      good: ["\r"],
      bad: ["\n", "\r\n", ""]
    });

    ezTest({
      name: "Parsimmon.lf",
      parser: Parsimmon.lf,
      good: ["\n"],
      bad: ["\r", "\r\n", ""]
    });

    ezTest({
      name: "Parsimmon.crlf",
      parser: Parsimmon.crlf,
      good: ["\r\n"],
      bad: ["\r", "\n", ""]
    });

    describe("Parsimmon.digit", function() {
      it("should parse exactly one 0-9 character", function() {
        assert.strictEqual(Parsimmon.digit.tryParse("4"), "4");
      });
    });
    ezTest({
      name: "Parsimmon.digit",
      parser: Parsimmon.digit,
      good: "0 1 2 3 4 5 6 7 8 9".split(" "),
      bad: ["a", "", "-"]
    });

    ezTest({
      name: "Parsimmon.digits",
      parser: Parsimmon.digits,
      good: ["", "007", "420", "69", "1337", "666"],
      bad: ["a", "-", "1 2 3 4", "-4", "0xcafe"]
    });

    ezTest({
      name: "Parsimmon.letter",
      parser: Parsimmon.letter,
      good: "a b Z c d e A G h z".split(" "),
      bad: ["9", ".", "-", ""]
    });

    ezTest({
      name: "Parsimmon.letters",
      parser: Parsimmon.letters,
      good: [""].concat("aAa bbbB Zzzz cc d e A G h z".split(" ")),
      bad: ["9", ".", "-"]
    });

    ezTest({
      name: "Parsimmon.optWhitespace",
      parser: Parsimmon.optWhitespace,
      good: [""].concat(whitespace),
      bad: ["a", "-", "1 2 3 4", "-4", "0xcafe"]
    });

    ezTest({
      name: "Parsimmon.whitespace",
      parser: Parsimmon.whitespace,
      good: whitespaces,
      bad: ["a", "", "-", "1 2 3 4", "-4", "0xcafe"]
    });
  });
});
