#!/bin/sh

T=${1:-"test"}

cd ../geotales.io/src/
bash compile.sh
cd ../../deploy/

rm -rf build/
mkdir build

cd ../geotales.io/
cp -r api/ \
	  assets/ \
	  lib/ \
	  vendor/ \
	  main.css \
	  robots.txt \
	  *.php \
	  ../deploy/build/

cd ../deploy/build/
if [ $T == "prod" ]; then sed -i "s/geotales-test/geotales/" init.php; fi
