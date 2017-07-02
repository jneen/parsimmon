'use strict';

suite('Parsimmon()', function() {

  test('should work in general', function() {
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

  test('unsafeUnion works on poorly formatted custom parser', function() {
    var p1 = Parsimmon.string('a').or(Parsimmon.string('b'));
    var p2 = Parsimmon(function(str, i) {
      return {
        status: false,
        index: -1,
        value: null,
        furthest: i,
        expected: []
      };
    });
    var p3 = Parsimmon.alt(p2, p1);
    var result = p3.parse('x');
    assert.deepStrictEqual(result.expected, ['\'a\'', '\'b\'']);
  });

});
