import { expect, test } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page.ts";
import { LoginPage } from "../pages/LoginView.page.ts";
import { StartPage } from "../pages/StartView.page.ts";
import { PersonManagementViewPage } from "../pages/admin/PersonManagementView.page.ts";
import { PersonDetailsViewPage } from "../pages/admin/PersonDetailsView.page.ts";
import { HeaderPage } from "../pages/Header.page.ts";
import { createRolleAndPersonWithUserContext } from "../base/api/testHelperPerson.page.ts";
import { getSPId } from "../base/api/testHelperServiceprovider.page.ts";
import { UserInfo }  from "../base/api/testHelper.page.ts";
import { addSystemrechtToRolle } from "../base/api/testHelperRolle.page.ts";
import { LONG, STAGE } from "../base/tags.ts";
import { deletePersonenBySearchStrings, deleteRolleById } from "../base/testHelperDeleteTestdata.ts";
import { typelehrer , typeSchueler, typeSchuladmin } from "../base/rollentypen.ts";
import { testschule, testschule665 } from "../base/organisation.ts";
import { email , itslearning} from "../base/sp.ts";
import { generateNachname, generateVorname, generateRolleName, generateKopersNr } from "../base/testHelperGenerateTestdataNames.ts";
import { generateDateFuture, generateDateToday, gotoTargetURL } from "../base/testHelperUtils.ts";
import { lehrkraftOeffentlichRolle , lehrkraftInVertretungRolle} from "../base/rollen.ts";

const PW = process.env.PW;
const ADMIN = process.env.USER;

let username: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
let rolleId: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht

