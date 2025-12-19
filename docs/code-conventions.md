# TLDR

- Code soll Typescript Best Practices folgen
- Frontend-Views werden als Pages abgebildet
- Funktionslogik (Actions und Assertions) als Methoden in Pages
- Navigation sollte über Pages laufen und die `waitForPageLoad()`-Funktion sollte aufgerufen werden
- Testlogik (inkl. Aufruf der Page-Methoden) in Tests
- Alle definierten Variablen in Pages sind mit private readonly deklariert und werden nur in den lokalen Methoden benutzt
- API-Funktionen werden mit Hilfe einer generierten API und Playwright-Fetch-Wrapper implementiert
- Die API muss bei jeder Aktualisierung im Backend auch in Playwright aktualisiert werden

# Pages

Alle Variablen, die Lokatoren verwenden, sollen readonly sein und nur innerhalb der Page benutzt werden. Dadurch verringern wir den Wartungsaufwand bei Änderungen erheblich, da die Änderungen nur an einer Stelle erfolgen müssen.

Methoden, die Funktionslogik beinhalten, können public sein und in den Tests verwendet werden. Die Tests sollen nur so wenig Parameter wie möglich (aber so viele wie nötig) an die Page-Funktionen übergeben.

Die Namen der Locator-Variablen orientieren sich an den Benennungen der Test-Ids im Frontend.

Jede Page besitzt eine Methode waitForPageLoad(), die mindestens eine eindeutige Headline (oder ähnliches Element) der Seite überprüft und die Page anschließend zurückgibt.

# Testsuiten

Alle Testsuiten (Dateien) sind Use-Case bezogen. Eine Testsuite beinhaltet nur einen Use-Case. Ein Use-Case kann aus mehreren Testfällen bestehen.

Abzubildende Use Cases während des Refactorings

# Namensgebung

| Element             | Empfohlener Case     | Endung   | Beispiel                 | Besonderheit                                      |
| ------------------- | -------------------- | -------- | ------------------------ | ------------------------------------------------- |
| Pages               | PascalCase           | .page.ts | PersonImportView.page.ts | Übernahme des Dateinamens der View im Frontend    |
| Variablen           | camelCase            | -        | organisationAutocomplete |
| Konstanten          | SCREAMING_SNAKE_CASE | -        | FRONTEND_URL             |
| Methoden            | camelCase            | -        | waitForPageLoad()        |
| Testsuiten          | PascalCase           | .spec.ts | RolleAnlegen.spec.ts     | Testsuiten sind immer Use Case bezogen, siehe hie |
| Test Ids (Frontend) | kebab-case           | -        | person-creation-form     |

# Coding-Regeln

Linter immer ausführen vor dem Pushen `npm run lint`

# Tags

Mit Tags können wir die Ausführung der Tests gezielt steuern. So können beispielsweise Tests nur auf Stage oder nur auf Dev ausgeführt, je nachdem welche Drittsysteme oder andere Gegebenheiten berücksichtigt werden müssen. Die folgende Matrix zeigt, welche Tags vorhanden sind und welche Besonderheiten sie abdecken.

| Tag   | Grundfunktionen | LDAP | Drittsysteme | Login |
| ----- | --------------- | ---- | ------------ | ----- |
| dev   | x               | x    |              |       |
| stage | x               |      | x            |       |
| smoke |                 |      |              | x     |

# Refactoring (ab Juni 2025)

In einem Workshop am 26.6.25 wurde beschlossen, dass für die Stabilität der Playwright Tests ein Refactoring notwendig ist. Mehrere Wochen fehlschlagender Tests in Pull Requests und geplanten Workflows haben für Mehrarbeit und Frustration gesorgt, die durch das Refactoring zukünftig verhindert werden sollten. Das Refactoring wurde aufgeteilt in die folgenden Punkte:

## Pages

Jede Seite, die im Frontend des Schulportals vorhanden ist, wurde in einem eigenen Page-Objekt in Playwright abgebildet.

Alle Funktionen, die eine Seite bietet, wurden identifiziert und als Methoden in den Pages implementiert. Dabei sollen so wenig Parameter wie möglich vom Test an die Pages übergeben werden. Das stellt sicher, dass die Funktionslogik hauptsächlich durch die Pages abgedeckt ist und die Tests auf die Testlogik reduziert werden können.

