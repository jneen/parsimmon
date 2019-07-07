"use strict";

describe("promap", function() {
  function toLower(x) {
    return x.toLowerCase();
  }

  function ord(chr) {
    return chr.charCodeAt(0);
  }

  function chrs(b) {
    return b.toString("ascii");
  }

  function length(x) {
    return x.length;
  }

  function sub1(x) {
    return x - 1;
  }

  it("with a function, transforms the input and parses that, and transforms the output", function() {
    var parser = Parsimmon.string("a").promap(toLower, ord);
    assert.deepEqual(parser.parse("A"), { status: true, value: 0x61 });
  });

  it("asserts that a function was given", function() {
    assert.throws(function() {
      Parsimmon.string("x").promap("not a function", toLower);
    });

    assert.throws(function() {
      Parsimmon.string("x").promap(toLower, "not a function");
    });
  });

  it("upholds profunctor law of composition", function() {
    var parser1 = Parsimmon.string("aa")
      .promap(toLower, length)
      .promap(chrs, sub1);

    var parser2 = Parsimmon.string("aa").promap(
      function(x) {
        return toLower(chrs(x));
      },
      function(x) {
        return sub1(length(x));
      }
    );
    var input = Buffer.from([0x41, 0x41]);

    assert.deepEqual(parser1.parse(input), parser2.parse(input));
  });
});
