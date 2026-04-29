import { PlaywrightTestArgs, test } from '@playwright/test';
import { createPerson, createRolleAndPersonWithPersonenkontext, UserInfo } from '../base/api/personApi';
import { addServiceProvidersToRolle, addSystemrechtToRolle, createRolle, RollenArt } from '../base/api/rolleApi';
import { getServiceProviderId } from '../base/api/serviceProviderApi';
import { getOrganisationId } from '../base/api/organisationApi';
import { klasse1Testschule } from '../base/klassen';
import { landSH, testschule665Name, testschuleName } from '../base/organisation';
import { typeLehrer, typeSchuladmin } from '../base/rollentypen';
import { email } from '../base/sp';
import { DEV, STAGE } from '../base/tags';
import { gotoTargetURL, loginAndNavigateToAdministration } from '../base/testHelperUtils';
import { generateKopersNr, generateNachname, generateRolleName, generateVorname } from '../base/utils/generateTestdata';
import { PersonDetailsViewPage } from '../pages/admin/personen/details/PersonDetailsView.page';
import { PersonManagementViewPage } from '../pages/admin/personen/PersonManagementView.page';
import { HeaderPage } from '../pages/components/Header.page';
import { LoginViewPage } from '../pages/LoginView.page';
import { ProfileViewPage } from '../pages/ProfileView.page';

test.describe('Zwei-Faktor-Authentifizierung über eigenes Profil einrichten', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Login', async () => {
      await loginAndNavigateToAdministration(page);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Offene Dialoge schließen', async () => {
      try {
        await page.keyboard.press('Escape');
      } catch {
        // ignore if no dialog open
      }
    });
  });

  test(
    '2FA über eigenes Profil einrichten als Lehrkraft',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const header: HeaderPage = new HeaderPage(page);
      const login: LoginViewPage = new LoginViewPage(page);
      const profileView: ProfileViewPage = new ProfileViewPage(page);
      const rollenart: RollenArt = typeLehrer;
      const kopersnummer: string = generateKopersNr();

      await test.step('Lehrer via API anlegen und mit diesem anmelden', async () => {
        const idSPs: string[] = [await getServiceProviderId(page, email)];
        const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          rollenart,
          generateNachname(),
          generateVorname(),
          idSPs,
          generateRolleName(),
          kopersnummer,
        );
        await header.logout();
        await header.navigateToLogin();
        await login.login(userInfo.username, userInfo.password);
        await login.updatePassword();
      });

      await test.step('Profil öffnen', async () => {
        await header.navigateToProfile();
        await profileView.waitForPageLoad();
      });

      await test.step('2FA öffnen', async () => {
        await profileView.open2FADialog();
      });

      await test.step('2FA Texte prüfen und QR-Code generieren', async () => {
        await profileView.assert2FADialogIntro();
        await profileView.proceedTo2FAQrCode();
      });

      await test.step('QR-Code-Display prüfen', async () => {
        await profileView.assert2FAQrCodeDisplayed();
        await profileView.proceedToOtpEntry();
      });

      await test.step('OTP-Dialog prüfen und Fehler anzeigen', async () => {
        await profileView.assert2FAOtpEntryPrompt();
        await profileView.submitEmptyOtpAndCheckError();
      });

      await test.step('Dialog schließen', async () => {
        await profileView.close2FADialog();
        await profileView.assert2FACard();
      });
    },
  );
});

