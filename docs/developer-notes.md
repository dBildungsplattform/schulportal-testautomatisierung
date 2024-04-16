# Fehlende data-testid
## Erläuterung
Der Playwright-Codegenerator ist ein sehr wirkungsvolles tool um schnell Ausdrücke für die Elemente auf einer Webseite automatisch zu erstellen.
Der FE-Entwickler des Clients muss das Attribut "data-testid" für jedes Element einfügen, welches für die Playwright-Testautomatisierung relevant ist.
Welche Elemente relevant sind, weiss der Entwickler zum Zeitpunkt der Entwicklung des FE nicht und kann deshalb die data-testids nur erraten.

## Hinweise für die Vergabe einer data-testid im FE
Die data-testid muss genau in dem Bereich liegen, in dem der Endanwender auch tatsächlich den Klick ausführt, oder auch dort wo das Auge des Anwenders hinschaut(auf die Texte)

# Liste der fehlenden oder nicht korrekt plazierten data-testid
## admin/PersonCreationView.page.ts

Hier fehlt eine testId für den success-Text "Max Mustermann wurde erfolgreich hinzugefügt.":
src\views\admin\PersonCreationView.vue
<!-- Result template on success after submit  -->
    <template v-if="personStore.createdPerson && !personStore.errorCode">
      <v-container class="new-role-success">
        <v-row justify="center">
          <v-col
            class="subtitle-1"
            cols="auto"
          >
            {{
              $t('admin.person.addedSuccessfully', {
                firstname: personStore.createdPerson.person.name.vorname,
                lastname: personStore.createdPerson.person.name.familienname,
              })
            }}
          </v-col>
        </v-row>


## admin/PersonDetailsView.page.ts
--

## admin/PersonManagementView.page.ts
--

## admin/RolleCreationView.page.ts
--

## admin/RolleManagementView.page.ts
--

## Header.page.ts
--

## LandingView.page.ts
--

## LoginView.page.ts
--

## MenuBar.page.ts
--

## StartView.page.ts
--