test.describe(`Testfälle für die Administration von Personen": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
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

    const addminVorname = await generateVorname();
    const adminNachname = await generateNachname();
    const adminRolle = await generateRolleName();
    const adminRollenart = typeSchuladmin;
    const adminOrganisation = 'Testschule-PW665';
    const adminIdSPs: string[] = [await getSPId(page, 'Schulportal-Administration')];
    let userInfoAdmin: UserInfo;

    const lehrerVorname = await generateVorname();
    const lehrerNachname = await generateNachname();
    const lehrerRolle = await generateRolleName();
    const lehrerRollenart = typelehrer;
    const lehrerOrganisation = testschule665;
    
    let userInfoLehrer: UserInfo;
    let lehrerBenutzername = '';
    const rolle = lehrkraftInVertretungRolle;
    const kopersNr = await generateKopersNr();

    await test.step(`Einen Schuladmin und einen zu bearbeitenden Lehrer mit je einer einer Schulzuordnung(Schule ist an einer Position > 25 in der DB) über die api anlegen und mit diesem Schuladmin anmelden`, async () => {
        // Schuladmin
        userInfoAdmin = await createRolleAndPersonWithUserContext(page, adminOrganisation, adminRollenart, addminVorname, adminNachname, adminIdSPs, adminRolle);
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        username.push(userInfoAdmin.username);
        rolleId.push(userInfoAdmin.rolleId);

        // Lehrer
        userInfoLehrer = await createRolleAndPersonWithUserContext(page, lehrerOrganisation, lehrerRollenart, lehrerVorname, lehrerNachname, [await getSPId(page, 'E-Mail')], lehrerRolle);
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

    test("Befristung beim hinzufügen von Personenkontexten", { tag: [LONG] }, async ({ page }) => {
        let userInfoLehrer: UserInfo;
        const unbefristeteRolle = lehrkraftOeffentlichRolle;
        const befristeteRolle = lehrkraftInVertretungRolle;

        await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und SP(email) über die api anlegen ${ADMIN}`, async () => {
            userInfoLehrer = await createRolleAndPersonWithUserContext(page, testschule, typelehrer, await generateNachname(), await generateVorname(), [await getSPId(page, email)], await generateRolleName());
            username.push(userInfoLehrer.username);
            rolleId.push(userInfoLehrer.rolleId);
        })

        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        const personDetailsView: PersonDetailsViewPage = await test.step(`Zu testenden Lehrer suchen und Gesamtübersicht öffnen`, async () => {
            await gotoTargetURL(page, "admin/personen"); // Die Navigation ist nicht Bestandteil des Tests
            await personManagementView.searchBySuchfeld(userInfoLehrer.username);
            return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username); // Klick auf den Benutzernamen
        })

        await test.step(`Ansicht für neuen Personenkontext öffnen`, async () => {
            await personDetailsView.button_editSchulzuordnung.click();
            await personDetailsView.button_addSchulzuordnung.click();
            await personDetailsView.organisationen.selectByTitle('1111111 (Testschule Schulportal)');
        })
    
        await test.step(`Befristung bei ${unbefristeteRolle} und ${befristeteRolle} überprüfen`, async () => {
            await personDetailsView.rollen.selectByTitle(befristeteRolle);
            await expect(personDetailsView.button_befristetSchuljahresende).toBeChecked();
            await personDetailsView.rollen.selectByTitle(unbefristeteRolle);
            await expect(personDetailsView.button_befristungUnbefristet).toBeChecked();
        });
    })

    test("Einen Benutzer über das FE unbefristet sperren @long @stage", {tag: [LONG, STAGE]}, async ({ page }) => {
        let userInfoLehrer: UserInfo;
        const sperrDatumAb = await generateDateToday() // Konkrete Testdaten für diesen Testfall

        await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) und SP(email) über die api anlegen ${ADMIN}`, async () => {
          userInfoLehrer = await createRolleAndPersonWithUserContext(page, testschule, typelehrer, await generateNachname(), await generateVorname(), [await getSPId(page, email)], await generateRolleName());
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
            userInfoLehrer = await createRolleAndPersonWithUserContext(page, testschule, typelehrer, await generateNachname(), await generateVorname(), [await getSPId(page, email)], await generateRolleName());
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

    test("Gesamtübersicht für einen Benutzer als Schueler öffnen und Unsichtbarkeit des 2FA Abschnitts prüfen", {tag: [LONG]}, async ({ page }) => {
        let userInfoLehrer: UserInfo;

        await test.step(`Testdaten: Schüler mit einer Rolle(LERN) über die api anlegen ${ADMIN}`, async () => {
            userInfoLehrer = await createRolleAndPersonWithUserContext(page, testschule, typeSchueler, await generateNachname(), await generateVorname(), [await getSPId(page, itslearning)], await generateRolleName());
            username.push(userInfoLehrer.username);
            rolleId.push(userInfoLehrer.rolleId);
        })

        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
            await gotoTargetURL(page, "admin/personen"); 
            await personManagementView.searchBySuchfeld(userInfoLehrer.username);
            return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
        })

        await test.step(`Gesamtübersicht Abschnitte prüfen`, async () => {
            await expect(personDetailsView.text_h2_benutzerBearbeiten).toHaveText('Benutzer bearbeiten');
            await expect(personDetailsView.text_h3_passwort_headline).toBeVisible();
            await expect(personDetailsView.text_h3_schulzuordnung_headline).toBeVisible();
            await expect(personDetailsView.text_h3_lockPerson_headline).toBeVisible();
        })

        await test.step(`Unsichtbarkeit des 2FA Abschnitts prüfen`, async () => {
            await expect(personDetailsView.text_h3_2FA).toBeHidden();
            await expect(personDetailsView.text_token_IstEingerichtet_info).toBeHidden();
            await expect(personDetailsView.text_neuen_token_einrichten_info).toBeHidden();
            await expect(personDetailsView.text_kein_token_ist_Eingerichtet).toBeHidden();
            await expect(personDetailsView.button_2FAEinrichten).toBeHidden();
        })
    })

    test("Gesamtübersicht für einen Benutzer als Lehrkraft öffnen und 2FA Status prüfen dass kein Token eingerichtet ist", {tag: [LONG]}, async ({ page }) => {
        let userInfoLehrer: UserInfo;

        await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen ${ADMIN}`, async () => {
            userInfoLehrer = await createRolleAndPersonWithUserContext(page, testschule, typelehrer, await generateNachname(), await generateVorname(), [await getSPId(page, email)], await generateRolleName());
            username.push(userInfoLehrer.username);
            rolleId.push(userInfoLehrer.rolleId);
        })

        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
            await gotoTargetURL(page, "admin/personen");
            await personManagementView.searchBySuchfeld(userInfoLehrer.username);
            return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
        })

        await test.step(`2FA Status prüfen dass kein Token eingerichtet ist`, async () => {
            await expect(personDetailsView.text_h3_2FA).toBeVisible();
            await expect(personDetailsView.text_kein_token_ist_Eingerichtet).toBeVisible();
        })
    })

    test("Gesamtübersicht für einen Benutzer als Schuladmin öffnen und 2FA Status prüfen dass kein Token eingerichtet ist", {tag: [LONG]}, async ({ page }) => {
        const addminVorname = await generateVorname();
        const adminNachname = await generateNachname();
        const adminRollenart = typeSchuladmin;
        const adminOrganisation = testschule665;
        let userInfoAdmin: UserInfo;

        await test.step(`Testdaten: Schuladmin mit einer Rolle(LEIT) über die api anlegen ${ADMIN}`, async () => {
            userInfoAdmin = await createRolleAndPersonWithUserContext(page, adminOrganisation, adminRollenart, addminVorname, adminNachname, [await getSPId(page, 'Schulportal-Administration')], await generateRolleName());
        await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
        username.push(userInfoAdmin.username);
        rolleId.push(userInfoAdmin.rolleId);
        })

        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
            await gotoTargetURL(page, "admin/personen"); 
            await personManagementView.searchBySuchfeld(userInfoAdmin.username);
            return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
        })

        await test.step(`2FA Status prüfen dass kein Token eingerichtet ist`, async () => {
            await expect(personDetailsView.text_h3_2FA).toBeVisible();
            await expect(personDetailsView.text_kein_token_ist_Eingerichtet).toBeVisible();
        })
    })

    test("Gesamtübersicht für einen Benutzer als Landesadmin öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist", {tag: [LONG]}, async ({ page }) => {
        const addminVorname = await generateVorname();
        const adminNachname = await generateNachname();
        const organisation = 'Land Schleswig-Holstein';
        const rollenart = 'SYSADMIN'

        let userInfoAdmin: UserInfo;

        await test.step(`Testdaten: Landesadmin mit einer Rolle(SYSADMIN) über die api anlegen ${ADMIN}`, async () => {
            userInfoAdmin = await createRolleAndPersonWithUserContext(page, organisation, rollenart, addminVorname, adminNachname, [await getSPId(page, 'Schulportal-Administration')], await generateRolleName());
            await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'ROLLEN_VERWALTEN');
            await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_SOFORT_LOESCHEN');
            await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
            await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'SCHULEN_VERWALTEN');
            await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'KLASSEN_VERWALTEN');
            await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'SCHULTRAEGER_VERWALTEN');
            await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_ANLEGEN');

            username.push(userInfoAdmin.username);
            rolleId.push(userInfoAdmin.rolleId);
        })

        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
            await gotoTargetURL(page, "admin/personen"); 
            await personManagementView.searchBySuchfeld(userInfoAdmin.username);
            return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
        })

        await test.step(`2FA Token einrichten`, async () => {
            await expect(personDetailsView.text_h3_2FA).toBeVisible();
            await personDetailsView.softwareTokenEinrichten();
        })

        await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
            await expect(personDetailsView.text_token_IstEingerichtet_info).toBeVisible();
            await expect(personDetailsView.text_neuen_token_einrichten_info).toBeVisible();
        })
    })

    test("Gesamtübersicht für einen Benutzer als Schuladmin öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist", {tag: [LONG]}, async ({ page }) => {
        const adminRollenart = typeSchuladmin;
        const adminOrganisation = testschule665;
        let userInfoAdmin: UserInfo;

        await test.step(`Testdaten: Schuladmin mit einer Rolle(LEIT) über die api anlegen ${ADMIN}`, async () => {
            userInfoAdmin = await createRolleAndPersonWithUserContext(page, adminOrganisation, adminRollenart, await generateNachname(), await generateVorname(), [await getSPId(page, 'Schulportal-Administration')], await generateRolleName());
            await addSystemrechtToRolle(page, userInfoAdmin.rolleId, 'PERSONEN_VERWALTEN');
            username.push(userInfoAdmin.username);
            rolleId.push(userInfoAdmin.rolleId);
        })

        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
            await gotoTargetURL(page, "admin/personen"); 
            await personManagementView.searchBySuchfeld(userInfoAdmin.username);
            return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
        })

        await test.step(`2FA Token einrichten`, async () => {
            await expect(personDetailsView.text_h3_2FA).toBeVisible();
            await personDetailsView.softwareTokenEinrichten();
        })

        await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
            await expect(personDetailsView.text_token_IstEingerichtet_info).toBeVisible();
            await expect(personDetailsView.text_neuen_token_einrichten_info).toBeVisible();
        })
    })

    test("Gesamtübersicht für einen Benutzer als Lehrkraft öffnen, 2FA Token einrichten und 2FA Status prüfen dass ein Token eingerichtet ist", {tag: [LONG]}, async ({ page }) => {
        let userInfoLehrer: UserInfo;

        await test.step(`Testdaten: Lehrer mit einer Rolle(LEHR) über die api anlegen ${ADMIN}`, async () => {
            userInfoLehrer = await createRolleAndPersonWithUserContext(page, testschule, typelehrer, await generateNachname(), await generateVorname(), [await getSPId(page, email)], await generateRolleName());
            username.push(userInfoLehrer.username);
            rolleId.push(userInfoLehrer.rolleId);
        })

        const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
            await gotoTargetURL(page, "admin/personen"); 
            await personManagementView.searchBySuchfeld(userInfoLehrer.username);
            return await personManagementView.openGesamtuebersichtPerson(page, userInfoLehrer.username);
        })

        await test.step(`2FA Token einrichten`, async () => {
            await expect(personDetailsView.text_h3_2FA).toBeVisible();
            await personDetailsView.softwareTokenEinrichten();
        })

        await test.step(`2FA Status prüfen dass ein Token eingerichtet ist`, async () => {
            await expect(personDetailsView.text_token_IstEingerichtet_info).toBeVisible();
            await expect(personDetailsView.text_neuen_token_einrichten_info).toBeVisible();
        })
    })
});