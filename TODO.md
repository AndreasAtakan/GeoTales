## TODO

- Move the system out of Google Cloud, and onto klick.com server (4 CPU, 8GB RAM, 250 GB SSD)


- Business:
	* Registrere AS hos Stripe for nettbetaling

- IN:
	* Vedlegg i søknaden:
		- Skjermbilde av GeoGebra modell med forklarende tekst under
		- Tre skjermbilder, hvert av en scene i Paulus kartet, med videre forklaring av programmet

- Landing page redesign:
	* Move "Top 15 maps" text to under search field
	* Rename "Try now" button to "Create map"
- Edit-mode:
	* ~Kapittelinndeling~
	* Numerert scene (1-n)
	* Under "Available basemaps"; legg til mulighet for blankt/ensfarget grunnart
	* Library of avilable avatar icons (this will save a lot of storage space and cost)
	* Extra drawing-options; add a "pallette" with more map-drawing options (measurement, free-hand, etc.)
	* Fix tootip for ImageOverlay
	* Add textbox as a map-object drawing option:
		- Before placing the textbox, when in "drwaing-mode", there will be a small circlemarker following the curser marking the bottom-center position of where the textbox will be placed
		- When placed, textboxes on map will appear as a leaflet-popup with trumbowyg-textbox inside filling the entire popup
		- (?) The popup's position will be static relative to the screen, and not to the map
		- The popup is a Leaflet-Draggable object with a drag-handler in top-left corner
		- The popup can be resized in both with and height
		- (?) Have a date/time input above the textbox in the popup instead of the date/time in the scene-box in left section
	* Remove textbox from left scene section
	* Redo left scene-section:
		- This section will ONLY contain scenes
		- Change the section into a collapsable "drop-down/-up" with a much smaller total width
		- The section will only contain small box-elements that represent a single scene with buttons for "recapture", "delete", "reorder", etc.
		- Each box-element will have a checkbox that can mark that scene as the begining of a new chapter. When checked, a small textbox will appear where the user can input the chapter title
	* Redo "create new scene" workflow:
		- When user clicks "+" under a scene, the new scene must be created immediately, capturing the maps current extent. This will NOT trigger a "flash" on the map
		- If user wants to change the scene's map-extent, user can simply click "recapture"
		- Only "Recapture" will trigger a map flash-effect
	* GEDCOM import:
		- User-defined options for import: only show one gene-line, ...
		- Skal alle hendelser komme inn som scener? (Hver død/fødsel)
		- Somehow mark relation between avatars (line between?, color-coding?, ect.)
	* Mulighet til å rotere avatarer, slider i popup menyen, CSS transform
- Pres-mode:
	* ~When scene content is empty, scene box should not be shown~
	* When transitioning from on scene to the next, map-textboxes should be faded out when the scene is "exited", and faded in when the next scene is "entered"
	* There should be an option to not auto-pan to the next scenes map-position. Lock/Unlock. When unlocked, the map will go to next scene as usual, but not automatically move the map
- Forum-integration:
	* Set up file and image upload to Amazon S3
	* Add login providers: Google, Apple, Facebook, Twitter, GitHub, Discord
	* Cron-job for checking if a user is deleted from the forum; `https://forum.tellusmap.com/u/by-external/{external_id}.json`
	* Cron-job for checking if an image no longer exists in a map, and then deleting it from Amazon S3
	* `code/api/img.php`: Upload file to Discourse via API instead of saving to disk. This will utilize Amazon S3 via Discourse
	* Implement *webhooks.php* for reciving webhook calls from Discourse when user logs in and out; then log user in or out


- Working TODO:
	* Paul map

- Endringer etter tilbakemeldinger, ny runde:
	* Scene text-box can't write?






- W (not woking) Block zoom on mobile devices; meta tag
- X (extend this) Mulighet for grunnkart-legende
