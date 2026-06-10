---
name: create-page-object
description: 'Erstellt ein neues Playwright Page-Object für eine Admin-Seite im Schulportal. Nutzt Playwright MCP zur Live-Inspektion der Zielseite (data-testid-Attribute, interaktive Elemente) und generiert danach die TypeScript-Datei nach den Projektkonventionen. Use when asked to create a new page object, add a page class, or implement a new page for the schulportal test automation project.'
---

# Create Page Object

Dieses Skill erstellt ein neues Playwright Page-Object für eine Admin-Seite des Schulportals. Es inspiziert die Zielseite per Playwright MCP live und generiert dann die TypeScript-Klasse nach den Projektkonventionen.

## Use When
- Ein neues Page-Object für eine Admin-Seite erstellt werden soll
- Eine neue Seite in den Test-Automatisierungsworkflow eingebunden werden soll
- Die `data-testid`-Attribute einer Seite unbekannt sind und per MCP ermittelt werden müssen

## Do Not Use When
- Nur eine bestehende Klasse erweitert oder umbenannt werden soll → verwende stattdessen [`extend-page-object`](../extend-page-object/SKILL.md)
- Kein Login-Zugang zur Zielseite vorhanden ist

## See Also
- [`extend-page-object`](../extend-page-object/SKILL.md) — Erweitert eine bestehende Page-Klasse um neue Locators und Methoden

---

## Projektkonventionen

### Dateinamenskonvention
| Typ | Muster | Beispiel |
|-----|--------|---------|
| Konvention | `<Name>.page.ts` | `PersonDetailsView.page.ts` |
| Standalone (kein extend) | `<Name>.ts` oder `<Name>.page.ts` | `SchulischeAngebotsverwaltungView.ts` |

### Ablageorte
```
pages/admin/personen/          ← Personen-Views
pages/admin/organisationen/    ← Schulen, Klassen
pages/admin/rollen/            ← Rollen-Views
pages/admin/service-provider/  ← Angebote / Service-Provider
pages/components/              ← Wiederverwendbare UI-Komponenten
```

### Klassenstruktur — mit AbstractAdminPage (Standard)
```ts
import { expect, Page } from '@playwright/test';
import { AbstractAdminPage } from '../AbstractAdmin.page';
import { MenuBarPage } from '../../components/MenuBar.page';
// ... weitere Imports

export class MyViewPage extends AbstractAdminPage {
  private readonly someLocator: Locator;
  public readonly menu: MenuBarPage;

  constructor(protected readonly page: Page) {
    super(page);
    this.someLocator = this.page.getByTestId('some-test-id');
    this.menu = new MenuBarPage(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<MyViewPage> {
    await expect(this.page.getByTestId('layout-card-headline')).toHaveText('...');
    return this;
  }

  /* assertions */
  public async assertSomething(): Promise<void> {
    await expect(this.someLocator).toBeVisible();
  }
}
```

### Klassenstruktur — Standalone (kein extends)
```ts
import { expect, Locator, Page } from '@playwright/test';
import { MenuBarPage } from '../../components/MenuBar.page';

export class MyViewPage {
  private readonly headline: Locator;
  public readonly menu: MenuBarPage;

  constructor(protected readonly page: Page) {
    this.headline = this.page.getByTestId('layout-card-headline');
    this.menu = new MenuBarPage(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<MyViewPage> {
    await expect(this.headline).toHaveText('...');
    return this;
  }
}
```

### Verfügbare Hilfsklassen
| Klasse | Import | Verwendung |
|--------|--------|-----------|
| `DataTable` | `../../components/DataTable.page` | Tabellen mit Sortierung, Paginierung, Zeilenauswahl |
| `Autocomplete` | `../../components/Autocomplete` | Such-/Filter-Dropdowns |
| `SearchFilter` | `../../components/SearchFilter` | Freitext-Suche |
| `MenuBarPage` | `../../components/MenuBar.page` | Navigationsmenü |
| `AbstractAdminPage` | `../AbstractAdmin.page` | Basisklasse für Admin-Views |

---

## Workflow

### Phase 1 — Eingaben sammeln

