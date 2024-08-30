# Erläuterung
## Die Tags/Kategorien dienen dazu, die Tests für die unterschiedlichen Umgebungen/Pipelines auszuwählen.
Somit ist sichergestellt, dass nicht immer alle Tests auf allen Umgebungen laufen.
Die tags werden in dem Testtitel am Ende gestellt. Jeder Testfall muss laut Konvention mindestens einen tag haben.
Für die Teststeuerung werden die tags in der Ausführungszeile ind der .yml Datei angegeben.
### Beispiel: FRONTEND_URL='https://test.dev.spsh.dbildungsplattform.de/' npx playwright test -g "@smoke"

## Mögliche tags per Konvention(Definition Testsuiten siehe README.md)
### @smoke
### @short
### @long
### @stage

### In Planung
#### @prod: Testsuite für Produktion (relevant für manuelles triggern nach Prod-Deployment)
#### @mobile: Testsuite für Mobiletests (relevant für main.dev, schedule täglich)
#### @browse: Testsuite für Browsertests (relevant relevant für main.dev, schedule täglich)
#### @bitv: Testsuite für Barrierefreiheitstests (relevant für main.dev, schedule täglich)