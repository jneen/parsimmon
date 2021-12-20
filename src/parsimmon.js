"use strict";

function Parsimmon(action) {
  if (!(this instanceof Parsimmon)) {
    return new Parsimmon(action);
  }
  this._ = action;
}

var _ = Parsimmon.prototype;

function times(n, f) {
  var i = 0;
  for (i; i < n; i++) {
    f(i);
  }
}

function forEach(f, arr) {
  times(arr.length, function(i) {
    f(arr[i], i, arr);
  });
}

function reduce(f, seed, arr) {
  forEach(function(elem, i, arr) {
    seed = f(seed, elem, i, arr);
  }, arr);
  return seed;
}

function map(f, arr) {
  return reduce(
    function(acc, elem, i, a) {
      return acc.concat([f(elem, i, a)]);
    },
    [],
    arr
  );
}

function lshiftBuffer(input) {
  var asTwoBytes = reduce(
    function(a, v, i, b) {
      return a.concat(
        i === b.length - 1
          ? Buffer.from([v, 0]).readUInt16BE(0)
          : b.readUInt16BE(i)
      );
    },
    [],
    input
  );
  return Buffer.from(
    map(function(x) {
      return ((x << 1) & 0xffff) >> 8;
    }, asTwoBytes)
  );
}

function consumeBitsFromBuffer(n, input) {
  var state = { v: 0, buf: input };
  times(n, function() {
    state = {
      v: (state.v << 1) | bitPeekBuffer(state.buf),
      buf: lshiftBuffer(state.buf)
    };
  });
  return state;
}

function bitPeekBuffer(input) {
  return input[0] >> 7;
}

function sum(numArr) {
  return reduce(
    function(x, y) {
      return x + y;
    },
    0,
    numArr
  );
}

function find(pred, arr) {
  return reduce(
    function(found, elem) {
      return found || (pred(elem) ? elem : found);
    },
    null,
    arr
  );
}

function bufferExists() {
  return typeof Buffer !== "undefined";
}

function setExists() {
  if (Parsimmon._supportsSet !== undefined) {
    return Parsimmon._supportsSet;
  }
  var exists = typeof Set !== "undefined";
  Parsimmon._supportsSet = exists;
  return exists;
}

function ensureBuffer() {
  if (!bufferExists()) {
    throw new Error(
      "Buffer global does not exist; please use webpack if you need to parse Buffers in the browser."
    );
  }
}

function bitSeq(alignments) {
  ensureBuffer();
  var totalBits = sum(alignments);
  if (totalBits % 8 !== 0) {
    throw new Error(
      "The bits [" +
        alignments.join(", ") +
        "] add up to " +
        totalBits +
        " which is not an even number of bytes; the total should be divisible by 8"
    );
  }
  var bytes = totalBits / 8;

  var tooBigRange = find(function(x) {
    return x > 48;
  }, alignments);
  if (tooBigRange) {
    throw new Error(
      tooBigRange + " bit range requested exceeds 48 bit (6 byte) Number max."
    );
  }

  return new Parsimmon(function(input, i) {
    var newPos = bytes + i;
    if (newPos > input.length) {
      return makeFailure(i, bytes.toString() + " bytes");
    }
    return makeSuccess(
      newPos,
      reduce(
        function(acc, bits) {
          var state = consumeBitsFromBuffer(bits, acc.buf);
          return {
            coll: acc.coll.concat(state.v),
            buf: state.buf
          };
        },
        { coll: [], buf: input.slice(i, newPos) },
        alignments
      ).coll
    );
  });
}

function bitSeqObj(namedAlignments) {
  ensureBuffer();
  var seenKeys = {};
  var totalKeys = 0;
  var fullAlignments = map(function(item) {
    if (isArray(item)) {
      var pair = item;
      if (pair.length !== 2) {
        throw new Error(
          "[" +
            pair.join(", ") +
            "] should be length 2, got length " +
            pair.length
        );
      }
      assertString(pair[0]);
      assertNumber(pair[1]);
      if (Object.prototype.hasOwnProperty.call(seenKeys, pair[0])) {
        throw new Error("duplicate key in bitSeqObj: " + pair[0]);
      }
      seenKeys[pair[0]] = true;
      totalKeys++;
      return pair;
    } else {
      assertNumber(item);
      return [null, item];
    }
  }, namedAlignments);
  if (totalKeys < 1) {
    throw new Error(
      "bitSeqObj expects at least one named pair, got [" +
        namedAlignments.join(", ") +
        "]"
    );
  }
  var namesOnly = map(function(pair) {
    return pair[0];
  }, fullAlignments);
  var alignmentsOnly = map(function(pair) {
    return pair[1];
  }, fullAlignments);

  return bitSeq(alignmentsOnly).map(function(parsed) {
    var namedParsed = map(function(name, i) {
      return [name, parsed[i]];
    }, namesOnly);

    return reduce(
      function(obj, kv) {
        if (kv[0] !== null) {
          obj[kv[0]] = kv[1];
        }
        return obj;
      },
      {},
      namedParsed
    );
  });
}

