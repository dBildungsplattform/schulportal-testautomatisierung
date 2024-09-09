# Ausführung der Tests durch Actions in github
Alle Actions können jederzeit manuell getriggert werden. Hierzu die entsprechende action auswählen. Dann auf den Button "Run workflow" klicken.

## Action "Manuell alle Tests(staging)"
Diese Action kann nur manuell ausgelöst werden und enthält die Testsuite "stage"

## Action "Playwright Tests"
Die Action wird beim Deployment auf den Branch-Umgebungen automatisch ausgelöst und enthält die Testsuite "short"

## Action "Scheduled Playwright Alle Tests(main)"
Die Action wird jeden Morgen zu einer bestimmten Uhrzeit zeitgesteuert ausgelöst und enthält die Testsuite "long"

## Action "Scheduled Playwright Smoketest(staging)"
Die Action wird jeden Morgen zu einer bestimmten Uhrzeit zeitgesteuert ausgelöst und enthält die Testsuite "smoke"

## Action "Scheduled Playwright Smoketest(test.dev)"
Die Action wird jeden Morgen zu einer bestimmten Uhrzeit zeitgesteuert ausgelöst und enthält die Testsuite "smoke"