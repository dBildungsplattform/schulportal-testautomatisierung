import {expect, test} from "@playwright/test";
import {LandingPage} from "../pages/LandingView.page.ts";
import {LoginPage} from "../pages/LoginView.page.ts";
import {StartPage} from "../pages/StartView.page.ts";
import {PersonManagementViewPage} from "../pages/admin/PersonManagementView.page.ts";
import {PersonDetailsViewPage} from "../pages/admin/PersonDetailsView.page.ts";
import {HeaderPage} from "../pages/Header.page.ts";
import {faker} from "@faker-js/faker/locale/de";
import {createRolleAndPersonWithUserContext} from "../base/api/testHelperPerson.page.ts";
import {getSPId} from "../base/api/testHelperServiceprovider.page.ts";
import {UserInfo} from "../base/api/testHelper.page.ts";
import {addSystemrechtToRolle} from "../base/api/testHelperRolle.page.ts";
import {LONG, STAGE} from "../base/tags.ts";
import {deletePersonenBySearchStrings, deleteRolleById} from "../base/testHelperDeleteTestdata.ts";
import {typelehrer} from "../base/rollentypen.ts";
import {testschule} from "../base/organisation.ts";
import {email} from "../base/sp.ts";
import {generateLehrerNachname, generateLehrerVorname, generateRolleName} from "../base/testHelperGenerateTestdataNames.ts";
import {generateDateFuture, generateDateToday, gotoTargetURL} from "../base/testHelperUtils.ts";

const PW = process.env.PW;
const ADMIN = process.env.USER;

