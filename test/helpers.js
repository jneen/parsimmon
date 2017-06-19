'use strict';

function equivalentParsers(p1, p2, inputs) {
  for (var i = 0; i < inputs.length; i++) {
    assert.deepEqual(p1.parse(inputs[i]), p2.parse(inputs[i]));
  }
}

exports.equivalentParsers = equivalentParsers;
