"use strict";

// Run me with Node to see my output!

let util = require("util");
let P = require("..");
let B = P.Binary;

///////////////////////////////////////////////////////////////////////

// Try using another string encoding here!
let STRING_ENCODING = "utf8";
// let STRING_ENCODING = "ucs2";

// Try rearranging these items
let DIRECTIONS_ENUM = ["up", "down", "left", "right"];

let Lang = P.createLanguage({
  File: p =>
    P.seqObj(
      p.MagicNumber,
      ["directions", p.Directions5],
      ["array", p.Int32Array],
      ["double", B.doubleLE],
      ["string", p.String]
    ),
  Directions5: () =>
    B.bitSeq([
      6, // 6 ignored bits
      2, // 2-bit direction #1
      2, // 2-bit direction #2
      2, // 2-bit direction #3
      2, // 2-bit direction #4
      2 // 2-bit direction #5
    ]).map(xs => {
      return xs.slice(1).map(x => DIRECTIONS_ENUM[x]);
    }),
  MagicNumber: () => P.seq(B.byte(0x13), B.byte(0x37)),
  Int32: () => B.int32BE,
  UInt32: () => B.uint32BE,
  String: p => p.UInt32.chain(n => B.encodedString(STRING_ENCODING, n)),
  Int32Array: p => p.UInt32.chain(n => p.Int32.times(n))
});

///////////////////////////////////////////////////////////////////////

// File format:
// - Magic number: hexadecimal "1337" byte sequence
// - 6 ignored bits
// - 10 bits where each pair of bits represents up/down/left/right
//   - 0 = 0b00 = up
//   - 1 = 0b01 = down
//   - 2 = 0b10 = left
//   - 3 = 0b11 = right
// - Array length: 32-bit unsigned big-endian integer
// - 32-bit signed integers up to the array length
// - A double precision floating point little-endian number
// - A 32-bit unsigned big-endian integer for the string length
// - "string length" number of UTF-8 bytes
// - End of file

let magic = [0x13, 0x37];
let length = [0x00, 0x00, 0x00, 0x02];
let directions = [0b00000011, 0b00101101];
let n512 = [0x00, 0x00, 0x02, 0x00];
let n513 = [0x00, 0x00, 0x02, 0x01];
let d314 = Buffer.alloc(8);
d314.writeDoubleLE(Math.PI);
let testString = "«Piña Colada® is a beverage!»";
let testStringByteLength = Buffer.from(testString, STRING_ENCODING).length;
let str = Buffer.alloc(4 + testStringByteLength);
let index = 0;
index += str.writeUInt32BE(testStringByteLength, index);
index += str.write(testString, index, testStringByteLength, STRING_ENCODING);
index;
let bytes = [
  ...magic,
  ...directions,
  ...length,
  ...n512,
  ...n513,
  ...d314,
  ...str
];
let input = Buffer.from(bytes);

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = Lang.File.tryParse(input);
prettyPrint(ast);
