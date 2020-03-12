---
page: https://idle.run/google-drive-encrypt
title: Google Drive Encrypted File Upload
tags: google drive encryption
date: 2020-03-12
---


Source for [https://drive-encrypt.com] which provides encrypted file storage for Google Drive in direct browser upload and download (no middleware server). See the FAQ for more info.


## Local Testing

App is only configured in gcloud for operation on the drive-encrypt.com domain, so that needs to be mocked using hosts file.

Edit /etc/hosts and add

```
127.0.0.1 drive-encrypt.com
```

Run in dev mode with `HTTPS_PORT=443 npm run dev`

Hit https://drive-encrypt.com as normal (and accept self-signed cert)

### Resources:

https://developers.google.com/drive/v3/web/listing

https://chrome.google.com/webstore/developer/dashboard

https://developer.chrome.com/webstore/inline_installation