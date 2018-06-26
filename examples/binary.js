"use strict";

// Run me with Node to see my output!

let util = require("util");
let P = require("..");
let B = P.Binary;

///////////////////////////////////////////////////////////////////////

let Lang = P.createLanguage({
  File: p => p.MagicNumber.then(p.Int32Array),
  MagicNumber: () => P.seq(B.byte(0x13), B.byte(0x37)),
  Int32: () => B.bitSeq([32]).map(x => x[0]),
  Int32Array: p => p.Int32.chain(n => p.Int32.times(n))
});

///////////////////////////////////////////////////////////////////////

let magic = [0x13, 0x37];
let length = [0x00, 0x00, 0x00, 0x02];
let n512 = [0x00, 0x00, 0x02, 0x00];
let n513 = [0x00, 0x00, 0x02, 0x01];
let bytes = [].concat(magic, length, n512, n513);
let input = Buffer.from(bytes);

function prettyPrint(x) {
  let opts = { depth: null, colors: "auto" };
  let s = util.inspect(x, opts);
  console.log(s);
}

let ast = Lang.File.tryParse(input);
prettyPrint(ast);
