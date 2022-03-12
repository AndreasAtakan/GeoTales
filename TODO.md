## TODO

- Move the system out of Google Cloud, and onto klick.com server (4 CPU, 8GB RAM, 250 GB SSD)


- Business:
	* Registrere AS hos Stripe for nettbetaling
	* Svar på IN søknad

- W **Use uuid as map_id in database (security, you should not be able to "guess" the id's)**


- Edit-mode:
	* X Kapittelinndeling
	* X Numerert scene (1-n)
	* Under "Available basemaps"; legg til mulighet for blankt/ensfarget grunnart
	* Library of avilable avatar icons (this will save a lot of storage space and cost)
	* Extra drawing-options; add a "pallette" with more map-drawing options (measurement, free-hand, etc.)
	* Fix tootip for ImageOverlay
	* D Add textbox as a map-object drawing option:
		- D Before placing the textbox, when in "drwaing-mode", there will be a small circlemarker following the curser marking the bottom-center position of where the textbox will be placed
		- D When placed, textboxes on map will appear as a leaflet-popup with trumbowyg-textbox inside filling the entire popup
		- D (?) The popup's position will be static relative to the screen, and not to the map
		- D The popup is a Leaflet-Draggable object with a drag-handler in top-left corner
		- D The popup can be resized in both with and height
		- D (?) Have a date/time input above the textbox in the popup instead of the date/time in the scene-box in left section
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
	* Mulighet til å rotere avatarer, slider i popup menyen, CSS transform
	* X Remove rectangle as drawing-option
	* Posibility to make hyperlink to other scenes in the textboxes
	* Avatar-size; only from 10 to (f.ex) 200
	* Map-objects from last scene should automatically be added to the next scene when creating
- Pres-mode:
	* Kapittelinndeling
	* ~When scene content is empty, scene box should not be shown~
	* When transitioning from on scene to the next, map-textboxes should be faded out when the scene is "exited", and faded in when the next scene is "entered"
	* There should be an option to not auto-pan to the next scenes map-position. Lock/Unlock. When unlocked, the map will go to next scene as usual, but not automatically move the map
	* Add logo to "flere knapper valg" dropdown in top right
- Forum-integration:
	* Set up file and image upload to Amazon S3
	* `code/api/img.php`: Upload file to Discourse via API instead of saving to disk. This will utilize Amazon S3 via Discourse
	* Cron-job for checking if a user is deleted from the forum; `https://forum.tellusmap.com/u/by-external/{external_id}.json`
	* Cron-job for checking if an image no longer exists in a map, and then deleting it from Amazon S3
	* Implement *webhooks.php* for reciving webhook calls from Discourse when user logs in and out; then log user in or out


- Working TODO:
	* Scene/Textbox redo; fortsett å jobbe i *textboxes.js*
						  I will change it so that there is only one textbox on the map at the time, and this textbox is a replacement of the scene-textbox.
						  I will use jQuery-UI [draggable](https://jqueryui.com/draggable/#constrain-movement) and [resizable](https://jqueryui.com/resizable/#constrain-area) to make them interactive

- Endringer etter tilbakemeldinger, ny runde:
	* Scene text-box can't write?






- W (not woking) Block zoom on mobile devices; meta tag
- W (not relevant) Mulighet for grunnkart-legende
