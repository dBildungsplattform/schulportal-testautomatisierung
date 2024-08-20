# Erläuterung
## Die tags/Kategorie dienen dazu, die Tests für die unterschiedlichen Umgebungen/Pipelines auszuwählen.
Somit ist sichergestellt, dass nicht immer alles Tests auf allen Umgebungen laufen.
Die tags werden in dem Testtitel am Ende gestellt. Jeder Testfall muss laut Konvention mindestens einen tags haben.
Für die Teststeuerung werden die tags in der Ausführungszeile ind der .yml Datei angegeben.
### Beispiel: FRONTEND_URL='https://test.dev.spsh.dbildungsplattform.de/' npx playwright test -g "@SMOKE"

## Mögliche tags per Konvention
### @smoke: Testsuite Smoketest(relevant für test.dev, stage; schedule täglich)
### @short: Testsuite short(relevant für Branch-Umgebungen)
### @long: Testsuite long(relevant für main.dev, schedule täglich)
### @stage: Testsuite für Staging(relevant für manuelles triggern nach Stage-Deployment)
### In Planung
#### @prod: Testsuite für Produktion(relevant für manuelles triggern nach Prode-Deployment)
#### @mobile: Testsuite für Mobiletests(relevant für main.dev, schedule täglich)
#### @browse: Testsuite für Browsertests(relevant relevant für main.dev, schedule täglich)
#### @bitv: Testsuite für Barrierefreiheitstests(relevant für main.dev, schedule täglich)

# Verwendung der tags in den Tests(Testname + tags)
## api-spec.ts
### GET und Post request Personen und Benutzer anschließend über das FE löschen @long @short @stage

## Klasse-spec.ts

## login-spec.ts
### Erfolgreicher Standard Login Landesadmin @long @stage @smoke
### Erfolgloser Login mit falschem Passwort und gültigem Benutzernamen in der Rolle Landesadmin @long @short @stage

## logoff-spec.ts
## Erfolgreicher Standard Logoff als Landesadmin @long @short @stage

## MenuBar-spec.ts
## Test der Hauptmenue-Leiste und Untermenues auf Vollständigkeit @long @short @stage
## Test der Funktion "Zurueck zur Startseite" @long @short @stage

## Person-spec.ts

## Rolle-spec.ts

## Schule-spec.ts

## SchulportalAdministration-spec.ts
#ToDo

## workflow-spec.ts
#ToDo