const path = require('path');
const fs = require('fs');

if( !fs.existsSync(path.join(__dirname, 'config.json')) ) {
  console.error('Please create a config.json file (see sample-config.json)');
  process.exit(-1);
}
if( !fs.existsSync(path.join(__dirname, 'service-account.json')) ) {
  console.error('No service-account.json file found.  You can create one at on the google cloud console: https://console.cloud.google.com/iam-admin/serviceaccounts?&organizationId=558550560619&project=digital-ucdavis-edu');
  process.exit(-1);
}

const Crawler = require('./lib/crawler');
let crawler = new Crawler();
crawler.run()
  .then(() => {
    console.log('crawl completed');
    crawler.browser.close()
  });