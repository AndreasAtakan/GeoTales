## Notes

##### Endringer – tilbakemeldinger runde 1:

1. Bygge ferdig skjermbilde for presentasjonsmodus (fremheve aktuell scene, tids-tikker i presentasjonsmodus)
2. X Mulighet til å lenke avatar og scene (avataren følger scene-overgangen)
3. Vise hvilket tidsformat som bruks på scenene sitt tidspunkt-input
4. Global redo/undo på all regidering (ctrl-z/ctrl-v på både kart og scener)

##### Endringer – tilbakemeldinger runde 2:

1. Font-valg: font-alternativene må være i de spesifikke font-ene
2. Alle modal-er bør være flyttbar av bruker (som frittstående vinduer)
3. Redigere avatar icon før icon blir satt på avataren (litt som twitter-profilbilde)
4. X Automatisk legg inn tidspunkt fra forrige scene på ny scene (tidspunkt fortsettelse)
5. X En scene skal følge flere kart-posisjoner (gjør dette ved å ha valg om å "keep prevoius scene", altså lag en ny scene på ny posisjon med samme innhold som forrige svene)
6. Legge inn tekst-boks som som alternativ i kart-tegning
7. X Skifte grunnkart fra scene-til-scene, med glidende overgang
8. X Gjør om på objekt redigering slik at det ikke lenger er bygd inn i leaflet.draw, men heller i objektets popup

##### Endringer – tilbakemeldinger runde 3:

1. Lage en markering av koblingen mellom objekters nåværende posisjon og forrige posisjon
2. Legge inn mulighet for å "trace path" for avatarer (legge en linje etter avataren som viser bevegelsen, enten avtagende linje-styrke eller annet)
3. Legge inn glidende transition for avatar mellom scenene
4. X Når man oppretter en ny scene, så skal objektene fra tidligere scene IKKE kopieres inn med en gang. Objektene fra tidligere scene skal kun kopieres inn i nåværende scene når brukeren trykker på objektet fra this.fadeLayer (og drar objektet).


###### Misc.

- Form in scenes needs validation. i.e. the "time" input is not set unless the user gives values for both hour, minute and seconds. If seconds is missing, the time field is not set at all. Add some sort of validation on the set_scene mehtod in events to give a message to the user to set the value in its entirety.
- Source for object-editing enable and disable: https://github.com/Leaflet/Leaflet.draw/issues/129#issuecomment-466672085

- Skal scenene fange et rent snap-shot av kart-objecter, eller skal kart-objekene sine instillinger vedvare over alle scenene?
	- Alternativ 1: avatarer vedvarer og alle andre kart-objekter gjør ikke
	- Alternativ 2: alle kart-objekter vedvarer
	- Alternativ 3: ingen kart-objekter vedvarer (heller ikke avatar)





------------------------

### Endringer gjort i /lib

- **leaflet.draw**
	- Erstattet alle `L.Point(20,20)` med `L.Point(12,12)` i *leaflet.draw-src.js* og *leaflet.draw.js*. For å gjøre resize/move boksene på polyline/polygon objekter mindre
	- ~Fjernet alle kall til `_toggleMarkerHighlight` og fjernet selve metoden og medfølgende hjelpe-metoder på `L.Edit.Marker` i *leaflet.draw-src.js* og *leaflet.draw.js*. For å fjerne objekt-styling på markers i editLayer~
	- ~Fjernet `selectedPathOptions.fillOpacity` på `L.EditToolbar` i *leaflet.draw-src.js* og *leaflet.draw.js*. Slik at polyline/polygon fillOpacity beholdes~
