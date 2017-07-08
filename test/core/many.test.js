'use strict';

suite('many', function() {

  test('simple case', function() {
    var letters = Parsimmon.letter.many();
    assert.deepEqual(letters.parse('x').value, ['x']);
    assert.deepEqual(letters.parse('xyz').value, ['x','y','z']);
    assert.deepEqual(letters.parse('').value, []);
    assert.ok(!letters.parse('1').status);
    assert.ok(!letters.parse('xyz1').status);
  });

  test('followed by then', function() {
    var parser = Parsimmon.string('x').many().then(Parsimmon.string('y'));
    assert.equal(parser.parse('y').value, 'y');
    assert.equal(parser.parse('xy').value, 'y');
    assert.equal(parser.parse('xxxxxy').value, 'y');
  });

  test('should pass state through each parser', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    var inc = Parsimmon(function(input, i, state) {
      return Parsimmon.makeSuccess(i, null, state + 1);
    });
    var parser = Parsimmon.any.then(inc).many().then(test(4));
    parser.tryParse('abcd', 0);
  });

});
