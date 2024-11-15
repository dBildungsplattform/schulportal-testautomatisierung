# Struktur der Playwright-Tests
In diesem Dokument wird beschrieben, wie wir unsere Playwright-Tests strukturieren.

## Zielsetzung
Das Ziel bei unseren Tests ist es, die Benutzerinteraktionen so abstrakt wie möglich zu beschreiben.
Das heißt zum Beispiel, dass wir nicht in jedem Test erneut beschreiben wollen, wie man eine ComboBox bedient.
Stattdessen soll der Test lediglich fordern, dass aus einer ComboBox ein Eintrag ausgewählt wird.

Für die Seiten heißt das, dass eine Page-Klasse Methoden hat, die Seitenausgänge beschreiben.
Wenn eine Seite, ohne vorherige Interaktion mit einer anderen Seite angesteuert werden kann, braucht sie zudem
eine Methode zum Direkteinsprung.

Die Tests sollen so geschrieben werden, dass sie nur dann ein Seitenobjekt halten, wenn sie mit der Seite interagieren.
Seitenobjekte für Folgeseiten sollen aus den Methoden für die Seitenausgänge kommen.

Tests werden parallel ausgeführt, wenn sie in verschiedenen Dateien stehen.
Es ist daher ratsam, Testdateien klein zu halten und entsprechend sinnvoll zu schneiden.

## Technische Umsetzung
### Verzeichnisstruktur
#### `base`: Helper für Tests
Im `base`-Verzeichnis befinden sich Helper, die von den Tests aufgerufen werden aber nicht direkt zu den Tests gehören.
Darunter fällt zum Beispiel die Erzeugung von Testdaten direkt über API.

#### `elements`: wiederkehrende Seitenelemente (TODO: über Umbenennung in "components" nachdenken)
In `elements` befinden sich semantische Wrapper um Locators, die wiederkehrende Elemente auf den Seiten testen.
Beispielsweise legen wir hier eine Klasse für "Comboboxen" ab, die die nötigen Schritte zur Auswahl von Elementen kapselt.

#### `fixtures`: Ablage von Testdaten
Das `fixtures`-Verzeichnis beinhaltet Testdaten, die als JSON oder in beliebigen anderen Formaten abgelegt werden können.

#### `pages`: Seitenobjekte
Im Verzeichnis `pages` liegen Seitenrepräsentationen.
Eine Seite hat dabei high-level-Funktionen, zur Navigation und zum Aufruf von Seitenfunktionalitäten.

#### `/tests`: Die eigentlichen Tests

### Tags
Wir verwenden Tags, um diejenigen Tests auszuwählen, die ausgeführt werden sollen.
Zur Zeit unterscheiden wir nach Ausführungslänge (@long, @short).
Das muss aber nicht die einzige Unterscheidungskategorie bleiben.

### Navigation mit FromAnywhere
Für die Verwendung von mehreren Pages in den einzelnen Tests müssen sie nicht in jedem Test importiert und einzeln navigiert werden. Stattdessen ist es sinnvoll, verlinkte Pages in dedizierten Funktionen der einzelnen Pages zu returnen und die Funktionen im Test aufzurufen. Das spart Code und Wartungsaufwand.

Als Einstieg dient dazu die Klasse `FromAnywhere`, über die man von jeder Route aus die LandingPage aufrufen kann, um von dort aus weiter zu navigieren.

#### Beispiel
```
FromAnywhere
.start()
.goToLogin()
.login(ADMIN, PW)
.goToAdminstration()
.goToBenutzerimport();
```