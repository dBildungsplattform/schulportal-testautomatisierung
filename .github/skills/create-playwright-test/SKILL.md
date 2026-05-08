---
name: create-playwright-test
description: "Erstellt einen neuen Playwright-Test (.spec.ts) für das Schulportal. Berücksichtigt Projektkonventionen, Page-Objects, API-basierte Testdatenerstellung und bekannte Backend-Constraints. Use when asked to create a new test, write a test, implement a test case, neuen Test schreiben, Testfall implementieren."
argument-hint: "Beschreibung des Testfalls oder Pfad zur CSV mit Testschritten"
---

# Create Playwright Test

Erstellt einen neuen Playwright-Test für das Schulportal nach den Projektkonventionen.

## Use When
- Ein neuer Playwright-Test (.spec.ts) geschrieben werden soll
- Testschritte aus einer CSV- oder Ticket-Beschreibung umgesetzt werden sollen

## Do Not Use When
- Ein bestehender Test repariert werden soll → verwende [`run-and-fix-test`](../run-and-fix-test/SKILL.md)
- Nur ein Page-Object erstellt werden soll → verwende [`create-page-object`](../create-page-object/SKILL.md)

## See Also
- [`run-and-fix-test`](../run-and-fix-test/SKILL.md) — Test ausführen und iterativ reparieren
- [`create-page-object`](../create-page-object/SKILL.md) — Neues Page-Object erstellen
- [`extend-page-object`](../extend-page-object/SKILL.md) — Bestehendes Page-Object erweitern
- [testdaten.md](../../../docs/testdaten.md) — Übersicht aller API-Wrapper, Generatoren und Cleanup-Helfer für Testdaten
- [best-practices.md](../../../docs/best-practices.md) — Coding-Konventionen
- [structure.md](../../../docs/structure.md) — Projektstruktur
- [tags.md](../../../docs/tags.md) — Tag-Konventionen

---

## Projektkonventionen (Kurzfassung)

Ausführlich in `docs/best-practices.md` und `docs/structure.md` beschrieben. Hier die wichtigsten Regeln:

- **Tests enthalten keine Funktionslogik** — Logik, Aktionen und Assertions gehören in Page-Objects
- **Locators nur in Pages** — Tests greifen ausschließlich auf Page-Methoden zu
- **Use-Case pro Datei** — Eine `.spec.ts` deckt genau einen Use-Case ab
- **Dateiname:** PascalCase, Endung `.spec.ts` (z.B. `RolleAnlegen.spec.ts`)
- **Describe-Blöcke:** kurz, fachlich, auf Deutsch
- **Tags:** alphabetisch sortiert: `{ tag: [DEV, STAGE] }`
- **`test.step()`:** nur für fachliche Hauptphasen, Step-Namen auf Deutsch
- **Assertions:** Präfix `assert` in Page-Methoden, Web-first Assertions bevorzugen

---

## API-basierte Testdatenerstellung — Bekannte Backend-Constraints

### Constraint: `LERN_NOT_AT_SCHULE_AND_KLASSE`

Schüler (LERN-Rollen / `typeSchueler`) können **nicht** nur mit einem Schulkontext erstellt werden. 
Sowohl der CREATE-Endpunkt als auch der COMMIT-Endpunkt erfordern **immer Schule + Klasse zusammen**.

**Falsch:**
```ts
// ❌ Erzeugt nur Schul-Kontext ohne Klasse → Fehler LERN_NOT_AT_SCHULE_AND_KLASSE
await createPersonWithPersonenkontext(page, organisationId, rolleId);
```

**Richtig:**
```ts
// ✅ Schul- und Klassen-Kontext werden zusammen übergeben
await createRolleAndPersonWithPersonenkontext(
  page, schuleName, typeSchueler,
  nachname, vorname,
  [serviceProviderId], rolleName,
  undefined, klasseId,  // ← klasseId muss gesetzt sein
);
```

### Constraint: `DUPLICATE_KLASSENKONTEXT_FOR_SAME_ROLLE` (nur COMMIT-Endpunkt)

Der COMMIT-Endpunkt (`PUT /api/personenkontext-workflow/:id`) lehnt Anfragen ab, bei denen ein Schüler mit der **gleichen Rolle** an **zwei verschiedenen Klassen** zugeordnet wird.

**Empfehlung:** Wenn ein Schüler an mehreren Klassen mit gleicher Rolle zugeordnet sein soll, **alle Kontexte im CREATE-Aufruf** anlegen statt CREATE + COMMIT:

```ts
// ✅ Alle Kontexte in einem einzigen CREATE-Aufruf anlegen
await createPersonWithZweiKlassenKontexte(
  page, schuleId, klasse1Id, klasse2Id,
  rolleId, rolleId,  // gleiche Rolle für beide Klassen
  nachname, vorname,
);
```