function parseBufferFor(other, length) {
  return new Parsimmon(function(input, i) {
    ensureBuffer();
    if (i + length > input.length) {
      return makeFailure(i, length + " bytes for " + other);
    }
    return makeSuccess(i + length, input.slice(i, i + length));
  });
}

function parseBuffer(length) {
  return parseBufferFor("buffer", length).map(function(unsafe) {
    return Buffer.from(unsafe);
  });
}

function encodedString(encoding, length) {
  return parseBufferFor("string", length).map(function(buff) {
    return buff.toString(encoding);
  });
}

function isInteger(value) {
  return typeof value === "number" && Math.floor(value) === value;
}

function assertValidIntegerByteLengthFor(who, length) {
  if (!isInteger(length) || length < 0 || length > 6) {
    throw new Error(who + " requires integer length in range [0, 6].");
  }
}

function uintBE(length) {
  assertValidIntegerByteLengthFor("uintBE", length);
  return parseBufferFor("uintBE(" + length + ")", length).map(function(buff) {
    return buff.readUIntBE(0, length);
  });
}

function uintLE(length) {
  assertValidIntegerByteLengthFor("uintLE", length);
  return parseBufferFor("uintLE(" + length + ")", length).map(function(buff) {
    return buff.readUIntLE(0, length);
  });
}

function intBE(length) {
  assertValidIntegerByteLengthFor("intBE", length);
  return parseBufferFor("intBE(" + length + ")", length).map(function(buff) {
    return buff.readIntBE(0, length);
  });
}

function intLE(length) {
  assertValidIntegerByteLengthFor("intLE", length);
  return parseBufferFor("intLE(" + length + ")", length).map(function(buff) {
    return buff.readIntLE(0, length);
  });
}

function floatBE() {
  return parseBufferFor("floatBE", 4).map(function(buff) {
    return buff.readFloatBE(0);
  });
}

function floatLE() {
  return parseBufferFor("floatLE", 4).map(function(buff) {
    return buff.readFloatLE(0);
  });
}

function doubleBE() {
  return parseBufferFor("doubleBE", 8).map(function(buff) {
    return buff.readDoubleBE(0);
  });
}

function doubleLE() {
  return parseBufferFor("doubleLE", 8).map(function(buff) {
    return buff.readDoubleLE(0);
  });
}

function toArray(arrLike) {
  return Array.prototype.slice.call(arrLike);
}
// -*- Helpers -*-

function isParser(obj) {
  return obj instanceof Parsimmon;
}

function isArray(x) {
  return {}.toString.call(x) === "[object Array]";
}

function isBuffer(x) {
  /* global Buffer */
  return bufferExists() && Buffer.isBuffer(x);
}

function makeSuccess(index, value) {
  return {
    status: true,
    index: index,
    value: value,
    furthest: -1,
    expected: []
  };
}

function makeFailure(index, expected) {
  if (!isArray(expected)) {
    expected = [expected];
  }
  return {
    status: false,
    index: -1,
    value: null,
    furthest: index,
    expected: expected
  };
}

function mergeReplies(result, last) {
  if (!last) {
    return result;
  }
  if (result.furthest > last.furthest) {
    return result;
  }
  var expected =
    result.furthest === last.furthest
      ? union(result.expected, last.expected)
      : last.expected;
  return {
    status: result.status,
    index: result.index,
    value: result.value,
    furthest: last.furthest,
    expected: expected
  };
}

