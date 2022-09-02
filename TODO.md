## TODO

- Biz:
	* IN markedsavklaring
	* Gjøres etter Arendal og før Oktober:
		* Omforme Trefadder syse server til enterprise-server
			- Utvide kapasitet (hdd, ram og cpu)
		* Sette opp ny GeoTales hoved-hosting server på Amazon
			- EC2 linux VM: 550GB ssd, 16GB ram, 2 cpu
			- [Pris](https://calculator.aws/#/estimate?id=fd96a5e49ea3c7799c3a7d82a54deb06a49dc553)
		* ~~Omforme GeoTales syste server til backup-server~~
			- Omgjøre kapasitet (mindre cpu og ram, mer hdd)
			- Ikke hoste kildekode, bare backup av Postgres database og Discourse-backup


- Overall:
	* (WIP) Implement Stripe payment
	* (Fixed?) Reklamespalte i pres-modus for ubetalte brukere
	* Flytte alle pres-modus ting
	* Geo-Blog, bruke GeoTales til å kommunisere ut til publikum
		- Mulighet for admins til å pinne-kart til toppen av landings-siden
	* (krever testing) Bugs with payment: kan lage ny bruker hos stripe, men får error når den prøver å gå til stripe-checkout
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
	* Views fra pres-modus må telle inn i views på landingssiden
	* Hengelås mer tydelig ikon
	* Navigasjons-piler er øverst i boken (låst)


- Working TODO:
	* Tekstboks "Create link" knapp; når en tekst er markert bør man få en modal hvor man kan legge inn lenke også blir det `<a href="[Lenke]">[Den markerte teksten]</a>`
	* Lenker i tekstboks; hvis teksten allerede var stor (header 1,2,..), så blir hyperlenke teksten automatisk liten; feil
	* Teksten i boken skal være skalert basert på skjermstørrelse (bruk % eller rem)
	* https://wms.napkin.no/geoserver/wms
