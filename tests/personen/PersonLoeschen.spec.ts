import { PlaywrightTestArgs, test, expect } from '@playwright/test';
import { createRolleAndPersonWithPersonenkontext } from '../../base/api/personApi';
import { getServiceProviderId } from '../../base/api/serviceProviderApi';
import { generateNachname, generateVorname, generateRolleName } from '../../base/utils/generateTestdata';
import { RollenArt } from '../../base/api/rolleApi';
import { landSH } from '../../base/organisation';
import { PersonManagementViewPage } from '../../pages/admin/personen/PersonManagementView.neu.page';
import { PersonDetailsViewPage } from '../../pages/admin/personen/details/PersonDetailsView.neu.page';
import { HeaderPage } from '../../pages/components/Header.neu.page';

test.describe(`Testfälle für das Löschen von Benutzern: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
	let personManagementView: PersonManagementViewPage;
	let header: HeaderPage;
	let nachname: string;

	test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
		personManagementView = new PersonManagementViewPage(page);
		header = new HeaderPage(page);
	});

	test.afterEach(async ({ page }: PlaywrightTestArgs) => {
		await header.logout();
	});

	test('Einen Benutzer über das FE löschen', { tag: [LONG, SHORT, STAGE, DEV, BROWSER] }, async ({ page }: PlaywrightTestArgs) => {
		const vorname: string = generateVorname();
		nachname = generateNachname();
		const rolle: string = generateRolleName();
		const berechtigung: RollenArt = 'SYSADMIN';
		const idSPs: string[] = [await getServiceProviderId(page, 'Schulportal-Administration')];

		await test.step('Neuen Benutzer über die api anlegen', async () => {
			await createRolleAndPersonWithPersonenkontext(page, landSH, berechtigung, vorname, nachname, idSPs, rolle);
		});

		await test.step('Benutzer wieder löschen über das FE', async () => {
			await personManagementView.waitForPageLoad();
			await personManagementView.searchFilter.searchByText(nachname);
			const personDetailsView: PersonDetailsViewPage = await personManagementView.openGesamtuebersicht(nachname);
			await personDetailsView.deletePerson();
			await personManagementView.waitForPageLoad();
			await personManagementView.checkIfPersonNotExists(nachname);
		});
	});
});