// index of { input => { index => { lineNumber, startOfLine } } }
// when we see a new index we just walk backwards to the last seen index and
// compute the new lineNumber and startOfLine from there so we don't have to
// recompute from the whole input
var lineColumnIndex = {};
function makeLineColumnIndex(input, i) {
  if (isBuffer(input)) {
    return {
      offset: i,
      line: -1,
      column: -1
    };
  }

  // initialize if we haven't seen this input yet
  if (!(input in lineColumnIndex)) {
    lineColumnIndex[input] = {};
  }

  var inputIndex = lineColumnIndex[input];

  var prevLine = 0;
  var newLines = 0;
  var lineStart = 0;
  var j = i;
  while (j >= 0) {
    if (j in inputIndex) {
      prevLine = inputIndex[j].line;
      // lineStart === 0 when we haven't found a new line on the walk
      // back from i, so we are on the same line as the previously cached
      // index
      if (lineStart === 0) {
        lineStart = inputIndex[j].lineStart;
      }
      break;
    }

    if (
      // Unix LF (\n) or Windows CRLF (\r\n) line ending
      input.charAt(j) === "\n" ||
      // Old Mac CR (\r) line ending
      (input.charAt(j) === "\r" && input.charAt(j + 1) !== "\n")
    ) {
      newLines++;
      // lineStart === 0 when this is the first new line we have found
      if (lineStart === 0) {
        lineStart = j + 1;
      }
    }
    j--;
  }

  var lineWeAreUpTo = prevLine + newLines;
  var columnWeAreUpTo = i - lineStart;

  inputIndex[i] = { line: lineWeAreUpTo, lineStart: lineStart };

  // lines and columns are 1-indexed
  return {
    offset: i,
    line: lineWeAreUpTo + 1,
    column: columnWeAreUpTo + 1
  };
}

// Returns the sorted set union of two arrays of strings
function union(xs, ys) {
  // for newer browsers/node we can improve performance by using
  // modern JS
  if (setExists() && Array.from) {
    // eslint-disable-next-line no-undef
    var set = new Set(xs);
    for (var y = 0; y < ys.length; y++) {
      set.add(ys[y]);
    }
    var arr = Array.from(set);
    arr.sort();
    return arr;
  }
  var obj = {};
  for (var i = 0; i < xs.length; i++) {
    obj[xs[i]] = true;
  }
  for (var j = 0; j < ys.length; j++) {
    obj[ys[j]] = true;
  }
  var keys = [];
  for (var k in obj) {
    if ({}.hasOwnProperty.call(obj, k)) {
      keys.push(k);
    }
  }
  keys.sort();
  return keys;
}

function assertParser(p) {
  if (!isParser(p)) {
    throw new Error("not a parser: " + p);
  }
}

function get(input, i) {
  if (typeof input === "string") {
    return input.charAt(i);
  }
  return input[i];
}

// TODO[ES5]: Switch to Array.isArray eventually.
function assertArray(x) {
  if (!isArray(x)) {
    throw new Error("not an array: " + x);
  }
}

function assertNumber(x) {
  if (typeof x !== "number") {
    throw new Error("not a number: " + x);
  }
}

function assertRegexp(x) {
  if (!(x instanceof RegExp)) {
    throw new Error("not a regexp: " + x);
  }
  var f = flags(x);
  for (var i = 0; i < f.length; i++) {
    var c = f.charAt(i);
    // Only allow regexp flags [imus] for now, since [g] and [y] specifically
    // mess up Parsimmon. If more non-stateful regexp flags are added in the
    // future, this will need to be revisited.
    if (c !== "i" && c !== "m" && c !== "u" && c !== "s") {
      throw new Error('unsupported regexp flag "' + c + '": ' + x);
    }
  }
}

function assertFunction(x) {
  if (typeof x !== "function") {
    throw new Error("not a function: " + x);
  }
}

function assertString(x) {
  if (typeof x !== "string") {
    throw new Error("not a string: " + x);
  }
}

// -*- Error Formatting -*-

var linesBeforeStringError = 2;
var linesAfterStringError = 3;
var bytesPerLine = 8;
var bytesBefore = bytesPerLine * 5;
var bytesAfter = bytesPerLine * 4;
var defaultLinePrefix = "  ";

function repeat(string, amount) {
  return new Array(amount + 1).join(string);
}

function formatExpected(expected) {
  if (expected.length === 1) {
    return "Expected:\n\n" + expected[0];
  }
  return "Expected one of the following: \n\n" + expected.join(", ");
}

function leftPad(str, pad, char) {
  var add = pad - str.length;
  if (add <= 0) {
    return str;
  }
  return repeat(char, add) + str;
}

function toChunks(arr, chunkSize) {
  var length = arr.length;
  var chunks = [];
  var chunkIndex = 0;

  if (length <= chunkSize) {
    return [arr.slice()];
  }

  for (var i = 0; i < length; i++) {
    if (!chunks[chunkIndex]) {
      chunks.push([]);
    }

    chunks[chunkIndex].push(arr[i]);

    if ((i + 1) % chunkSize === 0) {
      chunkIndex++;
    }
  }

  return chunks;
}

// Get a range of indexes including `i`-th element and `before` and `after` amount of elements from `arr`.
function rangeFromIndexAndOffsets(i, before, after, length) {
  return {
    // Guard against the negative upper bound for lines included in the output.
    from: i - before > 0 ? i - before : 0,
    to: i + after > length ? length : i + after
  };
}

