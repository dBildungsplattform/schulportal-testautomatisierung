import { test, type PlaywrightTestArgs } from '@playwright/test';

test.describe(`Testfälle für den Login: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {      
      // logout
    });


  test('Erfolgreicher Login', async ({ page }) => {
    
  });

  test('Fehlgeschlagener Login mit falschen Daten', async ({ page }) => {
    
  });

  test('Fehlgeschlagener Login mit gesperrtem Benutzer', async ({ page }) => {
    
  });

  test('Erfolgreicher Logout', async ({ page }) => {
    
  });
});