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
});
