var Parsimmon = {};

Parsimmon.Parser = P(function(_, _super, Parser) {
  "use strict";
  // The Parser object is a wrapper for a parser function.
  // Externally, you use one to parse a string by calling
  //   var result = SomeParser.parse('Me Me Me! Parse Me!');
  // You should never call the constructor, rather you should
  // construct your Parser from the base parsers and the
  // parser combinator methods.

  function makeSuccess(index, value) {
    return {
      status: true,
      index: index,
      value: value,
      furthest: -1,
      expected: ''
    };
  }

  function makeFailure(index, expected) {
    return {
      status: false,
      index: -1,
      value: null,
      furthest: index,
      expected: expected
    };
  }

  function furthestBacktrackFor(result, last) {
    if (!last) return result;
    if (result.furthest >= last.furthest) return result;

    return {
      status: result.status,
      index: result.index,
      value: result.value,
      furthest: last.furthest,
      expected: last.expected
    }
  }

  function parseError(stream, result) {
    var expected = result.expected;
    var i = result.furthest;

    if (i === stream.length) {
      var message = 'expected ' + expected + ', got the end of the string';
    }
    else {
      var prefix = (i > 0 ? "'..." : "'");
      var suffix = (stream.length - i > 12 ? "...'" : "'");
      var message = 'expected ' + expected + ' at character ' + i + ', got '
        + prefix + stream.slice(i, i+12) + suffix;
    }
    throw 'Parse Error: ' + message + "\n    parsing: '" + stream + "'";
  }

  _.init = function(body) { this._ = body; };

  _.parse = function(stream) {
    var result = this.skip(eof)._(stream, 0);

    return result.status ? result.value : parseError(stream, result);
  };

  // -*- primitive combinators -*- //
  _.or = function(alternative) {
    var self = this;

    return Parser(function(stream, i) {
      var result = self._(stream, i);

      return result.status ? result : furthestBacktrackFor(alternative._(stream, i), result);
    });
  };

  _.then = function(next) {
    var self = this;

    return Parser(function(stream, i) {
      var result = self._(stream, i);

      if (!result.status) return result;

      var nextParser = (next instanceof Parser ? next : next(result.value));
      return furthestBacktrackFor(nextParser._(stream, result.index), result);
    });
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

    return Parser(function(stream, i) {
      var accum = [];
      var result;
      var prevResult;

      for (;;) {
        result = self._(stream, i);
        prevResult = furthestBacktrackFor(result, prevResult);

        if (result.status) {
          i = result.index;
          accum.push(result.value);
        }
        else {
          return furthestBacktrackFor(makeSuccess(i, accum), prevResult);
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
    if (arguments.length < 2) max = min;
    var self = this;

    return Parser(function(stream, i) {
      var accum = [];
      var start = i;
      var result;
      var prevResult;

      for (var times = 0; times < min; times += 1) {
        result = self._(stream, i);
        prevResult = furthestBacktrackFor(result, prevResult);
        if (result.status) {
          i = result.index;
          accum.push(result.value);
        }
        else {
          return prevResult;
        }
      }

      for (; times < max && result; times += 1) {
        result = self._(stream, i);
        prevResult = furthestBacktrackFor(result, prevResult);
        if (result.status) {
          i = result.index;
          accum.push(result.value);
        }
        else {
          break;
        }
      }

      return furthestBacktrackFor(makeSuccess(i, accum), prevResult);
    });
  };

  // -*- higher-level combinators -*- //
  _.result = function(res) { return this.then(succeed(res)); };
  _.atMost = function(n) { return this.times(0, n); };
  _.atLeast = function(n) {
    var self = this;
    return seq([this.times(n), this.many()]).map(function(results) {
      return results[0].concat(results[1]);
    });
  };

  _.map = function(fn) {
    var self = this;
    return Parser(function(stream, i) {
      var result = self._(stream, i);
      if (!result.status) return result;
      return furthestBacktrackFor(makeSuccess(result.index, fn(result.value)), result);
    });
  };

  _.skip = function(next) {
    return seq([this, next]).map(function(results) { return results[0]; });
  };

  _.mark = function() {
    return seq([index, this, index]).map(function(results) {
      return { start: results[0], value: results[1], end: results[2] };
    });
  };

  // -*- primitive parsers -*- //
  var string = Parsimmon.string = function(str) {
    var len = str.length;
    var expected = "'"+str+"'";

    return Parser(function(stream, i) {
      var head = stream.slice(i, i+len);

      if (head === str) {
        return makeSuccess(i+len, head);
      }
      else {
        return makeFailure(i, expected);
      }
    });
  };

  var regex = Parsimmon.regex = function(re) {
    if (re.source[0] !== '^') throw 'regex '+re+' must be anchored';

    var expected = ''+re;

    return Parser(function(stream, i) {
      var match = re.exec(stream.slice(i));

      if (match) {
        var result = match[0];
        return makeSuccess(i+result.length, result);
      }
      else {
        return makeFailure(i, re);
      }
    });
  };

  var succeed = Parsimmon.succeed = function(value) {
    return Parser(function(stream, i) {
      return makeSuccess(i, value);
    });
  };

  var fail = Parsimmon.fail = function(expected) {
    return Parser(function(stream, i) { return makeFailure(i, expected); });
  };

  var letter = Parsimmon.letter = regex(/^[a-z]/i);
  var letters = Parsimmon.letters = regex(/^[a-z]*/i);
  var digit = Parsimmon.digit = regex(/^[0-9]/);
  var digits = Parsimmon.digits = regex(/^[0-9]*/);
  var whitespace = Parsimmon.whitespace = regex(/^\s+/);
  var optWhitespace = Parsimmon.optWhitespace = regex(/^\s*/);

  var any = Parsimmon.any = Parser(function(stream, i) {
    if (i >= stream.length) return makeFailure(i, 'any character');

    return makeSuccess(i+1, stream.charAt(i));
  });

  var all = Parsimmon.all = Parser(function(stream, i) {
    return makeSuccess(stream.length, stream.slice(i));
  });

  var eof = Parsimmon.eof = Parser(function(stream, i) {
    if (i < stream.length) return makeFailure(i, 'EOF');

    return makeSuccess(i, null);
  });

  var lazy = Parsimmon.lazy = function(f) {
    var parser = Parser(function(stream, i) {
      parser._ = f()._;
      return parser._(stream, i);
    });

    return parser;
  };

  // [Parser a] -> Parser [a]
  var seq = Parsimmon.seq = function(parsers) {
    return Parser(function(stream, i) {
      var result;
      var accum = new Array(parsers.length);

      for (var j = 0; j < parsers.length; j += 1) {
        result = furthestBacktrackFor(parsers[j]._(stream, i), result);
        if (!result.status) return result;
        accum[j] = result.value
        i = result.index;
      }

      return furthestBacktrackFor(makeSuccess(i, accum), result);
    });
  }

  var index = Parsimmon.index = Parser(function(stream, i) {
    return makeSuccess(i, i);
  });

  //- fantasyland compat

  //- Semigroup
  _.concat = _.then;

  //- Applicative
  _.of = Parser.of = Parsimmon.of = succeed

  _.ap = function(other) {
    return seq([this, other]).map(function(results) {
      return results[0](results[1]);
    });
  };

  //- Monad
  _.chain = _.then;
});
