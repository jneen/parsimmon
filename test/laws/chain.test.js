'use strict';

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
