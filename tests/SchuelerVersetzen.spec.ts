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
import { deletePersonenBySearchStrings, deleteRolleById, deleteKlasseById } from "../base/testHelperDeleteTestdata.ts";
import { typelehrer, typeSchueler, typeSchuladmin} from "../base/rollentypen.ts";
import { testschule, testschule665 } from "../base/organisation.ts";
import { email , itslearning, schulportaladmin} from "../base/sp.ts";
import { generateNachname, generateVorname, generateRolleName, generateKopersNr, generateKlassenname } from "../base/testHelperGenerateTestdataNames.ts";
import { generateDateFuture, generateDateToday, gotoTargetURL } from "../base/testHelperUtils.ts";
import { createKlasse, getOrganisationId } from "../base/api/testHelperOrganisation.page.ts";
import { get } from "http";

const PW = process.env.PW;
const ADMIN = process.env.USER;

let username: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
let rolleId: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
let klasseId: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht


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
            await header.logout();
            await landing.button_Anmelden.click();
            await login.login(ADMIN, PW);
            await expect(startseite.text_h2_Ueberschrift).toBeVisible();

            if (username) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
                await deletePersonenBySearchStrings(page, username);
                username = [];
            }

            if (rolleId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
                await deleteRolleById(page, rolleId);
                rolleId = [];
            }

            if (klasseId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
                await deleteKlasseById(page, klasseId);
                klasseId = [];
            }
        });

        await test.step(`Abmelden`, async () => {
            const header = new HeaderPage(page);
            await header.logout();
        });
    });

    test("In der Rolle Schuladmin einen Schüler in eine andere Klasse versetzen", {tag: [LONG]}, async ({ page }) => {
        let userInfoSchuladmin: UserInfo;
        let userInfoSchueler: UserInfo;
        let klasseId1: string;
        let klasseId2: string;

        await test.step(`Testdaten: Schuladmin, Schüler und 2 Klassen über die api anlegen, sowie Klasse1 dem Schüler zuordnen ${ADMIN}`, async () => {
            // Schuladmin anlegen
            userInfoSchuladmin = await createRolleAndPersonWithUserContext(page, testschule665, typeSchuladmin, await generateVorname(), await generateNachname(), [await getSPId(page, schulportaladmin)], await generateRolleName());
            await addSystemrechtToRolle(page, userInfoSchuladmin.rolleId, 'PERSONEN_VERWALTEN');
            username.push(userInfoSchuladmin.username);
            rolleId.push(userInfoSchuladmin.rolleId);

            // Klassen anlegen
            klasseId1 = await createKlasse(page, await getOrganisationId(page, testschule665), await getOrganisationId(page, testschule665), await generateKlassenname());
            klasseId.push(klasseId1);
            klasseId2 = await createKlasse(page, await getOrganisationId(page, testschule665), await getOrganisationId(page, testschule665), await generateKlassenname());
            klasseId.push(klasseId2);


            await page.pause();

            // Schüler
            // userInfoSchueler = await createRolleAndPersonWithUserContext(page, testschule665, typeSchueler, await generateVorname(), await generateNachname(), [await getSPId(page, schulportaladmin)], await generateRolleName());
            // await addSystemrechtToRolle(page, userInfoSchuladmin.rolleId, 'PERSONEN_VERWALTEN');
            // username.push(userInfoSchuladmin.username);
            // rolleId.push(userInfoSchuladmin.rolleId);
        })

        // const personManagementView: PersonManagementViewPage = new PersonManagementViewPage(page);

        // const personDetailsView: PersonDetailsViewPage = await test.step(`Gesamtübersicht öffnen`, async () => {
        //     await gotoTargetURL(page, "admin/personen"); 
        //     await personManagementView.searchBySuchfeld(userInfoAdmin.username);
        //     return await personManagementView.openGesamtuebersichtPerson(page, userInfoAdmin.username);
        // })

        // await test.step(`2FA Status prüfen dass kein Token eingerichtet ist`, async () => {
        //     await expect(personDetailsView.text_h3_2FA).toBeVisible();
        //     await expect(personDetailsView.text_kein_token_ist_Eingerichtet).toBeVisible();
        // })
    })

    
});