## Notes

##### Endringer – tilbakemeldinger runde 1:

1. Bygge ferdig skjermbilde for presentasjonsmodus (fremheve aktuell scene, tids-tikker i presentasjonsmodus)
2. X Mulighet til å lenke avatar og scene (avataren følger scene-overgangen)
3. Vise hvilket tidsformat som bruks på scenene sitt tidspunkt-input
4. Global redo/undo på all regidering (ctrl-z/ctrl-v på både kart og scener)

##### Endringer – tilbakemeldinger runde 2:

1. Font-valg: font-alternativene må være i de spesifikke font-ene
2. V Alle modal-er bør være flyttbar av bruker (som frittstående vinduer)
3. Redigere avatar icon før icon blir satt på avataren (litt som twitter-profilbilde)
4. X Automatisk legg inn tidspunkt fra forrige scene på ny scene (tidspunkt fortsettelse)
5. X En scene skal følge flere kart-posisjoner (gjør dette ved å ha valg om å "keep prevoius scene", altså lag en ny scene på ny posisjon med samme innhold som forrige svene)
6. Legge inn tekst-boks som alternativ i kart-tegning
7. X Skifte grunnkart fra scene-til-scene, med glidende overgang
8. X Gjør om på objekt redigering slik at det ikke lenger er bygd inn i leaflet.draw, men heller i objektets popup

##### Endringer – tilbakemeldinger runde 3:

1. X Lage en markering av koblingen mellom objekters nåværende posisjon og forrige posisjon
2. Legge inn mulighet for å "trace path" for avatarer (legge en linje etter avataren som viser bevegelsen, enten avtagende linje-styrke eller annet)
3. X Legge inn glidende transition for avatar mellom scenene
4. X Når man oppretter en ny scene, så skal objektene fra tidligere scene IKKE kopieres inn med en gang. Objektene fra tidligere scene skal kun kopieres inn i nåværende scene når brukeren trykker på objektet fra this.fadeLayer (og drar objektet).


###### Misc.

- Form in scenes needs validation, i.e. the "time" input is not set unless the user gives values for both hour, minute and seconds. If seconds is missing, the time field is not set at all. Add some sort of validation on the set_scene mehtod in events to give a message to the user to set the value in its entirety.
- Source for object-editing enable and disable: https://github.com/Leaflet/Leaflet.draw/issues/129#issuecomment-466672085

- Gi brukeren muligheten til å plassere/posisjonere bilde-grunnkart i forhold til de innebygde grunnkartene
	- Fremtidig utvidelse: en full grunnkart-editor hvor brukeren kan lage sine egne grunnkart med bilder og/eller innebygde grunnkart, og lagre dem til "Avaiable basemaps"
	  Og "Available basemaps" bør ha et søkefelt på toppen

- Kapittel-inndeling av scenene (gruppere scenene i "kapitler" og ha en innholdfortegnelse av alle kapitler øverst, på toppen av scene-seksjonen)





------------------------

### Endringer gjort i /lib

- **leaflet.draw**
	- Erstattet alle `L.Point(20,20)` med `L.Point(12,12)` i *leaflet.draw-src.js* og *leaflet.draw.js*. For å gjøre resize/move boksene på polyline/polygon objekter mindre
	- ~Fjernet alle kall til `_toggleMarkerHighlight` og fjernet selve metoden og medfølgende hjelpe-metoder på `L.Edit.Marker` i *leaflet.draw-src.js* og *leaflet.draw.js*. For å fjerne objekt-styling på markers i editLayer~
	- ~Fjernet `selectedPathOptions.fillOpacity` på `L.EditToolbar` i *leaflet.draw-src.js* og *leaflet.draw.js*. Slik at polyline/polygon fillOpacity beholdes~
