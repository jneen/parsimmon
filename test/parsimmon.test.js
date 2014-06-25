suite('parser', function() {
  var string = Parsimmon.string;
  var regex = Parsimmon.regex;
  var letter = Parsimmon.letter;
  var digit = Parsimmon.digit;
  var any = Parsimmon.any;
  var optWhitespace = Parsimmon.optWhitespace;
  var eof = Parsimmon.eof;
  var succeed = Parsimmon.succeed;
  var seq = Parsimmon.seq;
  var alt = Parsimmon.alt;
  var all = Parsimmon.all;
  var index = Parsimmon.index;
  var lazy = Parsimmon.lazy;

  test('Parsimmon.string', function() {
    var parser = string('x');
    var res = parser.parse('x');
    assert.ok(res.status);
    assert.equal(res.value, 'x');

    res = parser.parse('y')
    assert.ok(!res.status)
    assert.equal("'x'", res.expected);
    assert.equal(0, res.index);

    assert.equal(
      "expected 'x' at character 0, got 'y'",
      Parsimmon.formatError('y', res)
    );
  });

  test('Parsimmon.regex', function() {
    var parser = regex(/[0-9]/);

    assert.equal(parser.parse('1').value, '1');
    assert.equal(parser.parse('4').value, '4');
    assert.deepEqual(parser.parse('x0'), {
      status: false,
      index: 0,
      expected: /[0-9]/
    });
    assert.deepEqual(parser.parse('0x'), {
      status: false,
      index: 1,
      expected: 'EOF'
    });
  });

  test('Parsimmon.seq', function() {
      var parser = seq(string('('), regex(/[^\)]/).many(), string(')'));

      assert.deepEqual(parser.parse('(string between parens)').value, ['(', 'string between parens', ')']);
      assert.deepEqual(parser.parse('(string'), {
          status: false,
          index: 7,
          expected: "')'"
      });
      assert.deepEqual(parser.parse('starts wrong (string between parens)'), {
          status: false,
          index: 0,
          expected: "'('"
      });
  });

  suite('Parsimmon.custom', function(){
    test('simple parser definition', function(){
      function customAny() {
        return Parsimmon.custom(function(success, failure){
          return function(stream, i) {
            return success(i+1, stream.charAt(i));
          }
        });
      }

      var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
      var parser = customAny();

      for (var i = 0; i < letters.length; i++) {
        assert.deepEqual(parser.parse(letters[i]), {status: true, value: letters[i]})
      }
    });

    test('failing parser', function(){
      function failer() {
        return Parsimmon.custom(function(success, failure){
          return function(stream, i) {
            return failure(i, 'nothing');
          }
        });
      }

      assert.deepEqual(failer().parse('a'), {status: false, index: 0, expected: 'nothing'})
    });

    test('composes with existing parsers', function(){
      function notChar(char) {
        return Parsimmon.custom(function(success, failure) {
          return function(stream, i) {
            if (stream.charCodeAt(i) !== char.charCodeAt(0)) {
              return success(i+1, stream.charAt(i));
            }
            return failure(i, 'something different than "' + stream.charAt(i)) + '"';
          }
        });
      }

      function join(array) {
        return array.join('');
      }

      var parser = seq(string('a'), notChar('b').times(5).map(join), notChar('b').or(string('b'))).map(join);

      assert.deepEqual(parser.parse('acccccb'), {status: true, value: 'acccccb'});
    });
  });


  test('Parsimmon.alt', function(){
      var toNode = function(nodeType){
          return function(value) {
              return { type: nodeType, value: value}
          }
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
  })

  suite('then', function() {
    test('with a parser, uses the last return value', function() {
      var parser = string('x').then(string('y'));
      assert.deepEqual(parser.parse('xy'), { status: true, value: 'y' });
      assert.deepEqual(parser.parse('y'), {
        status: false,
        expected: "'x'",
        index: 0
      })
      assert.deepEqual(parser.parse('xz'), {
        status: false,
        expected: "'y'",
        index: 1
      });
    });
  });

  suite('chain', function() {
    test('asserts that a parser is returned', function() {
      var parser1 = letter.chain(function() { return 'not a parser' });
      assert.throws(function() { parser1.parse('x'); });

      assert.throws(function() { letter.then('x'); });
    });

    test('with a function that returns a parser, continues with that parser', function() {
      var piped;
      var parser = string('x').chain(function(x) {
        piped = x;
        return string('y');
      });

      assert.deepEqual(parser.parse('xy'), { status: true, value: 'y'});
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

      assert.deepEqual(parser.parse('x'), { status: true, value: 'y' });
      assert.equal(piped, 'x');
    });
  });

  suite('result', function() {
    test('returns a constant result', function() {
      var oneParser = string('x').result(1);
      assert.deepEqual(oneParser.parse('x'), { status: true, value: 1 });
    });
  });

  suite('skip', function() {
    test('uses the previous return value', function() {
      var parser = string('x').skip(string('y'));

      assert.deepEqual(parser.parse('xy'), { status: true, value: 'x' });
      assert.ok(!parser.parse('x').status);
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
        .chain(function(x) {
          return string('y');
        }).or(string('z'));

      assert.equal(parser.parse('\\y').value, 'y');
      assert.equal(parser.parse('z').value, 'z');
      assert.ok(!parser.parse('\\z').status);
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
        index: 1,
        expected: 'a character besides y'
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
        index: 2,
        expected: '+'
      });

      allowedOperator = '*';
      assert.equal(parser.parse('x*y').value, '*');
      assert.deepEqual(parser.parse('x+y'), {
        status: false,
        index: 2,
        expected: '*'
      });
    });
  });

  test('eof', function() {
    var parser = optWhitespace.skip(eof).or(all.result('default'));

    assert.equal(parser.parse('  ').value, '  ')
    assert.equal(parser.parse('x').value, 'default');
  });

  test('test', function() {
    var parser = Parsimmon.test(function(ch) { return ch !== '.' });
    assert.equal(parser.parse('x').value, 'x');
    assert.equal(parser.parse('.').status, false);
  });

  test('takeWhile', function() {
    var parser = Parsimmon.takeWhile(function(ch) { return ch !== '.' })
                    .skip(all);
    assert.equal(parser.parse('abc').value, 'abc');
    assert.equal(parser.parse('abc.').value, 'abc');
    assert.equal(parser.parse('.').value, '');
    assert.equal(parser.parse('').value, '');
  });

  test('index', function() {
    var parser = regex(/^x*/).then(index);
    assert.equal(parser.parse('').value, 0);
    assert.equal(parser.parse('xx').value, 2);
    assert.equal(parser.parse('xxxx').value, 4);
  });

  test('mark', function() {
    var ys = regex(/^y*/).mark()
    var parser = optWhitespace.then(ys).skip(optWhitespace);
    assert.deepEqual(parser.parse('').value, { start: 0, value: '', end: 0 });
    assert.deepEqual(parser.parse(' yy ').value, { start: 1, value: 'yy', end: 3 });
  });

  suite('smart error messages', function() {
    // this is mainly about .or(), .many(), and .times(), but not about
    // their core functionality, so it's in its own test suite

    suite('or', function() {
      test('prefer longest branch', function() {
        var parser = string('abc').then(string('def')).or(string('ab').then(string('cd')));

        assert.deepEqual(parser.parse('abc'), {
          status: false,
          index: 3,
          expected: "'def'"
        });
      });

      test('prefer last of equal length branches', function() {
        var parser = string('abc').then(string('def')).or(string('abc').then(string('d')));

        assert.deepEqual(parser.parse('abc'), {
          status: false,
          index: 3,
          expected: "'d'"
        });
      });

      test('prefer longest branch even after a success', function() {
        var parser = string('abcdef').then(string('g')).or(string('ab'))
          .then(string('cd')).then(string('xyz'));

        assert.deepEqual(parser.parse('abcdef'), {
          status: false,
          index: 6,
          expected: "'g'"
        });
      });
    });

    suite('many', function() {
      test('prefer longest branch even in a .many()', function() {
        var list = lazy(function() {
          return optWhitespace.then(atom.or(sexpr)).skip(optWhitespace).many();
        });
        var atom = regex(/^[^()\s]+/);
        var sexpr = string('(').then(list).skip(string(')'));

        assert.deepEqual(list.parse('(a b) (c ((() d)))').value,
                         [['a', 'b'], ['c', [[[], 'd']]]]);

        assert.deepEqual(list.parse('(a b ()) c)'), {
          status: false,
          index: 10,
          expected: 'EOF'
        });

        assert.deepEqual(list.parse('(a (b)) (() c'), {
          status: false,
          index: 13,
          expected: "')'"
        });
      });

      test('prefer longest branch in .or() nested in .many()', function() {
        var parser = string('abc').then(string('def')).or(string('a')).many();

        assert.deepEqual(parser.parse('aaabcdefaa').value,
                         ['a', 'a', 'def', 'a', 'a']);

        assert.deepEqual(parser.parse('aaabcde'), {
          status: false,
          index: 5,
          expected: "'def'"
        });
      });
    });

    suite('times', function() {
      test('prefer longest branch in .times() too', function() {
        var parser = string('abc').then(string('def')).or(string('a')).times(3, 6);

        assert.deepEqual(parser.parse('aabcde'), {
          status: false,
          index: 4,
          expected: "'def'"
        });

        assert.deepEqual(parser.parse('aaaaabcde'), {
          status: false,
          index: 7,
          expected: "'def'"
        });
      });
    });

    suite('desc', function() {
      test('allows custom error messages', function() {
        var x = string('x').desc('the letter x')
        var y = string('y').desc('the letter y')
        var parser = x.then(y)

        assert.deepEqual(parser.parse('a'), {
          status: false,
          index: 0,
          expected: 'the letter x'
        });

        assert.deepEqual(parser.parse('xa'), {
          status: false,
          index: 1,
          expected: 'the letter y'
        });
      });

      test('allows tagging with `lazy`', function() {
        var x = lazy('the letter x', function() { return string('x'); });
        var y = lazy('the letter y', function() { return string('y'); });
        var parser = x.then(y)

        assert.deepEqual(parser.parse('a'), {
          status: false,
          index: 0,
          expected: 'the letter x'
        });

        assert.deepEqual(parser.parse('xa'), {
          status: false,
          index: 1,
          expected: 'the letter y'
        });
      });
    });
  });
});
