"use strict";

describe("times", function() {
  it("zero case", function() {
    var zeroLetters = Parsimmon.letter.times(0);
    assert.deepEqual(zeroLetters.parse("").value, []);
    assert.ok(!zeroLetters.parse("x").status);
  });

  it("nonzero case", function() {
    var threeLetters = Parsimmon.letter.times(3);
    assert.deepEqual(threeLetters.parse("xyz").value, ["x", "y", "z"]);
    assert.ok(!threeLetters.parse("xy").status);
    assert.ok(!threeLetters.parse("xyzw").status);
    var thenDigit = threeLetters.then(Parsimmon.digit);
    assert.equal(thenDigit.parse("xyz1").value, "1");
    assert.ok(!thenDigit.parse("xy1").status);
    assert.ok(!thenDigit.parse("xyz").status);
    assert.ok(!thenDigit.parse("xyzw").status);
  });

  it("with a min and max", function() {
    var someLetters = Parsimmon.letter.times(2, 4);
    assert.deepEqual(someLetters.parse("xy").value, ["x", "y"]);
    assert.deepEqual(someLetters.parse("xyz").value, ["x", "y", "z"]);
    assert.deepEqual(someLetters.parse("xyzw").value, ["x", "y", "z", "w"]);
    assert.ok(!someLetters.parse("xyzwv").status);
    assert.ok(!someLetters.parse("x").status);
    var thenDigit = someLetters.then(Parsimmon.digit);
    assert.equal(thenDigit.parse("xy1").value, "1");
    assert.equal(thenDigit.parse("xyz1").value, "1");
    assert.equal(thenDigit.parse("xyzw1").value, "1");
    assert.ok(!thenDigit.parse("xy").status);
    assert.ok(!thenDigit.parse("xyzw").status);
    assert.ok(!thenDigit.parse("xyzwv1").status);
    assert.ok(!thenDigit.parse("x1").status);
  });

  it("checks that argument types are correct", function() {
    assert.throws(function() {
      Parsimmon.string("x").times("not a number");
    });
    assert.throws(function() {
      Parsimmon.string("x").times(1, "not a number");
    });
    assert.throws(function() {
      Parsimmon.string("x").atLeast("not a number");
    });
    assert.throws(function() {
      Parsimmon.string("x").atMost("not a number");
    });
  });

  it("prefer longest branch in .times() too", function() {
    var parser = Parsimmon.string("abc")
      .then(Parsimmon.string("def"))
      .or(Parsimmon.string("a"))
      .times(3, 6);

    assert.deepEqual(parser.parse("aabcde"), {
      status: false,
      index: {
        offset: 4,
        line: 1,
        column: 5
      },
      expected: ["'def'"]
    });

    assert.deepEqual(parser.parse("aaaaabcde"), {
      status: false,
      index: {
        offset: 7,
        line: 1,
        column: 8
      },
      expected: ["'def'"]
    });
  });
});
