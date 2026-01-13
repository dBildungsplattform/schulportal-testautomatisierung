import { test as teardown, APIResponse, PlaywrightTestArgs, test } from '@playwright/test';
import FromAnywhere from '../pages/FromAnywhere';
import { LandingPage } from '../pages/LandingView.page';
import { StartPage } from '../pages/StartView.page';
import { LoginPage } from '../pages/LoginView.page';
import { ApiResponse, OrganisationenApi, OrganisationResponse, OrganisationsTyp } from '../base/api/generated';
import { constructOrganisationApi } from '../base/api/organisationApi';

const FRONTEND_URL: string | undefined = process.env.FRONTEND_URL || '';
const searchString: string = 'TAuto';
const timeoutMS: number = 2 * 60 * 1000;

teardown('delete database', async ({ page }: PlaywrightTestArgs) => {
  test.setTimeout(timeoutMS);

  const organisationApi: OrganisationenApi = constructOrganisationApi(page);

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
    const personenJson: { items: { person: { id: string } }[] } = await response.json();

    for (const person of personenJson.items) {
      await page.request.delete(FRONTEND_URL + `api/personen/${person.person.id}`);
    }
  });

  await test.step(`Rollen löschen`, async () => {
    const response: APIResponse = await page.request.get(FRONTEND_URL + `api/rolle?searchStr=${searchString}`);
    const rollenJson: { id: string }[] = await response.json();

    for (const rolle of rollenJson) {
      await page.request.delete(FRONTEND_URL + `api/rolle/${rolle.id}`);
    }
  });

  await test.step(`Klassen löschen`, async () => {
    let klassen: Array<OrganisationResponse> = [];
    try {
      const response: ApiResponse<Array<OrganisationResponse>> =
        await organisationApi.organisationControllerFindOrganizationsRaw({
          searchString,
          typ: OrganisationsTyp.Klasse,
        });
      klassen = await response.value();
    } catch {}

    for (const { id } of klassen) {
      try {
        await organisationApi.organisationControllerDeleteOrganisationRaw({ organisationId: id });
      } catch {}
    }
  });

  await test.step(`Schulen löschen`, async () => {
    const response: APIResponse = await page.request.get(
      FRONTEND_URL + `api/organisationen?searchString=${searchString}&typ=SCHULE`
    );
    const schulenJson: { id: string }[] = await response.json();

    for (const schule of schulenJson) {
      await page.request.delete(FRONTEND_URL + `api/organisationen/${schule.id}`);
    }
  });
});
