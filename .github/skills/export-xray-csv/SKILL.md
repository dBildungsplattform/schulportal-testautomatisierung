---
name: export-xray-csv
description: 'Converts a test case Markdown table (output of generate-test-cases) into a CSV file optimized for Xray import. Use when asked to export, convert, or generate a Xray CSV from an existing test case table.'
---

# Export Test Cases as Xray CSV

Dieser Skill konvertiert eine Testfall-Tabelle (aus dem `generate-test-cases`-Skill) in eine **CSV-Datei für den Xray-Import**.

## Use When
- Du sollst eine vorhandene Testfall-Tabelle als Xray-CSV exportieren
- Du sollst eine CSV für den Xray-Import aus einer Markdown-Tabelle erstellen

## Do Not Use When
- Es sollen neue Testfälle aus einer Anforderung abgeleitet werden (→ zuerst `generate-test-cases` verwenden)
- Es ist noch keine Testfall-Tabelle vorhanden

---

## Input

Benötigt: Die Markdown-Tabelle aus dem `generate-test-cases`-Skill. Sie kann direkt im Chat übergeben oder aus dem vorherigen Schritt übernommen werden.

---

## Step 1 — CSV generieren

> **WICHTIG: Reine Format-Konvertierung.** Übernehme jeden Zellenwert der Tabelle exakt und unverändert (1:1). Leite keine neuen Testfälle ab, ergänze keinen Inhalt, denke nicht über die Anforderung nach. Deine einzige Aufgabe ist das Umwandeln von Markdown-Spalten in CSV-Spalten.

> **KEIN Lesen von Referenzdateien.** Öffne oder lese keine bestehenden CSV-Dateien im Workspace (z.B. andere `*-testfaelle.csv`). Alle benötigten Formatregeln sind vollständig in dieser SKILL.md enthalten — eine externe Referenz ist nicht notwendig.

> **Ausgabe:** Antworte ausschließlich mit dem CSV-Block (` ```csv `). Kein Vortext, keine Erklärungen, keine Zusammenfassung vor oder nach dem CSV.

**CSV-Formatregeln:**
- Trennzeichen zwischen Spalten: `;`
- **Zellen werden nur dann in doppelte Anführungszeichen `"..."` eingeschlossen, wenn sie mindestens eines der folgenden Zeichen enthalten:** Semikolon (`;`), echten Zeilenumbruch, oder ein doppeltes Anführungszeichen (`"`). Einfache Zellen ohne diese Zeichen werden **ohne Anführungszeichen** ausgegeben.
- Zeilenumbrüche **innerhalb** einer Zelle werden als **echte Zeilenumbrüche** (newline) kodiert — `<br>` aus der Markdown-Tabelle wird dabei in echte Zeilenumbrüche umgewandelt. Das entspricht dem Alt+Enter-Verhalten in Excel
- Doppelte Anführungszeichen innerhalb einer Zelle werden als `""` escaped

**Spaltenreihenfolge** (exakt wie in der Eingabetabelle):

```
TCID | tests | Zusammenfassung | Beschreibung | Aktion | Data | Erwartetes Ergebnis | Testplan | Autor | Stichwort | [Stichwort | ...] | Prio | Repo
```

> Jedes Stichwort aus der Tabelle erhält eine eigene Spalte, alle mit der Überschrift **Stichwort**. Doppelte Spaltennamen sind gewünscht — das ist für den Xray-Import optimiert.

**Metadaten-Regel:** Die Felder tests, Zusammenfassung, Beschreibung, Testplan, Autor, Stichwörter, Prio und Repo stehen **nur in der ersten Zeile** eines Tests — Folgezeilen bleiben leer. Das Feld **Data** wird in jeder Zeile ausgefüllt (mindestens `-`).

---

## Step 2 — Self-Check (intern — keine Ausgabe)

Prüfe intern, ob:
- Alle `<br>` in der Quelle in echte Zeilenumbrüche umgewandelt wurden
- Zellen mit `;`, echtem Zeilenumbruch oder `"` sind in `"..."` eingeschlossen; alle anderen Zellen sind **ohne** Anführungszeichen
- Anführungszeichen in Zellen korrekt als `""` escaped sind
- Metadaten nur in der ersten Zeile je Test stehen
- Die Spaltenanzahl in jeder Zeile konsistent ist

Gib diesen Check **nicht** aus.

---

## When the Skill Cannot Proceed

Stop und informiere den User, wenn:
- Keine Testfall-Tabelle vorhanden ist — weise auf den `generate-test-cases`-Skill hin
- Die Tabelle ein unbekanntes Format hat, das nicht in das CSV-Schema übersetzt werden kann

## Output Location
Speichere die CSV-Datei unter `.github/manual_tests/<TICKET-ID>-testfaelle.csv`.