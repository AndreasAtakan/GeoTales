## TODO

- (?) Use map bounds instead of center/zoom. Small devices needs to show the entire map-extent
- X Bug; when scenes are rearranged, the basemap "last_basemap" mechanism needs to update the scenes basemap value so that the last basemap is still the same basemap as before the reordering



- T (TEST THIS) Block zoom on mobile devices; meta tag
- X Can't pinch-zoom map on mobile
- X Roman-era basemap without churches; new basemap system with support for XYZ-tiles and Mapbox styles
- (-) Roman-era map, remove roads
- V (Legg også til i pres.modus) Mulighet for grunnkart-legende

- Edit-mode
	- X Move offcanvas content to header and add collapse on medium-screen break-point
	- (?) Add a rectangle on the current scene's bounds
	- X Endre hva som er default grunnkart (utgangspunkt grunnkart)
	- V (Dette vil løses med Summernote) Legg til slette-x-knapp på bildene i scenene
	- \[WORKING ON THIS\] Erstatte Pell tekstboks med Summernote textboks:
		- (Løses med Summernote) Pell tekst-boks på scenene, legg in flere valg (tekst-størrelse, tekst-farge, etc.)
		- (Løses med Summernote) Gjør Pell tekst-boks større
	- Avatar-ikon:
		- Automatisk gjør ikon-bilde dimensjoner lik utgangspunkt-bilde
		- Mulighet til å endre størrelse
		- Mulighet til å rotere; slider i popup menyen, CSS transform
		- Valg på "Rounded"; skal avatar være sirkel eller firkant
		- Sjekkboks på "make settings global"; sett gjeldene avatar instillinger på instanser av avataren i alle scenene

- Presentation-mode
	- X Add full-screen button
	- X (TEST THIS) Fadelayer skal ikke eksistere i pres. modus
	- X Fix date-ticker, screen-shots from JE
	- Gjøre om på scenene slik at de ikke er i en `<ul>`, men heller separate 'cards' med avstand mellom hverande slik at kun den mitterste er i "fokus".
	  Også legge inn slik at scenene over og under den aktive scenen "forsvinner" bak en slags 'fade' (kanskje også med pil-opp og pil-ned knapper?)
