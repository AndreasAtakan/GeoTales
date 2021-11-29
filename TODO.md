## TODO

- (?) Use map bounds instead of center/zoom. Small devices needs to show the entire map-extent
- X (TEST THIS) Bug; when scenes are rearranged, the basemap "last_basemap" mechanism needs to update the scenes basemap value so that the last basemap is still the same basemap as before the reordering



- X (TEST THIS) Block zoom on mobile devices; meta tag
- X Can't pinch-zoom map on mobile
- X (TEST THIS, made new basemap system with support for XYZ-tiles and Mapbox styles) Roman-era basemap without churches

- Edit-mode
	- Move offcanvas content to header and add collapse on medium-screen break-point
	- Add "grey-out" overlay over entire map except the section where the curren active scene is
	- X "Available basemaps" accordian should not extend the modal zoom, it should only fill the screen height and overflow with scroll
	- Mulighet til å endre avatar-icon størrelse

- Presentation-mode
	- X Add full-screen button
	- X (TEST THIS) Fadelayer skal ikke eksistere i pres. modus
	- X Fix date-ticker, screen-shots from JE
	- Gjøre om på scenene slik at de ikke er i en `<ul>`, men heller separate 'cards' med avstand mellom hverande slik at kun den mitterste er i "fokus".
      Også legge inn slik at scenene over og under den aktive scenen "forsvinner" bak en slags 'fade' (kanskje også med pil-opp og pil-ned knapper?)
