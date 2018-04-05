"use strict";

suite("contramap", function() {
  function toLower(x) {
    return x.toLowerCase();
  }

  function chrs(b) {
    return b.toString("ascii");
  }

  test("with a function, transforms the input and parses that", function() {
    var parser = Parsimmon.string("x").contramap(function(x) {
      return x.toLowerCase();
    });
    assert.deepEqual(parser.parse("X"), { status: true, value: "x" });
  });

  test("asserts that a function was given", function() {
    assert.throws(function() {
      Parsimmon.string("x").contramap("not a function");
    });
  });

  test("upholds contravariant law of composition", function() {
    var parser1 = Parsimmon.string("a")
      .contramap(toLower)
      .contramap(chrs);
    var parser2 = Parsimmon.string("a").contramap(function(x) {
      return toLower(chrs(x));
    });
    var input = Buffer.from([0x61]);

    assert.deepEqual(parser1.parse(input), parser2.parse(input));
  });

  test("embedded contramaps make sense", function() {
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
});
