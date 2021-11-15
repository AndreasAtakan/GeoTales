## Notes

##### Endringer basert på tilbakemelding:

1. X Gjøre om på scroll slik at scene-valg gjøres av brukerklikk i stedet for scolling (også med tastatur-pil navigering)
2. Bygge ferdig skjermbilde for presentasjonsmodus (fremheve aktuell scene, tids-tikker i presentasjonsmodus)
3. X Bygge inn valg for bakgrunnskart
4. X Mulighet til å lenke avatar og scene (avataren følger scene-overgangen)
5. Misc:
	- X Eget icon på avatar (marker-drawing, eget icon og eget navn)
	- Vise hvilket tidsformat som bruks på scenene sitt tidspunkt-input
	- Global redo/undo på all regidering (ctrl-z/ctrl-v på både kart og scener)
	- X Navn-endring: I map-options, "Clustering"->"Avatar Clustering", "Or choose custom basemap"->"Or choose custom basemap (this can be any image file)"
	- Bugs: Safari browser, map-object popup vises ikke på klikk

##### Endringer – tilbakemeldinger runde 2:

1. Font-valg: font-alternativene må være i de spesifikke font-ene
2. Alle modal-er bør være flyttbar av bruker (som frittstående vinduer)
3. Redigere avatar icon før icon blir satt på avataren (litt som twitter-profilbilde)
4. Utforske alternative muligheter for pin-to-map funksjonalitet på avatar
5. X Automatisk legg inn tidspunkt fra forrige scene på ny scene (tidspunkt fortsettelse)
6. En scene skal følge flere kart-posisjoner (gjør dette ved å ha valg om å "keep prevoius scene", altså lag en ny scene på ny posisjon med samme innhold som forrige svene)
7. Legge inn tekst-boks som som alternativ i kart-tegning
8. Skifte grunnkart fra scene-til-scene, med glidende overgang
9. Gjør om på objekt redigering slik at det ikke lenger er bygd inn i leaflet.draw, men heller i objektets popup

###### Misc.

- Form in scenes needs validation. i.e. the "time" input is not set unless the user gives values for both hour, minute and seconds. If seconds is missing, the time field is not set at all. Add some sort of validation on the set_scene mehtod in events to give a message to the user to set the value in its entirety.
- Source for object-editing enable and disable: https://github.com/Leaflet/Leaflet.draw/issues/129#issuecomment-466672085

- Skal scenene fange et rent snap-shot av kart-objecter, eller skal kart-objekene sine instillinger vedvare over alle scenene?
	- Alternativ 1: avatarer vedvarer og alle andre kart-objekter gjør ikke
	- Alternativ 2: alle kart-objekter vedvarer
	- Alternativ 3: ingen kart-objekter vedvarer (heller ikke avatar)





------------------------

- Profile bar: kan slås av og på ved valg (både i pres.- og redigerings modus)
	- Når en person eller sted (element på profile bar) er markert, og bruker scroller forbi denne personen, vil det elementet henge igjen for at det ikke skal forsvinne av skjermen

- Flytte timeline options til tannhjulet på tidslinjen
- Flytte cluster mode til tannhjul på profile bar-en