function byteRangeToRange(byteRange) {
  // Exception for inputs smaller than `bytesPerLine`
  if (byteRange.from === 0 && byteRange.to === 1) {
    return {
      from: byteRange.from,
      to: byteRange.to
    };
  }

  return {
    from: byteRange.from / bytesPerLine,
    // Round `to`, so we don't get float if the amount of bytes is not divisible by `bytesPerLine`
    to: Math.floor(byteRange.to / bytesPerLine)
  };
}

function formatGot(input, error) {
  var index = error.index;
  var i = index.offset;

  var verticalMarkerLength = 1;
  var column;
  var lineWithErrorIndex;
  var lines;
  var lineRange;
  var lastLineNumberLabelLength;

  if (i === input.length) {
    return "Got the end of the input";
  }

  if (isBuffer(input)) {
    var byteLineWithErrorIndex = i - (i % bytesPerLine);
    var columnByteIndex = i - byteLineWithErrorIndex;
    var byteRange = rangeFromIndexAndOffsets(
      byteLineWithErrorIndex,
      bytesBefore,
      bytesAfter + bytesPerLine,
      input.length
    );
    var bytes = input.slice(byteRange.from, byteRange.to);
    var bytesInChunks = toChunks(bytes.toJSON().data, bytesPerLine);

    var byteLines = map(function(byteRow) {
      return map(function(byteValue) {
        // Prefix byte values with a `0` if they are shorter than 2 characters.
        return leftPad(byteValue.toString(16), 2, "0");
      }, byteRow);
    }, bytesInChunks);

    lineRange = byteRangeToRange(byteRange);
    lineWithErrorIndex = byteLineWithErrorIndex / bytesPerLine;
    column = columnByteIndex * 3;

    // Account for an extra space.
    if (columnByteIndex >= 4) {
      column += 1;
    }

    verticalMarkerLength = 2;
    lines = map(function(byteLine) {
      return byteLine.length <= 4
        ? byteLine.join(" ")
        : byteLine.slice(0, 4).join(" ") + "  " + byteLine.slice(4).join(" ");
    }, byteLines);
    lastLineNumberLabelLength = (
      (lineRange.to > 0 ? lineRange.to - 1 : lineRange.to) * 8
    ).toString(16).length;

    if (lastLineNumberLabelLength < 2) {
      lastLineNumberLabelLength = 2;
    }
  } else {
    var inputLines = input.split(/\r\n|[\n\r\u2028\u2029]/);
    column = index.column - 1;
    lineWithErrorIndex = index.line - 1;
    lineRange = rangeFromIndexAndOffsets(
      lineWithErrorIndex,
      linesBeforeStringError,
      linesAfterStringError,
      inputLines.length
    );

    lines = inputLines.slice(lineRange.from, lineRange.to);
    lastLineNumberLabelLength = lineRange.to.toString().length;
  }

  var lineWithErrorCurrentIndex = lineWithErrorIndex - lineRange.from;

  if (isBuffer(input)) {
    lastLineNumberLabelLength = (
      (lineRange.to > 0 ? lineRange.to - 1 : lineRange.to) * 8
    ).toString(16).length;

    if (lastLineNumberLabelLength < 2) {
      lastLineNumberLabelLength = 2;
    }
  }

  var linesWithLineNumbers = reduce(
    function(acc, lineSource, index) {
      var isLineWithError = index === lineWithErrorCurrentIndex;
      var prefix = isLineWithError ? "> " : defaultLinePrefix;
      var lineNumberLabel;

      if (isBuffer(input)) {
        lineNumberLabel = leftPad(
          ((lineRange.from + index) * 8).toString(16),
          lastLineNumberLabelLength,
          "0"
        );
      } else {
        lineNumberLabel = leftPad(
          (lineRange.from + index + 1).toString(),
          lastLineNumberLabelLength,
          " "
        );
      }

      return [].concat(
        acc,
        [prefix + lineNumberLabel + " | " + lineSource],
        isLineWithError
          ? [
              defaultLinePrefix +
                repeat(" ", lastLineNumberLabelLength) +
                " | " +
                leftPad("", column, " ") +
                repeat("^", verticalMarkerLength)
            ]
          : []
      );
    },
    [],
    lines
  );

  return linesWithLineNumbers.join("\n");
}

function formatError(input, error) {
  return [
    "\n",
    "-- PARSING FAILED " + repeat("-", 50),
    "\n\n",
    formatGot(input, error),
    "\n\n",
    formatExpected(error.expected),
    "\n"
  ].join("");
}

