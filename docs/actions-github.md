# Ausführung der Tests durch Actions in github
Alle actions können jederzeit manuell getriggert werden. Hierzu die entsprechende action auswählen. Dann auf den Button "Run workflow" klicken.

## Action "Manuell alle Tests(staging)"
Diese action kann nur manuell ausgelöst werden und enthält die Testsuite "stage"

## Action "Playwright Tests"
Die action wird beim Deployment auf den Branch-Umgebungen automatisch ausgelöst und enthält die Testsuite "short"

## Action "Scheduled Playwright Alle Tests(main)"
Die Tests werden jeden Morgen zu einer bestimmten Uhrzeit zeitgesteuert ausgelöst und enthält die Testsuite "long"

## Action "Scheduled Playwright Smoketest(staging)"
Die action wird jeden Morgen zu einer bestimmten Uhrzeit zeitgesteuert ausgelöst und enthält die Testsuite "smoke"

## Action "Scheduled Playwright Smoketest(test.dev)"
Die action wird jeden Morgen zu einer bestimmten Uhrzeit zeitgesteuert ausgelöst und enthält die Testsuite "smoke"