Folgende Informationen sind erforderlich, bevor mit der Implementierung begonnen wird:

| Information | Pflicht | Quelle |
|-------------|---------|--------|
| Klassenname der neuen Page | ✅ | Benutzer |
| Dateiname (`*.page.ts`) | ✅ | Benutzer |
| Ablageort im Projekt | ✅ | Benutzer |
| URL der Zielseite | ✅ | Benutzer |
| Welche Aktionen sollen abgebildet werden (read / edit / delete) | ✅ | Benutzer |
| Login-Credentials oder Test-User | ✅ | Benutzer / `global-setup.ts` |

> **Warte auf alle Pflicht-Informationen, bevor du mit Phase 2 beginnst.**

### Pflichtfrage — Klassentyp

**Stelle diese Frage explizit, bevor du mit dem Implement beginnst — auch wenn der Nutzer sie nicht von sich aus beantwortet hat:**

> „Soll die Klasse `extends AbstractAdminPage` verwenden (Standard für Admin-Views mit Header/Menu-Basisfunktionalität) oder soll sie eine **Standalone-Klasse** ohne Vererbung sein?"

Warte auf die Antwort. Fahre erst dann mit Phase 2 fort.

| Antwort | Klassendeklaration | `super(page)` im Konstruktor | `AbstractAdminPage`-Import |
|---------|-------------------|------------------------------|---------------------------|
| `extends AbstractAdminPage` | `export class XPage extends AbstractAdminPage` | ✅ ja | ✅ ja |
| Standalone | `export class XPage` | ❌ nein | ❌ nein |

---

### Phase 2 — MCP-Inspektion der Zielseite

Nutze Playwright MCP um die Live-Seite zu inspizieren.

1. **Browser öffnen** — Zur Login-Seite der Anwendung navigieren
2. **Einloggen** — Login-Workflow durchführen (Credentials aus `global-setup.ts` oder vom Benutzer)
3. **Zur Zielseite navigieren** — Die vom Benutzer angegebene URL aufrufen
4. **Snapshot erstellen** — `browser_snapshot` ausführen, um den DOM-Zustand zu erfassen
5. **`data-testid`-Attribute dokumentieren** — Alle relevanten testIds auflisten:
   - Headlines / Überschriften
   - Formularfelder und Labels
   - Buttons (Speichern, Abbrechen, Bearbeiten, Löschen)
   - Tabellen
   - Dropdowns / Autocomplete-Felder
   - Dialoge / Modals
6. **Interaktive Elemente bestimmen** — Unterscheiden zwischen:
   - Nur lesend (display-only)
   - Editierbar (Input, Select, Checkbox)
   - Aktionen auslösend (Button, Link)

**Erwartetes Ergebnis:** Eine Liste aller gefundenen `data-testid`-Werte mit ihrer Bedeutung.

---

### Phase 3 — Page-Object implementieren

Erstelle die TypeScript-Datei am angegebenen Ablageort.

#### 3.1 — Imports auswählen
Nur die tatsächlich benötigten Imports einfügen (kein Dead Code):
- `Page`, `Locator`, `expect` aus `@playwright/test`
- Hilfsklassen (`DataTable`, `Autocomplete`, etc.) nur wenn genutzt
- `AbstractAdminPage` nur bei `extends`-Variante

#### 3.2 — Klassendeklaration
```ts
export class <Name>Page {                   // Standalone
export class <Name>Page extends AbstractAdminPage {   // mit extends
```

#### 3.3 — Konstruktor
- Alle Locators als `private readonly`-Felder deklarieren
- `getByTestId(...)` für alle gefundenen testIds verwenden
- `MenuBarPage` als `public readonly menu` hinzufügen
- Bei Autocomplete-Feldern: `new Autocomplete(this.page, this.page.getByTestId('...'))`
- Bei Tabellen: `new DataTable(this.page, this.page.getByTestId('...'))`

#### 3.4 — Methoden implementieren

**Pflichtmethoden:**
```ts
public async waitForPageLoad(): Promise<MyViewPage> {
  // Warte auf mindestens eine charakteristische Headline oder ein Element
  // Best Practice: mindestens eine eindeutige Headline mit toHaveText() prüfen
  await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
  await expect(this.someCard).toBeVisible();
  await expect(this.headline).toContainText('...');
  return this;
}
```

