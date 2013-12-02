var assert = require('assert')
  , Parsimmon = require('./../index')
  , mocha = require('mocha')
;

function partialEquals(x) {
  return function(y) { return x === y; }
}

suite('parser', function() {
  var string = Parsimmon.string;
  var regex = Parsimmon.regex;
  var letter = Parsimmon.letter;
  var digit = Parsimmon.digit;
  var any = Parsimmon.any;
  var optWhitespace = Parsimmon.optWhitespace;
  var eof = Parsimmon.eof;
  var succeed = Parsimmon.succeed;
  var all = Parsimmon.all;

  test('Parsimmon.string', function() {
    var parser = string('x');
    assert.equal(parser.parse('x'), 'x');
    assert.throws(function() { parser.parse('y') },
      partialEquals("Parse Error: expected 'x' at character 0, got 'y'\n    parsing: 'y'"));
  });

  test('Parsimmon.regex', function() {
    var parser = regex(/^[0-9]/);

    assert.equal(parser.parse('1'), '1');
    assert.equal(parser.parse('4'), '4');
    assert.throws(function() { parser.parse('x'); },
      partialEquals("Parse Error: expected /^[0-9]/ at character 0, got 'x'\n    parsing: 'x'"));
    assert.throws(function() { regex(/./) }, 'must be anchored');
  });

  suite('then', function() {
    test('with a parser, uses the last return value', function() {
      var parser = string('x').then(string('y'));
      assert.equal(parser.parse('xy'), 'y');
      assert.throws(function() { parser.parse('y'); },
        partialEquals("Parse Error: expected 'x' at character 0, got 'y'\n    parsing: 'y'"));
      assert.throws(function() { parser.parse('xz'); },
        partialEquals("Parse Error: expected 'y' at character 1, got '...z'\n    parsing: 'xz'"));
    });

    test('asserts that a parser is returned', function() {
      var parser1 = letter.then(function() { return 'not a parser' });
      assert.throws(function() { parser1.parse('x'); });

      var parser2 = letter.then('x');
      assert.throws(function() { letter.parse('xx'); });
    });

    test('with a function that returns a parser, continues with that parser', function() {
      var piped;
      var parser = string('x').then(function(x) {
        piped = x;
        return string('y');
      });

      assert.equal(parser.parse('xy'), 'y');
      assert.equal(piped, 'x');
      assert.throws(function() { parser.parse('x'); });
    });
  });

  suite('map', function() {
    test('with a function, pipes the value in and uses that return value', function() {
      var piped;

      var parser = string('x').map(function(x) {
        piped = x;
        return 'y';
      });

      assert.equal(parser.parse('x'), 'y')
      assert.equal(piped, 'x');
    });
  });

  suite('result', function() {
    test('returns a constant result', function() {
      var myResult = 1;
      var oneParser = string('x').result(1);

      assert.equal(oneParser.parse('x'), 1);

      var myFn = function() {};
      var fnParser = string('x').result(myFn);

      assert.equal(fnParser.parse('x'), myFn);
    });
  });

  suite('skip', function() {
    test('uses the previous return value', function() {
      var parser = string('x').skip(string('y'));

      assert.equal(parser.parse('xy'), 'x');
      assert.throws(function() { parser.parse('x'); });
    });
  });

  suite('or', function() {
    test('two parsers', function() {
      var parser = string('x').or(string('y'));

      assert.equal(parser.parse('x'), 'x');
      assert.equal(parser.parse('y'), 'y');
      assert.throws(function() { parser.parse('z') });
    });

    test('with then', function() {
      var parser = string('\\')
        .then(function() {
          return string('y')
        }).or(string('z'));

      assert.equal(parser.parse('\\y'), 'y');
      assert.equal(parser.parse('z'), 'z');
      assert.throws(function() { parser.parse('\\z') });
    });
  });

  function assertEqualArray(arr1, arr2) {
    assert.equal(arr1.join(), arr2.join());
  }

  suite('many', function() {
    test('simple case', function() {
      var letters = letter.many();

      assertEqualArray(letters.parse('x'), ['x']);
      assertEqualArray(letters.parse('xyz'), ['x','y','z']);
      assertEqualArray(letters.parse(''), []);
      assert.throws(function() { letters.parse('1'); });
      assert.throws(function() { letters.parse('xyz1'); });
    });

    test('followed by then', function() {
      var parser = string('x').many().then(string('y'));

      assert.equal(parser.parse('y'), 'y');
      assert.equal(parser.parse('xy'), 'y');
      assert.equal(parser.parse('xxxxxy'), 'y');
    });
  });

  suite('times', function() {
    test('zero case', function() {
      var zeroLetters = letter.times(0);

      assertEqualArray(zeroLetters.parse(''), []);
      assert.throws(function() { zeroLetters.parse('x'); });
    });

    test('nonzero case', function() {
      var threeLetters = letter.times(3);

      assertEqualArray(threeLetters.parse('xyz'), ['x', 'y', 'z']);
      assert.throws(function() { threeLetters.parse('xy'); });
      assert.throws(function() { threeLetters.parse('xyzw'); });

      var thenDigit = threeLetters.then(digit);
      assert.equal(thenDigit.parse('xyz1'), '1');
      assert.throws(function() { thenDigit.parse('xy1'); });
      assert.throws(function() { thenDigit.parse('xyz'); });
      assert.throws(function() { thenDigit.parse('xyzw'); });
    });

    test('with a min and max', function() {
      var someLetters = letter.times(2, 4);

      assertEqualArray(someLetters.parse('xy'), ['x', 'y']);
      assertEqualArray(someLetters.parse('xyz'), ['x', 'y', 'z']);
      assertEqualArray(someLetters.parse('xyzw'), ['x', 'y', 'z', 'w']);
      assert.throws(function() { someLetters.parse('xyzwv'); });
      assert.throws(function() { someLetters.parse('x'); });

      var thenDigit = someLetters.then(digit);
      assert.equal(thenDigit.parse('xy1'), '1');
      assert.equal(thenDigit.parse('xyz1'), '1');
      assert.equal(thenDigit.parse('xyzw1'), '1');
      assert.throws(function() { thenDigit.parse('xy'); });
      assert.throws(function() { thenDigit.parse('xyzw'); });
      assert.throws(function() { thenDigit.parse('xyzwv1'); });
      assert.throws(function() { thenDigit.parse('x1'); });
    });

    test('atLeast', function() {
      var atLeastTwo = letter.atLeast(2);

      assertEqualArray(atLeastTwo.parse('xy'), ['x', 'y']);
      assertEqualArray(atLeastTwo.parse('xyzw'), ['x', 'y', 'z', 'w']);
      assert.throws(function() { atLeastTwo.parse('x'); });
    });
  });

  suite('fail', function() {
    var fail = Parsimmon.fail;
    var succeed = Parsimmon.succeed;

    test('use Parsimmon.fail to fail dynamically', function() {
      var parser = any.then(function(ch) {
        return fail('a character besides ' + ch);
      }).or(string('x'));

      assert.throws(function() { parser.parse('y'); });
        // partialEquals("Parse Error: expected a character besides y, got the end of the string\n    parsing: 'y'"));
      assert.equal(parser.parse('x'), 'x');
    });

    test('use Parsimmon.succeed or Parsimmon.fail to branch conditionally', function() {
      var allowedOperator;

      var parser =
        string('x')
        .then(string('+').or(string('*')))
        .then(function(operator) {
          if (operator === allowedOperator) return succeed(operator);
          else return fail(allowedOperator);
        })
        .skip(string('y'))
      ;

      allowedOperator = '+';
      assert.equal(parser.parse('x+y'), '+');
      assert.throws(function() { parser.parse('x*y'); },
        partialEquals("Parse Error: expected + at character 2, got '...y'\n    parsing: 'x*y'"));

      allowedOperator = '*';
      assert.equal(parser.parse('x*y'), '*');
      assert.throws(function() { parser.parse('x+y'); },
        partialEquals("Parse Error: expected * at character 2, got '...y'\n    parsing: 'x+y'"));
    });
  });

  test('eof', function() {
    var parser = optWhitespace.skip(eof).or(all.result('default'));

    assert.equal(parser.parse('  '), '  ')
    assert.equal(parser.parse('x'), 'default');
  });

  // suite('smart error messages', function() {
  //   // this is mainly about .or(), .many(), and .times(), but not about
  //   // their core functionality, so it's in its own test suite

  //   suite('or', function() {
  //     test('prefer longest branch', function() {
  //       var parser = string('abc').then(string('def')).or(string('ab').then(string('cd')));

  //       assert.throws(function() { parser.parse('abc'); },
  //         partialEquals("Parse Error: expected 'def', got the end of the string\n    parsing: 'abc'"));
  //     });

  //     test('prefer last of equal length branches', function() {
  //       var parser = string('abc').then(string('def')).or(string('abc').then(string('d')));

  //       assert.throws(function() { parser.parse('abc'); },
  //         partialEquals("Parse Error: expected 'd', got the end of the string\n    parsing: 'abc'"));
  //     });

  //     test('prefer longest branch even after a success', function() {
  //       var parser = string('abcdef').then(string('g')).or(string('ab'))
  //         .then(string('cd')).then(string('xyz'));

  //       assert.throws(function() { parser.parse('abcdef'); },
  //         partialEquals("Parse Error: expected 'g', got the end of the string\n    parsing: 'abcdef'"));
  //     });
  //   });

  //   suite('many', function() {
  //     test('prefer longest branch even in a .many()', function() {
  //       var atom = regex(/^[^()\s]+/);
  //       var sexpr = string('(').then(function() { return list; }).skip(string(')'));
  //       var list = optWhitespace.then(atom.or(sexpr)).skip(optWhitespace).many();

  //       assert.deepEqual(list.parse('(a b) (c ((() d)))'), [['a', 'b'], ['c', [[[], 'd']]]]);

  //       assert.throws(function() { list.parse('(a b ()) c)'); },
  //         partialEquals("Parse Error: expected EOF at character 10, got '...)'\n    parsing: '(a b ()) c)'"));
  //       assert.throws(function() { list.parse('(a (b)) (() c'); },
  //         partialEquals("Parse Error: expected ')', got the end of the string\n    parsing: '(a (b)) (() c'"));
  //     });

  //     test('prefer longest branch in .or() nested in .many()', function() {
  //       var parser = string('abc').then(string('def')).or(string('a')).many();

  //       assert.deepEqual(parser.parse('aaabcdefaa'), ['a', 'a', 'def', 'a', 'a']);

  //       assert.throws(function() { parser.parse('aaabcde'); },
  //         partialEquals("Parse Error: expected 'def' at character 5, got '...de'\n    parsing: 'aaabcde'"));
  //     });
  //   });

  //   suite('times', function() {
  //     test('prefer longest branch in .times() too', function() {
  //       var parser = string('abc').then(string('def')).or(string('a')).times(3, 6);

  //       assert.throws(function() { parser.parse('aabcde'); },
  //         partialEquals("Parse Error: expected 'def' at character 4, got '...de'\n    parsing: 'aabcde'"));

  //       assert.throws(function() { parser.parse('aaaaabcde'); },
  //           partialEquals("Parse Error: expected 'def' at character 7, got '...de'\n    parsing: 'aaaaabcde'"));
  //     });
  //   });
  // });
});
