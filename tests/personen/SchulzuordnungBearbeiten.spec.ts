import { PlaywrightTestArgs, test } from '@playwright/test';
import {
  createRolleAndPersonWithPersonenkontext,
  setTimeLimitPersonenkontext,
  freshLoginPage,
  UserInfo
} from '../../base/api/personApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { testschuleName, testschuleDstNr } from '../../base/organisation';
import {
  generateNachname,
  generateVorname,
  generateRolleName,
  generateCurrentDate,
  formatDateDMY
} from '../../base/utils/generateTestdata';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { LoginViewPage } from '../../pages/LoginView.neu.page';
import { StartViewPage } from '../../pages/StartView.neu.page';
import { RollenArt } from '../../base/api/generated';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.neu.page';
import { email } from '../../base/sp';

test.describe(
  `Testfälle für Schulzuordnung bearbeiten: ENV: ${process.env.ENV} URL: ${process.env.FRONTEND_URL}`,
  () => {
    let startPage: StartViewPage;
    let personManagementView: PersonManagementViewPage;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      const loginPage: LoginViewPage = await freshLoginPage(page);
      startPage = await loginPage.login(process.env.USER, process.env.PW);
      await startPage.waitForPageLoad();
      personManagementView = await startPage.goToAdministration();
    });

    test(
      'Befristung einer Schulzuordnung von einem Lehrer durch einen Landesadmin bearbeiten',
      async ({ page }: PlaywrightTestArgs) => {
        let userInfoLehrer: UserInfo;
        const nameRolle: string = generateRolleName();
        const timeLimitTeacherRolle: string = formatDateDMY(generateCurrentDate({ days: 3, months: 5 }));
        let timeLimitTeacherRolleNew: string;

        // ---------- Testdaten ----------
        await test.step('Testdaten: Lehrer mit Rolle und Schulzuordnung anlegen', async () => {
          userInfoLehrer = await createRolleAndPersonWithPersonenkontext(
            page,
            testschuleName,
            RollenArt.Lehr,
            generateNachname(),
            generateVorname(),
            [await getServiceProviderId(page, email)],
            nameRolle
          );

          await setTimeLimitPersonenkontext(
            page,
            userInfoLehrer.personId,
            userInfoLehrer.organisationId,
            userInfoLehrer.rolleId,
            generateCurrentDate({ days: 3, months: 5 })
          );
        });

        // ---------- Open person ----------
        const personDetailsView: PersonDetailsViewPage = await test.step('Gesamtübersicht öffnen', async () => {
          const view: PersonDetailsViewPage = await personManagementView.searchAndOpenGesamtuebersicht(userInfoLehrer.username);
          await view.waitForPageLoad();
          return view;
        });

        // ---------- Open edit mode ----------
        await test.step('Schulzuordnung im Bearbeitungsmodus öffnen', async () => {
          await personDetailsView.editZuordnungen();
          await personDetailsView.selectSchulzuordnungCheckbox(testschuleName);
        });

        // ---------- Open Befristung dialog ----------
        await test.step('Befristung im Bearbeitungsmodus öffnen', async () => {
          await personDetailsView.openBefristungDialog();
        });

        // ---------- Validate invalid and valid dates ----------
        await test.step('Ungültige und gültige Befristungen eingeben', async () => {
          await personDetailsView.performBefristungValidation();
          timeLimitTeacherRolleNew = formatDateDMY(generateCurrentDate({ days: 0, months: 8 }));
          await personDetailsView.setFinalBefristung(timeLimitTeacherRolleNew);
        });

        // ---------- Submit and confirm ----------
        await test.step('Gültige Befristung speichern', async () => {
          await personDetailsView.submitBefristungChange(timeLimitTeacherRolle, timeLimitTeacherRolleNew);
        });

        // ---------- Review and final save ----------
        await test.step('In der Änderungsübersicht die Befristung der Rolle überprüfen und das Speichern final bestätigen', async () => {
          await personDetailsView.reviewAndSaveBefristungChange({
            dstNr: testschuleDstNr,
            schuleName: testschuleName,
            nameRolle,
            oldDate: timeLimitTeacherRolle,
            newDate: timeLimitTeacherRolleNew,
          });
        });

        // ---------- Verify final state ----------
        await test.step('In der Gesamtübersicht überprüfen, dass die Schulzuordnung mit dem korrekten Datum angezeigt wird', async () => {
          await personDetailsView.validateEntireNameSchulzuordnung(
            testschuleDstNr,
            testschuleName,
            nameRolle,
            'rgb(0, 30, 73)',
            timeLimitTeacherRolleNew,
            'person-zuordnungen-section-view'
          );
        });
      }
    );
  }
);

