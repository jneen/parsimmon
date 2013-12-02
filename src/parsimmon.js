var Parsimmon = {};

Parsimmon.Parser = P(function(_, _super, Parser) {
  "use strict";
  // The Parser object is a wrapper for a parser function.
  // Externally, you use one to parse a string by calling
  //   var result = SomeParser.parse('Me Me Me! Parse Me!');
  // You should never call the constructor, rather you should
  // construct your Parser from the base parsers and the
  // parser combinator methods.

  function parseError(stream, result) {
    var expected = result.value;
    var i = result.index;

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

  function furthestFailure(onFailure, myI, myExpected) {
    return function(stream, yourI, yourExpected) {
      if (myI > yourI) return onFailure(stream, myI, myExpected);
      else return onFailure.apply(this, arguments);
    };
  }

  function furthestFailureSuccess(onSuccess, myFurthestFailureI, myFurthestExpected) {
    return function(stream, i, result, yourFurthestFailureI, yourFurthestExpected) {
      if (myFurthestFailureI > yourFurthestFailureI) {
        return onSuccess(stream, i, result, myFurthestFailureI, myFurthestExpected);
      }
      else return onSuccess.apply(this, arguments);
    };
  }

  // -*- primitive combinators -*- //
  _.or = function(alternative) {
    var self = this;

    return Parser(function(stream, i) {
      var result = self._(stream, i);

      return result.status ? result : alternative._(stream, i);
    });
  };

  _.then = function(next) {
    var self = this;

    return Parser(function(stream, i) {
      var result = self._(stream, i);

      if (result.status) {
        var nextParser = (next instanceof Parser ? next : next(result.value));
        return nextParser._(stream, result.index);
      }
      else {
        return result;
      }
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

      for (;;) {
        result = self._(stream, i);
        if (result.status) {
          i = result.index;
          accum.push(result.value);
        }
        else {
          return { status: true, index: i, value: accum };
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

      for (var times = 0; times < min; times += 1) {
        result = self._(stream, i);
        if (result.status) {
          i = result.index;
          accum.push(result.value);
        }
        else {
          return { status: false, index: start, value: result.value };
        }
      }

      for (; times < max && result; times += 1) {
        result = self._(stream, i);
        if (result.status) {
          i = result.index;
          accum.push(result.value);
        }
        else {
          break;
        }
      }

      return { status: true, index: i, value: accum }
    });
  };

  // -*- higher-level combinators -*- //
  _.result = function(res) { return this.then(succeed(res)); };
  _.atMost = function(n) { return this.times(0, n); };
  _.atLeast = function(n) {
    var self = this;
    return self.times(n).then(function(start) {
      return self.many().map(function(end) {
        return start.concat(end);
      });
    });
  };

  _.map = function(fn) {
    return this.then(function(result) { return succeed(fn(result)); });
  };

  _.skip = function(two) {
    return this.then(function(result) { return two.result(result); });
  };

  // -*- primitive parsers -*- //
  var string = Parsimmon.string = function(str) {
    var len = str.length;
    var expected = "'"+str+"'";

    return Parser(function(stream, i) {
      var head = stream.slice(i, i+len);

      if (head === str) {
        return { status: true, index: i+len, value: head };
      }
      else {
        return { status: false, index: i, value: expected };
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
        return { status: true, index: i+result.length, value: result };
      }
      else {
        return { status: false, index: i, value: re };
      }
    });
  };

  var succeed = Parsimmon.succeed = function(value) {
    return Parser(function(stream, i) {
      return { status: true, index: i, value: value };
    });
  };

  var fail = Parsimmon.fail = function(expected) {
    return Parser(function(stream, i) {
      return { status: false, index: i, value: expected };
    });
  };

  var letter = Parsimmon.letter = regex(/^[a-z]/i);
  var letters = Parsimmon.letters = regex(/^[a-z]*/i);
  var digit = Parsimmon.digit = regex(/^[0-9]/);
  var digits = Parsimmon.digits = regex(/^[0-9]*/);
  var whitespace = Parsimmon.whitespace = regex(/^\s+/);
  var optWhitespace = Parsimmon.optWhitespace = regex(/^\s*/);

  var any = Parsimmon.any = Parser(function(stream, i) {
    if (i >= stream.length) return { status: false, index: i, value: 'any character' };

    return { status: true, index: i+1, value: stream.charAt(i) };
  });

  var all = Parsimmon.all = Parser(function(stream, i) {
    return { status: true, index: stream.length, value: stream.slice(i) };
  });

  var eof = Parsimmon.eof = Parser(function(stream, i) {
    if (i < stream.length) return { status: false, index: i, value: 'EOF' };

    return { status: true, index: i, value: null };
  });
});
