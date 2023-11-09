/**
 * @jest-environment jsdom
 */
import client from './client';

test('client', () => {
  expect(client).toBeDefined();
});
