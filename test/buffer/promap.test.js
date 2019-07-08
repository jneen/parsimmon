"use strict";

describe("promap", function() {
  function toLower(x) {
    return x.toLowerCase();
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
