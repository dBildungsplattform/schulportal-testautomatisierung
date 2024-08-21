# Erläuterung
## Die tags/Kategorie dienen dazu, die Tests für die unterschiedlichen Umgebungen/Pipelines auszuwählen.
Somit ist sichergestellt, dass nicht immer alles Tests auf allen Umgebungen laufen.
Die tags werden in dem Testtitel am Ende gestellt. Jeder Testfall muss laut Konvention mindestens einen tags haben.
Für die Teststeuerung werden die tags in der Ausführungszeile ind der .yml Datei angegeben.
### Beispiel: FRONTEND_URL='https://test.dev.spsh.dbildungsplattform.de/' npx playwright test -g "@smoke"

## Mögliche tags per Konvention(Definition Testsuiten siehe README.md)
### @smoke: Testsuite Smoketest(relevant für test.dev, stage; schedule täglich)
### @short: Testsuite short(relevant für Branch-Umgebungen)
### @long: Testsuite long(relevant für main.dev, schedule täglich)
### @stage: Testsuite für Staging(relevant für manuelles triggern nach Stage-Deployment)

### In Planung
#### @prod: Testsuite für Produktion(relevant für manuelles triggern nach Prode-Deployment)
#### @mobile: Testsuite für Mobiletests(relevant für main.dev, schedule täglich)
#### @browse: Testsuite für Browsertests(relevant relevant für main.dev, schedule täglich)
#### @bitv: Testsuite für Barrierefreiheitstests(relevant für main.dev, schedule täglich)