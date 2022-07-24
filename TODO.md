## TODO

- Biz:
	* Registrere AS hos Stripe for nettbetaling
	* IN markedsavklaring


- Overall:
	* (How?) Implement Stripe payment
	* Reklamespalte i pres-modus for ubetalte brukere
	* Password-beskyttede kart
- My-Maps:
	* Legg til knapp for å "unpublish", dvs. slette kartets post på forumet
- Edit-mode:
	* Mulighet til å rotere avatarer, slider i popup menyen, CSS transform
	* Posibility to make hyperlink to other scenes in the textboxes
	* GEDCOM import:
		- User-defined options for import: only show one gene-line, ...
		- Skal alle hendelser komme inn som scener? (Hver død/fødsel)
		- Somehow mark relation between avatars (line between?, color-coding?, ect.)
- Pres-mode:
	* Alle knapper er "fadet ut" når brukeren ikke beveger musen, og kommer til syne når brukeren beveger eller trykker på skjermen
- Forum-integration:
	* X File and image upload to Amazon S3 (edit-mode and forum)
	* Implement *webhooks.php* for reciving webhook calls from Discourse when user logs in and out; then log user in or out
		- (? maybe obsolete) Cron-job for checking if a user is deleted from the forum; `https://forum.tellusmap.com/u/by-external/{external_id}.json`


- Working TODO:
	* Tekstboks "Create link" knapp; når en tekst er markert bør man få en modal hvor man kan legge inn lenke også blir det `<a href="[Lenke]">[Den markerte teksten]</a>`
	* Lenker i tekstboks; hvis teksten allerede var stor (header 1,2,..), så blir hyperlenke teksten automatisk liten; feil
	* Teksten i boken skal være skalert basert på skjermstørrelse (bruk % eller rem)
