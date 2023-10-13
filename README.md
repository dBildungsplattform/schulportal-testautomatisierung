# Schulportal Playwright, Doku für lokale Ausführung von den Tests

## Zu installierende Node.js-Pakete
npm install dotenv
npm install otpauth
npm install jimp
npm install qrcode-reader

# Oft verwendetet Konsolenbefehle

## Einen bestimmten Test ausführen: 
npx playwright test TF0001.spec.ts

## Umgebungsvariablen überschreiben
gitbash: TIMEOUT="" npx playwright test TF0001.spec.ts --headed

powershell:
 $env:TIMEOUT=""
npx playwright test 00_Authentifizierung.spec.ts --headed

## Einen Report von der Testausführung öffnen: 
npx playwright show-report results\results-2023-10-06T13_49_14_593

## Code-Generator starten: 
npx playwright codegen https://helm.dev.spsh.dbildungsplattform.de

## debug-mode: 
git bash: PWDEBUG=1 npx playwright test 00_Authentifizierung.spec.ts --headed

powershell:
PWDEBUG=1
npx playwright test 00_Authentifizierung.spec.ts --headed

# Struktur Testfälle

## Prefix Testfälle
Bereich 00: Authentifizierung 
Bereich 10: Navigation
Bereich 20:
Bereich 30: