/**
 * @jest-environment jsdom
 */
import client from './client';

import {expect, test} from '@jest/globals'

test('client', () => {
  expect(client).toBeDefined();
});
