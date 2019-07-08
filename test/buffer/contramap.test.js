"use strict";

describe("contramap", function() {
  function toLower(x) {
    return x.toLowerCase();
  }

  function chrs(b) {
    return b.toString("ascii");
  }

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
});
