/* global module, define */

// This unsightly UMD-module header is here to make this code work without
// modification with CommonJS, AMD, and browser globals.

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window).
    root.Parsimmon = factory();
  }
}(this, function() {
  'use strict';

  // The Parser object is a wrapper for a parser function.
  // Externally, you use one to parse a string by calling
  //   var result = SomeParser.parse('Me Me Me! Parse Me!');
  // You should never call the constructor, rather you should
  // construct your Parser from the base parsers and the
  // parser combinator methods.
  function Parsimmon(action) {
    if (!(this instanceof Parsimmon)) {
      return new Parsimmon(action);
    }
    this._ = action;
  }

  function isParser(obj) {
    return obj instanceof Parsimmon;
  }

  var _ = Parsimmon.prototype;

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
    return {
      status: false,
      index: -1,
      value: null,
      furthest: index,
      expected: [expected]
    };
  }

  function mergeReplies(result, last) {
    if (!last) {
      return result;
    }
    if (result.furthest > last.furthest) {
      return result;
    }
    var expected = (result.furthest === last.furthest)
      ? unsafeUnion(result.expected, last.expected)
      : last.expected;
    return {
      status: result.status,
      index: result.index,
      value: result.value,
      furthest: last.furthest,
      expected: expected
    };
  }

  // Returns the sorted set union of two arrays of strings. Note that if both
  // arrays are empty, it simply returns the first array, and if exactly one
  // array is empty, it returns the other one unsorted. This is safe because
  // expectation arrays always start as [] or [x], so as long as we merge with
  // this function, we know they stay in sorted order.
  function unsafeUnion(xs, ys) {
    // Exit early if either array is empty (common case)
    var xn = xs.length;
    var yn = ys.length;
    if (xn === 0) {
      return ys;
    } else if (yn === 0) {
      return xs;
    }
    // Two non-empty arrays: do the full algorithm
    var obj = {};
    for (var i = 0; i < xn; i++) {
      obj[xs[i]] = true;
    }
    for (var j = 0; j < yn; j++) {
      obj[ys[j]] = true;
    }
    var keys = [];
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        keys.push(k);
      }
    }
    keys.sort();
    return keys;
  }

  // For ensuring we have the right argument types
  function assertParser(p) {
    if (!isParser(p)) {
      throw new Error('not a parser: ' + p);
    }
  }

  function assertNumber(x) {
    if (typeof x !== 'number') {
      throw new Error('not a number: ' + x);
    }
  }

  function assertRegexp(x) {
    if (!(x instanceof RegExp)) {
      throw new Error('not a regexp: '+x);
    }
    var f = flags(x);
    for (var i = 0; i < f.length; i++) {
      var c = f.charAt(i);
      // Only allow regexp flags [imu] for now, since [g] and [y] specifically
      // mess up Parsimmon. If more non-stateful regexp flags are added in the
      // future, this will need to be revisited.
      if (c != 'i' && c != 'm' && c != 'u') {
        throw new Error('unsupported regexp flag "' + c + '": ' + x);
      }
    }
  }

  function assertFunction(x) {
    if (typeof x !== 'function') {
      throw new Error('not a function: ' + x);
    }
  }

  function assertString(x) {
    if (typeof x !== 'string') {
      throw new Error('not a string: ' + x);
    }
  }

  function formatExpected(expected) {
    if (expected.length === 1) {
      return expected[0];
    }
    return 'one of ' + expected.join(', ');
  }

  function formatGot(input, error) {
    var index = error.index;
    var i = index.offset;
    if (i === input.length) {
      return ', got the end of the input';
    }
    var prefix = (i > 0 ? '\'...' : '\'');
    var suffix = (input.length - i > 12 ? '...\'' : '\'');
    return ' at line ' + index.line + ' column ' + index.column
      +  ', got ' + prefix + input.slice(i, i + 12) + suffix;
  }

  function formatError(input, error) {
    return 'expected ' +
      formatExpected(error.expected) +
      formatGot(input, error);
  }

  _.parse = function(input) {
    if (typeof input !== 'string') {
      throw new Error('.parse must be called with a string as its argument');
    }
    var result = this.skip(eof)._(input, 0);

    return result.status ? {
      status: true,
      value: result.value
    } : {
      status: false,
      index: makeLineColumnIndex(input, result.furthest),
      expected: result.expected
    };
  };

  _.tryParse = function(str) {
    var result = this.parse(str);
    if (result.status) {
      return result.value;
    } else {
      var msg = formatError(str, result);
      var err = new Error(msg);
      err.type = 'ParsimmonError';
      err.result = result;
      throw err;
    }
  };

  // [Parsimmon a] -> Parsimmon [a]
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

  function seqMap() {
    var args = [].slice.call(arguments);
    if (args.length === 0) {
      throw new Error('seqMap needs at least one argument');
    }
    var mapper = args.pop();
    assertFunction(mapper);
    return seq.apply(null, args).map(function(results) {
      return mapper.apply(null, results);
    });
  }

  /**
   * Allows to add custom primitive parsers
   */
  function custom(parsingFunction) {
    return Parsimmon(parsingFunction(makeSuccess, makeFailure));
  }

  function alt() {
    var parsers = [].slice.call(arguments);
    var numParsers = parsers.length;
    if (numParsers === 0) {
      return fail('zero alternates');
    }
    for (var j = 0; j < numParsers; j += 1) {
      assertParser(parsers[j]);
    }
    return Parsimmon(function(input, i) {
      var result;
      for (var j = 0; j < parsers.length; j += 1) {
        result = mergeReplies(parsers[j]._(input, i), result);
        if (result.status) return result;
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
    return parser.chain(function(r) {
      return pairs.map(function(rs) {
        return [r].concat(rs);
      });
    });
  }

  // -*- primitive combinators -*- //
  _.or = function(alternative) {
    return alt(this, alternative);
  };

  _.then = function(next) {
    if (typeof next === 'function') {
      throw new Error('chaining features of .then are no longer supported, use .chain instead');
    }
    assertParser(next);
    return seq(this, next).map(function(results) { return results[1]; });
  };

  // -*- optimized iterative combinators -*- //
  // equivalent to:
  // _.many = function() {
  //   return this.times(0, Infinity);
  // };
  // or, more explicitly:
  // _.many = function() {
  //   var self = this;
  //   return self.then(function(x) {
  //     return self.many().then(function(xs) {
  //       return [x].concat(xs);
  //     });
  //   }).or(succeed([]));
  // };
  _.many = function() {
    var self = this;

    return Parsimmon(function(input, i) {
      var accum = [];
      var result = undefined;

      for (;;) {
        result = mergeReplies(self._(input, i), result);
        if (result.status) {
          i = result.index;
          accum.push(result.value);
        } else {
          return mergeReplies(makeSuccess(i, accum), result);
        }
      }
    });
  };

  // equivalent to:
  // _.times = function(min, max) {
  //   if (arguments.length < 2) max = min;
  //   var self = this;
  //   if (min > 0) {
  //     return self.then(function(x) {
  //       return self.times(min - 1, max - 1).then(function(xs) {
  //         return [x].concat(xs);
  //       });
  //     });
  //   }
  //   else if (max > 0) {
  //     return self.then(function(x) {
  //       return self.times(0, max - 1).then(function(xs) {
  //         return [x].concat(xs);
  //       });
  //     }).or(succeed([]));
  //   }
  //   else return succeed([]);
  // };
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

  // -*- higher-level combinators -*- //
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
  _['fantasy-land/map'] = _.map;

  _.skip = function(next) {
    return seq(this, next).map(function(results) { return results[0]; });
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

  _.desc = function(expected) {
    var self = this;
    return Parsimmon(function(input, i) {
      var reply = self._(input, i);
      if (!reply.status) {
        reply.expected = [expected];
      }
      return reply;
    });
  };

  _.fallback = function(result) {
    return this.or(succeed(result));
  };

  // -*- primitive parsers -*- //
  function string(str) {
    assertString(str);
    var expected = '\'' + str + '\'';
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

  function flags(re) {
    var s = '' + re;
    return s.slice(s.lastIndexOf('/') + 1);
  }

  function regexp(re, group) {
    assertRegexp(re);
    if (arguments.length >= 2) {
      assertNumber(group);
    } else {
      group = 0;
    }
    var anchored = RegExp('^(?:' + re.source + ')', flags(re));
    var expected = '' + re;
    return Parsimmon(function(input, i) {
      var match = anchored.exec(input.slice(i));
      if (match) {
        var fullMatch = match[0];
        var groupMatch = match[group];
        if (groupMatch != null) {
          return makeSuccess(i + fullMatch.length, groupMatch);
        }
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

  var any = Parsimmon(function(input, i) {
    if (i >= input.length) {
      return makeFailure(i, 'any character');
    }
    return makeSuccess(i+1, input.charAt(i));
  });

  var all = Parsimmon(function(input, i) {
    return makeSuccess(input.length, input.slice(i));
  });

  var eof = Parsimmon(function(input, i) {
    if (i < input.length) {
      return makeFailure(i, 'EOF');
    }
    return makeSuccess(i, null);
  });

  function test(predicate) {
    assertFunction(predicate);
    return Parsimmon(function(input, i) {
      var char = input.charAt(i);
      if (i < input.length && predicate(char)) {
        return makeSuccess(i + 1, char);
      } else {
        return makeFailure(i, 'a character matching ' + predicate);
      }
    });
  }

  function oneOf(str) {
    return test(function(ch) {
      return str.indexOf(ch) >= 0;
    });
  }

  function noneOf(str) {
    return test(function(ch) {
      return str.indexOf(ch) < 0;
    });
  }

  function takeWhile(predicate) {
    assertFunction(predicate);

    return Parsimmon(function(input, i) {
      var j = i;
      while (j < input.length && predicate(input.charAt(j))) {
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

  function makeLineColumnIndex(input, i) {
    var lines = input.slice(0, i).split('\n');
    // Note that unlike the character offset, the line and column offsets are
    // 1-based.
    var lineWeAreUpTo = lines.length;
    var columnWeAreUpTo = lines[lines.length - 1].length + 1;
    return {
      offset: i,
      line: lineWeAreUpTo,
      column: columnWeAreUpTo
    };
  }

  var index = Parsimmon(function(input, i) {
    return makeSuccess(i, makeLineColumnIndex(input, i));
  });

  function empty() {
    return fail('fantasy-land/empty');
  }

  // Fantasy Land Semigroup support
  _.concat = _.or;
  _['fantasy-land/concat'] = _.concat;

  // Fantasy Land Semigroup and Monoid support
  _.empty = empty;
  _['fantasy-land/empty'] = _.empty;

  // Fantasy Land Applicative support
  _.of = succeed;
  _['fantasy-land/of'] = _.of;

  // Fantasy Land Applicative support
  _.ap = function(other) {
    return seqMap(other, this, function(f, x) {
      return f(x);
    });
  };
  _['fantasy-land/ap'] = _.ap;

  // Fantasy Land Monad support
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
  _['fantasy-land/chain'] = _.chain;

  var digit = regexp(/[0-9]/).desc('a digit');
  var digits = regexp(/[0-9]*/).desc('optional digits');
  var letter = regexp(/[a-z]/i).desc('a letter');
  var letters = regexp(/[a-z]*/i).desc('optional letters');
  var optWhitespace = regexp(/\s*/).desc('optional whitespace');
  var whitespace = regexp(/\s+/).desc('whitespace');

  Parsimmon.all = all;
  Parsimmon.alt = alt;
  Parsimmon.any = any;
  Parsimmon.custom = custom;
  Parsimmon.digit = digit;
  Parsimmon.digits = digits;
  Parsimmon.eof = eof;
  Parsimmon.fail = fail;
  Parsimmon.formatError = formatError;
  Parsimmon.index = index;
  Parsimmon.isParser = isParser;
  Parsimmon.lazy = lazy;
  Parsimmon.letter = letter;
  Parsimmon.letters = letters;
  Parsimmon.makeFailure = makeFailure;
  Parsimmon.makeSuccess = makeSuccess;
  Parsimmon.noneOf = noneOf;
  Parsimmon.oneOf = oneOf;
  Parsimmon.optWhitespace = optWhitespace;
  Parsimmon.Parser = Parsimmon;
  Parsimmon.regex = regexp;
  Parsimmon.regexp = regexp;
  Parsimmon.sepBy = sepBy;
  Parsimmon.sepBy1 = sepBy1;
  Parsimmon.seq = seq;
  Parsimmon.seqMap = seqMap;
  Parsimmon.string = string;
  Parsimmon.succeed = succeed;
  Parsimmon.takeWhile = takeWhile;
  Parsimmon.test = test;
  Parsimmon.whitespace = whitespace;

  // Fantasy Land Semigroup support
  Parsimmon.empty = empty;
  Parsimmon['fantasy-land/empty'] = empty;

  // Fantasy Land Applicative support
  Parsimmon.of = succeed;
  Parsimmon['fantasy-land/of'] = succeed;

  return Parsimmon;
}));