function flags(re) {
  if (re.flags !== undefined) {
    return re.flags;
  }
  // legacy browser support
  return [
    re.global ? "g" : "",
    re.ignoreCase ? "i" : "",
    re.multiline ? "m" : "",
    re.unicode ? "u" : "",
    re.sticky ? "y" : ""
  ].join("");
}

function anchoredRegexp(re) {
  return RegExp("^(?:" + re.source + ")", flags(re));
}

// -*- Combinators -*-

function seq() {
  var parsers = [].slice.call(arguments);
  var numParsers = parsers.length;
  for (var j = 0; j < numParsers; j += 1) {
    assertParser(parsers[j]);
  }
  return Parsimmon(function(input, i) {
    var result;
    var accum = new Array(numParsers);
    for (var j = 0; j < numParsers; j += 1) {
      result = mergeReplies(parsers[j]._(input, i), result);
      if (!result.status) {
        return result;
      }
      accum[j] = result.value;
      i = result.index;
    }
    return mergeReplies(makeSuccess(i, accum), result);
  });
}

function seqObj() {
  var seenKeys = {};
  var totalKeys = 0;
  var parsers = toArray(arguments);
  var numParsers = parsers.length;
  for (var j = 0; j < numParsers; j += 1) {
    var p = parsers[j];
    if (isParser(p)) {
      continue;
    }
    if (isArray(p)) {
      var isWellFormed =
        p.length === 2 && typeof p[0] === "string" && isParser(p[1]);
      if (isWellFormed) {
        var key = p[0];
        if (Object.prototype.hasOwnProperty.call(seenKeys, key)) {
          throw new Error("seqObj: duplicate key " + key);
        }
        seenKeys[key] = true;
        totalKeys++;
        continue;
      }
    }
    throw new Error(
      "seqObj arguments must be parsers or [string, parser] array pairs."
    );
  }
  if (totalKeys === 0) {
    throw new Error("seqObj expects at least one named parser, found zero");
  }
  return Parsimmon(function(input, i) {
    var result;
    var accum = {};
    for (var j = 0; j < numParsers; j += 1) {
      var name;
      var parser;
      if (isArray(parsers[j])) {
        name = parsers[j][0];
        parser = parsers[j][1];
      } else {
        name = null;
        parser = parsers[j];
      }
      result = mergeReplies(parser._(input, i), result);
      if (!result.status) {
        return result;
      }
      if (name) {
        accum[name] = result.value;
      }
      i = result.index;
    }
    return mergeReplies(makeSuccess(i, accum), result);
  });
}

function seqMap() {
  var args = [].slice.call(arguments);
  if (args.length === 0) {
    throw new Error("seqMap needs at least one argument");
  }
  var mapper = args.pop();
  assertFunction(mapper);
  return seq.apply(null, args).map(function(results) {
    return mapper.apply(null, results);
  });
}

// TODO[ES5]: Revisit this with Object.keys and .bind.
function createLanguage(parsers) {
  var language = {};
  for (var key in parsers) {
    if ({}.hasOwnProperty.call(parsers, key)) {
      (function(key) {
        var func = function() {
          return parsers[key](language);
        };
        language[key] = lazy(func);
      })(key);
    }
  }
  return language;
}

function alt() {
  var parsers = [].slice.call(arguments);
  var numParsers = parsers.length;
  if (numParsers === 0) {
    return fail("zero alternates");
  }
  for (var j = 0; j < numParsers; j += 1) {
    assertParser(parsers[j]);
  }
  return Parsimmon(function(input, i) {
    var result;
    for (var j = 0; j < parsers.length; j += 1) {
      result = mergeReplies(parsers[j]._(input, i), result);
      if (result.status) {
        return result;
      }
    }
    return result;
  });
}

function sepBy(parser, separator) {
  // Argument asserted by sepBy1
  return sepBy1(parser, separator).or(succeed([]));
}

function sepBy1(parser, separator) {
  assertParser(parser);
  assertParser(separator);
  var pairs = separator.then(parser).many();
  return seqMap(parser, pairs, function(r, rs) {
    return [r].concat(rs);
  });
}

// -*- Core Parsing Methods -*-

_.parse = function(input) {
  if (typeof input !== "string" && !isBuffer(input)) {
    throw new Error(
      ".parse must be called with a string or Buffer as its argument"
    );
  }
  var parseResult = this.skip(eof)._(input, 0);

  var result;
  if (parseResult.status) {
    result = {
      status: true,
      value: parseResult.value
    };
  } else {
    result = {
      status: false,
      index: makeLineColumnIndex(input, parseResult.furthest),
      expected: parseResult.expected
    };
  }

  // release memory from lineColumnIndex now we are done parsing
  delete lineColumnIndex[input];

  return result;
};

