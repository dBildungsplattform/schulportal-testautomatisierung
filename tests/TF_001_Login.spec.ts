import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/Login';


test('Login Test', async ({ page }) => {
  const server = 'portal';
  const url = 'https://' + server + '.qs.schule-sh.de/univention/login/#/'; 
  const Login = new LoginPage(page);
  
  await Login.loginAndereURL('xxxxxxxx', 'xxxxxxx', url); 

  
   //await page.pause();
});