test.describe('Zwei-Faktor-Authentifizierung als Admin einrichten', () => {
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Login', async () => {
      await loginAndNavigateToAdministration(page);
    });
  });

  test.afterEach(async ({ page }: PlaywrightTestArgs) => {
    await test.step('Offene Dialoge schließen', async () => {
      try {
        await page.keyboard.press('Escape');
      } catch {
        // ignore if no dialog open
      }
    });
  });

  test('2FA Abschnitt ist für Schüler nicht sichtbar', { tag: [DEV, STAGE] }, async ({ page }: PlaywrightTestArgs) => {
    const userInfoSchueler: UserInfo = await test.step('Testdaten: Schüler anlegen', async () => {
      const schuleId: string = await getOrganisationId(page, testschuleName);
      const klasseId: string = await getOrganisationId(page, klasse1Testschule);
      const rollenname: string = generateRolleName();
      const rolleId: string = await createRolle(page, 'LERN', schuleId, rollenname);
      await addServiceProvidersToRolle(page, rolleId, [await getServiceProviderId(page, 'itslearning')]);
      const userInfo: UserInfo = await createPerson(
        page,
        schuleId,
        rolleId,
        generateNachname(),
        generateVorname(),
        '',
        klasseId,
      );
      return userInfo;
    });

    const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

    const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
      await gotoTargetURL(page, 'admin/personen');
      await personManagementView.searchAndOpenGesamtuebersicht(userInfoSchueler.username);
      return new PersonDetailsViewPage(page);
    });

    await test.step('Gesamtübersicht Abschnitte prüfen', async () => {
      await personDetailsView.waitForPageLoad();
      await personDetailsView.checkSections();
    });

    await test.step('Unsichtbarkeit des 2FA Abschnitts prüfen', async () => {
      await personDetailsView.checkSectionsNotVisible({ twoFactor: true });
    });
  });

  test(
    '2FA Status prüfen: kein Token eingerichtet für Lehrkraft',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const userInfoLehrer: UserInfo = await test.step('Testdaten: Lehrkraft anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName(),
        );
        return userInfo;
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchAndOpenGesamtuebersicht(userInfoLehrer.username);
        return new PersonDetailsViewPage(page);
      });

      await test.step('2FA Status prüfen dass kein Token eingerichtet ist', async () => {
        await personDetailsView.checkSections({ twoFactor: true });
        await personDetailsView.check2FASetup(false);
      });
    },
  );

  test(
    '2FA Status prüfen: kein Token eingerichtet für Schuladmin',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const userInfoAdmin: UserInfo = await test.step('Testdaten: Schuladmin anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          testschule665Name,
          typeSchuladmin,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, 'Schulportal-Administration')],
          generateRolleName(),
        );
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
        return userInfo;
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchAndOpenGesamtuebersicht(userInfoAdmin.username);
        return new PersonDetailsViewPage(page);
      });

      await test.step('2FA Status prüfen dass kein Token eingerichtet ist', async () => {
        await personDetailsView.checkSections({ twoFactor: true });
        await personDetailsView.check2FASetup(false);
      });
    },
  );

  test(
    '2FA Token einrichten und Status prüfen für Landesadmin',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const userInfoAdmin: UserInfo = await test.step('Testdaten: Landesadmin anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          landSH,
          'SYSADMIN',
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, 'Schulportal-Administration')],
          generateRolleName(),
        );
        await addSystemrechtToRolle(page, userInfo.rolleId, 'ROLLEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_SOFORT_LOESCHEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'KLASSEN_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'SCHULTRAEGER_VERWALTEN');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_ANLEGEN');
        return userInfo;
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchAndOpenGesamtuebersicht(userInfoAdmin.username);
        return new PersonDetailsViewPage(page);
      });

      await test.step('2FA Token einrichten', async () => {
        await personDetailsView.checkSections({ twoFactor: true });
        await personDetailsView.addSoftwareToken();
      });

      await test.step('2FA Status prüfen dass ein Token eingerichtet ist', async () => {
        await personDetailsView.check2FASetup(true);
      });
    },
  );

  test(
    '2FA Token einrichten und Status prüfen für Schuladmin',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const userInfoAdmin: UserInfo = await test.step('Testdaten: Schuladmin anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          testschule665Name,
          typeSchuladmin,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, 'Schulportal-Administration')],
          generateRolleName(),
        );
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
        return userInfo;
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchAndOpenGesamtuebersicht(userInfoAdmin.username);
        return new PersonDetailsViewPage(page);
      });

      await test.step('2FA Token einrichten', async () => {
        await personDetailsView.checkSections({ twoFactor: true });
        await personDetailsView.addSoftwareToken();
      });

      await test.step('2FA Status prüfen dass ein Token eingerichtet ist', async () => {
        await personDetailsView.check2FASetup(true);
      });
    },
  );

  test(
    '2FA Token einrichten und Status prüfen für Lehrkraft',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const userInfoLehrer: UserInfo = await test.step('Testdaten: Lehrkraft anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName(),
        );
        return userInfo;
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchAndOpenGesamtuebersicht(userInfoLehrer.username);
        return new PersonDetailsViewPage(page);
      });

      await test.step('2FA Token einrichten', async () => {
        await personDetailsView.checkSections({ twoFactor: true });
        await personDetailsView.addSoftwareToken();
      });

      await test.step('2FA Status prüfen dass ein Token eingerichtet ist', async () => {
        await personDetailsView.check2FASetup(true);
      });
    },
  );

  test(
    '2FA Token einrichten, Status prüfen und Token zurücksetzen für Lehrkraft',
    { tag: [DEV, STAGE] },
    async ({ page }: PlaywrightTestArgs) => {
      const userInfoLehrer: UserInfo = await test.step('Testdaten: Lehrkraft anlegen', async () => {
        const userInfo: UserInfo = await createRolleAndPersonWithPersonenkontext(
          page,
          testschuleName,
          typeLehrer,
          generateNachname(),
          generateVorname(),
          [await getServiceProviderId(page, email)],
          generateRolleName(),
        );
        return userInfo;
      });

      const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

      const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
        await gotoTargetURL(page, 'admin/personen');
        await personManagementView.searchAndOpenGesamtuebersicht(userInfoLehrer.username);
        return new PersonDetailsViewPage(page);
      });

      await test.step('Token einrichten', async () => {
        await personDetailsView.addSoftwareToken();
      });

      await test.step('2FA Status prüfen dass ein Token eingerichtet ist', async () => {
        await personDetailsView.check2FASetup(true);
      });

      await test.step('Token zurücksetzen', async () => {
        await personDetailsView.resetSoftwareToken();
        await personDetailsView.check2FASetup(false);
      });
    },
  );
});
