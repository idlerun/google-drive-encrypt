#!/bin/bash

convert -background none icon.svg -resize 256x256 icon-256.png
convert -background none icon.svg -resize 128x128 icon-128.png
convert -background none icon.svg -resize 96x96 -bordercolor none -border 16 icon-128-border.png
convert -background none icon.svg -define icon:auto-resize=64,48,32,16 ../src/public/favicon.ico