Am Ende sollen im Idealfall keine public Variablen mehr in den Pages vorhanden sein.

Um den Scope des Refactorings zu gewährleisten, wurden vorerst nur die bereits in Playwright implementierten Funktionen hinzugefügt. Alle neuen Funktionen werden in weiteren Tickets nachträglich ergänzt.

## Tests

Nach dem Refactoring sollen alle Tests um einiges schlanker sein, da die Funktionslogik in die Pages verlagert wurde. In den Tests werden benötigte Variablen definiert und die Funktionen der Pages aufgerufen, an die die Variablen übergeben werden. Durch diesen Schritt werden alle Tests lesbarer und übersichtlicher.

Abzubildende Use Cases während des Refactorings

## API

Für die Erhaltung der Stabilität und Wartbarkeit der automatisierten Tests wurden auch die API-Calls in eigenen Klassen definiert. Es gibt einmal die von uns erstellten API-Klassen, bspw. base/api/personApi.ts (selbst vergebener Name, Modelname im Singular), in denen wir die Methoden zur Verwendung in Pages und Tests definieren. Dort benutzen wir die zugehörige generierte API-Klasse, bspw. base/api/generated/personenApi.ts (Name aus der API vom Backend vergeben). Diese wird aus dem Swagger Doc der Backend-API generiert.

Vor dem Refactoring gab es Helper-Klassen, die sowohl Funktionslogik, als auch API-Logik beinhaltet haben. Diese wurden durch das Refactoring getrennt, so dass die API-Klassen nur noch API-Logik beinhalten.

Bei jeder Änderung der API im Backend-Repo muss die API auch in Playwright neu generiert werden. Der Befehl dazu lautet im Playwright-Repo `npm run generate-api`.

## Workflows

Die bestehenden Workflows in den Github Actions sind historisch gewachsen und größtenteils unverständlich. Mit dem Refactoring wurden die Workflows reduziert und parametrisierbar gemacht. Es gibt nun einen Workflow, der sich um die Ausführung kümmert und Parameter für Umgebung, Browser und Testumfang (Tags) entgegennimmt. Damit ist es möglich, jede mögliche Kombination von Parametern manuell und geplant auszuführen.

# Beispiele

```typescript
import ....

export class LoginViewPage {
  // Alle global in der Page verwendeten Variablen (z.B. wenn Variablen in mehreren Methoden benötigt werden) werden hier auf oberster Ebene definiert.
  // Alle Variablen, die nur lokal in den Methoden verwendet werden, werden auch nur lokal definiert.
  /* add global locators here */

  // protected readonly sorgt dafür, dass this.page verfügbar ist
  constructor(protected readonly page: Page) {}

  // Wir trennen zwischen Actions und Assertions
  // Actions sind alle Funktionen, die eine Page bereitstellt
  /* actions */
  // Jede Page benötigt eine Methode waitForPageLoad(), die public ist und in Tests verwendet werden kann
  // Indem this zurückgegeben wird, können wir den aufrufenden Code etwas verschlanken
  public async waitForPageLoad(): Promise<LoginViewPage> {
    await this.page.getByTestId('login-page-title').waitFor({ state: 'visible' });
    await expect(this.page.getByTestId('login-page-title')).toHaveText('Anmeldung');
	return this;
  }

  // Alle Methoden, die nicht in Tests verwendet werden müssen, sind als private deklariert und werden nur innerhalb der Page aufgerufen
  private generateSecurePassword(): string {
    return generator.generate({ length: 8, numbers: true }) + '1Aa!';
  }

  // Public Methoden werden in Tests verwendet und haben meistens einen Rückgabewert
  // Der Rückgabewert kann in vielen Fällen eine weitere Page sein
  public async login(
    username: string = process.env.USER as string,
    password: string = process.env.PW as string
  ): Promise<StartViewPage> {
    // Wenn Lokatoren lokal mehrfach benutzt werden, sollten sie als Variable deklariert werden
    const usernameInput: Locator = this.page.getByTestId('username-input');
    const passwordInput: Locator = this.page.getByTestId('password-input');
    const loginButton: Locator = this.page.getByTestId('login-button');

    // Lokatoren, die nur einmalig benutzt werden, können direkt aufgerufen werden
    await expect(this.page.getByTestId('login-page-title')).toHaveText('Anmeldung');
    await expect(this.page.getByTestId('login-prompt-text')).toHaveText('Bitte geben Sie Ihre persönlichen Zugangsdaten ein.');

    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(username);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();
    return new StartViewPage(this.page);
  }

  // Assertions sind alle Methoden, die Überprüfungen von Page-Elementen oder -Verhalten dienen
  /* assertions */
  public async loginFailedWithWrongCredentials(): Promise<void> {
    const inputErrorSpan: Locator = this.page.getByTestId('input-error-message');

    await expect(inputErrorSpan).toBeVisible();
    await expect(inputErrorSpan).toHaveText('Ungültiger Benutzername oder Passwort.');
  }

  public async loginFailedWithLockedUser(): Promise<void> {
    const loginErrorSpan: Locator = this.page.getByTestId('login-error-message');

    await expect(loginErrorSpan).toBeVisible();
    await expect(loginErrorSpan).toHaveText('Ihr Benutzerkonto ist gesperrt. Bitte wenden Sie sich an Ihre schulischen Administratorinnen und Administratoren.');
  }
}
```

