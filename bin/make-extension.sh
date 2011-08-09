#!/bin/sh

BASE="$(dirname $0)/../public"

cd $BASE
mkdir -p ../build

EXT=../build/extension.zip
rm $EXT 
zip -r $EXT .

echo Upload $EXT
open https://chrome.google.com/webstore/developer/update
