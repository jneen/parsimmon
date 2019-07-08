"use strict";

describe(".tryParse", function() {
  it("returns just the value", function() {
    var x = 4;
    assert.equal(Parsimmon.of(x).tryParse(""), x);
  });

  it("returns throws on a bad parse", function() {
    assert.throws(function() {
      Parsimmon.digit.tryParse("a");
    });
  });

  it("thrown error message is equal to formatError", function() {
    var input = "a";
    var parser = Parsimmon.digit;
    var result = parser.parse(input);
    var errMsg = Parsimmon.formatError(input, result);
    try {
      parser.tryParse(input);
    } catch (err) {
      assert.equal(err.message, errMsg);
    }
  });

  it("thrown error contains full result object", function() {
    var input = "a";
    var parser = Parsimmon.digit;
    var result = parser.parse(input);
    try {
      parser.tryParse(input);
    } catch (err) {
      assert.deepEqual(err.result, result);
    }
  });

  it("thrown error message is equal to formatError", function() {
    var input = "a";
    var parser = Parsimmon.digit;
    try {
      parser.tryParse(input);
    } catch (err) {
      assert.deepEqual(err.result, parser.parse(input));
    }
  });
});
