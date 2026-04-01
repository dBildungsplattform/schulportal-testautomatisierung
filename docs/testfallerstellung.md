# Testfallerstellung mit GitHub Copilot

Diese Anleitung beschreibt, wie mit den Copilot-Skills `generate-test-cases` und `export-xray-csv` aus einer Anforderung manuelle Testfälle erstellt und für den Import in Xray vorbereitet werden.

---

## Überblick: Der Workflow

```
Anforderung (Ticket / User Story)
        ↓
[1] generate-test-cases  →  Markdown-Tabelle (reviewbar)
        ↓
[2] export-xray-csv      →  CSV-Datei unter .github/manual_tests/
        ↓
Xray-Import
```

Der Workflow besteht immer aus **zwei Schritten**, die nacheinander ausgeführt werden. Der erste Schritt erzeugt eine menschenlesbare Tabelle zur Kontrolle, der zweite macht daraus die importierbare Datei.

Aktuell ist die Aufteilung in 2 Schritten notwendig. Wenn man versucht Beides zusammen zu führen, bricht Copilot die Aufgabe ab, weil die Ausgabe zu groß wird.

---

## Vorbereitung: Was du vor dem ersten Schritt brauchst

Bevor du Copilot anweist, Testfälle zu erstellen, solltest du folgende Informationen parat haben:

| Information    | Beispiel                                   | Bedeutung                                              |
|----------------|--------------------------------------------|--------------------------------------------------------|
| **Anforderung**| Ticket-Text, Akzeptanzkriterien, Freitext  | Was soll getestet werden?                              |
| **Testtiefe**  | Positiv, Negativ, Grenzwerte               | Welche Arten von Tests sollen abgedeckt werden?       |
| **tests**      | `SPSH-234`                                 | Jira-Ticket-ID, der die Testfälle zugeordnet werden   |
| **Beschreibung**| `"Test aus Playwright importiert."`       | Kurze Beschreibung für alle Testfälle dieser Aufgabe  |
| **Testplan**   | `SPSH-3163`                                | Ticket-ID des zugehörigen Testplans in Jira           |
| **Stichwörter**| `Automatisiert`, `Beschrieben`             | Xray-Labels; jedes Stichwort wird eine eigene Spalte  |
| **Autor**      | `silvia.grosche`                           | Jira-Benutzername                                     |
| **Repo**       | `Automatisierung/Navigieren`               | Pfad im Repo, dem die Testfälle thematisch zugeordnet sind |
| **Prio**       | `low` / `medium` / `high`                 | Priorität der Testfälle                               |

---

## Schritt 1: Testfälle generieren (`generate-test-cases`)

### Wie du Copilot aktivierst

Schreibe in den Copilot-Chat z.B.:

> „Erstelle Testfälle für folgende Anforderung: [Ticket-Text einfügen]"

oder

> „Leite manuelle Testfälle aus dieser User Story ab: [...]"

Copilot erkennt automatisch, dass der `generate-test-cases`-Skill anzuwenden ist, und **stellt dir einmalig alle notwendigen Fragen** (Anforderungstext, Testtiefe, Metadaten), bevor es losgeht.

### Was Copilot ausgibt

Eine **Markdown-Tabelle** mit diesen Spalten:

```
TCID | tests | Zusammenfassung | Beschreibung | Aktion | Data | Erwartetes Ergebnis | Testplan | Autor | Stichwort | Prio | Repo
```

- **TCID**: Fortlaufende Nummer. Mehrere Zeilen mit derselben TCID gehören zum gleichen Testfall (aufbauende Schritte).
- **Aktion**: Alle Schritte des Tests, jeder mit `# ` präfixiert. Buttons stehen in `*...*`, UI-Elemente und Meldungen in `_..._`.
- **Data**: Konkrete Testdaten für den jeweiligen Schritt.
- **Metadaten** (tests, Zusammenfassung, Beschreibung, Testplan, Autor, Stichwörter, Prio, Repo) stehen **nur in der ersten Zeile** eines Testfalls.

### Was du jetzt tun solltest

**Kontrolliere die Tabelle** bevor du weitermachst:
- Sind alle fachlich relevanten Szenarien (Positiv, Negativ, Grenzwerte) abgedeckt?
- Stimmen Aktionsschritte und Erwartete Ergebnisse inhaltlich?
- Sind die Metadaten korrekt (Ticket-ID, Testplan, Autor)?

Gibt es Korrekturbedarf, weise Copilot direkt im Chat darauf hin — z.B.:
> „Füge noch einen Negativ-Test für ungültige E-Mail-Adressen hinzu."

---

## Schritt 2: CSV exportieren (`export-xray-csv`)

### Wie du Copilot aktivierst

Sobald die Markdown-Tabelle aus Schritt 1 vorliegt und geprüft ist, schreibe:

> „Exportiere die Tabelle als Xray-CSV."

oder

> „Wandle das in eine CSV-Datei für den Xray-Import um."

Copilot liest die Tabelle aus dem vorherigen Schritt und konvertiert sie **ohne inhaltliche Änderungen** in eine CSV-Datei.

### Was Copilot ausgibt

Eine CSV-Datei, die unter folgendem Pfad gespeichert wird:

```
.github/manual_tests/<TICKET-ID>-testfaelle.csv
```

Beispiel: `.github/manual_tests/SPSH-234-testfaelle.csv`

**Wichtige Formatdetails der CSV:**
- Trennzeichen: `;`
- Zeilenumbrüche innerhalb von Zellen werden als echte Zeilenumbrüche kodiert (wie Alt+Enter in Excel)
- Anführungszeichen in Zellen werden als `""` escaped
- Jedes Stichwort hat eine eigene Spalte (auch wenn der Spaltenname mehrfach vorkommt — das ist gewollt für Xray)

---

## Häufige Fragen

**Kann ich beide Schritte in einem Rutsch erledigen?**
Nein — der Review der Markdown-Tabelle zwischen Schritt 1 und 2 ist bewusst eingebaut. Die Tabelle ist die einzige menschenlesbare Kontrollstufe, bevor Daten in Xray landen.

**Was, wenn Copilot nach Schritt 1 direkt eine CSV ausgeben will?**
Das `export-xray-csv`-Skill ist explizit so gebaut, dass es nur dann angewendet wird, wenn eine Tabelle bereits vorhanden ist. Sage Copilot, dass du zuerst die Tabelle sehen möchtest.

**Welche Testarten gibt es?**
- **Positiv-Test (Happy Path):** Korrekte Eingaben → System verhält sich wie erwartet.
- **Negativ-Test:** Falsche oder fehlende Eingaben → System zeigt korrekte Fehlermeldung.
- **Grenzwert-Test:** Extremwerte (leer, zu lang, Sonderzeichen) → System verhält sich stabil.

**Wo liegt der Unterschied zwischen `tests` und `Testplan`?**
`tests` ist die ID des Tickets, dem die einzelnen Testfälle zugeordnet werden (z.B. das Feature-Ticket). `Testplan` ist die ID des übergeordneten Testplan-Tickets in Jira/Xray.

---

## Verwandte Dokumente

- [best-practices.md](best-practices.md) — Allgemeine Konventionen für Tests im Repo
- [structure.md](structure.md) — Aufbau des Repositories
- [tags.md](tags.md) — Übersicht der verwendeten Test-Tags
