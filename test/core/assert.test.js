"use strict";

suite("parser.assert", function() {
  test("should fail when parser fails", function() {
    var value = Parsimmon.digit
      .assert(function() {
        return true;
      })
      .parse("a");
    assert(!value.status);
  });

  test("should fail when sentenel returns false", function() {
    var value = Parsimmon.digit
      .assert(function() {
        return false;
      })
      .parse("1");
    assert(!value.status);
  });

  test("should yield when parser yields and sentenel returns true", function() {
    var value = Parsimmon.digit
      .assert(function() {
        return true;
      })
      .parse("1");
    assert(value.status);
  });

  test("should accept an error description string", function() {
    var value = Parsimmon.digit
      .assert(function() {
        return true;
      }, "error description string")
      .parse("1");
    assert(value.status);
  });

  test("should report error description string on assertion failure", function() {
    var value = Parsimmon.digit
      .assert(function() {
        return false;
      }, "error description string")
      .parse("1");
    assert(value.expected.includes("error description string"));
  });

  test("should report failure with offset at end of parsed value", function() {
    var value = Parsimmon.digits
      .assert(function() {
        return false;
      })
      .parse("11a");
    assert(value.index.offset === 2);
  });
});
