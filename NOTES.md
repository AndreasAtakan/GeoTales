## Notes

##### Endringer – tilbakemeldinger runde 1:

1. V Vise hvilket tidsformat som bruks på scenene sitt tidspunkt-input
2. Global redo/undo på all regidering (ctrl-z/ctrl-v på både kart og scener)

##### Endringer – tilbakemeldinger runde 2:

1. V Alle modal-er bør være flyttbar av bruker (som frittstående vinduer)
2. Redigere avatar icon før icon blir satt på avataren (litt som twitter-profilbilde)
3. Legge inn tekst-boks som alternativ i kart-tegning

##### Endringer – tilbakemeldinger runde 3:

1. Legge inn mulighet for å "trace path" for avatarer (legge en linje etter avataren som viser bevegelsen, enten avtagende linje-styrke eller annet)


###### Misc.

- Source for object-editing enable and disable: https://github.com/Leaflet/Leaflet.draw/issues/129#issuecomment-466672085

- Gi brukeren muligheten til å plassere/posisjonere bilde-grunnkart i forhold til de innebygde grunnkartene
	- Fremtidig utvidelse: en full grunnkart-editor hvor brukeren kan lage sine egne grunnkart med bilder og/eller innebygde grunnkart, og lagre dem til "Avaiable basemaps"
	  Og "Available basemaps" bør ha et søkefelt på toppen

- Kapittel-inndeling av scenene (gruppere scenene i "kapitler" og ha en innholdfortegnelse av alle kapitler øverst, på toppen av scene-seksjonen)

- Dato-velger må være lettere å finne fram til ønsket år (ikke scrolle i 15 min). Gjelder Chrome

- V Bilde på scenene; legge inn et mellomsteg før man setter inn hvor brukeren kan crop-e/omforme/legge inn tekst på bildet (litt som twitter profil-bilder)

- Ny avatar-icon funksjonalitet: Legg inn ny ui i avatar-popup under "overlay" hvor brukeren kan legge predefinerte ikoner med gjennomsiktighet (png), f.eks. båt, bil, ol., som vil legges på toppen av avatarens eksisterende ikon. Dette gir avataren ekstra "forteller"-verdi
- Legg inn fade-overgang mellom avatar-ikoner fra scene til scene

- [Grunnkart kilde](https://maps.lib.utexas.edu/maps)





------------------------

### Endringer gjort i /lib

- **leaflet.draw**
	- Erstattet alle `L.Point(20,20)` med `L.Point(12,12)` i *leaflet.draw-src.js* og *leaflet.draw.js*. For å gjøre resize/move boksene på polyline/polygon objekter mindre
	- ~Fjernet alle kall til `_toggleMarkerHighlight` og fjernet selve metoden og medfølgende hjelpe-metoder på `L.Edit.Marker` i *leaflet.draw-src.js* og *leaflet.draw.js*. For å fjerne objekt-styling på markers i editLayer~
	- ~Fjernet `selectedPathOptions.fillOpacity` på `L.EditToolbar` i *leaflet.draw-src.js* og *leaflet.draw.js*. Slik at polyline/polygon fillOpacity beholdes~
