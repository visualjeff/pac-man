import Ember from 'ember';
import SharedStuffMixin from 'pac-man/mixins/shared-stuff';
import { module, test } from 'qunit';

module('Unit | Mixin | shared stuff');

// Replace this with your real tests.
test('it works', function(assert) {
  let SharedStuffObject = Ember.Object.extend(SharedStuffMixin);
  let subject = SharedStuffObject.create();
  assert.ok(subject);
});
