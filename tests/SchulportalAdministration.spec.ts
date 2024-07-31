import {expect, test} from "@playwright/test";
import {LandingPage} from "../pages/LandingView.page";
import {StartPage} from "../pages/StartView.page";
import {LoginPage} from "../pages/LoginView.page";
import {HeaderPage} from "../pages/Header.page";
import {createBenutzerWithUserContext, UserInfo, getSPId, addSystemrechtToRolle, deletePersonen, deleteRolle } from "../base/testHelper.page";

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

test.describe(`Testfälle für Schulportal Administration": Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
    test.afterEach(async ({ page }) => {
        await test.step(`Abmelden`, async () => {
          const Header = new HeaderPage(page);
          await Header.button_logout.click();
        });
      });
    
    test("Prüfen, dass die Schulportal-Administration Kachel nicht sichtbar ist für Lehrkräfte", async ({page}) => {
        const Landing = new LandingPage(page);
        const Login = new LoginPage(page);
        const Header = new HeaderPage(page);

        // Testdaten erstellen
        await page.goto(FRONTEND_URL);          
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);

        const idSP = await getSPId(page, 'E-Mail');
        const userInfo: UserInfo = await createBenutzerWithUserContext(page, 'Testschule Schulportal', 'LEHR', 'TAuto-PW-B-MeierLehrer', 'TAuto-PW-B-Hans', idSP, 'TAuto-PW-R-RolleLehrer');
        await Header.button_logout.click();  

        // Test durchführen
        await Landing.button_Anmelden.click();
        await Login.login(userInfo.username, userInfo.password);
        await Login.UpdatePW();
        const Startseite = new StartPage(page);
        await test.step(`Prüfen, dass die Kachel E-Mail angezeigt wird und die Kachel Schulportal-Administration nicht angezeigt wird`, async () => {
            await expect(Startseite.card_item_schulportal_administration).toBeHidden();
            await expect(Startseite.card_item_email).toBeVisible();
        });
        await Header.button_logout.click();

        // Testdaten löschen
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);
        await deletePersonen(page, userInfo.personId);
        await deleteRolle(page, userInfo.rolleId);
    });

    test("Prüfen, dass die Schulportal-Administration Kachel nicht sichtbar ist für Schüler", async ({page}) => {
        const Landing = new LandingPage(page);
        const Login = new LoginPage(page);
        const Header = new HeaderPage(page);

        // Testdaten erstellen
        await page.goto(FRONTEND_URL);          
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);

        const idSP = await getSPId(page, 'itslearning');
        const userInfo: UserInfo = await createBenutzerWithUserContext(page, 'Testschule Schulportal', 'LERN', 'TAuto-PW-B-JansenSchüler', 'TAuto-PW-B-Helga', idSP, 'TAuto-PW-R-RolleSuS');
        await Header.button_logout.click();  

        // Test durchführen
        await Landing.button_Anmelden.click();
        await Login.login(userInfo.username, userInfo.password);
        await Login.UpdatePW();
        const Startseite = new StartPage(page);
        await test.step(`Prüfen, dass die Kachel E-Mail angezeigt wird und die Kachel Schulportal-Administration nicht angezeigt wird`, async () => {
            await expect(Startseite.card_item_schulportal_administration).toBeHidden();
            await expect(Startseite.card_item_itslearning).toBeVisible();
        });
        await Header.button_logout.click();

        // Testdaten löschen
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);
        await deletePersonen(page, userInfo.personId);
        await deleteRolle(page, userInfo.rolleId);
    });

    test("Prüfen, dass die Schulportal-Administration Kachel sichtbar ist für Schuladmins", async ({page}) => {
        const Landing = new LandingPage(page);
        const Login = new LoginPage(page);
        const Header = new HeaderPage(page);
        
        // Testdaten erstellen
        await page.goto(FRONTEND_URL);          
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);

        const idSP = await getSPId(page, 'Schulportal-Administration');
        const userInfo: UserInfo = await createBenutzerWithUserContext(page, 'Testschule Schulportal', 'LEIT', 'TAuto-PW-B-MeierAdmin', 'TAuto-PW-B-Peter', idSP, 'TAuto-PW-R-RolleSchuladmin');
        await addSystemrechtToRolle(page, userInfo.rolleId, 'PERSONEN_VERWALTEN'); 
        await Header.button_logout.click();     

        // Test durchführen
        await Landing.button_Anmelden.click();
        await Login.login(userInfo.username, userInfo.password);
        await Login.UpdatePW();
        const Startseite = new StartPage(page);
        await test.step(`Prüfen, dass die Kachel E-Mail nicht angezeigt wird und die Kachel Schulportal-Administration angezeigt wird`, async () => {
            await expect(Startseite.card_item_schulportal_administration).toBeVisible();
            await expect(Startseite.card_item_email).toBeHidden();
        });
        await Header.button_logout.click();

        // Testdaten löschen
        await Landing.button_Anmelden.click();
        await Login.login(ADMIN, PW);
        await deletePersonen(page, userInfo.personId);
        await deleteRolle(page, userInfo.rolleId);
    }); 
});