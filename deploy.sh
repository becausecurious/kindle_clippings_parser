#!/bin/bash

cd ~/projects/kindle_notes_parser/source
npm run build

rm -r ~/projects/becausecurious/website/because_curious/main/static/main/imported/kindle_notes_parser/*

# https://askubuntu.com/a/86891
cp -a ./build/.  ~/projects/becausecurious/website/because_curious/main/static/main/imported/kindle_notes_parser/
