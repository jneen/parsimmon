'use strict';

suite('all', function() {

  test('should pass state through', function() {
    function test(n) {
      return Parsimmon(function(input, i, state) {
        assert.strictEqual(state, n);
        return Parsimmon.makeSuccess(i, undefined, state);
      });
    }
    test(10)
      .then(Parsimmon.all)
      .then(test(10))
      .tryParse('memes', 10);
  });

});
