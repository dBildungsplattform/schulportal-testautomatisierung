---
name: generate-test-cases
description: 'Derives manual test cases from a requirement and outputs them as a reviewable Markdown table. This is the canonical basis for all export formats (e.g. Xray CSV). Use when asked to create, derive, or write manual test cases from a requirement, user story, or ticket.'
---

# Generate Manual Test Cases

Dieser Skill leitet aus einer Anforderung manuelle Testfälle ab und gibt sie als **Markdown-Tabelle** aus. Die Tabelle ist die kanonische, reviewierbare Basis für alle weiteren Exportformate (z.B. Xray-CSV via `export-xray-csv`).

## Use When
- Du sollst manuelle Testfälle aus einer Anforderung, User Story oder einem Ticket erstellen
- Du sollst bestehende Testfälle in die Tabellenstruktur überführen
- Du wirst gebeten, Testfälle für einen bestimmten Funktionsbereich abzuleiten

## Do Not Use When
- Es sollen Playwright-/automatisierte Tests in TypeScript geschrieben werden (normaler Coding-Workflow)
- Es wird nur eine Erklärung oder Analyse einer Anforderung gewünscht, keine Testfälle
- Es sollen Gherkin-Tests geschrieben werden
- Es soll direkt eine CSV-Datei für Xray erzeugt werden (→ danach `export-xray-csv` verwenden)

---

## Step 0 — Kontext sammeln (einmalig je Aufgabe)

Bevor du Testfälle erstellst, stelle dem User **einmalig** folgende Fragen. Warte auf alle Antworten, bevor du fortfährst:

1. **Anforderung**: Was soll getestet werden? (User Story, Freitext, Ticket-Inhalt)
2. **Testtiefe**: Welche Testarten sollen abgedeckt werden?
   - Positiv-Tests (Happy Path)
   - Negativ-Tests (Fehlerfälle, ungültige Eingaben)
   - Grenzwert-Tests
   - Kombinationen der obigen
3. **Metadaten** für alle Testfälle dieser Aufgabe:
   - **Tests** (Ticket-ID, z.B. `"SPSH-234"`)
   - **Beschreibung** (z.B. `"Test aus Playwright importiert."`)
   - **Testplan** (Ticket-ID des zugehörigen Testplans, z.B. `"SPSH-3163"`)
   - **Stichwörter** (eine oder mehrere, z.B. `"Automatisiert"`, `"Beschrieben"` — jedes Stichwort ergibt eine eigene Spalte in der Tabelle)
   - **Autor** (z.B. `"silvia.grosche"`)
   - **Repo** (z.B. `"Automatisierung/Navigieren"`)
   - **Prio** (`"low"`, `"medium"` oder `"high"`)

> **Fahre erst fort, wenn alle Angaben vorliegen.**

---

## Step 0b — Anforderungstext vorverarbeiten (intern — keine Ausgabe)

Ersetze in der gegebenen Anforderung die folgenden Zeichen, bevor du Testfälle ableitest. Dieser Schritt gilt für den gesamten Anforderungstext inkl. Akzeptanzkriterien und Scope. Gib das Ergebnis **nicht** aus.

| Zeichen | Ersetzung |
|---------|-----------|
| `"`     | `'`       |
| `ä`     | `ae`      |
| `ö`     | `oe`      |
| `ü`     | `ue`      |
| `ß`     | `ss`      |

---

## Step 1 — Testfälle ableiten

Leite aus der Anforderung einzelne Testfälle ab. Beachte dabei:

- Decke alle vom User gewählten Testarten ab (Positiv, Negativ, Grenzwerte, Kombinationen)
- **Alle Schritte eines Testszenarios (Vorbedingungen + fachliche Aktion) gehören in die erste Tabellenzeile.** Folgezeilen mit gleicher TCID beschreiben **sequenzielle, aufbauende Schritte** — sie enthalten nur die **Delta-Aktion** (was sich gegenüber dem Vorgänger ändert), keinen wiederholten Setup.
- Eine **neue TCID** entsteht nur, wenn der Test **von vorne beginnt** (neuer Kontext, komplett neues Setup). Sequenziell aufbauende Varianten (z.B. schrittweise veränderte Testdaten im gleichen Ablauf) bleiben in einer TCID.
- **Es wird nur geprüft, was die Anforderung betrifft.** Vorbereitende Schritte (Anmelden, Navigation) sind keine eigenen Prüfschritte und erzeugen kein eigenes Erwartetes Ergebnis.

---

## Step 2 — Als Markdown-Tabelle ausgeben

Gib die Testfälle als Markdown-Tabelle mit exakt diesen Spalten in dieser Reihenfolge aus:

```
TCID | tests | Zusammenfassung | Beschreibung | Aktion | Data | Erwartetes Ergebnis | Testplan | Autor | Stichwort | [Stichwort | ...] | Prio | Repo
```

> Jedes vom User angegebene Stichwort erhält eine eigene Spalte, alle mit der Überschrift **Stichwort**.

**Tabellenregeln:**

- **TCID**: Fortlaufende Nummer, startet bei `1`. Ein Testfall kann mehrere Zeilen haben — alle Zeilen desselben Tests erhalten dieselbe TCID.
- **Metadaten-Regel**: Die Felder tests, Zusammenfassung, Beschreibung, Testplan, Autor, Stichwörter, Prio und Repo stehen **nur in der ersten Zeile** eines Tests — Folgezeilen dieser Spalten bleiben leer. Das Feld **Data** wird in jeder Zeile ausgefüllt (mindestens `-`).
- **Zusammenfassung**: Format `<tests>: <kurze Testbeschreibung>` (z.B. `SPSH-234: Login mit gültigen Daten`).
- **Aktion**: Alle Schritte des Testszenarios, jeder präfixiert mit `# `. Beginnt mit Vorbereitungsschritten (Anmelden, Navigation), endet mit der fachlich relevanten Aktion. Beim Anmelde-Schritt steht **ausschließlich die Rollenbezeichnung** (z.B. `# Als Schuladmin anmelden`). **Niemals** Systemrechte oder Account-Details in die Aktion — diese gehören in **Data**. Unter-Schritte werden mit `## ` präfixiert.
  Formatierungskonventionen:
  - **Buttons** → `*...*`: z.B. `*Schließen* klicken`
  - **UI-Elemente, Eigennamen, Seitentitel** → `_..._`: z.B. `_Klassenverwaltung_ öffnen`
  - **Gesuchte Texte, Meldungen** → `_..._`: z.B. `_Erfolgsmeldung: Der Vorgang wurde ausgeführt._`
- **Data**: Testdaten passend zum Aktionsschritt dieser Zeile. Wenn keine Daten relevant sind: `-`.
- **Erwartetes Ergebnis**: Das fachlich relevante Prüfergebnis der Zeile, **ohne** `# ` Präfix. Pro Tabellenzeile genau ein Erwartetes Ergebnis — das des letzten anforderungsrelevanten Schritts.

**Abschluss:** Füge nach der Tabelle folgenden Hinweis ein:

> → Für den Xray-Import: `export-xray-csv`-Skill auf diese Tabelle anwenden.

---

## Step 3 — Self-Check (intern — keine Ausgabe)

Prüfe Vollständigkeit und Konsistenz der Tabelle intern und korrigiere Fehler. Gib diesen Check **nicht** aus.

---

## When the Skill Cannot Proceed

Stop und informiere den User, wenn:
- Die Anforderung zu vage ist, um konkrete Testschritte abzuleiten — bitte um Präzisierung
- Kein erwartetes Verhalten aus der Anforderung erkennbar ist — frage nach dem Akzeptanzkriterium
