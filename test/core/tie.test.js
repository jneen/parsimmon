'use strict';

suite('parser.tie()', function() {

  test('concatenates all the results', function() {
    var parser = Parsimmon.seq(
      Parsimmon.string('<| '),
      Parsimmon.letter,
      Parsimmon.digit,
      Parsimmon.string(' |>')
    ).tie();
    var text = '<| o7 |>';
    var result = parser.tryParse(text);
    assert.strictEqual(result, text);
  });

  test('only accept array of string parsers', function() {
    assert.throws(function() {
      Parsimmon.of(1).tie().tryParse('');
    });
    assert.throws(function() {
      Parsimmon.of([1]).tie().tryParse('');
    });
    assert.throws(function() {
      Parsimmon.of(['1', 2]).tie().tryParse('');
    });
    assert.doesNotThrow(function() {
      Parsimmon.of(['1']).tie().tryParse('');
    });
  });

});
