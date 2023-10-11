import { test, expect } from '@playwright/test';

test("env", async ({ page }) => {
    console.log(process.env.FOO); // also prints "bar"
  })