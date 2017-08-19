'use strict';

suite('fallback', function() {

  test('returns same result as original when match is found', function() {
    var parser = Parsimmon.string('a').fallback('nothing');
    assert.deepEqual(parser.parse('a').value, 'a');
  });

  test('allows fallback result if no match is found', function() {
    var parser = Parsimmon.string('a').fallback('nothing');
    assert.deepEqual(parser.parse('').value, 'nothing');
  });

  test('will work with many() method', function() {
    var parser = Parsimmon.alt(
      Parsimmon.string('b').fallback('nothing'),
      Parsimmon.string('a')
    ).many();
    assert.deepEqual(parser.parse('bbba').value, ['b', 'b', 'b', 'nothing', 'a', 'nothing']);
  });
});