### Constraint: Optimistic Locking bei COMMIT (`count` und `lastModified`)

Der COMMIT-Endpunkt erwartet:
- `count`: die **aktuelle Anzahl** der bestehenden Personenkontexte der Person
- `lastModified`: den **exakten Server-Zeitstempel** der letzten Änderung

Falsche Werte führen zu `NEWER_VERSION_OF_PERSONENKONTEXTE_AVAILABLE` oder `COUNT_MISMATCHING`.

**Empfehlung:** Wo möglich, alle Kontexte direkt im CREATE anlegen statt CREATE + COMMIT. 
Falls COMMIT nötig ist, den `currentCount`-Parameter korrekt setzen:

```ts
// addSecondOrganisationToPerson hat einen optionalen currentCount-Parameter (default=1)
await addSecondOrganisationToPerson(
  page, personId, organisationId, rolleId,
  currentCount, // ← Anzahl der bestehenden Kontexte, NICHT die Ziel-Anzahl
);
```

### Zusammenfassung der Endpunkt-Unterschiede

| Verhalten | CREATE (`POST`) | COMMIT (`PUT`) |
|---|---|---|
| Schüler ohne Klasse | ❌ `LERN_NOT_AT_SCHULE_AND_KLASSE` | ❌ `LERN_NOT_AT_SCHULE_AND_KLASSE` |
| 2 Klassen, gleiche Rolle | ✅ erlaubt | ❌ `DUPLICATE_KLASSENKONTEXT_FOR_SAME_ROLLE` |
| Versionierung (`count`/`lastModified`) | nicht nötig | ✅ erforderlich |

---

## Verfügbare API-Funktionen für Testdatenerstellung

Vollständige Übersicht inkl. Signaturen, Beispielen und Entscheidungshilfe: [docs/testdaten.md](../../../docs/testdaten.md).

Kurzreferenz:

| Funktion | Zweck |
|---|---|
| `createPersonWithPersonenkontext` | Person an existierender Org + Rolle anlegen |
| `createRolleAndPersonWithPersonenkontext` | Rolle + Person + Personenkontext in einem Schritt (inkl. Klasse) |
| `createPersonWithZweiKlassenKontexte` | Person mit Schule + 2 Klassen in einem CREATE |
| `addSecondOrganisationToPerson` | Zweite Org/Klasse per COMMIT hinzufügen (Achtung: Versionierung!) |
| `createTeacherAndLogin` | Lehrkraft anlegen + direkt einloggen |
| `prepareAndLoginUserWithPermissions` | User mit definierten Systemrechten anlegen + einloggen ([tests/helpers/](../../../tests/helpers/prepareAndLoginUserWithPermissions.ts)) |
| `deletePerson` / `deletePersonenBySearchStrings` | Person(en) löschen (Cleanup) |
| `deleteRolleById` / `deleteRolleByName` | Rolle(n) löschen (Cleanup) |
| `deleteKlasseByName` | Klasse(n) löschen (Cleanup) |

Weitere Helpers:
- `base/api/organisationApi.ts`: `createSchule`, `createKlasse`, `getKlasseId`, `getOrganisationId`
- `base/api/rolleApi.ts`: `createRolle`, `getRolleId`, `addServiceProvidersToRolle`, `addSystemrechtToRolle` (sequentiell – optimistic locking)
- `base/api/serviceProviderApi.ts`: `getServiceProviderId`
- `base/testHelperDeleteTestdata.ts`: Bulk-Cleanup-Funktionen
- `tests/helpers/`: Spezialisierte Helper für komplexere Szenarien

---

## Workflow

### Phase 1 — Testbeschreibung einholen

Ohne Testbeschreibung **nicht starten**. Pflichtangaben:

| Information | Pflicht | Quelle |
|---|---|---|
| Use-Case-Beschreibung oder Testschritte | ✅ | Benutzer / CSV / Ticket |
| Welche Rolle agiert (Landesadmin, Schuladmin, …) | ✅ | Benutzer / Testschritte |
| Welche Testdaten benötigt werden | ✅ | Aus Testschritten ableiten |
| Tags (DEV, STAGE) | ⚪ | Benutzer (Default: `[DEV]`) |

Wenn die Beschreibung unklar ist → beim Benutzer nachfragen, **bevor** Page-Objects oder Tests erstellt werden.

### Phase 2 — Page-Objects und Locators prüfen

Aus den Testschritten ableiten, welche Pages und welche Methoden/Locators benötigt werden. Dann pro Page der Reihe nach prüfen:

1. **Existiert das Page-Object** unter `pages/` oder `pages/admin/<bereich>/`?
   - **Nein** → Skill [`create-page-object`](../create-page-object/SKILL.md) aufrufen, um die Page neu anzulegen. Erst danach hier weitermachen.
   - **Ja** → weiter zu Schritt 2.
