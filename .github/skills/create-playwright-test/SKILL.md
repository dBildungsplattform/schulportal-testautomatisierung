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

Alle Funktionen liegen in `base/api/personApi.ts`:

| Funktion | Zweck |
|---|---|
| `createPersonWithPersonenkontext` | Person mit einer Org + Rolle anlegen |
| `createRolleAndPersonWithPersonenkontext` | Rolle + Person + Personenkontext in einem Schritt (inkl. Klasse) |
| `createPersonWithZweiKlassenKontexte` | Person mit Schule + 2 Klassen in einem CREATE |
| `addSecondOrganisationToPerson` | Zweite Org/Klasse per COMMIT hinzufügen (Achtung: Versionierung!) |
| `deletePerson` | Person löschen (Cleanup) |

Weitere Helpers:
- `base/api/organisationApi.ts`: `createSchule`, `createKlasse`, `getKlasseId`, `getOrganisationId`
- `base/api/rolleApi.ts`: `createRolle`, `getRolleId`, `addServiceProvidersToRolle`
- `base/api/serviceProviderApi.ts`: `getServiceProviderId`
- `tests/helpers/`: Spezialisierte Helper für komplexere Szenarien

---

## Workflow

### Phase 1 — Eingaben sammeln

| Information | Pflicht | Quelle |
|---|---|---|
| Use-Case-Beschreibung oder Testschritte | ✅ | Benutzer / CSV / Ticket |
| Welche Rolle agiert (Landesadmin, Schuladmin, ...) | ✅ | Benutzer |
| Welche Testdaten benötigt werden | ✅ | Aus Testschritten ableiten |
| Dateiname der `.spec.ts` | ✅ | Benutzer oder aus Use-Case ableiten |
| Tags (DEV, STAGE) | ⚪ | Benutzer |

### Phase 2 — Benötigte Page-Objects und API-Funktionen identifizieren

1. Testschritte durchgehen und ermitteln:
   - Welche Pages werden navigiert?
   - Welche API-Funktionen für Testdaten-Setup benötigt?
   - Welche Assertions werden geprüft?
2. Prüfen, ob die benötigten Page-Objects und API-Funktionen existieren
3. Falls nicht vorhanden → erst Page-Object erstellen (Skill `create-page-object`) oder API-Funktion ergänzen

### Phase 3 — Test implementieren

#### 3.1 — Datei anlegen

Ablageort: `tests/<bereich>/` (z.B. `tests/personen/`, `tests/rollen/`, `tests/schulen/`)

#### 3.2 — Grundstruktur

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

#### 3.3 — Testdaten-Setup

- **Immer API-basiert**, nicht über die UI
- Bei Schülern **immer Schule + Klasse** zusammen anlegen (Constraint `LERN_NOT_AT_SCHULE_AND_KLASSE`)
- Bei Multi-Klasse-Szenarien: `createPersonWithZweiKlassenKontexte` statt CREATE+COMMIT
- Testdaten generieren mit Funktionen aus `base/utils/generateTestdata.ts`: `generateNachname()`, `generateVorname()`, `generateSchulname()`, `generateKlassenname()`, `generateRolleName()`, `generateDienststellenNr()`

#### 3.4 — Testlogik

- Aktionen über Page-Methoden aufrufen, keine direkten Locator-Zugriffe
- Navigation über `waitForPageLoad()`-Ketten
- `test.step()` für fachliche Hauptphasen

#### 3.5 — Cleanup

- Erstellte Personen mit `deletePerson()` aufräumen
- In `afterEach` oder am Ende des Tests

### Phase 4 — Validierung

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