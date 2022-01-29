## TODO

- Move the system out of Google Cloud, and onto klick.com server (4 CPU, 8GB RAM, 250 GB SSD)
- Port Paul map onto system


- Business:
	1. Vente på registrering av AS hos Brønnøysund
	2. Registrere AS hos Stripe for nettbetaling


- Landing page redesign:
	1. X Top part of page should be a grid view of the top 15 posted maps from the forum (like a gallery)
	2. X Add project preview image, this shoud be a link to the center basemap image (to keep things simple)
	3. X Pricing should not be included (pricing info is on settings-page)
	4. X Big "Create your own map here" button (directly to sign up, with Google, Facebook, etc.)
- Projects page:
	1. X Add a "Share" button; opens a share modal
		- X Contains a copy-field with the link to pres-mode, user can click "copy to clipboard"
		- X Contains a copy-field with the link to pres-mode in iframe, user can click "copy to clipboard"
		- X User can share to FB, Twitter, email, etc.
- Edit-mode:
	0. When user saves the map; also write the center basemap-tile as the map's *preview*
	1. BUG; "Pluss" button on scene (under delete); click-event is still active in prepare-mode
	2. Prepare-scene box should have a cancel button (X) to remove
	3. When in prepare mode, all avatars should be moved to fadeLayer
	4. Kapittelinndeling
	5. Library of avilable avatar icons (this will save a lot of storage space and cost)
	6. Extra drawing-options; add a "pallette" with more map-drawing options (measurement, free-hand, etc.)
	7. Avatar-sizing looks wierd on different screen-sizes; solution could be to fix avatar size to a certain zoom-level
	8. GEDCOM import:
		- User-defined options for import: only show one gene-line, ...
		- Skal alle hendelser komme inn som scener? (Hver død/fødsel)
		- Somehow mark relation between avatars (line between?, color-coding?, ect.)
	9. Down the line; all changes should be auto-saved
- Pres-mode:
	1. When scene content is empty, scene box should not be shown
	2. Extra buttons to navigate; "Back to forum", "Back to my projects", Chapter-navigation
	3. Fix date in scene box so that it "ticks" from previous date to next date
	4. Legg til fade inn og ut på scenene
	5. Når kartet ikke er på scenens bounds, og brukeren trykker på et bilde i scene-boksen, så skal det ikke åpne bilde-modal, men heller gå til scenens bounds og kun åpne bilde-modal når brukeren trykker på bildet og kartet allerde står på scnene-bounds
- Forum:
	1. X When user publishes map to forum; embed pres-mode as an iframe into the post
	2. W Add navigation buttons to header; "Gallery" button, "My maps" button
	3. Set up file and image upload to Amazon S3
	4. Add login providers: Google, Apple, Facebook, Twitter, GitHub, Discord
- Forum-integration:
	1. Cron-job for checking if a user is deleted from the forum
	2. Cron-job for checking if an image no longer exists in a map, and then deleting it from Amazon S3
	3. `code/api/img.php`: Upload file to Discourse via API instead of saving to disk. This will utilize Amazon S3 via Discourse
	4. Add api-call for checking if user is logged in on the forum. Auto-login user if *yes*, log user out of *no*.
	5. X Use avatar from the forum instead of user-icon in navbar (fetch avatar from forum API)


- Working TODO:
	- W DB change; Rename "Project" to "Map", complete change in *edit.php*, *pres.php*, etc.
	- W Paramater change; Rename "pid" to "id", complete change in *edit.php*, *pres.php*, etc.
	- X Create a PHP config file that parametarizes out the forum-url, and things like that
	- X New header background-color; #eba937
	- X New logo; assets/logo.png
	- (?) Landing page; Add search bar above grid-view that redirects to Forum *Public maps* search






- WIP (not woking) Block zoom on mobile devices; meta tag
- X (extend this) Mulighet for grunnkart-legende
- Edit-mode
	- (?) Avatar-ikon; Mulighet til å rotere, slider i popup menyen, CSS transform
- Presentation-mode
	- (?) Avatar-ikon overganger; gjøre mer "smooth" (fade-overgang på avatar-ikoner fra scene til scene)