2. **Sind alle benötigten Methoden/Locators in der Page vorhanden?**
   - **Nein** → Skill [`extend-page-object`](../extend-page-object/SKILL.md) aufrufen, um die fehlenden Methoden/Locators zu ergänzen. Erst danach hier weitermachen.
   - **Ja** → weiter zu Phase 3.
3. Analog: Prüfen, ob die benötigten **API-Funktionen** für das Testdaten-Setup in `base/api/` existieren. Wenn nicht, vor dem Test ergänzen (siehe [docs/testdaten.md](../../../docs/testdaten.md)).

> Diese Phase **niemals überspringen**. Tests sollen keine Locators direkt enthalten – fehlende Logik gehört zuerst in die Page-Objects.

### Phase 3 — Ablageort: bestehende `.spec.ts` wiederverwenden oder neu anlegen

Vor dem Schreiben prüfen, ob es bereits eine passende `.spec.ts` gibt, in der der neue Testfall ergänzt werden kann.

1. Unter `tests/<bereich>/` nach thematisch passenden Dateien suchen (z. B. `PersonAnlegen.spec.ts`, `KlasseBearbeiten.spec.ts`).
2. **Passende Datei vorhanden?**
   - **Ja** → neuen `test(...)`-Block in eine passende bestehende `test.describe`-Suite einfügen. Vorhandene `beforeEach`/`afterEach` wiederverwenden, soweit sie zum neuen Fall passen.
   - **Nein** → neue Datei `tests/<bereich>/<UseCase>.spec.ts` (PascalCase) anlegen.
3. **Vor dem Einfügen** prüfen, ob das vorhandene `beforeEach` bereits alle nötigen Testdaten anlegt:
   - Reicht das Setup aus → Test einfach ergänzen.
   - Es fehlen Testdaten → das `beforeEach` (oder ein eigenes inneres `test.describe` mit eigenem `beforeEach`) entsprechend erweitern. Alle neuen IDs/Usernames in die suite-lokalen Cleanup-Arrays aufnehmen, damit `afterEach` sie wieder aufräumt.

### Phase 4 — Test implementieren

#### 4.1 — Ablageort

`tests/<bereich>/` (z. B. `tests/personen/`, `tests/rollen/`, `tests/schulen/`).

#### 4.2 — Grundstruktur (bei neuer Datei)

Wenn eine bestehende Spec-Datei wiederverwendet wird, nur den `test(…)`-Block einfügen und ggf. das `beforeEach` erweitern – keine neue `test.describe`-Hülle bauen.

```ts
import test, { expect, PlaywrightTestArgs } from '@playwright/test';
// Imports für API-Funktionen, Pages, Testdaten-Generatoren, Tags...

test.describe(`<Fachlicher Use-Case Name>`, () => {
  test.describe(`Als <Rolle>`, () => {
    // Suite-lokale Variablen für Testdaten
    let someId: string;

    test.beforeEach(async ({ page }: PlaywrightTestArgs) => {
      // Login und Navigation
      // Testdaten via API anlegen
    });

    test.afterEach(async ({ page }: PlaywrightTestArgs) => {
      // Cleanup: Testdaten löschen
    });

    test(`Testfall-Beschreibung`, { tag: [DEV] }, async ({ page }: PlaywrightTestArgs) => {
      // Test-Schritte über Page-Methoden
    });
  });
});
```

#### 4.3 — Testdaten-Setup

- **Immer API-basiert**, nicht über die UI
- **Setup gehört in `beforeEach`** (oder in einen `test.step('Testdaten … anlegen')` ganz am Anfang des Tests) – nicht mitten im Testablauf
- Die Page muss vor API-Aufrufen eingeloggt sein (typisch: `loginAndNavigateToAdministration(page)` als Landesadmin), da die Wrapper über den Page-Cookie authentifizieren
- Bei Schülern **immer Schule + Klasse** zusammen anlegen (Constraint `LERN_NOT_AT_SCHULE_AND_KLASSE`)
- Bei Multi-Klasse-Szenarien: `createPersonWithZweiKlassenKontexte` statt CREATE+COMMIT
- Testdaten generieren mit Funktionen aus `base/utils/generateTestdata.ts`: `generateNachname()`, `generateVorname()`, `generateSchulname()`, `generateKlassenname()`, `generateRolleName()`, `generateDienststellenNr()`, `generateKopersNr()`. Alle Generatoren erzeugen Werte mit Präfix `TAuto-PW-…` für Wiedererkennbarkeit und Kollisionsfreiheit bei parallelen Tests.
- Schulen werden **nicht** angelegt – stattdessen die Konstanten aus [base/organisation.ts](../../../base/organisation.ts) verwenden (`testschuleName`, `testschule665Name`, `ersatzTestschuleName` …), da Schulen aktuell nicht gelöscht werden können.

