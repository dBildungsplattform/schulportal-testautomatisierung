import { expect, Page } from '@playwright/test';
import { ServiceProviderKategorie } from '../../base/api/generated';
import { createSchule } from '../../base/api/organisationApi';
import { addOrganisationenToPerson, UserInfo } from '../../base/api/personApi';
import { test as base } from '../../base/fixtures';
import { loginNewUserAndNavigateToAdministration } from '../../base/testHelperUtils';
import { generateAngebotname, generateSchulname } from '../../base/utils/generateTestdata';
import { ServiceProviderCreationSuccessPage } from '../../pages/admin/service-provider/ServiceProviderCreationSuccessPage.page';
import {
  ServiceProviderCreateParams,
  ServiceProviderCreationViewPage,
} from '../../pages/admin/service-provider/ServiceProviderCreationView.page';
import { ServiceProviderDetailsBySchuleViewPage } from '../../pages/admin/service-provider/ServiceProviderDetailsBySchuleView.page';

const test = base.extend<{
  angebotCreation: {
    serviceProviderCreationPage: ServiceProviderCreationViewPage;
    angebot: ServiceProviderCreateParams;
  };
  angebotCreationSchuladmin: {
    serviceProviderCreationPage: ServiceProviderCreationViewPage;
    angebot: ServiceProviderCreateParams;
  };
  asSchuladminWith2Schulen: {
    userinfo: UserInfo;
    schulen: { id: string; name: string }[];
    serviceProviderCreationPage: ServiceProviderCreationViewPage;
  };
}>({
  angebotCreation: async ({ page, asLandesadmin, testSchule }, use) => {
    const serviceProviderCreationPage: ServiceProviderCreationViewPage = await asLandesadmin.personManagementViewPage
      .getMenu()
      .navigateToAngebotCreation();
    await use({
      serviceProviderCreationPage,
      angebot: {
        organisation: testSchule.name,
        name: generateAngebotname(),
        url: page.url(),
        logoAlt: 'KI',
        kategorie: ServiceProviderKategorie.Schulisch,
        zuweisbar: true,
        nutzbarRollenerweiterung: true,
        twoFactor: false,
      },
    });
  },
  angebotCreationSchuladmin: async ({ page, asSchuladmin }, use) => {
    const serviceProviderCreationPage: ServiceProviderCreationViewPage = await asSchuladmin.personManagementViewPage
      .getMenu()
      .navigateToAngebotCreation();
    await use({
      serviceProviderCreationPage,
      angebot: {
        organisation: asSchuladmin.schule.name,
        name: generateAngebotname(),
        url: page.url(),
        logoAlt: 'Cloud',
        kategorie: ServiceProviderKategorie.Schulisch,
        zuweisbar: true,
        nutzbarRollenerweiterung: true,
        twoFactor: false,
      },
    });
  },
  asSchuladminWith2Schulen: async ({ page, schuladminAccount }, use) => {
    const zweiteSchuleName: string = generateSchulname();
    const zweiteSchuleId: string = await createSchule(page, zweiteSchuleName);
    await addOrganisationenToPerson(
      page,
      schuladminAccount.userinfo.personId,
      [schuladminAccount.schule.id, zweiteSchuleId],
      schuladminAccount.userinfo.rolleId,
    );
    const personManagementPage = await loginNewUserAndNavigateToAdministration(page, schuladminAccount.userinfo);
    const serviceProviderCreationPage: ServiceProviderCreationViewPage = await personManagementPage
      .getMenu()
      .navigateToAngebotCreation();
    await use({
      userinfo: schuladminAccount.userinfo,
      schulen: [schuladminAccount.schule, { id: zweiteSchuleId, name: zweiteSchuleName }],
      serviceProviderCreationPage,
    });
  },
});

