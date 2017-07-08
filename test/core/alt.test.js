'use strict';

suite('Parsimmon.alt', function() {

  test('should work in general', function() {
    var toNode = function(nodeType){
      return function(value) {
        return {type: nodeType, value: value};
      };
    };

    var stringParser = Parsimmon.seq(
      Parsimmon.string('"'),
      Parsimmon.regexp(/[^"]*/),
      Parsimmon.string('"')
    ).map(toNode('string'));

    var identifierParser =
      Parsimmon.regexp(/[a-zA-Z]*/)
        .map(toNode('identifier'));

    var parser = Parsimmon.alt(stringParser, identifierParser);

    assert.deepEqual(
      parser.parse('"a string, to be sure"').value,
      {
        type: 'string',
        value: ['"', 'a string, to be sure', '"']
      }
    );

    assert.deepEqual(
      parser.parse('anIdentifier').value,
      {
        type: 'identifier',
        value: 'anIdentifier'
      }
    );

    assert.throws(function() {
      Parsimmon.alt('not a parser');
    });


    assert.strictEqual(Parsimmon.alt().parse('').status, false);
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
    var a = Parsimmon.string('a');
    var b = Parsimmon.string('b');
    var c = Parsimmon.string('c');
    var parser = Parsimmon.alt(
      test(0).then(inc).then(a).skip(test(1)),
      test(0).then(inc).then(b).skip(test(1)),
      test(0).then(inc).then(c).skip(test(1))
    ).then(test(1));
    parser.tryParse('c', 0);
  });

});