let username: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
let rolleId: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
    test.beforeEach(async ({page}) => {
        await test.step(`Login`, async () => {
            const landing: LandingPage = new LandingPage(page);
            const startseite: StartPage = new StartPage(page);
            const login: LoginPage = new LoginPage(page);
            await page.goto('/');
            await landing.button_Anmelden.click();
            await login.login(ADMIN, PW);
            await expect(startseite.text_h2_Ueberschrift).toBeVisible();
        });
    });

    test.afterEach(async ({page}) => {
        const header = new HeaderPage(page);
        const landing = new LandingPage(page);
        const login = new LoginPage(page);
        const startseite = new StartPage(page);

        await test.step(`Testdaten(Benutzer) löschen via API`, async () => {
            if (username) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
                await header.logout();
                await landing.button_Anmelden.click();
                await login.login(ADMIN, PW);
                await expect(startseite.text_h2_Ueberschrift).toBeVisible();

                await deletePersonenBySearchStrings(page, username);
                username = [];
            }

            if (rolleId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
                await header.logout();
                await landing.button_Anmelden.click();
                await login.login(ADMIN, PW);
                await expect(startseite.text_h2_Ueberschrift).toBeVisible();

                await deleteRolleById(rolleId, page);
                rolleId = [];
            }
        });

        await test.step(`Abmelden`, async () => {
            const header = new HeaderPage(page);
            await header.logout();
        });
    });

  test("Eine Schulzuordnung bei einem bestehenden Benutzer hinzufügen", {tag: [LONG, STAGE]}, async ({ page }) => {
    const personManagementView = new PersonManagementViewPage(page);
    const PersonDetailsView = new PersonDetailsViewPage(page);
    const header = new HeaderPage(page);
    const landing: LandingPage = new LandingPage(page);
    const login: LoginPage = new LoginPage(page);
    const startseite: StartPage = new StartPage(page);

    const addminVorname = "TAuto-PW-V-" + faker.person.firstName();
    const adminNachname = "TAuto-PW-N-" + faker.person.lastName();
    const adminRolle = await generateRolleName();
    const adminRollenart = 'LEIT';
    const adminOrganisation = 'Testschule-PW665';
    const adminIdSP = await getSPId(page, 'Schulportal-Administration');
    let userInfoAdmin: UserInfo;

    const lehrerVorname = "TAuto-PW-V-" + faker.person.firstName();
    const lehrerNachname = "TAuto-PW-N-" + faker.person.lastName();
    const lehrerRolle = await generateRolleName();
    const lehrerRollenart = 'LEHR';
    const lehrerOrganisation = 'Testschule-PW665';
    const lehrerIdSP = await getSPId(page, 'E-Mail');
    let userInfoLehrer: UserInfo;
    let lehrerBenutzername = '';
    const rolle = 'LiV';
    const kopersNr = faker.number.bigInt({min: 100000, max: 900000}).toString();

    await test.step(`Einen Schuladmin und einen zu bearbeitenden Lehrer mit je einer einer Schulzuordnung(Schule ist an einer Position > 25 in der DB) über die api anlegen und mit diesem Schuladmin anmelden`, async () => {
        // Schuladmin
        userInfoAdmin = await createRolleAndPersonWithUserContext(page, adminOrganisation, adminRollenart, addminVorname, adminNachname, adminIdSP, adminRolle);
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        username.push(userInfoAdmin.username);
        rolleId.push(userInfoAdmin.rolleId);

        // Lehrer
        userInfoLehrer = await createRolleAndPersonWithUserContext(page, lehrerOrganisation, lehrerRollenart, lehrerVorname, lehrerNachname, lehrerIdSP, lehrerRolle);
        username.push(userInfoLehrer.username);
        rolleId.push(userInfoLehrer.rolleId);
        lehrerBenutzername = userInfoLehrer.username;

        await header.logout();
        await landing.button_Anmelden.click();
        await login.login(userInfoAdmin.username, userInfoAdmin.password);
        await login.UpdatePW();
        await expect(startseite.text_h2_Ueberschrift).toBeVisible();
    })

    await test.step(`Die Gesamtübersicht des Lehrers öffnen`, async () => {
        await gotoTargetURL(page, "admin/personen");
        await personManagementView.input_Suchfeld.fill(lehrerBenutzername);
        await personManagementView.button_Suchen.click();
        await page.getByRole("cell", {name: lehrerBenutzername, exact: true}).click();
    });

    await test.step(`Eine zweite Schulzuordnung hinzufügen`, async () => {
        await PersonDetailsView.button_editSchulzuordnung.click();
        await PersonDetailsView.button_addSchulzuordnung.click();
        expect(await PersonDetailsView.combobox_organisation.innerText()).toContain(adminOrganisation);
        await PersonDetailsView.combobox_rolle.click();
        await page.getByText(rolle, {exact: true}).click();
        await PersonDetailsView.input_kopersNr.fill(kopersNr);
        await PersonDetailsView.button_submitAddSchulzuordnung.click();
        await PersonDetailsView.button_confirmAddSchulzuordnung.click();
        await PersonDetailsView.button_saveAssignmentChanges.click();
        await PersonDetailsView.button_closeSaveAssignmentChanges.click();
    });

    await test.step(`In der Gesamtübersicht die neue Schulzuordnung prüfen`, async () => {
        await expect(page.getByTestId('person-details-card')).toContainText('1111165 (Testschule-PW665): LiV (befristet bis');
        await expect(page.getByTestId('person-details-card')).toContainText('1111165 (Testschule-PW665): ' + lehrerRolle);
        });
    })

    test("Einen Benutzer über das FE unbefristet sperren @long @stage", {tag: [LONG, STAGE]}, async ({ page }) => {
        let userInfoLehrer: UserInfo;
        const sperrDatumAb = await generateDateToday() // Konkrete Testdaten für diesen Testfall

        await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und SP(email) über die api anlegen ${ADMIN}`, async () => {
          userInfoLehrer = await createRolleAndPersonWithUserContext(page, testschule, typelehrer, await generateLehrerNachname(), await generateLehrerVorname(), await getSPId(page, email), await generateRolleName());
          username.push(userInfoLehrer.username);
          rolleId.push(userInfoLehrer.rolleId);
        })

        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        const personDetailsView: PersonDetailsViewPage = await test.step(`Zu sperrenden Lehrer suchen und Gesamtübersicht öffnen`, async () => {
          await gotoTargetURL(page, "admin/personen"); // Die Navigation ist nicht Bestandteil des Tests
          await personManagementView.searchBySuchfeld(userInfoLehrer.username);
          return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username); // Klick auf den Benutzernamen
        })

        await test.step(`Lehrer sperren und anschließend prüfen, dass die Sperre gesetzt ist`, async () => {
          await personDetailsView.lockUserWithoutDate();
          await personDetailsView.checkUserIslocked(); // Das Icon und der Text für die Sperre muss angezeigt werden
          await personDetailsView.checkLockDateFrom(sperrDatumAb); // Der Benutzer muss ab heute gesperrt sein
        })
    })

    test("Einen Benutzer über das FE befristet sperren @long @stage", {tag: [LONG, STAGE]}, async ({ page }) => {
        let userInfoLehrer: UserInfo;
        const sperrDatumAb = await generateDateToday() // Konkrete Testdaten für diesen Testfall
        const sperrDatumBis = await generateDateFuture(5, 2); // Konkrete Testdaten für diesen Testfall

        await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und SP(email) über die api anlegen ${ADMIN}`, async () => {
            userInfoLehrer = await createRolleAndPersonWithUserContext(page, testschule, typelehrer, await generateLehrerNachname(), await generateLehrerVorname(), await getSPId(page, email), await generateRolleName());
            username.push(userInfoLehrer.username);
            rolleId.push(userInfoLehrer.rolleId);
        })

        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        const personDetailsView: PersonDetailsViewPage = await test.step(`Zu sperrenden Lehrer suchen und Gesamtübersicht öffnen`, async () => {
            await gotoTargetURL(page, "admin/personen"); // Die Navigation ist nicht Bestandteil des Tests
            await personManagementView.searchBySuchfeld(userInfoLehrer.username);
            return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username); // Klick auf den Benutzernamen
        })

        await test.step(`Lehrer sperren und anschließend prüfen, dass die Sperre gesetzt ist`, async () => {
            await personDetailsView.lockUserWithDate(sperrDatumBis);
            await personDetailsView.checkUserIslocked(); // Das Icon und der Text für die Sperre muss angezeigt werden
            await personDetailsView.checkLockDateFrom(sperrDatumAb); // Der Benutzer muss ab heute gesperrt sein
            await personDetailsView.checkLockDateTo(sperrDatumBis); // Der Benutzer muss gesperrt sein bis zun dem eingegebenen Datum
        })
    })
});