test.describe('Schulisches Angebot erstellen', () => {
  test('Als Landesadmin ein schulisches Angebot erstellen', async ({ angebotCreation, testSchule }) => {
    const { serviceProviderCreationPage, angebot } = angebotCreation;
    await test.step('Schule auswählen', async () => {
      await serviceProviderCreationPage.selectOrganisation(testSchule.name);
    });

    await test.step('Name eingeben', async () => {
      await serviceProviderCreationPage.enterName(angebot.name);
    });

    await test.step('Url eingeben', async () => {
      await serviceProviderCreationPage.enterUrl(angebot.url);
    });

    await test.step('Url testen', async () => {
      const newPage: Page = await serviceProviderCreationPage.clickTestUrl();
      expect(newPage.url()).toBe(angebot.url);
    });

    await test.step('Logo auswählen', async () => {
      await serviceProviderCreationPage.selectLogo({ logoAlt: angebot.logoAlt });
    });

    await test.step('Vorschau prüfen', async () => {
      await serviceProviderCreationPage.assertPreview(angebot.name, angebot.logoAlt);
    });

    await test.step('Standardwerte prüfen', async () => {
      await serviceProviderCreationPage.assertDefaultValuesSet();
    });

    const successPage: ServiceProviderCreationSuccessPage = await test.step('Angebot anlegen', async () => {
      return await serviceProviderCreationPage.clickSubmit();
    });

    await test.step('Erfolgsmeldung prüfen', async () => {
      await successPage.assertSuccessPage(angebot);
    });

    await test.step('Zur Rollenauswahl navigieren, angezeigte Werte und Bearbeitbarkeit prüfen', async () => {
      const detailsPage: ServiceProviderDetailsBySchuleViewPage = await successPage.navigateToRollenauswahl();
      await detailsPage.assertServiceProviderDetailsHeadline(testSchule.name);
      await detailsPage.assertServiceProviderDetails(angebot);
      await detailsPage.assertRollenerweiterungenDetails();
    });
  });

  test('Als Schuladmin ein schulisches Angebot erstellen', async ({ angebotCreationSchuladmin, asSchuladmin }) => {
    const { serviceProviderCreationPage, angebot } = angebotCreationSchuladmin;
    await test.step('Schule ist ausgewählt', async () => {
      await serviceProviderCreationPage.assertSchulePreselected(asSchuladmin.schule.name);
    });

    await test.step('Name eingeben', async () => {
      await serviceProviderCreationPage.enterName(angebot.name);
    });

    await test.step('Url eingeben', async () => {
      await serviceProviderCreationPage.enterUrl(angebot.url);
    });

    await test.step('Logo auswählen', async () => {
      await serviceProviderCreationPage.selectLogo({ logoAlt: angebot.logoAlt });
    });

    await test.step('Vorschau prüfen', async () => {
      await serviceProviderCreationPage.assertPreview(angebot.name, angebot.logoAlt);
    });

    await test.step('Standardwerte prüfen', async () => {
      await serviceProviderCreationPage.assertDefaultValuesSet();
    });

    await test.step('Felder sind für Schuladmin nicht änderbar', async () => {
      await serviceProviderCreationPage.assertSchuladminFieldsDisabled();
    });

    const successPage: ServiceProviderCreationSuccessPage = await test.step('Angebot anlegen', async () => {
      return await serviceProviderCreationPage.clickSubmit();
    });

    await test.step('Erfolgsmeldung prüfen', async () => {
      await successPage.assertSuccessPage(angebot);
    });

    await test.step('Zur Rollenauswahl navigieren, angezeigte Werte und Bearbeitbarkeit prüfen', async () => {
      const detailsPage: ServiceProviderDetailsBySchuleViewPage = await successPage.navigateToRollenauswahl();
      await detailsPage.assertServiceProviderDetailsHeadline(asSchuladmin.schule.name);
      await detailsPage.assertServiceProviderDetails(angebot);
      await detailsPage.assertRollenerweiterungenDetails();
    });
  });

  test('Als Schuladmin mit 2 Schulen Organisationsfilter prüfen', async ({ asSchuladminWith2Schulen }) => {
    const { serviceProviderCreationPage, schulen } = asSchuladminWith2Schulen;

    await test.step('Schulen sind auswählbar', async () => {
      await serviceProviderCreationPage.assertSelectableSchulen(schulen.map((schule) => schule.name));
    });
  });
});
