import { test as teardown, APIResponse, PlaywrightTestArgs, test } from '@playwright/test';
import FromAnywhere from '../pages/FromAnywhere';
import { LandingPage } from '../pages/LandingView.page.ts';
import { StartPage } from '../pages/StartView.page.ts';
import { LoginPage } from '../pages/LoginView.page.ts';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';
const searchString: string = 'TAuto';

teardown('delete database', async ({ page }: PlaywrightTestArgs) => {
  await test.step(`Login`, async () => {
    await FromAnywhere(page)
      .start()
      .then((landing: LandingPage) => landing.goToLogin())
      .then((login: LoginPage) => login.login())
      .then((startseite: StartPage) => startseite.validateStartPageIsLoaded());
  });

  await test.step(`Personen löschen`, async () => {
    const response: APIResponse = await page.request.get(
      FRONTEND_URL + `api/personen-frontend?suchFilter=${searchString}`
    );
    const personsJson = await response.json();

    for (const person of personsJson.items) {
      await page.request.delete(FRONTEND_URL + `api/personen/${person.person.id}`);
    }
  });

  await test.step(`Rollen löschen`, async () => {
    const response: APIResponse = await page.request.get(FRONTEND_URL + `api/rolle?searchStr=${searchString}`);
    const rolesJson = await response.json();

    for (const role of rolesJson) {
      await page.request.delete(FRONTEND_URL + `api/rolle/${role.id}`);
    }
  });

  await test.step(`Klassen löschen`, async () => {
    const response: APIResponse = await page.request.get(
      FRONTEND_URL + `api/organisationen?searchString=${searchString}&typ=KLASSE`
    );
    const schoolClassJson = await response.json();

    for (const schoolClass of schoolClassJson) {
      await page.request.delete(FRONTEND_URL + `api/organisationen/${schoolClass.id}/klasse`);
    }
  });
});
