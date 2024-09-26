# Schulportal Playwright, Doku für lokale Ausführung von den Tests

## Oft verwendetet Konsolenbefehle

### Code-Generator lokal starten:

#### npx playwright codegen https://main.dev.spsh.dbildungsplattform.de

#### npx playwright codegen https://SPSH-1234.dev.spsh.dbildungsplattform.de

#### npx playwright codegen https://spsh.staging.spsh.dbildungsplattform.de

#### npx playwright codegen https://test.dev.spsh.dbildungsplattform.de

#### npx playwright codegen https://localhost:8099/ --ignore-https-errors

### Tests lokal ausführen:

#### Alle Tests mit einer beliebigen URL ausführen

USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' npx playwright test

#### Alle Tests auf main ausführen

USER="xxx" PW="xxx" npx playwright test login.spec.ts

#### Einen bestimmten Testfall innerhalb einer Datei ausführen:

USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' npx playwright test -g "Einen Benutzer mit der Rolle Lehrkraft anlegen" --headed

#### Alle Tests einer bestimmten ausführen:

USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' npx playwright test Schule.spec.ts

#### debug-mode:

PWDEBUG=1 USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' npx playwright test -g "Einen Benutzer mit der Rolle Lehrkraft anlegen"

### Den letzten Report von der Testausführung öffnen:

npx playwright show-report

## Umgebungen

Die Default-Umgebung ist in der playwright.config.ts konfiguriert (dotenv.config)

### .env.dev(Default, main)

### .env.devTest

### .env.local

### .env.staging

## ESLint ausführen

npm run lint

## Testdatenerstellung durch die Playwright-Tests

Neue Testdaten, die während der Testausführung erstellt werden, haben den Prefix 'TAuto-PW-', gefolgt von einem Buchstaben für den Typ des Objekts + einen Zufallswert 
aus faker oder einem festen Wert. Der Name einer Rolle ist z.B. TAuto-PW-R-xxxxxxxxx. Somit ist es einfacher, die Testdaten zu erkennen, die durch die Playwright-Tests erstellt wurden.

## Hinweise für die Entwicklung der Tests

### Während der Entwicklung nur einen Test markieren, der alleine ausgeführt wird(temporär only hinzufügen in dem Test)

test.only('2 Schulen nacheinander anlegen', async ({ page }) => {

## Playwright installieren unter Windows

### git clone https://github.com/dBildungsplattform/schulportal-testautomatisierung

### cd schulportal-testautomatisierung

### npm ci

### npx playwright install --with-deps

## Entwicklungsumgebung

Empfohlen wird VS-Code

## Definition Testsuiten
### smoke
Dieses ist die kleinste Testsuite. Hiermit wird nur getestet, dass das Portal erfolgreich deployed wurde und die wichtigsten Komponenten lauffähig sind.
Getestet wird dieses durch einen Login-Test, der nach der Anmeldung prüft, dass die Kachel "Schulportal-Administration" angezeigt wird
### short
Die Testsuite läuft auf den Branch-Umgebungen und sollte eine Laufzeit von 5 Minuten nicht überschreiten. Für die Testuite werden die Testfälle mit der höchsten Priorität ausgewählt.
### long
Die Testsuite enthält alle funktionalen Tests.
### stage
Die Testsuite hat einen ähnlichen Umfang wie die Testsuite long. Auf der stage werden aber nicht die Testfälle ausgeführt, die aufgrund noch nicht implementierter Funktionen (wie z.B. Schulen löschen) Testdaten hinterlassen.
Desweiteren gibt es auf der Stage-Umgebung Schnittstellen wie z.B. itslearning, die nur da laufen bzw. eine Anbindung an das Testsystem von itslearning haben. Diese Testfälle können dann auch nur auf stage laufen.

## Übersicht Testfälle
Eine Übersicht aller Testfälle ist hier: docs/testcases.md. Diese Liste muss ergänzt werden wenn man neue Testfälle erstellt.