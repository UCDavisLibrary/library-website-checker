const puppeteer = require('puppeteer');
const config = require('../config.json');
const fs = require('fs-extra');
const path = require('path');
const CrawlerQueue = require('./crawler-queue');
// const PNG = require('pngjs').PNG;
// const pixelmatch = require('pixelmatch');
const PixelDiff = require('pixel-diff');
const GCSStorage = require('./gcs');
const gcs = new GCSStorage(config.name);

const CLEAN_NAME = config.name.replace(/ /g, '-');
const ROOT_DIR = path.join(process.cwd(), 'results', CLEAN_NAME);
const ROOT_SCREENSHOT_DIR = path.join(ROOT_DIR, 'screenshots')

const SIZES = {
  desktop : {
    width: 1500,
    height: 800
  },
  tablet : {
    width: 800,
    height: 600
  },
  mobile : {
    width: 350,
    height: 600
  }
}
const DEFAULT_WORKERS = 10;

class Crawler {

  constructor(primary=false) {
    this.visited = {};
    this.diff = {};

    // for children
    if( !primary ) {
      process.on('message', async msg => {
        let result = {};
        try {
          result = await this.crawlPath(msg.host, msg.pathname);
        } catch(e) {
          result.error = {
            message : e.message,
            stack : e.stack
          }
        }
        process.send(result);
      });
    } else {
      this.queue = new CrawlerQueue(config.maxWorkers || DEFAULT_WORKERS);
    }
  }

  async run() {
    if( fs.existsSync(ROOT_DIR) ) {
      await fs.remove(ROOT_DIR);
    }
    await fs.mkdirp(ROOT_DIR);

    let data = await this.queue.run(
      config.serverA.baseUrl, 
      config.screenshots.map(pathname => pathname.replace(/\/$/, ''))
    );
    this.visited = data.visited;
    this.diff = data.diff;

    data = await this.queue.run(
      config.serverB.baseUrl, 
      config.screenshots.map(pathname => pathname.replace(/\/$/, ''))
    );

    this.visited = Object.assign(this.visited, data.visited);
    this.diff = Object.assign(this.diff, data.diff);

    // for( let pathname of config.screenshots ) {
    //   pathname = pathname.replace(/\/$/, '');
    //   await this.crawlPath(config.serverA.baseUrl, pathname, true);
    // }
    // for( let pathname of config.screenshots ) {
    //   pathname = pathname.replace(/\/$/, '');
    //   await this.crawlPath(config.serverB.baseUrl, pathname, true);
    // }

    fs.writeFileSync(
      path.join(ROOT_DIR, 'results.json'),
      JSON.stringify({
        timestamp : Date.now(),
        config: config,
        diff : this.diff,
        visited : this.visited
      }, '  ', '  ')
    )

    await this.upload(
      path.join(ROOT_DIR, 'results.json'), 
      '/',
      'results.json'
    );
  }

  async init() {
    this.browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.emulateMedia('screen');
  }

