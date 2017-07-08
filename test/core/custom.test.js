'use strict';

suite('Parsimmon.custom', function(){
  test('simple parser definition', function(){
    function customAny() {
      return Parsimmon.custom(function(success){
        return function(input, i, state) {
          return success(i + 1, input.charAt(i), state);
        };
      });
    }

    var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    var parser = customAny();

    for (var i = 0; i < letters.length; i++) {
      assert.deepEqual(parser.parse(letters[i]), {status: true, value: letters[i]});
    }
  });

  test('failing parser', function(){
    function failer() {
      return Parsimmon.custom(function(success, failure){
        return function(input, i, state) {
          return failure(i, 'nothing', state);
        };
      });
    }

    assert.deepEqual(failer().parse('a'), {
      status: false,
      index: {
        offset: 0,
        line: 1,
        column: 1
      },
      expected: ['nothing']
    });
  });

  test('composes with existing parsers', function(){
    function notChar(char) {
      return Parsimmon.custom(function(success, failure) {
        return function(input, i, state) {
          if (input.charCodeAt(i) !== char.charCodeAt(0)) {
            return success(i + 1, input.charAt(i), state);
          }
          var message = 'something different than "' + input.charAt(i) + '"';
          return failure(i, message, state);
        };
      });
    }

    function join(array) {
      return array.join('');
    }

    var parser = Parsimmon.seq(Parsimmon.string('a'), notChar('b').times(5).map(join), notChar('b').or(Parsimmon.string('b'))).map(join);

    assert.deepEqual(parser.parse('acccccb'), {status: true, value: 'acccccb'});
  });

});
