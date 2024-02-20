# Fehlende data-testid
## Erläuterung
Der Playwright-Codegenerator ist ein sehr wirkungsvolles tool um schnell Ausdrücke für die Elemente auf einer Webseite automatisch zu erstellen.
Der FE-Entwickler des Clients muss das Attribut "data-testid" für jedes Element einfügen, welches für die Playwright-Testautomatisierung relevant ist.
Welche Elemente relevant sind, weiss der Entwickler zum Zeitpunkt der Entwicklung des FE nicht und kann deshalb die data-testids nur erraten.

## Hinweise für die Vergabe einer data-testid im FE
Die data-testid muss genau in dem Bereich liegen, in dem der Endanwender auch tatsächlich den Klick ausführt, oder auch dort wo das Auge des Anwenders hinschaut(auf die Texte)

# Liste der fehlenden oder nicht korrekt plazierten data-testid
## header.page.ts
--

## landing.page.ts
"Willkommen im Schulportal SH.": h1 data-v-ddc92da0="" class="headline-2">Willkommen im Schulportal SH.</h1>

## login.page.ts
--

## menu.page.ts
"NAVIGATION": div class="v-list-item-title">Navigation</div>

"Benutzerverwaltung": div class="v-list-item-title">Benutzerverwaltung</div>

"Neue Benutzer anlegen": div class="v-list-item-title">Neue Benutzer anlegen</div>

"Klassenverwaltung": div class="v-list-item-title">Klassenverwaltung</div>

"Rollenverwaltung": div class="v-list-item-title">Rollenverwaltung</div>

"Alle Rollen anzeigen": div class="v-list-item-title">Alle Rollen anzeigen</div>

"Schulverwaltung": div class="v-list-item-title">Schulverwaltung</div>

"Schulträgerverwaltung": div class="v-list-item-title">Schulträgerverwaltung</div>

## start.page.ts
"Alle Angebote": h2 class="text-h4">Alle Angebote</h2>

## user_management_detail.page.ts
"Benutzer bearbeiten": h2 class="text-left headline-2">Benutzer bearbeiten</h2>

## user_management.page.ts
"Benutzerverwaltung":  h2 class="text-left headline-2">Benutzerverwaltung</h2>


