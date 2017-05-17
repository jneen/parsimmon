/* global suite, test, assert, Parsimmon */

suite('parser', function() {
  var string = Parsimmon.string;
  var regex = Parsimmon.regex;
  var letter = Parsimmon.letter;
  var digit = Parsimmon.digit;
  var any = Parsimmon.any;
  var optWhitespace = Parsimmon.optWhitespace;
  var eof = Parsimmon.eof;
  var seq = Parsimmon.seq;
  var alt = Parsimmon.alt;
  var all = Parsimmon.all;
  var index = Parsimmon.index;
  var lazy = Parsimmon.lazy;
  var fail = Parsimmon.fail;
  var lookahead = Parsimmon.lookahead;
  var notFollowedBy = Parsimmon.notFollowedBy;

  function equivalentParsers(p1, p2, inputs) {
    for (var i = 0; i < inputs.length; i++) {
      assert.deepEqual(p1.parse(inputs[i]), p2.parse(inputs[i]));
    }
  }

  test('Parsimmon.isParser', function() {
    assert.isFalse(Parsimmon.isParser(undefined));
    assert.isFalse(Parsimmon.isParser({}));
    assert.isFalse(Parsimmon.isParser(null));
    assert.isTrue(Parsimmon.isParser(string('x')));
    assert.isTrue(Parsimmon.isParser(regex(/[0-9]/)));
  });

  test('Parsimmon.makeSuccess', function() {
    var index = 11;
    var value = 'a lucky number';
    var result = Parsimmon.makeSuccess(index, value);
    assert.deepEqual(result, {
      status: true,
      index: index,
      value: value,
      furthest: -1,
      expected: []
    });
  });

  test('Parsimmon.makeFailure', function() {
    var furthest = 4444;
    var expected = 'waiting in the clock tower';
    var result = Parsimmon.makeFailure(furthest, expected);
    assert.deepEqual(result, {
      status: false,
      index: -1,
      value: null,
      furthest: furthest,
      expected: [expected]
    });
  });

  test('Parsimmon()', function() {
    var good = 'just a Q';
    var bad = 'all I wanted was a Q';
    var justQ = Parsimmon(function(str, i) {
      if (str.charAt(i) === 'Q') {
        return Parsimmon.makeSuccess(i + 1, good);
      } else {
        return Parsimmon.makeFailure(i, bad);
      }
    });
    var result1 = justQ.parse('Q');
    var result2 = justQ.parse('x');
    assert.deepEqual(result1, {
      status: true,
      value: good,
    });
    assert.deepEqual(result2, {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: [bad]
    });
  });

  test('Parsimmon.string', function() {
    var parser = string('x');
    var res = parser.parse('x');
    assert.ok(res.status);
    assert.equal(res.value, 'x');

    res = parser.parse('y');
    assert.deepEqual(res, {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: ['\'x\'']
    });

    assert.equal(
      'expected \'x\' at line 1 column 1, got \'y\'',
      Parsimmon.formatError('y', res)
    );

    assert.throws(function() { string(34); });
  });

  test('Parsimmon.formatError', function() {
    var parser =
      Parsimmon.alt(
        Parsimmon.fail('a'),
        Parsimmon.fail('b'),
        Parsimmon.fail('c')
      );
    var expectation = 'expected one of a, b, c, got the end of the input';
    var input = '';
    var answer = Parsimmon.formatError(input, parser.parse(input));
    assert.deepEqual(answer, expectation);
  });

  suite('Parsimmon.notFollowedBy', function() {
    test('fails when its parser argument matches', function() {
      var weirdParser = string('dx');
      var parser = seq(
        string('abc'),
        notFollowedBy(weirdParser).result('NOT USED'),
        string('dx')
      );
      var answer = parser.parse('abcdx');
      assert.deepEqual(answer.expected, ['not "dx"']);
    });
    test('does not consume from its input', function() {
      var weirdParser = string('Q');
      var parser = seq(
        string('abc'),
        notFollowedBy(weirdParser),
        string('d')
      );
      var answer = parser.parse('abcd');
      assert.deepEqual(answer.value, ['abc', null, 'd']);
    });
    test('can be chained from prototype', function() {
      var parser = seq(
        string('abc').notFollowedBy(string('Q')),
        string('d')
      );
      var answer = parser.parse('abcd');
      assert.deepEqual(answer.value, ['abc', 'd']);
    });
  });

  suite('Parsimmon.lookahead', function() {
    test('should handle a string', function() {
      lookahead('');
    });
    test('should handle a regexp', function() {
      lookahead(/./);
    });
    test('should handle a parser', function() {
      lookahead(Parsimmon.digit);
    });
    test('can be chained as prototype', function() {
      var parser = seq(
        string('abc').lookahead('d'),
        string('d')
      );
      var answer = parser.parse('abcd');
      assert.deepEqual(answer.value, ['abc', 'd']);
    });
    test('does not consume from a string', function() {
      var parser = seq(
        string('abc'),
        lookahead('d'),
        string('d')
      );
      var answer = parser.parse('abcd');
      assert.deepEqual(answer.value, ['abc', '', 'd']);
    });
    test('does not consume from a regexp', function() {
      var parser = seq(
        string('abc'),
        lookahead(/d/),
        string('d')
      );
      var answer = parser.parse('abcd');
      assert.deepEqual(answer.value, ['abc', '', 'd']);
    });
    test('does not consume from a parser', function() {
      var weirdParser = Parsimmon.string('Q').or(Parsimmon.string('d'));
      var parser = seq(
        string('abc'),
        lookahead(weirdParser),
        string('d')
      );
      var answer = parser.parse('abcd');
      assert.deepEqual(answer.value, ['abc', '', 'd']);
    });
    test('raises error if argument is not a string, regexp, or parser', function() {
      assert.throws(function() { lookahead({}); });
      assert.throws(function() { lookahead([]); });
      assert.throws(function() { lookahead(true); });
      assert.throws(function() { lookahead(12); });
    });
  });

  test('Parsimmon.regex', function() {
    var parser = regex(/[0-9]/);

    assert.equal(parser.parse('1').value, '1');
    assert.equal(parser.parse('4').value, '4');
    assert.deepEqual(parser.parse('x0'), {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: ['/[0-9]/']
    });
    assert.deepEqual(parser.parse('0x'), {
      status: false,
      index: {
        offset: 1,
        line: 1,
        column: 2
      },
      expected: ['EOF']
    });
    assert.throws(function() { regex(42); });
    assert.throws(function() { regex(/a/, 'not a number'); });
  });

  test('Parsimmon.regex rejects /g flag', function() {
    assert.throws(function() {
      regex(/a/g);
    });
  });

  test('Parsimmon.regex is an alias for Parsimmon.regexp', function() {
    assert.equal(Parsimmon.regex, Parsimmon.regexp);
  });

  test('Parsimmon.regex with group', function() {
    var parser0 = regex(/(\w)(\d)/, 0);
    var parser1 = regex(/(\w)(\d)/, 1);
    var parser2 = regex(/(\w)(\d)/, 2);
    assert.equal(parser0.parse('a1').value, 'a1');
    assert.equal(parser1.parse('a1').value, 'a');
    assert.equal(parser2.parse('a1').value, '1');
  });

  test('Parsimmon.seq', function() {
    var parser =
        seq(
          string('('),
          regex(/[^)]/).many().map(function(xs) {
            return xs.join('');
          }),
          string(')')
        );

    assert.deepEqual(
        parser.parse('(string between parens)').value,
        ['(', 'string between parens', ')']
      );

    assert.deepEqual(
        parser.parse('(string'),
      {
        status: false,
        index: {
          offset: 7,
          line: 1,
          column: 8
        },
        expected: ['\')\'', '/[^)]/']
      }
      );

    assert.deepEqual(
        parser.parse('starts wrong (string between parens)'),
      {
        status: false,
        index: {
          offset: 0,
          line: 1,
          column: 1
        },
        expected: ['\'(\'']
      }
      );

    assert.throws(function() {
      seq('not a parser');
    });
  });

  suite('Parsimmon.seqMap', function() {
    test('like Parsimmon.seq and .map but spreads arguments', function() {
      var add = function(a, b) { return a + b; };
      var parser = Parsimmon.seqMap(Parsimmon.of(1), Parsimmon.of(2), add);
      assert.equal(parser.parse('').value, 3);
    });

    test('works for 1 arguments', function() {
      var parser = Parsimmon.seqMap(function() { return 10; });
      assert.equal(parser.parse('').value, 10);
    });

    test('works for 100 arguments', function() {
      var sum = function() {
        var tot = 0;
        for (var i = 0; i < arguments.length; i++) {
          tot += arguments[i];
        }
        return tot;
      };
      var args = [];
      for (var i = 1; i <= 100; i++) {
        args.push(Parsimmon.of(i));
      }
      args.push(sum);
      var parser = Parsimmon.seqMap.apply(null, args);
      assert.equal(parser.parse('').value, 5050);
    });

    test('asserts the final argument is a function', function() {
      Parsimmon.seqMap(function() {});
      assert.throws(function() {
        Parsimmon.seqMap(1);
      });
    });

    test('asserts at least 1 argument', function() {
      assert.throws(function() {
        Parsimmon.seqMap();
      });
    });
  });

  suite('Parsimmon.custom', function(){
    test('simple parser definition', function(){
      function customAny() {
        return Parsimmon.custom(function(success){
          return function(input, i) {
            return success(i+1, input.charAt(i));
          };
        });
      }

      var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
      var parser = customAny();

      for (var i = 0; i < letters.length; i++) {
        assert.deepEqual(parser.parse(letters[i]), {status: true, value: letters[i]});
      }
    });

    test('failing parser', function(){
      function failer() {
        return Parsimmon.custom(function(success, failure){
          return function(input, i) {
            return failure(i, 'nothing');
          };
        });
      }

      assert.deepEqual(failer().parse('a'), {
        status: false,
        index: {
          offset: 0,
          line: 1,
          column: 1
        },
        expected: ['nothing']
      });
    });

    test('composes with existing parsers', function(){
      function notChar(char) {
        return Parsimmon.custom(function(success, failure) {
          return function(input, i) {
            if (input.charCodeAt(i) !== char.charCodeAt(0)) {
              return success(i+1, input.charAt(i));
            }
            return failure(i, 'something different than "' + input.charAt(i)) + '"';
          };
        });
      }

      function join(array) {
        return array.join('');
      }

      var parser = seq(string('a'), notChar('b').times(5).map(join), notChar('b').or(string('b'))).map(join);

      assert.deepEqual(parser.parse('acccccb'), {status: true, value: 'acccccb'});
    });
  });

  suite('.tryParse', function() {
    test('returns just the value', function() {
      var x = 4;
      assert.equal(Parsimmon.of(x).tryParse(''), x);
    });

    test('returns throws on a bad parse', function() {
      assert.throws(function() {
        Parsimmon.digit.tryParse('a');
      });
    });

    test('thrown error message is equal to formatError', function() {
      var input = 'a';
      var parser = Parsimmon.digit;
      var result = parser.parse(input);
      var errMsg = Parsimmon.formatError(input, result);
      try {
        parser.tryParse(input);
      } catch (err) {
        assert.equal(err.message, errMsg);
      }
    });

    test('thrown error contains full result object', function() {
      var input = 'a';
      var parser = Parsimmon.digit;
      var result = parser.parse(input);
      try {
        parser.tryParse(input);
      } catch (err) {
        assert.deepEqual(err.result, result);
      }
    });

    test('thrown error message is equal to formatError', function() {
      var input = 'a';
      var parser = Parsimmon.digit;
      try {
        parser.tryParse(input);
      } catch (err) {
        assert.deepEqual(err.result, parser.parse(input));
      }
    });
  });

  test('Unique and sorted .expected array', function() {
    var parser =
      alt(
        fail('c'),
        fail('a'),
        fail('a'),
        fail('b'),
        fail('b'),
        fail('b'),
        fail('a')
      );
    var result = parser.parse('');
    assert.deepEqual(result.expected, ['a', 'b', 'c']);
  });

  test('Parsimmon.alt', function(){
    var toNode = function(nodeType){
      return function(value) {
        return {type: nodeType, value: value};
      };
    };

    var stringParser = seq(string('"'), regex(/[^"]*/), string('"')).map(toNode('string'));
    var identifierParser = regex(/[a-zA-Z]*/).map(toNode('identifier'));
    var parser = alt(stringParser, identifierParser);

    assert.deepEqual(parser.parse('"a string, to be sure"').value, {
      type: 'string',
      value: ['"', 'a string, to be sure', '"']
    });
    assert.deepEqual(parser.parse('anIdentifier').value, {
      type: 'identifier',
      value: 'anIdentifier'
    });

    assert.throws(function() { alt('not a parser'); });
  });

  test('.empty()', function() {
    var emptyParse = {
      status: false,
      expected: ['fantasy-land/empty'],
      index: {offset: 0, line: 1, column: 1}
    };
    assert.deepEqual(Parsimmon.digit.empty, Parsimmon.empty);
    assert.deepEqual(Parsimmon.empty().parse(''), emptyParse);
  });

  suite('fantasy-land/* method aliases', function() {
    function makeTester(name) {
      return function() {
        var flName = 'fantasy-land/' + name;
        var parser = Parsimmon.of('burrito');
        assert.equal(parser[name], parser[flName]);
      };
    }
    var methods = [
      'ap',
      'chain',
      'concat',
      'empty',
      'map',
      'of'
    ];
    for (var i = 0; i < methods.length; i++) {
      test('fantasy-land/' + methods[i] + ' alias', makeTester(methods[i]));
    }
  });

  test('Fantasy Land Parsimmon.empty alias', function() {
    assert.equal(Parsimmon.empty, Parsimmon['fantasy-land/empty']);
  });

  test('Fantasy Land Parsimmon.of alias', function() {
    assert.equal(Parsimmon.of, Parsimmon['fantasy-land/of']);
    assert.equal(Parsimmon.of, Parsimmon.any.of);
  });

  suite('Fantasy Land Semigroup', function() {
    test('associativity', function() {
      var a = Parsimmon.string('a');
      var b = Parsimmon.string('b');
      var c = Parsimmon.string('c');
      var abc1 = a.concat(b).concat(c);
      var abc2 = a.concat(b.concat(c));
      equivalentParsers(abc1, abc2, [
        'abc',
        'ac'
      ]);
    });
  });

  suite('Fantasy Land Functor', function() {
    test('identity', function() {
      var p1 = Parsimmon.digits;
      var p2 = Parsimmon.digits.map(function(x) { return x; });
      equivalentParsers(p1, p2, [
        '091',
        '111111',
        '46782792',
        'oops'
      ]);
    });

    test('composition', function() {
      function increment(x) {
        return x + 1;
      }
      var p1 = Parsimmon.digits.map(function(x) {
        return increment(Number(x));
      });
      var p2 = Parsimmon.digits.map(Number).map(increment);
      equivalentParsers(p1, p2, [
        '12',
        '98789',
        '89772371298389217387128937979839821738',
        'oh no!'
      ]);
    });
  });

  suite('Fantasy Land Apply', function() {
    test('composition', function() {
      function reverse(s) {
        return s.split('').reverse().join('');
      }

      function upperCase(s) {
        return s.toUpperCase();
      }

      function compose(f) {
        return function(g) {
          return function(x) {
            return f(g(x));
          };
        };
      }

      var p1 =
        Parsimmon.all
          .ap(Parsimmon.of(reverse))
          .ap(Parsimmon.of(upperCase));

      var p2 =
        Parsimmon.all.ap(
          Parsimmon.of(reverse).ap(
            Parsimmon.of(upperCase).map(compose)
          )
        );

      equivalentParsers(p1, p2, [
        'ok cool'
      ]);
    });
  });

  suite('Fantasy Land Applicative', function() {
    test('identity', function() {
      var p1 = Parsimmon.any;
      var p2 = p1.ap(Parsimmon.of(function(x) { return x; }));
      equivalentParsers(p1, p2, [
        'x',
        'z',
        'æ',
        '1',
        ''
      ]);
    });

    test('homomorphism', function() {
      function fn(s) {
        return s.toUpperCase();
      }
      var input = 'nice';
      var p1 = Parsimmon.of(input).ap(Parsimmon.of(fn));
      var p2 = Parsimmon.of(fn(input));
      assert.deepEqual(p1.parse(''), p2.parse(''));
    });

    test('interchange', function() {
      function increment(x) {
        return x + 1;
      }
      var input = 3;
      var p1 = Parsimmon.of(input).ap(Parsimmon.of(increment));
      var p2 = Parsimmon.of(increment).ap(Parsimmon.of(function(f) {
        return f(input);
      }));
      assert.deepEqual(p1.parse(''), p2.parse(''));
    });
  });

  suite('Fantasy Land Chain', function() {
    test('associativity', function() {
      function appender(x) {
        return function(xs) {
          return Parsimmon.of(xs.concat(x));
        };
      }
      function reverse(xs) {
        return Parsimmon.of(xs.slice().reverse());
      }
      var list = Parsimmon.sepBy(Parsimmon.letters, Parsimmon.whitespace);
      var input = 'quuz foo bar baz';
      var output = {
        status: true,
        value: ['baz', 'bar', 'foo', 'quuz', 'aaa']
      };
      var p1 = list.chain(reverse).chain(appender('aaa'));
      var p2 = list.chain(function(x) {
        return reverse(x).chain(appender('aaa'));
      });
      var out1 = p1.parse(input);
      var out2 = p2.parse(input);
      assert.deepEqual(out1, out2);
      assert.deepEqual(out1, output);
    });
  });

  suite('Fantasy Land Monad', function() {
    test('left identity', function() {
      function upperCase(x) {
        return Parsimmon.of(x.toUpperCase());
      }
      var input = 'foo';
      var output = {
        status: true,
        value: 'FOO'
      };
      var p1 = Parsimmon.of(input).chain(upperCase);
      var p2 = upperCase(input);
      var out1 = p1.parse('');
      var out2 = p2.parse('');
      assert.deepEqual(out1, out2);
      assert.deepEqual(out1, output);
    });

    test('right identity', function() {
      var input = 'monad burrito';
      var output = {
        status: true,
        value: input
      };
      var p1 = Parsimmon.all.chain(Parsimmon.of);
      var p2 = Parsimmon.all;
      var out1 = p1.parse(input);
      var out2 = p2.parse(input);
      assert.deepEqual(out1, out2);
      assert.deepEqual(out1, output);
    });
  });

  suite('Parsimmon.sepBy/sepBy1', function() {
    var chars   = regex(/[a-zA-Z]+/);
    var comma   = string(',');
    var csvSep  = Parsimmon.sepBy(chars, comma);
    var csvSep1 = Parsimmon.sepBy1(chars, comma);

    test('successful, returns an array of parsed elements', function(){
      var input  = 'Heres,a,csv,string,in,our,restrictive,dialect';
      var output = ['Heres', 'a', 'csv', 'string', 'in', 'our', 'restrictive', 'dialect'];
      assert.deepEqual(csvSep.parse(input).value, output);
      assert.deepEqual(csvSep1.parse(input).value, output);
      assert.throws(function() {
        Parsimmon.sepBy('not a parser');
      });
      assert.throws(function() {
        Parsimmon.sepBy(string('a'), 'not a parser');
      });
    });

    test('sepBy succeeds with the empty list on empty input, sepBy1 fails', function() {
      assert.deepEqual(csvSep.parse('').value, []);
      assert.deepEqual(csvSep1.parse(''), {
        status: false,
        index: {
          offset: 0,
          line: 1,
          column: 1
        },
        expected: ['/[a-zA-Z]+/']
      });
    });

    test('does not tolerate trailing separators', function() {
      var input = 'Heres,a,csv,with,a,trailing,comma,';
      var output = {
        status: false,
        index: {
          offset: 34,
          line: 1,
          column: 35
        },
        expected: ['/[a-zA-Z]+/']
      };

      assert.deepEqual(csvSep.parse(input), output);
      assert.deepEqual(csvSep1.parse(input), output);
    });
  });

  suite('then', function() {
    test('with a parser, uses the last return value', function() {
      var parser = string('x').then(string('y'));
      assert.deepEqual(parser.parse('xy'), {status: true, value: 'y'});
      assert.deepEqual(parser.parse('y'), {
        status: false,
        expected: ['\'x\''],
        index: {
          offset: 0,
          line: 1,
          column: 1
        }
      });
      assert.deepEqual(parser.parse('xz'), {
        status: false,
        expected: ['\'y\''],
        index: {
          offset: 1,
          line: 1,
          column: 2
        }
      });
    });
    test('errors when argument is not a parser', function() {
      assert.throws(function() {
        string('x').then('not a parser');
      });
    });
  });

  suite('chain', function() {
    test('asserts that a parser is returned', function() {
      var parser1 = letter.chain(function() { return 'not a parser'; });
      assert.throws(function() { parser1.parse('x'); });

      assert.throws(function() { letter.then('x'); });
    });

    test('with a function that returns a parser, continues with that parser', function() {
      var piped;
      var parser = string('x').chain(function(x) {
        piped = x;
        return string('y');
      });

      assert.deepEqual(parser.parse('xy'), {status: true, value: 'y'});
      assert.equal(piped, 'x');
      assert.ok(!parser.parse('x').status);
    });
  });

  suite('map', function() {
    test('with a function, pipes the value in and uses that return value', function() {
      var piped;

      var parser = string('x').map(function(x) {
        piped = x;
        return 'y';
      });

      assert.deepEqual(parser.parse('x'), {status: true, value: 'y'});
      assert.equal(piped, 'x');
    });
    test('asserts that a function was given', function() {
      assert.throws(function() { string('x').map('not a function'); });
    });
  });

  suite('result', function() {
    test('returns a constant result', function() {
      var oneParser = string('x').result(1);
      assert.deepEqual(oneParser.parse('x'), {status: true, value: 1});
    });
  });

  suite('skip', function() {
    test('uses the previous return value', function() {
      var parser = string('x').skip(string('y'));

      assert.deepEqual(parser.parse('xy'), {status: true, value: 'x'});
      assert.ok(!parser.parse('x').status);
    });
    test('asserts that a parser was given', function() {
      assert.throws(function() { string('x').skip('not a parser'); });
    });
  });

  suite('fallback', function() {
    test('allows fallback result if no match is found', function() {
      var parser = string('a').fallback('nothing');

      assert.deepEqual(parser.parse('a').value, 'a');
      assert.deepEqual(parser.parse('').value, 'nothing');
    });
  });

  suite('or', function() {
    test('two parsers', function() {
      var parser = string('x').or(string('y'));

      assert.equal(parser.parse('x').value, 'x');
      assert.equal(parser.parse('y').value, 'y');
      assert.ok(!parser.parse('z').status);
    });

    test('with chain', function() {
      var parser = string('\\')
        .chain(function() {
          return string('y');
        }).or(string('z'));

      assert.equal(parser.parse('\\y').value, 'y');
      assert.equal(parser.parse('z').value, 'z');
      assert.ok(!parser.parse('\\z').status);
    });
    test('asserts that a parser was given', function() {
      assert.throws(function() { string('x').or('not a parser'); });
    });
  });

  suite('many', function() {
    test('simple case', function() {
      var letters = letter.many();

      assert.deepEqual(letters.parse('x').value, ['x']);
      assert.deepEqual(letters.parse('xyz').value, ['x','y','z']);
      assert.deepEqual(letters.parse('').value, []);
      assert.ok(!letters.parse('1').status);
      assert.ok(!letters.parse('xyz1').status);
    });

    test('followed by then', function() {
      var parser = string('x').many().then(string('y'));

      assert.equal(parser.parse('y').value, 'y');
      assert.equal(parser.parse('xy').value, 'y');
      assert.equal(parser.parse('xxxxxy').value, 'y');
    });
  });

  suite('times', function() {
    test('zero case', function() {
      var zeroLetters = letter.times(0);

      assert.deepEqual(zeroLetters.parse('').value, []);
      assert.ok(!zeroLetters.parse('x').status);
    });

    test('nonzero case', function() {
      var threeLetters = letter.times(3);

      assert.deepEqual(threeLetters.parse('xyz').value, ['x', 'y', 'z']);
      assert.ok(!threeLetters.parse('xy').status);
      assert.ok(!threeLetters.parse('xyzw').status);

      var thenDigit = threeLetters.then(digit);
      assert.equal(thenDigit.parse('xyz1').value, '1');
      assert.ok(!thenDigit.parse('xy1').status);
      assert.ok(!thenDigit.parse('xyz').status);
      assert.ok(!thenDigit.parse('xyzw').status);
    });

    test('with a min and max', function() {
      var someLetters = letter.times(2, 4);

      assert.deepEqual(someLetters.parse('xy').value, ['x', 'y']);
      assert.deepEqual(someLetters.parse('xyz').value, ['x', 'y', 'z']);
      assert.deepEqual(someLetters.parse('xyzw').value, ['x', 'y', 'z', 'w']);
      assert.ok(!someLetters.parse('xyzwv').status);
      assert.ok(!someLetters.parse('x').status);

      var thenDigit = someLetters.then(digit);
      assert.equal(thenDigit.parse('xy1').value, '1');
      assert.equal(thenDigit.parse('xyz1').value, '1');
      assert.equal(thenDigit.parse('xyzw1').value, '1');
      assert.ok(!thenDigit.parse('xy').status);
      assert.ok(!thenDigit.parse('xyzw').status);
      assert.ok(!thenDigit.parse('xyzwv1').status);
      assert.ok(!thenDigit.parse('x1').status);
    });

    test('atMost', function() {
      var atMostTwo = letter.atMost(2);
      assert.deepEqual(atMostTwo.parse('').value, []);
      assert.deepEqual(atMostTwo.parse('a').value, ['a']);
      assert.deepEqual(atMostTwo.parse('ab').value, ['a', 'b']);
      assert.ok(!atMostTwo.parse('abc').status);
    });

    test('atLeast', function() {
      var atLeastTwo = letter.atLeast(2);

      assert.deepEqual(atLeastTwo.parse('xy').value, ['x', 'y']);
      assert.deepEqual(atLeastTwo.parse('xyzw').value, ['x', 'y', 'z', 'w']);
      assert.ok(!atLeastTwo.parse('x').status);
    });
    test('checks that argument types are correct', function() {
      assert.throws(function() { string('x').times('not a number'); });
      assert.throws(function() { string('x').times(1, 'not a number'); });
      assert.throws(function() { string('x').atLeast('not a number'); });
      assert.throws(function() { string('x').atMost('not a number'); });
    });
  });

  suite('fail', function() {
    var fail = Parsimmon.fail;
    var succeed = Parsimmon.succeed;

    test('use Parsimmon.fail to fail dynamically', function() {
      var parser = any.chain(function(ch) {
        return fail('a character besides ' + ch);
      }).or(string('x'));

      assert.deepEqual(parser.parse('y'), {
        status: false,
        index: {
          offset: 1,
          line: 1,
          column: 2
        },
        expected: ['a character besides y']
      });
      assert.equal(parser.parse('x').value, 'x');
    });

    test('use Parsimmon.succeed or Parsimmon.fail to branch conditionally', function() {
      var allowedOperator;

      var parser =
        string('x')
          .then(string('+').or(string('*')))
          .chain(function(operator) {
            if (operator === allowedOperator) return succeed(operator);
            else return fail(allowedOperator);
          })
          .skip(string('y'))
      ;

      allowedOperator = '+';
      assert.equal(parser.parse('x+y').value, '+');
      assert.deepEqual(parser.parse('x*y'), {
        status: false,
        index: {
          offset: 2,
          line: 1,
          column: 3
        },
        expected: ['+']
      });

      allowedOperator = '*';
      assert.equal(parser.parse('x*y').value, '*');
      assert.deepEqual(parser.parse('x+y'), {
        status: false,
        index: {
          offset: 2,
          line: 1,
          column: 3
        },
        expected: ['*']
      });
    });
  });

  test('eof', function() {
    var parser = optWhitespace.skip(eof).or(all.result('default'));

    assert.equal(parser.parse('  ').value, '  ');
    assert.equal(parser.parse('x').value, 'default');
  });

  test('test', function() {
    var parser = Parsimmon.test(function(ch) { return ch !== '.'; });
    assert.equal(parser.parse('x').value, 'x');
    assert.equal(parser.parse('.').status, false);
    assert.throws(function() { Parsimmon.test('not a function'); });
  });

  test('takeWhile', function() {
    var parser = Parsimmon.takeWhile(function(ch) { return ch !== '.'; })
      .skip(all);
    assert.equal(parser.parse('abc').value, 'abc');
    assert.equal(parser.parse('abc.').value, 'abc');
    assert.equal(parser.parse('.').value, '');
    assert.equal(parser.parse('').value, '');
    assert.throws(function() { Parsimmon.takeWhile('not a function'); });
  });

  test('index', function() {
    var parser = regex(/^[x\n]*/).then(index);
    assert.deepEqual(parser.parse('').value, {
      offset: 0,
      line: 1,
      column: 1
    });
    assert.deepEqual(parser.parse('xx').value, {
      offset: 2,
      line: 1,
      column: 3
    });
    assert.deepEqual(parser.parse('xx\nxx').value, {
      offset: 5,
      line: 2,
      column: 3
    });
  });

  test('mark', function() {
    var ys = regex(/^y*/).mark();
    var parser = optWhitespace.then(ys).skip(optWhitespace);
    assert.deepEqual(
      parser.parse('').value,
      {
        value: '',
        start: {offset: 0, line: 1, column: 1},
        end: {offset: 0, line: 1, column: 1}
      }
      );
    assert.deepEqual(
      parser.parse(' yy ').value,
      {
        value: 'yy',
        start: {offset: 1, line: 1, column: 2},
        end: {offset: 3, line: 1, column: 4}
      }
      );
    assert.deepEqual(
      parser.parse('\nyy ').value,
      {
        value: 'yy',
        start: {offset: 1, line: 2, column: 1},
        end: {offset: 3, line: 2, column: 3}
      }
      );
  });

  suite('smart error messages', function() {
    // this is mainly about .or(), .many(), and .times(), but not about
    // their core functionality, so it's in its own test suite

    suite('or', function() {
      test('prefer longest branch', function() {
        var parser = string('abc').then(string('def')).or(string('ab').then(string('cd')));

        assert.deepEqual(parser.parse('abc'), {
          status: false,
          index: {
            offset: 3,
            line: 1,
            column: 4
          },
          expected: ['\'def\'']
        });
      });

      test('prefer last of equal length branches', function() {
        var parser = string('abc').then(string('def')).or(string('abc').then(string('d')));

        assert.deepEqual(parser.parse('abc'), {
          status: false,
          index: {
            offset: 3,
            line: 1,
            column: 4
          },
          expected: ['\'d\'', '\'def\'']
        });
      });

      test('prefer longest branch even after a success', function() {
        var parser = string('abcdef').then(string('g')).or(string('ab'))
          .then(string('cd')).then(string('xyz'));

        assert.deepEqual(parser.parse('abcdef'), {
          status: false,
          index: {
            offset: 6,
            line: 1,
            column: 7
          },
          expected: ['\'g\'']
        });
      });
    });

    suite('many', function() {
      test('prefer longest branch even in a .many()', function() {
        var list = lazy(function() {
          return optWhitespace.then(atom.or(sexpr)).skip(optWhitespace).many();
        });
        var atom = regex(/[^()\s]+/).desc('an atom');
        var sexpr = string('(').then(list).skip(string(')'));

        assert.deepEqual(
          list.parse('(a b) (c ((() d)))').value,
          [['a', 'b'], ['c', [[[], 'd']]]]
        );

        assert.deepEqual(list.parse('(a b ()) c)'), {
          status: false,
          index: {
            offset: 10,
            line: 1,
            column: 11
          },
          expected: ['\'(\'', 'EOF', 'an atom']
        });

        assert.deepEqual(list.parse('(a (b)) (() c'), {
          status: false,
          index: {
            offset: 13,
            line: 1,
            column: 14
          },
          expected: ['\'(\'', '\')\'', 'an atom']
        });
      });

      test('prefer longest branch in .or() nested in .many()', function() {
        var parser = string('abc').then(string('def')).or(string('a')).many();

        assert.deepEqual(parser.parse('aaabcdefaa').value,
                         ['a', 'a', 'def', 'a', 'a']);

        assert.deepEqual(parser.parse('aaabcde'), {
          status: false,
          index: {
            offset: 5,
            line: 1,
            column: 6
          },
          expected: ['\'def\'']
        });
      });
    });

    suite('times', function() {
      test('prefer longest branch in .times() too', function() {
        var parser = string('abc').then(string('def')).or(string('a')).times(3, 6);

        assert.deepEqual(parser.parse('aabcde'), {
          status: false,
          index: {
            offset: 4,
            line: 1,
            column: 5
          },
          expected: ['\'def\'']
        });

        assert.deepEqual(parser.parse('aaaaabcde'), {
          status: false,
          index: {
            offset: 7,
            line: 1,
            column: 8
          },
          expected: ['\'def\'']
        });
      });
    });

    suite('desc', function() {
      test('allows custom error messages', function() {
        var x = string('x').desc('the letter x');
        var y = string('y').desc('the letter y');
        var parser = x.then(y);

        assert.deepEqual(parser.parse('a'), {
          status: false,
          index: {
            offset: 0,
            line: 1,
            column: 1
          },
          expected: ['the letter x']
        });

        assert.deepEqual(parser.parse('xa'), {
          status: false,
          index: {
            offset: 1,
            line: 1,
            column: 2
          },
          expected: ['the letter y']
        });
      });

      test('allows tagging with `lazy`', function() {
        var x = lazy('the letter x', function() { return string('x'); });
        var y = lazy('the letter y', function() { return string('y'); });
        var parser = x.then(y);

        assert.deepEqual(parser.parse('a'), {
          status: false,
          index: {
            offset: 0,
            line: 1,
            column: 1
          },
          expected: ['the letter x']
        });

        assert.deepEqual(parser.parse('xa'), {
          status: false,
          index: {
            offset: 1,
            line: 1,
            column: 2
          },
          expected: ['the letter y']
        });
      });
    });
  });
});
