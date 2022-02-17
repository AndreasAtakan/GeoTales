## Notes

##### Endringer – tilbakemeldinger runde 1:

1. V Vise hvilket tidsformat som bruks på scenene sitt tidspunkt-input
2. Global redo/undo på all regidering (ctrl-z/ctrl-v på både kart og scener)

##### Endringer – tilbakemeldinger runde 2:

1. Legge inn tekst-boks som alternativ i kart-tegning

##### Endringer – tilbakemeldinger runde 3:

1. Legge inn mulighet for å "trace path" for avatarer (legge en linje etter avataren som viser bevegelsen, enten avtagende linje-styrke eller annet)


###### Misc.

- Source for object-editing enable and disable: https://github.com/Leaflet/Leaflet.draw/issues/129#issuecomment-466672085

- Gi brukeren muligheten til å plassere/posisjonere bilde-grunnkart i forhold til de innebygde grunnkartene
	- Fremtidig utvidelse: en full grunnkart-editor hvor brukeren kan lage sine egne grunnkart med bilder og/eller innebygde grunnkart, og lagre dem til "Avaiable basemaps"
	  Og "Available basemaps" bør ha et søkefelt på toppen

- Dato-velger må være lettere å finne fram til ønsket år (ikke scrolle i 15 min). Gjelder Chrome

- V Bilde på scenene; legge inn et mellomsteg før man setter inn hvor brukeren kan crop-e/omforme/legge inn tekst på bildet (litt som twitter profil-bilder)

- [Grunnkart kilde](https://maps.lib.utexas.edu/maps)


- Discourse installasjon:
	- [SMTP issues](https://meta.discourse.org/t/discourse-with-other-websites-smtp-issue-end-of-file-reached/162893/3)
	- [SSO provider](https://meta.discourse.org/t/using-discourse-as-an-identity-provider-sso-discourseconnect/32974/1)
	- [Amazon S3 setup](https://meta.discourse.org/t/setting-up-file-and-image-uploads-to-s3/7229/1)
	- [Header links](https://meta.discourse.org/t/custom-header-links/90588/1)
	- Settings->Files->Authorized extensions; add *.tellus* extension
	- Settings->?; add `https://tellusmap.com` to allowed iframe domains
	- Install *Grace* theme
	- Set header color i *Default* theme; Admin settings->Customize->Colors->Light->Header background and Header primary


- Down-the-line:
	1. Alle endringer bør auto-lagres
	2. Bug with white lines on dark basemaps; porting all the code to MapBox will most likely fix this issue, but it will cost time. This should be done only if this bug hinders user-growth or if we have enought resources (money) to do it.
	3. Avatar følger linje (rute) fra scene-til-scene. En linje som følger avataren fra scene-til-scene
		- Når en bruker trykker på en avatar i pres.-mode, vår man valg om å se hele avatarens "reise"/rute oppsumert og markert med sammenhenge linje
		- [Cool font](https://exeterbookhand.com/)
	4. Problem hvis grunnkart forsvinner fra grunnkart-leverandørene; Vi bør ha et mellom-system som behandler alle grunnkart-leverandørene, slik at edit-mode kobler selg til dette mellom-systemet og ikke direkte til leverandørene. Da kan vi kontrollere hvis et grunnkart forsvinner.





------------------------

### Endringer gjort i /lib

- **leaflet.draw**
	- Erstattet alle `L.Point(20,20)` med `L.Point(12,12)` i *leaflet.draw-src.js* og *leaflet.draw.js*. For å gjøre resize/move boksene på polyline/polygon objekter mindre
	- ~Fjernet alle kall til `_toggleMarkerHighlight` og fjernet selve metoden og medfølgende hjelpe-metoder på `L.Edit.Marker` i *leaflet.draw-src.js* og *leaflet.draw.js*. For å fjerne objekt-styling på markers i editLayer~
	- ~Fjernet `selectedPathOptions.fillOpacity` på `L.EditToolbar` i *leaflet.draw-src.js* og *leaflet.draw.js*. Slik at polyline/polygon fillOpacity beholdes~
