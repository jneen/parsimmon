"use strict";

suite("byte", function() {
  test("it matches a buffer byte", function() {
    var b = Buffer.from([0xf]);
    var p = Parsimmon.byte(0xf);
    assert.ok(p.parse(b).value);
  });

  test("it formats single digit bytes like 0x0f", function() {
    var b = Buffer.from([0xa]);
    var p = Parsimmon.byte(0xf);
    assert.deepEqual(p.parse(b).expected, ["0x0f"]);
  });

  test("it formats double digit bytes like 0xff", function() {
    var b = Buffer.from([0x12]);
    var p = Parsimmon.byte(0xff);
    assert.deepEqual(p.parse(b).expected, ["0xff"]);
  });
});
