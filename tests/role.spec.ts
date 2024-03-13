import { faker } from '@faker-js/faker/locale/de';
import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingView.page';
import { LoginPage } from '../pages/LoginView.page';
import { StartPage } from '../pages/StartView.page';
import { MenuPage } from '../pages/MenuBar.page';
import { RoleDetailsViewPage } from '../pages/admin/RoleDetailsView.page';
import { RoleManagementViewPage } from '../pages/admin/RoleManagementView.page';

const PW = process.env.PW;
const ADMIN = process.env.USER;
const FRONTEND_URL = process.env.FRONTEND_URL;

test.describe(`Testfälle für die Anlage von Rollen: Umgebung: ${process.env.UMGEBUNG}: URL: ${process.env.FRONTEND_URL}:`, () => {
  test('2 Rollen nacheinander anlegen', async ({ page }) => {
    const Landing = new LandingPage(page);
    const Startseite = new StartPage(page);
    const Login = new LoginPage(page);
    const Menue = new MenuPage(page);
    const RoleDetailsView = new RoleDetailsViewPage(page);
    const RoleManagementeView = new RoleManagementViewPage(page);

    const ROLLENNAME1 = 'TAutoR1_' + faker.word.noun();
    const ROLLENNAME2 = 'TAutoR2_' + faker.word.noun();
    const SCHULSTRUKTURKNOTEN1 = 'Organisation2 (Träger2)';
    const SCHULSTRUKTURKNOTEN2 = 'Organisation3 (Schule1)';
    const ROLLENART1 = 'Lern'
    const ROLLENART2 = 'Lehr'

    await test.step(`Annmelden mit Benutzer ${ADMIN}`, async () => {
      await page.goto(FRONTEND_URL);
      await Landing.button_Anmelden.click();
      await Login.login(ADMIN, PW); 
      await expect(Startseite.text_h2_Ueberschrift).toBeVisible();
    })
    
    await test.step(`Dialog Rolle anlegen öffnen`, async () => {
      await Startseite.card_item_schulportal_administration.click();
      await Menue.menueItem_RolleAnlegen.click();
      await expect(RoleDetailsView.text_h2_RolleAnlegen).toHaveText('Neue Rolle hinzufügen');
    })
    
    await test.step(`Erste Rolle anlegen`, async () => {
      await RoleDetailsView.combobox_Schulstrukturknoten.click();
      await page.getByText(`${SCHULSTRUKTURKNOTEN1}`).click();

      await RoleDetailsView.combobox_Rollenart.click();
      await page.getByText(`${ROLLENART1}`).click();

      await RoleDetailsView.input_Rollenname.click();
      await RoleDetailsView.input_Rollenname.fill(ROLLENNAME1);
      await RoleDetailsView.button_RolleAnlegen.click();
      await expect(RoleDetailsView.text_success).toBeVisible();
    })

    await test.step(`Zweite Rolle anlegen`, async () => {
      await RoleDetailsView.button_WeitereRolleAnlegen.click();
      await RoleDetailsView.combobox_Schulstrukturknoten.click();
      await page.getByText(`${SCHULSTRUKTURKNOTEN2}`).click();

      await RoleDetailsView.combobox_Rollenart.click();
      await page.getByText(`${ROLLENART2}`).click();

      await RoleDetailsView.input_Rollenname.click();
      await RoleDetailsView.input_Rollenname.fill(ROLLENNAME2);
      await RoleDetailsView.button_RolleAnlegen.click();
      await expect(RoleDetailsView.text_success).toBeVisible();
    })

    await test.step(`In der Ergebnisliste prüfen dass die beiden neuen Rollen angezeigt sind`, async () => {
      await Menue.menueItem_AlleRollenAnzeigen.click();
      await expect(RoleManagementeView.text_h2_RolleAnlegen).toHaveText('Rollenverwaltung');
      await expect(page.getByRole('cell', { name: `${ROLLENNAME1}` })).toBeVisible();
      await expect(page.getByRole('cell', { name: `${ROLLENNAME2}` })).toBeVisible();
    })
  })  
})