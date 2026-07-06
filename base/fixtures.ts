import { expect, test as base } from '@playwright/test';

const NO_MOTION_STYLE: string = `
*, *::before, *::after {
  transition-duration: 0s !important;
  animation-duration: 0s !important;
}
`;

const NO_MOTION_STYLE_ID: string = '__pw_no_motion_style__';

export const test = base.extend({
  page: async ({ page, browserName }, use) => {
    if (browserName !== 'webkit') {
      await use(page);
      return;
    }

    await page.addInitScript(
      ({ styleId, styleContent }) => {
        const applyNoMotionStyle = (): void => {
          if (document.getElementById(styleId)) {
            return;
          }

          const styleElement: HTMLStyleElement = document.createElement('style');
          styleElement.id = styleId;
          styleElement.textContent = styleContent;

          const target: HTMLElement | null = document.head ?? document.documentElement;
          target?.append(styleElement);
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', applyNoMotionStyle, { once: true });
          return;
        }

        applyNoMotionStyle();
      },
      {
        styleId: NO_MOTION_STYLE_ID,
        styleContent: NO_MOTION_STYLE,
      },
    );

    await use(page);
  },
});

export { expect };
