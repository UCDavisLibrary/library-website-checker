const cp = require('child_process');
const path = require('path');

class CrawlerQueue {

  constructor(size) {
    this.size = size;
    this.running = 0;
    this.crawlers = [];

    for( let i = 0; i < size; i++ ) {
      this.crawlers.push(this._initCrawler());
    }
  }

  _initCrawler() {
    let crawler = {
      process : cp.fork(path.join(__dirname, 'crawler-worker.js'))
    }
    crawler.process.on('message', msg => {
      this.running--;
      console.log(`Queue worker complete.  crawlers-running=${this.running}, queue-size=${this.urlList.length}`);

      if( !msg.error ) {
        if( msg.diff ) {
          this.data.diff[msg.pathname] = msg.diff;
        }
        if( !this.data.visited[msg.host] ) {
          this.data.visited[msg.host] = {};
        }
        this.data.visited[msg.host][msg.pathname] = msg.visited;
      } else {
        this.data.visited[msg.host][msg.pathname] = msg.error;
      }

      if( this.urlList.length ) {
        this.dispatchUrl(crawler, this.urlList.shift());
      } else if( this.resolve && this.running === 0 ) {
        let resolve = this.resolve;
        this.resolve = null;
        this.reject = null;
        resolve(this.data);
      }
    });
    return crawler;
  }

  run(host, urlList) {
    this.host = host;
    this.data = {
      diff : {},
      visited : {}
    };
    this.urlList = urlList;

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      for( let i = 0; i < this.size; i++ ) {
        if( !this.urlList.length ) return;
        this.dispatchUrl(this.crawlers[i], this.urlList.shift());
      }
    });
  }

  dispatchUrl(crawler, url) {
    this.running++;
    console.log(`Queue dispatching url ${this.host}${url} for crawl.  crawlers-running=${this.running}, queue-size=${this.urlList.length}`);
    crawler.process.send({host: this.host, pathname: url});
  }

}

module.exports = CrawlerQueue;