#!/bin/bash -xe
npm run build
aws --profile idle.run s3 sync --exclude=.DS_Store --acl public-read ./dist s3://drive-encrypt.com