'use strict';

suite('desc', function() {

  test('allows custom error messages', function() {
    var x = Parsimmon.string('x').desc('the letter x');
    var y = Parsimmon.string('y').desc('the letter y');
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
    var x = Parsimmon.lazy('the letter x', function() {
      return Parsimmon.string('x');
    });
    var y = Parsimmon.lazy('the letter y', function() {
      return Parsimmon.string('y');
    });
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

  test('should pass state through', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    var inc = Parsimmon(function(input, i, state) {
      return Parsimmon.makeSuccess(i, null, state + 1);
    });
    var parser = Parsimmon.any.desc('by any other name?');
    test(0).then(parser).skip(test(0)).tryParse('a', 0);
    inc.then(parser).skip(test(1)).tryParse('b', 0);
  });

});
