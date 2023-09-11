import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';

test.describe('Erfolgreicher Standard Login', () => {
  test('Login Test', async ({ context, page }) => {
    const server = 'portal';
    const url = 'https://' + server + '.qs.schule-sh.de/univention/login/#/'; 
    const Login = new LoginPage(page);
    
    await test.step('Hier passiert nichts', async () => {  
    })

    await test.step('Negativer login', async () => {
      await Login.loginAndereURL('xxxxxxxx', 'xxxxxxx', url); 
    })
  })
})
  


   //await page.pause();
