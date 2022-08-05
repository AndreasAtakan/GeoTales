## TODO

- Biz:
	* Registrere AS hos Stripe for nettbetaling
	* IN markedsavklaring


- Overall:
	* (How?) Implement Stripe payment
	* (Fixed?) Reklamespalte i pres-modus for ubetalte brukere
- Edit-mode:
	* Mulighet til å rotere avatarer, slider i popup menyen, CSS transform
	* Posibility to make hyperlink to other scenes in the textboxes
	* GEDCOM import:
		- User-defined options for import: only show one gene-line, ...
		- Skal alle hendelser komme inn som scener? (Hver død/fødsel)
		- Somehow mark relation between avatars (line between?, color-coding?, ect.)
- Pres-mode:
	* \~
- Forum-integration:
	* X File and image upload to Amazon S3 (edit-mode and forum)
	* Implement *webhooks.php* for reciving webhook calls from Discourse when user logs in and out; then log user in or out
		- (? maybe obsolete) Cron-job for checking if a user is deleted from the forum; `https://forum.geotales.io/u/by-external/{external_id}.json`


- Working TODO:
	* Tekstboks "Create link" knapp; når en tekst er markert bør man få en modal hvor man kan legge inn lenke også blir det `<a href="[Lenke]">[Den markerte teksten]</a>`
	* Lenker i tekstboks; hvis teksten allerede var stor (header 1,2,..), så blir hyperlenke teksten automatisk liten; feil
	* Teksten i boken skal være skalert basert på skjermstørrelse (bruk % eller rem)
	* https://wms.napkin.no/geoserver/wms
