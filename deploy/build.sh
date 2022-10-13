#!/bin/sh

NOW=$(date +%s)

cd ../geotales.io/src/
rm main_*.js*
npm run build
cp edit/main.js main_edit_$NOW.js
cp edit/main.js.map main_edit_$NOW.js.map
sed -i "s/main.js.map/main_edit_$NOW.js.map/" edit/main.js
cp pres/main.js main_pres_$NOW.js
cp pres/main.js.map main_pres_$NOW.js.map
sed -i "s/main.js.map/main_pres_$NOW.js.map/" pres/main.js
rm edit/main.js* pres/main.js*

cd ../
sed -i "s/main_edit_.*.js/main_edit_$NOW.js/" edit.php
sed -i "s/main_pres_.*.js/main_pres_$NOW.js/" pres.php

cd ../deploy/
rm -rf build/
mkdir build
mkdir build/src

cd ../geotales.io/
cp -r assets/ \
	  lib/ \
	  main.css \
	  robots.txt \
	  *.php \
	  ../deploy/build/
cp src/main_*.css ../deploy/build/src/
cp src/main_*.js* ../deploy/build/src/
