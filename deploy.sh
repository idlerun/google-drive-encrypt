#!/bin/bash -xe
npm run build
find . -name .DS_Store -delete
aws s3 sync --exclude=.DS_Store --acl=public-read --cache-control="public, max-age=600" ./dist s3://drive-encrypt.com --delete