```typescript
import ....

// Globale Variablen für alle Tests in diesem Spec-File
const ADMIN: string | undefined = process.env.USER;
const PASSWORD: string | undefined = process.env.PW;

// Mit test.describe() werden einzelne Testsuites definiert.
// Ein Spec-File behandelt in unserem Projekt einen konkreten Anwendungsfall des Schulportals und kann mehrere Testsuites enthalten
test.describe(`Testfälle für den Login: Umgebung: ${process.env.ENV}: URL: ${process.env.FRONTEND_URL}:`, () => {
  // Lokale Variablen des Testfalls
  let landingPage: LandingViewPage;
  let loginPage: LoginViewPage;
  let header: HeaderPage;

  // Der beforeEach Hook einer Testsuite läuft vor jedem einzelnen Test und kann benötigte Ausgangssituationen herstellen
  // Z.B. für den Test benötigte Daten anlegen oder den Login durchführen etc.
  test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
    loginPage = await freshLoginPage(page);
    header = new HeaderPage(page);
  });

  // Ein konkreter Testfall wird mit test() ausgeführt
  // Im Idealfall sind die einzelnen Tests sehr schlank, da sie nur die einzelnen Schritte der Funktionslogik aus den Pages aufrufen
  // Hier werden bspw. nur 2 Methoden aufgerufen, loginPage.login() und startPage.serviceProvidersAreLoaded()
  test('Erfolgreicher Login', async () => {
    // In diesem Fall wird die StartPage bereits durch den Login zurückgegeben und muss deshalb nicht erneut beim waitForPageLoad gespeichert werden
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();
    await startPage.serviceProvidersAreLoaded();
  });

  // Tip: Zum Debugging eines einzelnen Tests kann es hilfreich sein, nur diesen Test mit Hilfe von test.only() auszuführen
  test.only('Fehlgeschlagener Login mit falschen Daten', async () => {
    await loginPage.login('anakin', 'obi-wan');
    await expect(loginPage.loginFailedWithWrongCredentials()).toBeTruthy();
  });

  // Tip: Sollte ein einzelner Test zu Problemen führen, kann er mit test.skip() geskippt werden
  // Das darf aber maximal eine Übergangslösung sein und ist eher zu vermeiden
  test.skip('Fehlgeschlagener Login mit gesperrtem Benutzer', async ({ page }: { page: Page }) => {
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();

    // Der gesperrte Nutzer wird nur in diesem Testfall benötigt und deshalb lokal angelegt
    /* create locked user */
    const testSchuleId: string = await getOrganisationId(page, testschuleName)
    const rolleName: string = await generateRolleName();
    const rolleId: string = await createRolle(page, 'LEHR', testSchuleId, rolleName);
    const userinfo: UserInfo = await createPerson(page, testSchuleId, rolleId)
    await lockPerson(page, userinfo.personId, testSchuleId);

    await header.logout();
    loginPage = await freshLoginPage(page);
    await loginPage.login(userinfo.username, userinfo.password);
    await expect(loginPage.loginFailedWithLockedUser()).toBeTruthy();
  });

  test('Erfolgreicher Logout', async () => {
    const startPage: StartViewPage = await loginPage.login(ADMIN, PASSWORD);
    await startPage.waitForPageLoad();

    await header.logout();
    await expect(landingPage.waitForPageLoad()).toBeTruthy();
  });
});
```
