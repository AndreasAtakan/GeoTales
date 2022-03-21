## TODO

- Move the system out of Google Cloud, and onto klick.com server (4 CPU, 8GB RAM, 250 GB SSD)


- Business:
	* Registrere AS hos Stripe for nettbetaling
	* IN søknad

- W **Use uuid as map_id in database (security, you should not be able to "guess" the id's)**


- Overall:
	* (How?) Implement Stripe payment
- Edit-mode:
	* X Kapittelinndeling
	* X Numerert scene (1-n)
	* X Remove rectangle as drawing-option
	* Library of avilable avatar icons (this will save a lot of storage space and cost)
	* Library of uploaded basemaps under "Avilable basemaps"
	* X Under "Available basemaps"; legg til mulighet for blankt/ensfarget grunnart
	* Extra drawing-options; add a "pallette" with more map-drawing options (measurement, free-hand, etc.)
	* Fix tootip for ImageOverlay
	* Mulighet til å rotere avatarer, slider i popup menyen, CSS transform
	* Posibility to make hyperlink to other scenes in the textboxes
	* Avatar-size; only from 10 to (f.ex) 200
	* Map-objects from last scene should automatically be added to the next scene when creating
	* X Add textbox as a map-object drawing option:
		- X The popup's position will be static relative to the screen, and not to the map
		- X The popup can be resized in both with and height
	* X Remove textbox from left scene section
	* X Redo left scene-section:
		- X This section will ONLY contain scenes
		- X Change the section into a collapsable "drop-down/-up" with a much smaller total width
		- X The section will only contain small box-elements that represent a single scene with buttons for "recapture", "delete", "reorder", etc.
		- X Each box-element will have a checkbox that can mark that scene as the begining of a new chapter. When checked, a small textbox will appear where the user can input the chapter title
	* X Redo "create new scene" workflow:
		- X When user clicks "+" under a scene, the new scene must be created immediately, capturing the maps current extent. This will NOT trigger a "flash" on the map
		- X If user wants to change the scene's map-extent, user can simply click "recapture"
		- X Only "Recapture" will trigger a map flash-effect
	* GEDCOM import:
		- User-defined options for import: only show one gene-line, ...
		- Skal alle hendelser komme inn som scener? (Hver død/fødsel)
		- Somehow mark relation between avatars (line between?, color-coding?, ect.)
	* GeoJSON import:
		- Create a map-drawing-object for each feature in the file
		- Give user choices to set color, fill, tooltip name, etc. as import options
- Pres-mode:
	* Kapittelinndeling
	* ~When scene content is empty, scene box should not be shown~
	* When transitioning from on scene to the next, map-textboxes should be faded out when the scene is "exited", and faded in when the next scene is "entered"
	* There should be an option to not auto-pan to the next scenes map-position. Lock/Unlock. When unlocked, the map will go to next scene as usual, but not automatically move the map
	* Add logo to "flere knapper valg" dropdown in top right
- Forum-integration:
	* X Set up file and image upload to Amazon S3
	* `code/api/img.php`: Upload file to Discourse via API instead of saving to disk. This will utilize Amazon S3 via Discourse
	* Implement *webhooks.php* for reciving webhook calls from Discourse when user logs in and out; then log user in or out
		- (? maybe obsolete) Cron-job for checking if a user is deleted from the forum; `https://forum.tellusmap.com/u/by-external/{external_id}.json`


- Working TODO:
	* –

- Endringer etter tilbakemeldinger, ny runde:
	* Scene text-box can't write?






- W (not woking) Block zoom on mobile devices; meta tag
