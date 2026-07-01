import { expect, test as base } from '@playwright/test';

const NO_MOTION_STYLE: string = `
*, *::before, *::after {
  transition-duration: 0s !important;
  animation-duration: 0s !important;
}
`;

export const test = base.extend({
  page: async ({ page, browserName }, use) => {
    if (browserName !== 'webkit') {
      await use(page);
      return;
    }

    const injectNoMotionStyles = async (): Promise<void> => {
      await page.addStyleTag({ content: NO_MOTION_STYLE });
    };

    const onLoad = (): void => {
      injectNoMotionStyles().catch(() => undefined);
    };

    page.on('load', onLoad);
    await injectNoMotionStyles();

    await use(page);

    page.off('load', onLoad);
  },
});

export { expect };
