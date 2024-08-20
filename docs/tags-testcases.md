# Erläuterung
## Die tags/Kategorie dienen dazu, die Tests für die unterschiedlichen Umgebungen/Pipelines auszuwählen.
Somit ist sichergestellt, dass nicht immer alles Tests auf allen Umgebungen laufen.
Die tags werden in dem Testtitel am Ende gestellt. Jeder Testfall muss laut Konvention mindestens einen tags haben.
Für die Teststeuerung werden die tags in der Ausführungszeile ind der .yml Datei angegeben.
### Beispiel: FRONTEND_URL='https://test.dev.spsh.dbildungsplattform.de/' npx playwright test -g "@smoke"

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
## Eine Klasse als Landesadmin anlegen und die Klasse anschließend in der Ergebnisliste suchen und dann löschen @long @short @stage
## Ergebnisliste Klassen als Landesadmin auf Vollständigkeit prüfen @long @short @stage
## Eine Klasse als Landesadmin anlegen und die Bestätigungsseite vollständig prüfen @long @stage

## login-spec.ts
### Erfolgreicher Standard Login Landesadmin @long @stage @smoke
### Erfolgloser Login mit falschem Passwort und gültigem Benutzernamen in der Rolle Landesadmin @long @short @stage

## logoff-spec.ts
## Erfolgreicher Standard Logoff als Landesadmin @long @short @stage

## MenuBar-spec.ts
## Test der Hauptmenue-Leiste und Untermenues auf Vollständigkeit @long @short @stage
## Test der Funktion "Zurueck zur Startseite" @long @short @stage

## Person-spec.ts
## Einen Benutzer mit der Rolle Lehrkraft anlegen als Landesadmin und anschließend mit diesem Benutzer anmelden @long @short @stage
## Einen Benutzer mit der Rolle Landesadmin anlegen @long @stage
## Einen Benutzer mit der Rolle LiV anlegen als Landesadmin @long @stage
## Einen Benutzer mit der Rolle Schuladmin anlegen als Landesadmin @long @short @stage
## Einen Benutzer mit der Rolle SuS anlegen als Landesadmin @long @short @stage
## Ergebnisliste Benutzer auf Vollständigkeit prüfen als Landesadmin @long @short @stage
## Prüfung auf korrekte Rollen in dem Dropdown 'Rolle' nach Auswahl der Organisation bei Anlage eines Benutzer in der Rolle Landesadmin @long @short @stage
## In der Ergebnisliste die Suchfunktion ausführen als Landesadmin @long @short @stage
## Eine Lehrkraft anlegen in der Rolle Landesadmin und die Bestätigungsseite vollständig prüfen @long @short @stage
## Mehere Benutzer hintereinander anlegen in der Rolle Landesadmin für die Rollenarten SuS und LEHR und die Bestätigungsseiten vollständig prüfen @long @stage

## Rolle-spec.ts
## 2 Rollen nacheinander anlegen mit Rollenarten LERN und LEHR als Landesadmin @long @short @stage
## Ergebnisliste Rollen auf Vollständigkeit prüfen als Landesadmin @long @short @stage
## Eine Rolle anlegen und die Bestätigungsseite vollständig prüfen als Landesadmin @long @short @stage

## Schule-spec.ts
## 2 Schulen nacheinander anlegen als Landesadmin @long
## Ergebnisliste Schulen auf Vollständigkeit prüfen als Landesadmin @long @short @stage
## Eine Schule anlegen als Schuladmin und die Bestätigungsseite vollständig prüfen @long @short

## SchulportalAdministration-spec.ts
## Prüfen, dass die Schulportal-Administration Kachel nicht sichtbar ist für Lehrkräfte @long @stage
## Prüfen, dass die Schulportal-Administration Kachel nicht sichtbar ist für Schüler @long @short @stage
## Prüfen, dass die Schulportal-Administration Kachel sichtbar ist für Schuladmins @long @stage

## workflow-spec.ts
## Angebote per Link öffnen als Landesadmin @long @short @stage
## Passwort Reset für einen Lehrer als Landesadmin @long @short @stage