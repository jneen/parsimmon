"use strict";

it("atLeast", function() {
  var atLeastTwo = Parsimmon.letter.atLeast(2);
  assert.deepEqual(atLeastTwo.parse("xy").value, ["x", "y"]);
  assert.deepEqual(atLeastTwo.parse("xyzw").value, ["x", "y", "z", "w"]);
  assert.ok(!atLeastTwo.parse("x").status);
});
