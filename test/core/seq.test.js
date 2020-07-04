"use strict";

testSetScenario(function() {
  it("Parsimmon.seq", function() {
    var parser = Parsimmon.seq(
      Parsimmon.string("("),
      Parsimmon.regexp(/[^)]/)
        .many()
        .map(function(xs) {
          return xs.join("");
        }),
      Parsimmon.string(")")
    );

    assert.deepEqual(parser.parse("(string between parens)").value, [
      "(",
      "string between parens",
      ")"
    ]);

    assert.deepEqual(parser.parse("(string"), {
      status: false,
      index: {
        offset: 7,
        line: 1,
        column: 8
      },
      expected: ["')'", "/[^)]/"]
    });

    assert.deepEqual(parser.parse("starts wrong (string between parens)"), {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: ["'('"]
    });

    assert.throws(function() {
      Parsimmon.seq("not a parser");
    });
  });
});