#### 4.4 — Testlogik

- Aktionen über Page-Methoden aufrufen, keine direkten Locator-Zugriffe
- Navigation über `waitForPageLoad()`-Ketten
- `test.step()` für fachliche Hauptphasen

#### 4.5 — Cleanup

- Cleanup erfolgt im `afterEach` über die Bulk-Helfer aus [base/testHelperDeleteTestdata.ts](../../../base/testHelperDeleteTestdata.ts)
- Pattern mit suite-lokalen Arrays für angelegte IDs/Usernames:

```ts
let usernames: string[] = [];
let rolleIds: string[] = [];

test.afterEach(async ({ page }: PlaywrightTestArgs) => {
  if (usernames.length > 0) {
    await deletePersonenBySearchStrings(page, usernames);
    usernames = [];
  }
  if (rolleIds.length > 0) {
    await deleteRolleById(rolleIds, page);
    rolleIds = [];
  }
});
```

- Nach dem Anlegen via API: `usernames.push(userInfo.username)` bzw. `rolleIds.push(userInfo.rolleId)` für späteren Cleanup merken.

### Phase 5 — Validierung

1. TypeScript-Kompilierung:
   ```bash
   npx tsc --noEmit
   ```
2. Test ausführen:
   ```bash
   npx playwright test <testdatei> --reporter=list
   ```
3. Bei Fehlern → Skill `run-and-fix-test` verwenden

---

## Referenz-Dateien

| Datei | Pattern |
|---|---|
| `tests/personen/PersonAnlegen.spec.ts` | Standard-Test mit API-Setup, Landesadmin, Schuladmin |
| `tests/personen/PersonenRolleZuordnenMehrfachbearbeitung.spec.ts` | Komplexer Test mit Multi-Klasse-Szenarien, Fehlerfall-Tests |
| `tests/helpers/createKlassenAndSchuelerForSchulen.ts` | Helper für Massen-Testdatenerstellung |
| `tests/helpers/prepareAndLoginUserWithPermissions.ts` | Helper für Login mit spezifischen Berechtigungen |

---

## Bekannte Vuetify-Pitfalls bei Autocomplete/Dropdown-Interaktionen

### Problem: „Keine Daten gefunden." bei Dropdown-Öffnung

Vuetify-Autocomplete-Felder laden Daten oft erst per API-Call, wenn das Feld sichtbar/aktiv wird. Wenn der Test das Dropdown öffnet, bevor die API-Antwort da ist, zeigt es „Keine Daten gefunden." und `waitForData()` in der `Autocomplete`-Klasse schlägt fehl.

**Lösung:** Nach dem Öffnen des Dropdowns `waitUntilLoadingIsDone()` aufrufen, bevor auf Inhalte zugegriffen wird. Das wartet, bis der Lade-Spinner verschwindet.

### Problem: DOM-Detachment bei `pressSequentially`

`pressSequentially` tippt Zeichen für Zeichen. Jeder Tastendruck kann eine API-Suche triggern, die das DOM der Ergebnisliste neu rendert. Zwischen dem Finden des Elements und dem Klick wird das Element durch ein Re-Render aus dem DOM entfernt → `element was detached from the DOM, retrying` → Timeout.

**Lösung:** `click({ force: true })` verwenden, um Playwright's Stability-Check zu überspringen. Dies ist ein akzeptiertes Pattern im Projekt (siehe `Autocomplete.openModal()`).

### Problem: Stale Overlays – falsches Dropdown wird angesprochen

Vuetify hält vorherige Overlay-Elemente im DOM. Der globale Selektor `.v-overlay .v-list-item` matched auch Items aus bereits geschlossenen Dropdowns (Org, Rolle), die noch unsichtbar im DOM liegen.

**Lösung:** Nur das **aktive** Overlay ansprechen:
```ts
// ❌ Matched alle Overlays (inkl. stale)
this.page.locator('.v-overlay .v-list-item')

// ✅ Nur das aktive Overlay
this.page.locator('div.v-overlay--active').getByRole('option')
```

### Zusammenfassung: Robustes Pattern für Vuetify-Autocomplete-Auswahl

```ts
// 1. Input klicken und Text tippen (triggert API-Suche)
await selectLocator.locator('input').click();
await selectLocator.locator('input').pressSequentially(suchtext);

// 2. Warten bis Laden abgeschlossen
const autocomplete = new Autocomplete(this.page, selectLocator);
await autocomplete.waitUntilLoadingIsDone();

// 3. Nur im aktiven Overlay suchen, force-click wegen DOM-Instabilität
const option = this.page.locator('div.v-overlay--active')
  .getByRole('option')
  .filter({ hasText: suchtext });
await option.first().click({ force: true });
```