  async crawlPath(host, pathname, first=false) {
    if( !this.visited[host] ) this.visited[host] = {};
    if( this.visited[host][pathname] ) return;
    
    // TMP
    // if( Object.keys(this.visited[host]).length > 10 ) return;

    if( !this.page ) await this.init();

    await this.page.setViewport(SIZES.desktop);

    let time = Date.now();
    await this.page.goto(host+pathname, {waitUntil: 'networkidle0'});
    time = Date.now() - time;
    console.log('Crawled', host+pathname, time+'ms');

    let actualHost = this._getHostFromUrl(this.page.url());

    let links = await this.page.evaluate(() => {
      let alert = document.querySelector('.emergency-alert');
      if( alert ) alert.style.display = 'none';

      return Array.from(document.querySelectorAll('a'))
        .map(ele => ele.getAttribute('href'))
        .filter(href => href ? true : false)
    });

    links = links.filter(link => {
        if( link.match(/^#/) ) return false;
        if( link.match(/^http/i) ) {
          return (this._getHostFromUrl(link) === actualHost);
        }
        return link.match(/^\//) ? true : false;
      })
      .map(link => {
        if( link.match(/^http/i) ) {
          let url = new URL(link);
          return url.pathname + (url.query ? '?'+url.query : '');
        }
        return link;
      })
      .map(link => link.replace(/\/$/, ''));

    this.visited[host][pathname] = {time};
    this.visited[host][pathname].screenshot = true;
    let diffInfo = await this.screenshot(host, pathname);
    if( diffInfo ) this.diff[pathname] = diffInfo;

    // if( !first ) return;

    return {
      host, pathname,
      diff : diffInfo, visited: this.visited[host][pathname]
    }

    // for( let pathname of links ) {
    //   await this.crawlPath(host, pathname);
    // }
  }

  upload(localFile, pathname, filename) {
    return gcs.uploadFile({
      localFile, pathname, filename
    })
  }

  async screenshot(host, pathname) {
    let serverName = config.serverA.baseUrl !== host ? config.serverA.name : config.serverB.name;
    let otherServerName = config.serverA.baseUrl === host ? config.serverA.name : config.serverB.name;

    let rootDir = path.join(ROOT_SCREENSHOT_DIR, serverName, pathname);
    await fs.mkdirp(rootDir);

    await this.page.screenshot({
      path: path.join(rootDir, `desktop-top-fold.png`)
    });
    await this.upload(
      path.join(rootDir, `desktop-top-fold.png`), 
      path.join(serverName, pathname),
      'desktop-top-fold.png'
    );

    // attempt to load all content
    let height = await this.page.evaluate(() => {
      return document.body.clientHeight;
    });
    await this.page.setViewport({width: SIZES.desktop.width, height});
    await wait(1000);

    for( var key in SIZES ) {
      console.log(`Taking screenshot ${pathname} @ ${SIZES[key].width}x${SIZES[key].height}: ${path.join(rootDir, `${key}.png`)}`);
      
      // want to let deferred loaded processes finish up
      await this.page.setViewport(SIZES[key]);

      await this.page.screenshot({
        path: path.join(rootDir, `${key}.png`),
        fullPage: true
      });
      await this.upload(
        path.join(rootDir, `${key}.png`), 
        path.join(serverName, pathname),
        `${key}.png`
      );
    }

    // only look for diffs on server B
    if( serverName === config.serverB.name ) return false;

    // see if we should diff the images
    let otherRootDir = path.join(ROOT_SCREENSHOT_DIR, otherServerName, pathname);
    let diffRootDir = path.join(ROOT_SCREENSHOT_DIR, 'diff', pathname);
    let diffInfo = {};

    for( var key in SIZES ) {
      let imgB = path.join(otherRootDir, key+'.png');
      let imgA = path.join(rootDir, key+'.png');

      if( fs.existsSync(imgB) && fs.existsSync(imgB) ) {
        console.log('Diffing '+key+' for '+(pathname || '/'));

        await fs.mkdirp(diffRootDir);
        let diff = new PixelDiff({
          imageAPath: imgA,
          imageBPath: imgB,
       
          // thresholdType: PixelDiff.THRESHOLD_PERCENT,
          thresholdType: PixelDiff.THRESHOLD_PIXEL,
          // threshold: 0.5, // 10% threshold
          delta: 150,
          hideShift: true,
       
          imageOutputPath: path.join(diffRootDir, key+'.png')
        });

        try {
          diffInfo[key] = await this.runDiff(diff);
          await this.upload(
            path.join(diffRootDir, `${key}.png`), 
            path.join('diff', pathname),
            `${key}.png`
          );
        } catch(e) {
          console.error(e);
        }

        // imgA = PNG.sync.read(fs.readFileSync(imgA));
        // imgB = PNG.sync.read(fs.readFileSync(imgB));

        // let {width, height} = imgA;
        // let diff = new PNG({width, height});

        // pixelmatch(imgA.data, imgB.data, diff.data, width, height, {threshold: 0.1});
        // await fs.mkdirp(diffRootDir);
        // fs.writeFileSync(path.join(diffRootDir, key+'.png'), PNG.sync.write(diff));
      }
    }

    return diffInfo;
  }

  async runDiff(diff) {
    return new Promise((resolve, reject) => {
      diff.run((error, result) => {
        if( error ) reject(error);
        else resolve(result);
        // if (error) {
        //    throw error;
        // } else {
        //    console.log(diff.hasPassed(result.code) ? 'Passed' : 'Failed');
        //    console.log('Found ' + result.differences + ' differences.');
        // }
     });
    });
  }

  _getHostFromUrl(url) {
    try {
      url = new URL(url);
      return url.protocol+'//'+url.host;
    } catch(e) {}
    return '';
  }
}

function wait(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), time);
  });
}

module.exports = Crawler;