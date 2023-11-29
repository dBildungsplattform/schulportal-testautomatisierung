# Schulportal Playwright, Doku für lokale Ausführung von den Tests

# Oft verwendetet Konsolenbefehle

## Einen bestimmten Test ausführen: 
USER="xxx" PW="xxx" npx playwright test TF0001.spec.ts

## Alle Tests ausführen: 
USER="xxx" PW="xxx" npx playwright test

## Umgebungsvariablen überschreiben
gitbash: USER='xxx' PW='xxx' npx playwright test TF0001.spec.ts --headed

powershell:
 $env:USER="xxx"
npx playwright test 00_Authentifizierung.spec.ts --headed

## Einen Report von der Testausführung öffnen: 
npx playwright show-report results\results-2023-10-06T13_49_14_593

## Code-Generator starten: 
npx playwright codegen https://test.dev.spsh.dbildungsplattform.de

## debug-mode: 
git bash: PWDEBUG=1 npx playwright test 00_Authentifizierung.spec.ts --headed

powershell:
PWDEBUG=1
npx playwright test 00_Authentifizierung.spec.ts --headed

## ESLint ausführen
`npm run lint`

## Lokale Ausführung
Wenn die Tests lokal ausgeführt werden, ist die Ziel-URL, auf der die Playwright-Tests ausgeführt werden, defaultmäßig: test.dev.
Dieses wird über die env-files gesteuert. Das genutzte env.file ist in der playwright.config auf das env-file '.env.dev' konfiguriert. Dieses sollte auch immer die
eingecheckte Konfiguration sein.