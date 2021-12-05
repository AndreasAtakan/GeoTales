## TODO

- (?) Use map bounds instead of center/zoom. Small devices needs to show the entire map-extent



- T (TEST THIS) Block zoom on mobile devices; meta tag
- (-) Roman-era map, remove roads
- X (Extend) Mulighet for grunnkart-legende

- Edit-mode
	- (?) Add a rectangle on the current scene's bounds
	- V (Dette vil løses med ny tekstboks) Legg til slette-x-knapp på bildene i scenene
	- X (TEST THIS) Erstatte Pell tekstboks:
	- X (TEST THIS) Avatar-ikon:
		- W Automatisk gjør ikon-bilde dimensjoner lik utgangspunkt-bilde
		- W Mulighet til å endre størrelse
		- W Valg på "Rounded"; skal avatar være sirkel eller firkant
		- W "Make settings global"; sett gjeldene avatar instillinger på instanser av avataren i alle scenene
		- W Avatar label; a small text-string under the icon
		- Mulighet til å rotere; slider i popup menyen, CSS transform

- Presentation-mode
	- Gjøre om på scenene slik at de ikke er i en `<ul>`, men heller separate 'cards' med avstand mellom hverande slik at kun den mitterste er i "fokus".
	  Også legge inn slik at scenene over og under den aktive scenen "forsvinner" bak en slags 'fade' (kanskje også med pil-opp og pil-ned knapper?)
