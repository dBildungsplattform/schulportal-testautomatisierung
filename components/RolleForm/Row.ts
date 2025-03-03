import { Locator } from '@playwright/test';

export class Row<T, M> {
  constructor(
    readonly label: Locator,
    readonly data: Locator,
    readonly inputElement: T,
    readonly messages: M,
  ) {}
}