// -*- Other Methods -*-

_.tryParse = function(str) {
  var result = this.parse(str);
  if (result.status) {
    return result.value;
  } else {
    var msg = formatError(str, result);
    var err = new Error(msg);
    err.type = "ParsimmonError";
    err.result = result;
    throw err;
  }
};

_.assert = function(condition, errorMessage) {
  return this.chain(function(value) {
    return condition(value) ? succeed(value) : fail(errorMessage);
  });
};

_.or = function(alternative) {
  return alt(this, alternative);
};

_.trim = function(parser) {
  return this.wrap(parser, parser);
};

_.wrap = function(leftParser, rightParser) {
  return seqMap(leftParser, this, rightParser, function(left, middle) {
    return middle;
  });
};

_.thru = function(wrapper) {
  return wrapper(this);
};

_.then = function(next) {
  assertParser(next);
  return seq(this, next).map(function(results) {
    return results[1];
  });
};

_.many = function() {
  var self = this;

  return Parsimmon(function(input, i) {
    var accum = [];
    var result = undefined;

    for (;;) {
      result = mergeReplies(self._(input, i), result);
      if (result.status) {
        if (i === result.index) {
          throw new Error(
            "infinite loop detected in .many() parser --- calling .many() on " +
              "a parser which can accept zero characters is usually the cause"
          );
        }
        i = result.index;
        accum.push(result.value);
      } else {
        return mergeReplies(makeSuccess(i, accum), result);
      }
    }
  });
};

_.tieWith = function(separator) {
  assertString(separator);
  return this.map(function(args) {
    assertArray(args);
    if (args.length) {
      assertString(args[0]);
      var s = args[0];
      for (var i = 1; i < args.length; i++) {
        assertString(args[i]);
        s += separator + args[i];
      }
      return s;
    } else {
      return "";
    }
  });
};

_.tie = function() {
  return this.tieWith("");
};

_.times = function(min, max) {
  var self = this;
  if (arguments.length < 2) {
    max = min;
  }
  assertNumber(min);
  assertNumber(max);
  return Parsimmon(function(input, i) {
    var accum = [];
    var result = undefined;
    var prevResult = undefined;
    for (var times = 0; times < min; times += 1) {
      result = self._(input, i);
      prevResult = mergeReplies(result, prevResult);
      if (result.status) {
        i = result.index;
        accum.push(result.value);
      } else {
        return prevResult;
      }
    }
    for (; times < max; times += 1) {
      result = self._(input, i);
      prevResult = mergeReplies(result, prevResult);
      if (result.status) {
        i = result.index;
        accum.push(result.value);
      } else {
        break;
      }
    }
    return mergeReplies(makeSuccess(i, accum), prevResult);
  });
};

_.result = function(res) {
  return this.map(function() {
    return res;
  });
};

_.atMost = function(n) {
  return this.times(0, n);
};

_.atLeast = function(n) {
  return seqMap(this.times(n), this.many(), function(init, rest) {
    return init.concat(rest);
  });
};

_.map = function(fn) {
  assertFunction(fn);
  var self = this;
  return Parsimmon(function(input, i) {
    var result = self._(input, i);
    if (!result.status) {
      return result;
    }
    return mergeReplies(makeSuccess(result.index, fn(result.value)), result);
  });
};

_.contramap = function(fn) {
  assertFunction(fn);
  var self = this;
  return Parsimmon(function(input, i) {
    var result = self.parse(fn(input.slice(i)));
    if (!result.status) {
      return result;
    }
    return makeSuccess(i + input.length, result.value);
  });
};

_.promap = function(f, g) {
  assertFunction(f);
  assertFunction(g);
  return this.contramap(f).map(g);
};

_.skip = function(next) {
  return seq(this, next).map(function(results) {
    return results[0];
  });
};

_.mark = function() {
  return seqMap(index, this, index, function(start, value, end) {
    return {
      start: start,
      value: value,
      end: end
    };
  });
};

_.node = function(name) {
  return seqMap(index, this, index, function(start, value, end) {
    return {
      name: name,
      value: value,
      start: start,
      end: end
    };
  });
};

_.sepBy = function(separator) {
  return sepBy(this, separator);
};

_.sepBy1 = function(separator) {
  return sepBy1(this, separator);
};

_.lookahead = function(x) {
  return this.skip(lookahead(x));
};

_.notFollowedBy = function(x) {
  return this.skip(notFollowedBy(x));
};

