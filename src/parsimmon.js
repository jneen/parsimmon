var Parsimmon = {};

Parsimmon.Parser = P(function(_, _super, Parser) {
  // The Parser object is a wrapper for a parser function.
  // Externally, you use one to parse a string by calling
  //   var result = SomeParser.parse('Me Me Me! Parse Me!');
  // You should never call the constructor, rather you should
  // construct your Parser from the base parsers and the
  // parser combinator methods.

  function parseError(stream, i, message) {
    if (i < stream.length) {
      stream = "'"+stream.slice(i)+"'";
    }
    else {
      stream = 'EOF';
    }

    throw 'Parse Error: '+message+' at '+stream;
  }

  _.init = function(body) { this._ = body; };

  _.parse = function(stream) {
    return this.skip(eof)._(stream, 0, success, parseError);

    function success(stream, i, result) { return result; }
  };

  // -*- primitive combinators -*- //
  _.or = function(alternative) {
    var self = this;

    return Parser(function(stream, i, onSuccess, onFailure) {
      return self._(stream, i, onSuccess, failure);

      function failure(stream, newI) {
        return alternative._(stream, i, onSuccess, onFailure);
      }
    });
  };

  _.then = function(next) {
    var self = this;

    return Parser(function(stream, i, onSuccess, onFailure) {
      return self._(stream, i, success, onFailure);

      function success(stream, newI, result) {
        var nextParser = (next instanceof Parser ? next : next(result));
        return nextParser._(stream, newI, onSuccess, onFailure);
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

    return Parser(function(stream, i, onSuccess, onFailure) {
      var xs = [];
      while (self._(stream, i, success, failure));
      return onSuccess(stream, i, xs);

      function success(stream, newI, x) {
        i = newI;
        xs.push(x);
        return true;
      }

      function failure() {
        return false;
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

    return Parser(function(stream, i, onSuccess, onFailure) {
      var xs = [];
      var result = true;
      var failure;

      for (var times = 0; times < min; times += 1) {
        result = self._(stream, i, success, firstFailure);
        if (!result) return onFailure(stream, i, failure);
      }

      for (; times < max && result; times += 1) {
        result = self._(stream, i, success, secondFailure);
      }

      return onSuccess(stream, i, xs);

      function success(stream, newI, x) {
        xs.push(x);
        i = newI;
        return true;
      }

      function firstFailure(stream, newI, msg) {
        failure = msg;
        i = newI;
        return false;
      }

      function secondFailure(stream, newI, msg) {
        return false;
      }
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
    var expected = "expected '"+str+"'";

    return Parser(function(stream, i, onSuccess, onFailure) {
      var head = stream.slice(i, i+len);

      if (head === str) {
        return onSuccess(stream, i+len, head);
      }
      else {
        return onFailure(stream, i, expected);
      }
    });
  };

  var regex = Parsimmon.regex = function(re) {
    if (re.source[0] !== '^') throw 'regex '+re+' must be anchored';

    var expected = 'expected '+re;

    return Parser(function(stream, i, onSuccess, onFailure) {
      var match = re.exec(stream.slice(i));

      if (match) {
        var result = match[0];
        return onSuccess(stream, i+result.length, result);
      }
      else {
        return onFailure(stream, i, expected);
      }
    });
  };

  var succeed = Parsimmon.succeed = function(result) {
    return Parser(function(stream, i, onSuccess) {
      return onSuccess(stream, i, result);
    });
  };

  var fail = Parsimmon.fail = function(msg) {
    return Parser(function(stream, i, _, onFailure) {
      return onFailure(stream, i, msg);
    });
  };

  var letter = Parsimmon.letter = regex(/^[a-z]/i);
  var letters = Parsimmon.letters = regex(/^[a-z]*/i);
  var digit = Parsimmon.digit = regex(/^[0-9]/);
  var digits = Parsimmon.digits = regex(/^[0-9]*/);
  var whitespace = Parsimmon.whitespace = regex(/^\s+/);
  var optWhitespace = Parsimmon.optWhitespace = regex(/^\s*/);

  var any = Parsimmon.any = Parser(function(stream, i, onSuccess, onFailure) {
    if (i >= stream.length) return onFailure(stream, i, 'expected any character');

    return onSuccess(stream, i+1, stream.charAt(i));
  });

  var all = Parsimmon.all = Parser(function(stream, i, onSuccess, onFailure) {
    return onSuccess(stream, stream.length, stream.slice(i));
  });

  var eof = Parsimmon.eof = Parser(function(stream, i, onSuccess, onFailure) {
    if (i < stream.length) return onFailure(stream, i, 'expected EOF');

    return onSuccess(stream, i, '');
  });
});
