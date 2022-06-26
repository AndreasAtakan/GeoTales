## TODO

- Biz:
	* Registrere AS hos Stripe for nettbetaling
	* IN markedsavklaring


- Overall:
	* (How?) Implement Stripe payment
	* Reklamespalte i pres-modus for ubetalte brukere
	* Password-beskyttede kart
- Edit-mode:
	* Library of avilable avatar icons (this will save a lot of storage space and cost)
	* Library of uploaded basemaps under "Avilable basemaps"
	* Mulighet til å rotere avatarer, slider i popup menyen, CSS transform
	* Posibility to make hyperlink to other scenes in the textboxes
	* GEDCOM import:
		- User-defined options for import: only show one gene-line, ...
		- Skal alle hendelser komme inn som scener? (Hver død/fødsel)
		- Somehow mark relation between avatars (line between?, color-coding?, ect.)
	* GeoJSON import:
		- Create a map-drawing-object for each feature in the file
		- Give user choices to set color, fill, tooltip name, etc. as import options
- Pres-mode:
	* When transitioning from on scene to the next, map-textboxes should be faded out when the scene is "exited", and faded in when the next scene is "entered"
	* There should be an option to not auto-pan to the next scenes map-position. Lock/Unlock. When unlocked, the map will go to next scene as usual, but not automatically move the map
	* Alle knapper er "fadet ut" når brukeren ikke beveger musen, og kommer til syne når brukeren beveger eller trykker på skjermen
- Forum-integration:
	* X Set up file and image upload to Amazon S3
	* `code/api/img.php`: Upload file to Discourse via API instead of saving to disk. This will utilize Amazon S3 via Discourse
	* Implement *webhooks.php* for reciving webhook calls from Discourse when user logs in and out; then log user in or out
		- (? maybe obsolete) Cron-job for checking if a user is deleted from the forum; `https://forum.tellusmap.com/u/by-external/{external_id}.json`


- Working TODO:
	* *map.js* linje 264; når jeg prøver å klone en avatar som i seg selv allerede er en klone av en annen avatar, produserer dette en feil
	* Tekstboks "Create link" knapp; når en tekst er markert bør man få en modal hvor man kan legge inn lenke også blir det `<a href="[Lenke]">[Den markerte teksten]</a>`
	* Generelt; legg til støtte for WebP bilder
	* Lenker i tekstboks; hvis teksten allerede var stor (header 1,2,..), så blir hyperlenke teksten automatisk liten; feil













- Teksten i boken skal være skalert basert på skjermstørrelse (bruk % eller rem)
- Pres-modus
- My Maps; legg til knapp for å "unpublish", dvs. slette kartets post på forumet
