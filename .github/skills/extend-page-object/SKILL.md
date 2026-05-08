---
name: extend-page-object
description: 'Erweitert eine bestehende Playwright Page-Object-Klasse um neue Locators und Methoden für eine Admin-Seite im Schulportal. Liest die Bestandsdatei, inspiziert die Zielseite per Playwright MCP als Landesadmin und fügt neue Elemente korrekt und konfliktfrei ein. Use when asked to extend, update, or add methods to an existing page object class in the schulportal test automation project.'
---

# Extend Page Object

Dieser Skill erweitert eine bestehende Playwright Page-Object-Klasse um neue Locators und Methoden. Er analysiert zunächst die Bestandsdatei, inspiziert dann die Zielseite live per Playwright MCP und ergänzt anschließend die TypeScript-Klasse nach den Projektkonventionen — ohne bestehenden Code zu verändern.

## Use When
- Eine bestehende Page-Klasse um neue Methoden oder Locators erweitert werden soll
- Neue UI-Elemente in eine vorhandene Page eingebunden werden sollen
- Die `data-testid`-Attribute neuer Elemente unbekannt sind und per MCP ermittelt werden müssen

## Do Not Use When
- Eine komplett neue Page-Klasse erstellt werden soll → verwende stattdessen [`create-page-object`](../create-page-object/SKILL.md)
- Kein Login-Zugang zur Zielseite vorhanden ist

---

## Projektkonventionen

### Wichtigste Regeln (aus best-practices.md)
- Locators werden **bevorzugt methoden-lokal** deklariert — nur wenn ein Locator in mehreren Methoden genutzt wird, kommt er als `private readonly`-Feld in den Konstruktor
- **Niemals** bestehende Felder oder Methoden überschreiben
- Methoden mit `assert`-Präfix sind Assertions (`/* assertions */`-Block)
- Alle anderen aktiven Methoden gehören in den `/* actions */`-Block
- Tests greifen **niemals** direkt auf Locators zu, nur auf Page-Methoden

### Blockreihenfolge in einer Page-Klasse
```
1. Felder (private readonly Locators, Hilfsklassen)
2. constructor
3. /* actions */   ← read- und edit-Methoden, waitForPageLoad()
4. /* assertions */ ← Methoden mit assert-Präfix
```

---

## Workflow

### Phase 1 — Eingaben sammeln

Folgende Informationen sind erforderlich, bevor mit der Implementierung begonnen wird:

| Information | Pflicht | Quelle |
|-------------|---------|--------|
| Zieldatei (Pfad zur `.page.ts`-Datei) | ✅ | Benutzer |
| Was soll hinzugefügt werden? (Beschreibung neuer Aktionen / Assertions) | ✅ | Benutzer |
| URL der Zielseite | ✅ | Benutzer |
| Login-Credentials oder Test-User | ✅ | Benutzer / `global-setup.ts` |

> **Warte auf alle Pflicht-Informationen, bevor du mit Phase 2 beginnst.**

---

### Phase 2 — Bestandsanalyse der Zieldatei

Lese die angegebene Datei vollständig ein und erstelle eine strukturierte Übersicht:

#### 2.1 — Klassentyp ermitteln
| Klassendeklaration | Typ |
|--------------------|-----|
| `export class XPage extends AbstractAdminPage` | extends AbstractAdminPage |
| `export class XPage` | Standalone |

#### 2.2 — Bestehende Felder inventarisieren
Liste alle `private readonly`- und `public readonly`-Felder auf. Diese **dürfen nicht** durch neue Felder mit demselben Namen überschrieben werden.

#### 2.3 — Bestehende Methoden inventarisieren
Liste alle `public` und `private`-Methoden auf. Keine Methodennamen doppelt verwenden.

#### 2.4 — Bestehende Imports inventarisieren
Liste alle aktuellen Imports auf, damit nur wirklich fehlende hinzugefügt werden.

**Erwartetes Ergebnis:** Vollständige Liste der vorhandenen Felder, Methoden und Imports als Grundlage für den Konfliktcheck.

---

### Phase 3 — MCP-Inspektion der Zielseite

Inspiziere die Zielseite immer als **Landesadmin** — dieser sieht alle UI-Elemente unabhängig von Systemrechten.

1. **Browser öffnen** — Zur Login-Seite der Anwendung navigieren
2. **Einloggen** — Login-Workflow durchführen (Credentials aus `global-setup.ts` oder vom Benutzer)
3. **Zur Zielseite navigieren** — Die vom Benutzer angegebene URL aufrufen
4. **Snapshot erstellen** — `browser_snapshot` ausführen
5. **Neue `data-testid`-Attribute dokumentieren** — Nur Elemente, die für die gewünschte neue Funktionalität relevant sind und **noch nicht** in der Klasse vorhanden sind:
   - Buttons (neue Aktionen)
   - Formularfelder
   - Dialoge / Modals
   - Tabellen, Dropdowns, Autocomplete-Felder
6. **Interaktionstyp bestimmen** — Für jedes neue Element: lesend, editierbar oder Aktion auslösend?