_.desc = function(expected) {
  if (!isArray(expected)) {
    expected = [expected];
  }
  var self = this;
  return Parsimmon(function(input, i) {
    var reply = self._(input, i);
    if (!reply.status) {
      reply.expected = expected;
    }
    return reply;
  });
};

_.fallback = function(result) {
  return this.or(succeed(result));
};

_.ap = function(other) {
  return seqMap(other, this, function(f, x) {
    return f(x);
  });
};

_.chain = function(f) {
  var self = this;
  return Parsimmon(function(input, i) {
    var result = self._(input, i);
    if (!result.status) {
      return result;
    }
    var nextParser = f(result.value);
    return mergeReplies(nextParser._(input, result.index), result);
  });
};

// -*- Constructors -*-

function string(str) {
  assertString(str);
  var expected = "'" + str + "'";
  return Parsimmon(function(input, i) {
    var j = i + str.length;
    var head = input.slice(i, j);
    if (head === str) {
      return makeSuccess(j, head);
    } else {
      return makeFailure(i, expected);
    }
  });
}

function byte(b) {
  ensureBuffer();
  assertNumber(b);
  if (b > 0xff) {
    throw new Error(
      "Value specified to byte constructor (" +
        b +
        "=0x" +
        b.toString(16) +
        ") is larger in value than a single byte."
    );
  }
  var expected = (b > 0xf ? "0x" : "0x0") + b.toString(16);
  return Parsimmon(function(input, i) {
    var head = get(input, i);
    if (head === b) {
      return makeSuccess(i + 1, head);
    } else {
      return makeFailure(i, expected);
    }
  });
}

function regexp(re, group) {
  assertRegexp(re);
  if (arguments.length >= 2) {
    assertNumber(group);
  } else {
    group = 0;
  }
  var anchored = anchoredRegexp(re);
  var expected = "" + re;
  return Parsimmon(function(input, i) {
    var match = anchored.exec(input.slice(i));
    if (match) {
      if (0 <= group && group <= match.length) {
        var fullMatch = match[0];
        var groupMatch = match[group];
        return makeSuccess(i + fullMatch.length, groupMatch);
      }
      var message =
        "valid match group (0 to " + match.length + ") in " + expected;
      return makeFailure(i, message);
    }
    return makeFailure(i, expected);
  });
}

function succeed(value) {
  return Parsimmon(function(input, i) {
    return makeSuccess(i, value);
  });
}

function fail(expected) {
  return Parsimmon(function(input, i) {
    return makeFailure(i, expected);
  });
}

function lookahead(x) {
  if (isParser(x)) {
    return Parsimmon(function(input, i) {
      var result = x._(input, i);
      result.index = i;
      result.value = "";
      return result;
    });
  } else if (typeof x === "string") {
    return lookahead(string(x));
  } else if (x instanceof RegExp) {
    return lookahead(regexp(x));
  }
  throw new Error("not a string, regexp, or parser: " + x);
}

function notFollowedBy(parser) {
  assertParser(parser);
  return Parsimmon(function(input, i) {
    var result = parser._(input, i);
    var text = input.slice(i, result.index);
    return result.status
      ? makeFailure(i, 'not "' + text + '"')
      : makeSuccess(i, null);
  });
}

function test(predicate) {
  assertFunction(predicate);
  return Parsimmon(function(input, i) {
    var char = get(input, i);
    if (i < input.length && predicate(char)) {
      return makeSuccess(i + 1, char);
    } else {
      return makeFailure(i, "a character/byte matching " + predicate);
    }
  });
}

function oneOf(str) {
  var expected = str.split("");
  for (var idx = 0; idx < expected.length; idx++) {
    expected[idx] = "'" + expected[idx] + "'";
  }
  return test(function(ch) {
    return str.indexOf(ch) >= 0;
  }).desc(expected);
}

function noneOf(str) {
  return test(function(ch) {
    return str.indexOf(ch) < 0;
  }).desc("none of '" + str + "'");
}

function custom(parsingFunction) {
  return Parsimmon(parsingFunction(makeSuccess, makeFailure));
}

// TODO[ES5]: Improve error message using JSON.stringify eventually.
function range(begin, end) {
  return test(function(ch) {
    return begin <= ch && ch <= end;
  }).desc(begin + "-" + end);
}

function takeWhile(predicate) {
  assertFunction(predicate);

  return Parsimmon(function(input, i) {
    var j = i;
    while (j < input.length && predicate(get(input, j))) {
      j++;
    }
    return makeSuccess(j, input.slice(i, j));
  });
}

