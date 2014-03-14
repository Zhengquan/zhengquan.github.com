#!/usr/bin/env bash

set -e
mkdir -p /tmp/blog 
rm -rf /tmp/blog/*

# generate static files
bundle exec rake generate
mv _site/* /tmp/blog

git checkout master
rm -rf *
mv /tmp/blog/* .

message="Site updated at $(date +'%d-%m-%Y')"

git add -A
git commit -am "'$message'"

git push origin master --force
git checkout 'source'
