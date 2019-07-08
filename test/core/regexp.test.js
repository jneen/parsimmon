"use strict";

describe("Parsimmon.regexp", function() {
  it("general usage", function() {
    var parser = Parsimmon.regexp(/[0-9]/);

    assert.equal(parser.parse("1").value, "1");
    assert.equal(parser.parse("4").value, "4");
    assert.deepEqual(parser.parse("x0"), {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: ["/[0-9]/"]
    });
    assert.deepEqual(parser.parse("0x"), {
      status: false,
      index: {
        offset: 1,
        line: 1,
        column: 2
      },
      expected: ["EOF"]
    });
    assert.throws(function() {
      Parsimmon.regexp(42);
    });
    assert.throws(function() {
      Parsimmon.regexp(/a/, "not a number");
    });
  });

  it("rejects /g flag", function() {
    assert.throws(function() {
      Parsimmon.regexp(/a/g);
    });
  });

  it("has alias Parsimmon.regex", function() {
    assert.equal(Parsimmon.regex, Parsimmon.regexp);
  });

  it("supports groups", function() {
    var parser0 = Parsimmon.regexp(/(\w)(\d)/, 0);
    var parser1 = Parsimmon.regexp(/(\w)(\d)/, 1);
    var parser2 = Parsimmon.regexp(/(\w)(\d)/, 2);
    var parser3 = Parsimmon.regexp(/(\w)(\d)/, 8);
    assert.strictEqual(parser0.parse("a1").value, "a1");
    assert.strictEqual(parser1.parse("a1").value, "a");
    assert.strictEqual(parser2.parse("a1").value, "1");
    assert.deepStrictEqual(parser3.parse("a1"), {
      status: false,
      expected: ["valid match group (0 to 3) in /(\\w)(\\d)/"],
      index: { column: 1, line: 1, offset: 0 }
    });
  });
});
