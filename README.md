# Schulportal Playwright, Doku für lokale Ausführung von den Tests

# Oft verwendetet Konsolenbefehle

## Eine bestimmte Testfall-Datei ausführen: 
USER="xxx" PW="xxx" npx playwright test login.spec.ts

## Einen bestimmten Testfall innerhalb einer Datei ausführen: 
USER='xxx' PW='xxx' npx playwright test -g "SPSH-122 Angebote" --headed

## Alle Tests ausführen: 
USER="xxx" PW="xxx" npx playwright test

## Alle Tests ausführen auf einer bestimmten Zielumgebung:
USER='xxx' PW='xxx' FRONTEND_URL='https://main.dev.spsh.dbildungsplattform.de/' npx playwright test

## Einen Report von der Testausführung öffnen: 
npx playwright show-report results\results-2023-10-06T13_49_14_593

## Code-Generator starten: 
npx playwright codegen https://test.dev.spsh.dbildungsplattform.de
npx playwright codegen https://main.dev.spsh.dbildungsplattform.de
npx playwright codegen https://localhost:8099/ --ignore-https-errors

## Code-Generator aus GHA starten: 
Run workflow "Playwright Tests" with frontendHostname: test.dev.spsh.dbildungsplattform.de

## debug-mode: 
PWDEBUG=1 npx playwright test login.spec.ts --headed

## ESLint ausführen
`npm run lint`

## Umgebungen
Es gibt die beiden Umgebungen .env.dev und .env.local auf denen die Tests ausgeführt werden. Verwendet wird die Umgebung, die in der playwright.config.ts konfiguriert ist(dotenv.config).

## Testdatenerstellung durch die Playwright-Tests
Neue Testdaten, die während der Testausführung erstellt werden, haben den Prefix 'TAuto', gefolgt von einem Buchstaben für den Typ + einen Zufallswert aus faker-js(Beispiel: XXX). Der Name einer Rolle ist z.B. TAutoR1XXX. Somit ist es einfacher, die Testdaten zu erkennen, die durch die Playwright-Tests erstellt wurden.