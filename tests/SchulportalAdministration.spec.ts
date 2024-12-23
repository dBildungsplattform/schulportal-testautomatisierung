import { expect, test } from "@playwright/test";
import { LandingPage } from "../pages/LandingView.page";
import { StartPage } from "../pages/StartView.page";
import { LoginPage } from "../pages/LoginView.page";
import { HeaderPage } from "../pages/Header.page";
import { getSPId } from "../base/api/testHelperServiceprovider.page";
import { createRolleAndPersonWithUserContext } from "../base/api/testHelperPerson.page";
import { addSystemrechtToRolle } from "../base/api/testHelperRolle.page";
import { UserInfo } from "../base/api/testHelper.page";
import { LONG, SHORT, STAGE } from "../base/tags";
import { deletePersonById, deleteRolleById } from "../base/testHelperDeleteTestdata";
import { generateNachname, generateRolleName, generateVorname } from "../base/testHelperGenerateTestdataNames";

const PW: string | undefined = process.env.PW;
const ADMIN: string | undefined = process.env.USER;

let personId: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht
let rolleId: string[] = []; // Im afterEach Block werden alle Testdaten gelöscht

test.describe(`Testfälle für Schulportal Administration": Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
    test.afterEach(async ({ page }) => {
        const header = new HeaderPage(page);
        const landing: LandingPage = new LandingPage(page);
        const login: LoginPage = new LoginPage(page);

        await test.step(`Testdaten löschen via API`, async () => {
            if (personId) { // nur wenn der Testfall auch mind. einen Benutzer angelegt hat
                await header.logout();
                await landing.button_Anmelden.click();
                await login.login(ADMIN, PW);
                
                await deletePersonById(personId, page);
                personId = [];
            }
    
            if (rolleId) { // nur wenn der Testfall auch mind. eine Rolle angelegt hat
                await header.logout();
                await landing.button_Anmelden.click();
                await login.login(ADMIN, PW);
                
                await deleteRolleById(rolleId, page);
                rolleId = [];
            }
        });

        await test.step(`Abmelden`, async () => {
          const header = new HeaderPage(page);
          await header.logout();
        });
      });

    test("Prüfen, dass die Schulportal-Administration Kachel nicht sichtbar ist für Lehrkräfte", {tag: [LONG, STAGE]}, async ({page}) => {
        const landing: LandingPage = new LandingPage(page);
        const login: LoginPage = new LoginPage(page);
        const header = new HeaderPage(page);

        // Testdaten erstellen
        await page.goto('/');
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);

        const idSPs: Array<string> = [await getSPId(page, 'E-Mail')];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(page, 'Testschule Schulportal', 'LEHR', await generateNachname(), await generateVorname(), idSPs, await generateRolleName());
        personId.push(userInfo.personId); 
        rolleId.push(userInfo.rolleId);
        await header.logout();

        // Test durchführen
        await landing.button_Anmelden.click();
        await login.login(userInfo.username, userInfo.password);
        await login.UpdatePW();
        const startseite: StartPage = new StartPage(page);
        await test.step(`Prüfen, dass die Kachel E-Mail angezeigt wird und die Kachel Schulportal-Administration nicht angezeigt wird`, async () => {
            await expect(startseite.card_item_schulportal_administration).toBeHidden();
            await expect(startseite.card_item_email).toBeVisible();
        });
    });

    test("Prüfen, dass die Schulportal-Administration Kachel nicht sichtbar ist für Schüler", {tag: [LONG, SHORT, STAGE]}, async ({page}) => {
        const landing: LandingPage = new LandingPage(page);
        const login: LoginPage = new LoginPage(page);
        const header = new HeaderPage(page);

        // Testdaten erstellen
        await page.goto('/');
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);

        const idSPs: Array<string> = [await getSPId(page, 'itslearning')];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(page, 'Testschule Schulportal', 'LERN', await generateNachname(), await generateVorname(), idSPs, await generateRolleName());
        personId.push(userInfo.personId); 
        rolleId.push(userInfo.rolleId);
        await header.logout();

        // Test durchführen
        await landing.button_Anmelden.click();
        await login.login(userInfo.username, userInfo.password);
        await login.UpdatePW();
        const startseite: StartPage = new StartPage(page);
        await test.step(`Prüfen, dass die Kachel E-Mail angezeigt wird und die Kachel Schulportal-Administration nicht angezeigt wird`, async () => {
            await expect(startseite.card_item_schulportal_administration).toBeHidden();
            await expect(startseite.card_item_itslearning).toBeVisible();
        });
    });

    test("Prüfen, dass die Schulportal-Administration Kachel sichtbar ist für Schuladmins", {tag: [LONG, STAGE]}, async ({page}) => {
        const landing: LandingPage = new LandingPage(page);
        const login: LoginPage = new LoginPage(page);
        const header = new HeaderPage(page);

        // Testdaten erstellen
        await page.goto('/');
        await landing.button_Anmelden.click();
        await login.login(ADMIN, PW);

        const idSPs: Array<string> = [await getSPId(page, 'Schulportal-Administration')];
        const userInfo: UserInfo = await createRolleAndPersonWithUserContext(page, 'Testschule Schulportal', 'LEIT', await generateNachname(), await generateVorname(), idSPs, await generateRolleName());
        personId.push(userInfo.personId); 
        rolleId.push(userInfo.rolleId);

        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN');
        await header.logout();

        // Test durchführen
        await landing.button_Anmelden.click();
        await login.login(userInfo.username, userInfo.password);
        await login.UpdatePW();
        const startseite: StartPage = new StartPage(page);
        await test.step(`Prüfen, dass die Kachel E-Mail nicht angezeigt wird und die Kachel Schulportal-Administration angezeigt wird`, async () => {
            await expect(startseite.card_item_schulportal_administration).toBeVisible();
            await expect(startseite.card_item_email).toBeHidden();
        });
    });
});