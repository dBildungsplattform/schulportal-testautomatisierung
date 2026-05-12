import path from 'node:path';

import { expect, test as base } from '@playwright/test';

const AUTH_STATE_DIR: string = path.resolve('test-results', 'auth');

export function getStorageStatePath(parallelIndex: number): string {
  return path.resolve(AUTH_STATE_DIR, `storage-state-${parallelIndex}.json`);
}

export const test = base.extend({
  storageState: async ({}, use, testInfo) => {
    const storageStatePath: string = getStorageStatePath(testInfo.parallelIndex);
    await use(storageStatePath);
  },
});

export { expect };
