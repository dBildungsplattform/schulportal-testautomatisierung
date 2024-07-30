import {expect, Page, test} from "@playwright/test";
import {LandingPage} from "../pages/LandingView.page";
import {StartPage} from "../pages/StartView.page";
import {LoginPage} from "../pages/LoginView.page";
import {HeaderPage} from "../pages/Header.page";
import {createBenutzerWithUserContext, UserInfo, getSPId, addSystemrechtToRolle } from "../base/testHelper";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für Schulportal Administration": Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
    test("Checken, ob die Schulportal-Administration Kachel nicht sichtbar ist für Lehrkräfte", async ({page}) => {
        const Landing = new LandingPage(page);
        const Login = new LoginPage(page);

        // Testdaten erstellen
        const idSP = await getSPId(page, 'E-Mail');
        const userInfo: UserInfo = await createBenutzerWithUserContext(page, 'SchuleA', 'LEHR', 'MeierLehrer', 'Hans', idSP, 'RolleA');
        const Header = new HeaderPage(page);

        // Test durchführen
        await Landing.button_Anmelden.click();
        await Login.login(userInfo.username, userInfo.password);
        await Login.UpdatePW();
        const Startseite = new StartPage(page);
        await test.step(`Prüfen, dass die Kachel E-Mail angezeigt wird und die Kachel Schulportal-Administration nicht angezeigt wird`, async () => {
            await expect(Startseite.card_item_schulportal_administration).toBeHidden();
            await expect(Startseite.card_item_email).toBeVisible();
        });
        await page.pause();
    });

    test.only("Checken, ob die Schulportal-Administration Kachel sichtbar ist für Schuladmins", async ({page}) => {
        const Landing = new LandingPage(page);
        const Login = new LoginPage(page);

        // Testdaten erstellen
        const idSP = await getSPId(page, 'Schulportal-Administration');
        const userInfo: UserInfo = await createBenutzerWithUserContext(page, 'SchuleB', 'LEIT', 'MeierSchulAdmin', 'Peter', idSP, 'RolleB');
        const Header = new HeaderPage(page);

        await page.goto(FRONTEND_URL);
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN'); 
        await Header.button_logout.click();     

        // Test durchführen
        await Landing.button_Anmelden.click();
        await Login.login(userInfo.username, userInfo.password);
        await Login.UpdatePW();
        const Startseite = new StartPage(page);
        await test.step(`Prüfen, dass die Kachel E-Mail angezeigt wird und die Kachel Schulportal-Administration nicht angezeigt wird`, async () => {
            await expect(Startseite.card_item_schulportal_administration).toBeVisible();
            await expect(Startseite.card_item_email).toBeHidden();
        });

        // Testdaten erstellen löschen
        await Header.button_logout.click();
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);
         
        await page.pause();
    }); 
});

       