function lazy(desc, f) {
  if (arguments.length < 2) {
    f = desc;
    desc = undefined;
  }

  var parser = Parsimmon(function(input, i) {
    parser._ = f()._;
    return parser._(input, i);
  });

  if (desc) {
    return parser.desc(desc);
  } else {
    return parser;
  }
}

// -*- Fantasy Land Extras -*-

function empty() {
  return fail("fantasy-land/empty");
}

_.concat = _.or;
_.empty = empty;
_.of = succeed;
_["fantasy-land/ap"] = _.ap;
_["fantasy-land/chain"] = _.chain;
_["fantasy-land/concat"] = _.concat;
_["fantasy-land/empty"] = _.empty;
_["fantasy-land/of"] = _.of;
_["fantasy-land/map"] = _.map;

// -*- Base Parsers -*-

var index = Parsimmon(function(input, i) {
  return makeSuccess(i, makeLineColumnIndex(input, i));
});

var any = Parsimmon(function(input, i) {
  if (i >= input.length) {
    return makeFailure(i, "any character/byte");
  }
  return makeSuccess(i + 1, get(input, i));
});

var all = Parsimmon(function(input, i) {
  return makeSuccess(input.length, input.slice(i));
});

var eof = Parsimmon(function(input, i) {
  if (i < input.length) {
    return makeFailure(i, "EOF");
  }
  return makeSuccess(i, null);
});

var digit = regexp(/[0-9]/).desc("a digit");
var digits = regexp(/[0-9]*/).desc("optional digits");
var letter = regexp(/[a-z]/i).desc("a letter");
var letters = regexp(/[a-z]*/i).desc("optional letters");
var optWhitespace = regexp(/\s*/).desc("optional whitespace");
var whitespace = regexp(/\s+/).desc("whitespace");
var cr = string("\r");
var lf = string("\n");
var crlf = string("\r\n");
var newline = alt(crlf, lf, cr).desc("newline");
var end = alt(newline, eof);

Parsimmon.all = all;
Parsimmon.alt = alt;
Parsimmon.any = any;
Parsimmon.cr = cr;
Parsimmon.createLanguage = createLanguage;
Parsimmon.crlf = crlf;
Parsimmon.custom = custom;
Parsimmon.digit = digit;
Parsimmon.digits = digits;
Parsimmon.empty = empty;
Parsimmon.end = end;
Parsimmon.eof = eof;
Parsimmon.fail = fail;
Parsimmon.formatError = formatError;
Parsimmon.index = index;
Parsimmon.isParser = isParser;
Parsimmon.lazy = lazy;
Parsimmon.letter = letter;
Parsimmon.letters = letters;
Parsimmon.lf = lf;
Parsimmon.lookahead = lookahead;
Parsimmon.makeFailure = makeFailure;
Parsimmon.makeSuccess = makeSuccess;
Parsimmon.newline = newline;
Parsimmon.noneOf = noneOf;
Parsimmon.notFollowedBy = notFollowedBy;
Parsimmon.of = succeed;
Parsimmon.oneOf = oneOf;
Parsimmon.optWhitespace = optWhitespace;
Parsimmon.Parser = Parsimmon;
Parsimmon.range = range;
Parsimmon.regex = regexp;
Parsimmon.regexp = regexp;
Parsimmon.sepBy = sepBy;
Parsimmon.sepBy1 = sepBy1;
Parsimmon.seq = seq;
Parsimmon.seqMap = seqMap;
Parsimmon.seqObj = seqObj;
Parsimmon.string = string;
Parsimmon.succeed = succeed;
Parsimmon.takeWhile = takeWhile;
Parsimmon.test = test;
Parsimmon.whitespace = whitespace;
Parsimmon["fantasy-land/empty"] = empty;
Parsimmon["fantasy-land/of"] = succeed;

Parsimmon.Binary = {
  bitSeq: bitSeq,
  bitSeqObj: bitSeqObj,
  byte: byte,
  buffer: parseBuffer,
  encodedString: encodedString,
  uintBE: uintBE,
  uint8BE: uintBE(1),
  uint16BE: uintBE(2),
  uint32BE: uintBE(4),
  uintLE: uintLE,
  uint8LE: uintLE(1),
  uint16LE: uintLE(2),
  uint32LE: uintLE(4),
  intBE: intBE,
  int8BE: intBE(1),
  int16BE: intBE(2),
  int32BE: intBE(4),
  intLE: intLE,
  int8LE: intLE(1),
  int16LE: intLE(2),
  int32LE: intLE(4),
  floatBE: floatBE(),
  floatLE: floatLE(),
  doubleBE: doubleBE(),
  doubleLE: doubleLE()
};

module.exports = Parsimmon;
