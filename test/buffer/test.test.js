"use strict";

it("test", function() {
  var highBit = Parsimmon.test(function(ch) {
    return ch | 128;
  });
  assert.equal(highBit.parse(Buffer.from([255])).status, true);
  assert.equal(highBit.parse(Buffer.from([0])).status, true);
  assert.equal(highBit.parse(Buffer.from([127])).status, true);
});