**Read-Methoden** (wenn Daten nur angezeigt werden):
```ts
public async getFieldValue(): Promise<string> {
  return await this.someLocator.innerText();
}
```

**Edit-Methoden** (wenn Felder bearbeitbar sind):
```ts
public async editField(value: string): Promise<void> {
  await this.someInput.fill(value);
}
public async saveChanges(): Promise<void> {
  await this.saveButton.click();
}
```

**Assertion-Methoden** (`assert`-Präfix — gemäß best-practices.md):
```ts
public async assertPageIsVisible(): Promise<void> {
  await expect(this.headline).toBeVisible();
}
public async assertFieldValue(expected: string): Promise<void> {
  await expect(this.someLocator).toHaveText(expected);
}
```

#### 3.5 — Methodenblöcke kommentieren
```ts
/* actions */
// read- und edit-Methoden

/* assertions */
// assert-Methoden
```

---

### Phase 4 — Validierung

1. **TypeScript-Kompilierung prüfen:**
   ```bash
   npx tsc --noEmit
   ```
2. **Import-Pfade verifizieren** — Relative Pfade müssen korrekt sein
3. **Nochmal MCP-Check (optional)** — `waitForPageLoad()` auf der echten Seite ausführen und bestätigen, dass sie nicht wirft

---

## Referenz-Dateien im Projekt

| Datei | Pattern |
|-------|---------|
| [pages/admin/service-provider/ServiceProviderManagementBySchuleView.page.ts](../../../pages/admin/service-provider/ServiceProviderManagementBySchuleView.page.ts) | Standalone-Klasse mit Filter-Autocomplete |
| [pages/admin/service-provider/ServiceProviderManagementView.page.ts](../../../pages/admin/service-provider/ServiceProviderManagementView.page.ts) | extends AbstractAdminPage, DataTable |
| [pages/admin/personen/PersonManagementView.page.ts](../../../pages/admin/personen/PersonManagementView.page.ts) | Komplexes Beispiel: DataTable, Filter, Dialoge, Navigation zur Detailseite |
| [pages/admin/rollen/RolleDetailsView.page.ts](../../../pages/admin/rollen/RolleDetailsView.page.ts) | Detailseite mit Edit- und Delete-Aktionen |

---

## Beispiel-Output

Für die URL `https://main.dev.spsh.dbildungsplattform.de/admin/angebote/schulspezifisch/{id}?orga={orgaId}`:

**Datei:** `pages/admin/service-provider/ServiceProviderDetailsBySchuleView.page.ts`

```ts
import { expect, Locator, Page } from '@playwright/test';
import { MenuBarPage } from '../../components/MenuBar.page';

export class ServiceProviderDetailsBySchuleViewPage {
  // TODO: testIds per MCP-Inspektion ermitteln und hier einsetzen
  private readonly card: Locator;
  private readonly headline: Locator;
  public readonly menu: MenuBarPage;

  constructor(protected readonly page: Page) {
    this.card = this.page.getByTestId('service-provider-details-by-schule-card');
    this.headline = this.page.getByTestId('layout-card-headline');
    this.menu = new MenuBarPage(this.page);
  }

  /* actions */
  public async waitForPageLoad(): Promise<ServiceProviderDetailsBySchuleViewPage> {
    // Mindestens eine eindeutige Headline mit toHaveText() prüfen (Best Practice)
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.card).toBeVisible();
    await expect(this.headline).toContainText('Angebot bearbeiten');
    return this;
  }

  public async getName(): Promise<string> {
    return this.headline.innerText();
  }

  /* assertions */
  // Präfix "assert" gemäß best-practices.md
  public async assertPageIsVisible(): Promise<void> {
    await expect(this.page.getByTestId('admin-headline')).toHaveText('Administrationsbereich');
    await expect(this.card).toBeVisible();
    await expect(this.headline).toContainText('Angebot bearbeiten');
  }

  public async assertName(expected: string): Promise<void> {
    await expect(this.headline).toHaveText(expected);
  }
}
```
