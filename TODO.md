## TODO

- Move the system out of Google Cloud, and onto klick.com server (4 CPU, 8GB RAM, 250 GB SSD)
- Port Paul map onto system


- Business:
	1. Vente på registrering av AS hos Brønnøysund
	2. Registrere AS hos Stripe for nettbetaling


- Landing page redesign:
	1. Top part of page should be a grid view of the top 15 posted maps from the forum (like a gallery)
	2. Add project preview image, this shoud be a link to the center basemap image (to keep things simple)
	3. Pricing should not be included (hide away somewhere else)
	4. Big "Create your own map here" button (directly yo sign up, with Google, Facebook, etc.)
	5. Down the line; keep users watching, add suggested maps so users keep watching
- Projects page:
	1. X Add a "Share" button; opens a share modal
		- X Contains a copy-field with the link to pres-mode, user can click "copy to clipboard"
		- X Contains a copy-field with the link to pres-mode in iframe, user can click "copy to clipboard"
		- X User can share to FB, Twitter, email, etc.
- Edit-mode:
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
	2. Add navigation buttons to header; "home" button goes to landing page, "My projects" button goes to projects page
	3. Set up file and image upload to Amazon S3
	4. Add login providers: Google, Apple, Facebook, Twitter, GitHub, Discord
- Forum-integration:
	1. Cron-job for checking if a user is deleted from the forum
	2. Cron-job for checking if an image no longer exists in a project, and then deleting it from Amazon S3
	3. `code/api/img.php`: Upload file to Discourse via API instead of saving to disk. This will utilize Amazon S3 via Discourse
	4. Add api-call for checking if user is logged in on the forum. Auto-login user if *yes*, log user out of *no*.
	5. Don't use fontawesome user-icon in navbar, instead use the avatar from the forum (fetch this from API-call)


- Working TODO:
	- W DB change; Rename "Project" to "Map"
	- W Paramater change; Rename "pid" to "id", complete change in *edit.php*, *pres.php*, etc.
	- Create a PHP config file that parametarizes out the forum-url, and things like that
	- W New header background-color; #eba937, todo also add to forum
	- X New logo; assets/logo.png
	- Continue work on landing-page






- WIP (not woking) Block zoom on mobile devices; meta tag
- X (extend this) Mulighet for grunnkart-legende
- Edit-mode
	- (?) Avatar-ikon; Mulighet til å rotere, slider i popup menyen, CSS transform
- Presentation-mode
	- (?) Avatar-ikon overganger; gjøre mer "smooth" (fade-overgang på avatar-ikoner fra scene til scene)
