## TODO

- Biz:
	* IN markedsavklaring
	* Gjøres etter Arendal og før Oktober:
		* Omforme Trefadder syse server til enterprise-server
			- Utvide kapasitet (hdd, ram og cpu)
		* Sette opp ny GeoTales hoved-hosting server på Amazon
			- [Pris](https://calculator.aws/#/estimate?id=a58b61ebdfa7889da4ac91c68cc76c20bc42f405)


- Overall:
	* (Fixed?) Reklamespalte i pres-modus for ubetalte brukere

	* Geo-Blog, bruke GeoTales til å kommunisere ut til publikum
		- Mulighet for admins til å pinne-kart til toppen av landings-siden
	* (krever testing) Bugs with payment: kan lage ny bruker hos stripe, men får error når den prøver å gå til stripe-checkout

	* Add ability to buy anually, create a new product in stripe with $5x12x0.8 price
		* Add this info to Pricing page
	* Pricing side; På premium signup gå rett til stripe side etter signup, ikke til Profile

- Edit-mode:
	* Option for å ha hengelås åpen by-defualt i pres-modus
	* Alle betalte funksjoner er grået ut for gratis brukere
	* Mulighet til å rotere avatarer, slider i popup menyen, CSS transform
	* Posibility to make hyperlink to other scenes in the textboxes
	* GEDCOM import:
		- User-defined options for import: only show one gene-line, ...
		- Skal alle hendelser komme inn som scener? (Hver død/fødsel)
		- Somehow mark relation between avatars (line between?, color-coding?, ect.)
- Pres-mode:
	* LEGGE INN LENKE TIL GEOTALES SAMMEN MED LEAFLET/BASEMAP LENKE NEDE TIL HØYRE I LEAFLET


- Working TODO:
	* Tekstboks "Create link" knapp; når en tekst er markert bør man få en modal hvor man kan legge inn lenke også blir det `<a href="[Lenke]">[Den markerte teksten]</a>`
	* Lenker i tekstboks; hvis teksten allerede var stor (header 1,2,..), så blir hyperlenke teksten automatisk liten; feil
	* Teksten i boken skal være skalert basert på skjermstørrelse (bruk % eller rem)
	* https://wms.napkin.no/geoserver/wms
