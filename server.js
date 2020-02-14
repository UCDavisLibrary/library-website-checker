const express = require('express');
const app = express();
const path =require('path');
const spaMiddleware = require('@ucd-lib/spa-router-middleware');
const fetch = require('node-fetch');

const assetsDir = path.join(__dirname, 'client');

const clientPackage = require('./client/package.json');
const loaderVersion = clientPackage.dependencies['@ucd-lib/cork-app-load'].replace(/^\^/, '');
const bundle = `
  <script>
    var CORK_LOADER_VERSIONS = {
      loader : '${loaderVersion}',
      bundle : '${clientPackage.version}'
    }
  </script>
  <script src="/loader/loader.js?_=${loaderVersion}"></script>`;

/**
 * Setup SPA app routes
 */
spaMiddleware({
  app: app,
  htmlFile : path.join(assetsDir, 'index.html'),
  isRoot : true,
  appRoutes : ['/'],
  getConfig : async (req, res, next) => {
    next({
      data : req.query.name ? (await getData(req.query.name)) : null,
      appRoutes : ['/'],
    });
  },
  template : async (req, res, next) => {
    next({bundle});
  }
});

async function getData(name) {
  let url = `https://storage.googleapis.com/website-diffs/${name}/results.json?_=${Date.now()}`;
  let resp;
  try {
    let resp = await fetch(url);
    return await resp.json();
  } catch(e) {
    let text = '';
    try { text = resp.text() }
    catch(e) {};

    return {
      error: true,
      message : e.message,
      stack : e.stack,
      url,
      body : text
    }
  }
}

/**
 * Setup static asset dir
 */
app.use(express.static(assetsDir, {
  immutable: true,
  maxAge: '1y'
}));

app.listen(process.env.PORT || 3000, () => {
  console.log('Library site checker server listening on: '+(process.env.PORT || 3000));
});