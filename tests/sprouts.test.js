import {expect, test} from 'vitest';
import {Jar} from '../public/javascripts/sprouts.js';

test('should return new Jar', () => {
  expect(new Jar).toBeInstanceOf(Jar);
});
