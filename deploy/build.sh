#!/bin/sh

cd ../geotales.io/src/
bash compile.sh
cd ../../deploy/

rm -rf build/
mkdir build

cd ../geotales.io/
cp -r assets/ \
	  lib/ \
	  main.css \
	  robots.txt \
	  *.php \
	  ../deploy/build/
