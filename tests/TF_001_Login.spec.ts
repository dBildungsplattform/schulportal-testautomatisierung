import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';

const PW = process.env.PW;
const USER = process.env.USER;
const URL_PORTAL = process.env.URL_PORTAL;
const URL_COOKIE_PORTAL = process.env.URL_COOKIE_PORTAL;
const URL_COOKIE_UCS = process.env.URL_COOKIE_UCS;

test.describe(`Start Test in der Umgebung: ${process.env.UMGEBUNG} und Server: ${process.env.URL_PORTAL}`, () => {
  test('Erfolgreicher Standard Login', async ({ context, page }) => {
    const Login = new LoginPage(page);
    
    await test.step("Vorab die Browser-Cookies setzen (Simulation, dass der Benutzer in der Vergangen schon mal auf der Seite war)", async () => {
      context.addCookies([{name:"schuposh-consent", value: "do-not-change-me", url: URL_COOKIE_PORTAL}]);
      context.addCookies([{name:"schuposh-consent", value: "do-not-change-me", url: URL_COOKIE_UCS}]);
    })

    await test.step('Negativer login', async () => {
      await Login.login('xxxxxxxx', 'yyyyyyyy', URL_PORTAL); 
    })
    // await page.pause();
  })
})