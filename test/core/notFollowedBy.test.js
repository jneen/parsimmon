'use strict';

suite('Parsimmon.notFollowedBy', function() {

  test('fails when its parser argument matches', function() {
    var weirdParser = Parsimmon.string('dx');
    var parser = Parsimmon.seq(
      Parsimmon.string('abc'),
      Parsimmon.notFollowedBy(weirdParser).result('NOT USED'),
      Parsimmon.string('dx')
    );
    var answer = parser.parse('abcdx');
    assert.deepEqual(answer.expected, ['not "dx"']);
  });

  test('does not consume from its input', function() {
    var weirdParser = Parsimmon.string('Q');
    var parser = Parsimmon.seq(
      Parsimmon.string('abc'),
      Parsimmon.notFollowedBy(weirdParser),
      Parsimmon.string('d')
    );
    var answer = parser.parse('abcd');
    assert.deepEqual(answer.value, ['abc', null, 'd']);
  });

  test('can be chained from prototype', function() {
    var parser = Parsimmon.seq(
      Parsimmon.string('abc').notFollowedBy(Parsimmon.string('Q')),
      Parsimmon.string('d')
    );
    var answer = parser.parse('abcd');
    assert.deepEqual(answer.value, ['abc', 'd']);
  });

  test('should pass state through unchanged', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    var inc = Parsimmon(function(input, i, state) {
      return Parsimmon.makeSuccess(i, null, state + 1);
    });
    var parser = Parsimmon.notFollowedBy(Parsimmon.regexp(/a/));
    test(0)
      .then(inc)
      .then(parser)
      .skip(test(1))
      .then(Parsimmon.string('b'))
      .tryParse('b', 0);
  });

});