**Erwartetes Ergebnis:** Liste aller neuen `data-testid`-Werte mit Bedeutung und Interaktionstyp.

---

### Phase 4 — Implementierung

Ergänze die bestehende Datei gezielt. Ändere **niemals** vorhandene Zeilen — nur Ergänzungen.

#### 4.1 — Imports ergänzen
Nur hinzufügen, was tatsächlich neu benötigt wird und noch nicht importiert ist:
- `Page`, `Locator`, `expect` aus `@playwright/test`
- Hilfsklassen (`DataTable`, `Autocomplete`, `SearchFilter` etc.) nur wenn neu genutzt

#### 4.2 — Neue Felder im Konstruktor ergänzen
Nur wenn ein Locator in **mehreren** neuen Methoden genutzt wird:
```ts
private readonly neuerButton: Locator;
// ...im constructor:
this.neuerButton = this.page.getByTestId('neuer-button-test-id');
```
Bei Autocomplete oder DataTable entsprechend:
```ts
private readonly neueAutocomplete: Autocomplete;
// ...im constructor:
this.neueAutocomplete = new Autocomplete(this.page, this.page.getByTestId('neue-autocomplete-test-id'));
```

#### 4.3 — Neue Methoden einfügen

**Im `/* actions */`-Block** — neue Aktionsmethoden:
```ts
public async neueAktion(param: string): Promise<void> {
  // Locator methoden-lokal wenn nur hier genutzt
  const locator: Locator = this.page.getByTestId('element-test-id');
  await locator.click();
}
```

**Im `/* assertions */`-Block** — neue Assertion-Methoden (`assert`-Präfix):
```ts
public async assertNeuesElementSichtbar(): Promise<void> {
  await expect(this.page.getByTestId('element-test-id')).toBeVisible();
}
```

**Best Practices für Assertions:**
```ts
// Web-first Assertions bevorzugen
await expect(locator).toBeVisible();           // ✅
await locator.waitFor(); expect(true).toBe(true); // ❌

// expect.soft() für nicht-kritische Mehrfachprüfungen
await expect.soft(locator).toHaveText('...');

// Zusammengehörige Assertions in einer Methode bündeln
public async assertDialogInhalte(): Promise<void> {
  await expect.soft(this.headline).toBeVisible();
  await expect.soft(this.saveButton).toBeEnabled();
}
```

---

### Phase 5 — Validierung

1. **TypeScript-Kompilierung prüfen:**
   ```bash
   npx tsc --noEmit
   ```
2. **Import-Pfade verifizieren** — Relative Pfade müssen korrekt sein
3. **Konfliktcheck wiederholen** — Kein bestehender Code darf verändert worden sein

---

## Referenz-Beispiel

### Ausgangslage: PersonManagementViewPage

Die Datei [pages/admin/personen/PersonManagementView.page.ts](../../../pages/admin/personen/PersonManagementView.page.ts) ist ein gutes Referenz-Beispiel für eine komplexe Page-Klasse mit `extends AbstractAdminPage`, mehreren Hilfsklassen und beiden Methodenblöcken.

**Bestehende Felder (Auszug):**
```ts
private readonly personTable: DataTable;
private readonly organisationAutocomplete: Autocomplete;
private readonly table: Locator;
private readonly schuelerVersetzenDialogCard: Locator;
public readonly menu: MenuBarPage;
```

**Beispiel: Neues Feld + Methode korrekt ergänzen**

Ausgangslage — Konstruktor endet mit:
```ts
    this.passwortZuruecksetzenDialogCard = this.page.getByTestId('password-reset-layout-card');
  }
```

Erweiterung — neues Feld im Konstruktor:
```ts
    this.passwortZuruecksetzenDialogCard = this.page.getByTestId('password-reset-layout-card');
    this.lockUserDialogCard = this.page.getByTestId('lock-user-layout-card');  // NEU
  }
```

Neue Methode im `/* actions */`-Block am Ende des Blocks:
```ts
  public async lockUser(): Promise<void> {
    await this.lockUserDialogCard.getByTestId('lock-user-submit-button').click();
  }
```

Neue Assertion im `/* assertions */`-Block:
```ts
  public async assertLockDialogVisible(): Promise<void> {
    await expect(this.lockUserDialogCard).toBeVisible();
  }
```

---

## Weitere Referenz-Dateien im Projekt

| Datei | Pattern |
|-------|---------|
| [pages/admin/rollen/RolleDetailsView.page.ts](../../../pages/admin/rollen/RolleDetailsView.page.ts) | Detailseite mit Edit- und Delete-Aktionen |
| [pages/admin/service-provider/ServiceProviderManagementView.page.ts](../../../pages/admin/service-provider/ServiceProviderManagementView.page.ts) | extends AbstractAdminPage, DataTable |
| [pages/components/DataTable.page.ts](../../../pages/components/DataTable.page.ts) | Wiederverwendbare DataTable-Komponente |
| [pages/components/Autocomplete.ts](../../../pages/components/Autocomplete.ts) | Autocomplete-Komponente |
