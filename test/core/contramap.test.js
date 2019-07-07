"use strict";

describe("contramap", function() {
  function toLower(x) {
    return x.toLowerCase();
  }

  function chrs(b) {
    return b.toString("ascii");
  }

  it("with a function, transforms the input and parses that", function() {
    var parser = Parsimmon.string("x").contramap(function(x) {
      return x.toLowerCase();
    });
    assert.deepEqual(parser.parse("X"), { status: true, value: "x" });
  });

  it("asserts that a function was given", function() {
    assert.throws(function() {
      Parsimmon.string("x").contramap("not a function");
    });
  });

  it("upholds contravariant law of composition", function() {
    var parser1 = Parsimmon.string("a")
      .contramap(toLower)
      .contramap(chrs);
    var parser2 = Parsimmon.string("a").contramap(function(x) {
      return toLower(chrs(x));
    });
    var input = Buffer.from([0x61]);

    assert.deepEqual(parser1.parse(input), parser2.parse(input));
  });

  it("embedded contramaps make sense", function() {
    var parser = Parsimmon.seq(
      Parsimmon.string("a"),
      Parsimmon.seq(Parsimmon.string("c"), Parsimmon.string("d"))
        .tie()
        .contramap(function(x) {
          return x.slice(1);
        })
    ).tie();

    assert.deepEqual(parser.parse("abcd"), { status: true, value: "acd" });
  });

  it("backtracking with contramaps works", function() {
    var parser = Parsimmon.seq(
      Parsimmon.string("a"),
      Parsimmon.seq(Parsimmon.string("c"), Parsimmon.string("d"))
        .tie()
        .contramap(function(x) {
          return x.slice(1);
        })
    )
      .tie()
      .or(Parsimmon.all);

    assert.deepEqual(parser.parse("abcde"), { status: true, value: "abcde" });
  });
});
