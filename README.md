---
page: https://idle.run/node-react-server
title: Webpack NodeJS Server with ReactJS Client
tags: nodejs react webpack
date: 2016-05-31
---

## About

This project is a starter template for a web server project with:

- NodeJS server using Express 4
- ReactJS client packed up with webpack
- Ready for Heroku

Extra goodies:

- Webpack dev hot-reloading for client JS and CSS
- SASS support
- Static resource serving
- AJAX using JQuery
- Babel loader
- `morgan` and `log-timestamp` improve Node console logging


### Getting started

**Check out the project from github**

```bash
git clone https://github.com/idlerun/node-react-server.git
```

**Install deps**

```bash
npm install
```

#### Dev Server

**Run dev server locally**

```bash
npm run dev
```

#### Production Build

Build the JS to static resources (in /public)

```bash
npm run build
```

Run the prod server with

```bash
npm start
```

### Next Steps

- Edit the server starting in [`src/server/`](https://github.com/idlerun/node-react-server/tree/src/server/)
- Edit the client starting in [`src/client/`](https://github.com/idlerun/node-react-server/tree/src/client/)

Browse the rest of the template and customize to your preference!

## Heroku

The app should be ready to deploy as a NodeJS app in Heroku.

Note that there is a `postinstall` script which Heroku will run after the `npm install`
command and will build the production JS and CSS resources. The `dist` folder should
not be committed to git.
