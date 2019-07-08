"use strict";

describe("Parsimmon.notFollowedBy", function() {
  it("fails when its parser argument matches", function() {
    var weirdParser = Parsimmon.string("dx");
    var parser = Parsimmon.seq(
      Parsimmon.string("abc"),
      Parsimmon.notFollowedBy(weirdParser).result("NOT USED"),
      Parsimmon.string("dx")
    );
    var answer = parser.parse("abcdx");
    assert.deepEqual(answer.expected, ['not "dx"']);
  });

  it("does not consume from its input", function() {
    var weirdParser = Parsimmon.string("Q");
    var parser = Parsimmon.seq(
      Parsimmon.string("abc"),
      Parsimmon.notFollowedBy(weirdParser),
      Parsimmon.string("d")
    );
    var answer = parser.parse("abcd");
    assert.deepEqual(answer.value, ["abc", null, "d"]);
  });

  it("can be chained from prototype", function() {
    var parser = Parsimmon.seq(
      Parsimmon.string("abc").notFollowedBy(Parsimmon.string("Q")),
      Parsimmon.string("d")
    );
    var answer = parser.parse("abcd");
    assert.deepEqual(answer.value, ["abc", "d"]);
  });
});
