# Schulportal Playwright, Doku für lokale Ausführung von den Tests

## Playwright lokal installieren

git clone https://github.com/dBildungsplattform/schulportal-testautomatisierung
cd schulportal-testautomatisierung
npm ci
npx playwright install --with-deps

## Entwicklungsumgebung

Empfohlen wird VS-Code

## Oft verwendetet Konsolenbefehle

### Code-Generator lokal starten:

#### npx playwright codegen https://main.dev.spsh.dbildungsplattform.de

#### npx playwright codegen https://SPSH-1234.dev.spsh.dbildungsplattform.de

#### npx playwright codegen https://spsh.staging.spsh.dbildungsplattform.de

#### npx playwright codegen https://localhost:8099/ --ignore-https-errors

### API generieren
Grundlage für die API-Generierung sind die Swagger Docs aus dem Backend. Das aktuellste Doc befindet sich auf main und kann über https://main.dev.spsh.dbildungsplattform.de/docs-json abgerufen werden.

Das doc dann in die Datei base/api/openapispec.json einfügen (alles kopieren und alles überschreiben) und mit dem folgenden Befehl die Generierung ausführen:

`npm run generate-api`


### Tests lokal ausführen:

#### Alle Tests mit einer beliebigen URL ausführen

USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' npx playwright test

#### Alle Tests auf main ausführen

USER="xxx" PW="xxx" npx playwright test login.spec.ts

#### Einen bestimmten Testfall innerhalb einer Datei ausführen:

USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' npx playwright test -g "Einen Benutzer mit der Rolle Lehrkraft anlegen" --headed

#### Alle Tests einer bestimmten Datei ausführen:

USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' npx playwright test Schule.spec.ts

### Tests ausführen in denen auch Operationen bzgl. LDAP getestet werden:
- Zusätzlich die Variablen LDAP_URL und LDAP_ADMIN_PASSWORD definieren
- Bsp.: 
```properties
USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' LDAP_URL='ldap://localhost' LDAP_ADMIN_PASSWORD='xxx' npx playwright test

USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' LDAP_URL='ldap://localhost' LDAP_ADMIN_PASSWORD='xxx' npx playwright test -g "Einen Benutzer mit der Rolle Lehrkraft anlegen" --headed

USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' LDAP_URL='ldap://localhost' LDAP_ADMIN_PASSWORD='xxx' npx playwright test Schule.spec.ts

...
``` 

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

test.only('2 Schulen nacheinander anlegen', async ({ page }: PlaywrightTestArgs) => {

## Definition Testsuiten
Die Testsuiten werden über Tags definiert. Siehe docs/tags.md