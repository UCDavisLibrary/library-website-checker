const config = require('../config');
const path = require('path');
const fs = require('fs-extra');
const {Storage} = require('@google-cloud/storage');
const {URL} = require('url');

class GCSStorage {

  constructor(name) {
    this.bucketName = 'website-diffs';
    this.name = name.replace(/ /g, '-').toLowerCase();

    let opts = {};
    let serviceAccountFile = path.join(__dirname, '..', 'service-account.json');
    if( fs.existsSync(serviceAccountFile) )  {
      opts.projectId = require(serviceAccountFile).project_id,
      opts.keyFilename = serviceAccountFile;
    }

    this.storage = new Storage(opts);
  }

  getBucket() {
    return this.storage.bucket(this.bucketName);
  }

  /**
   * @method initBucket
   * @description ensure gcs bucket exits
   */
  async initBucket() {
    let exists = await this.getBucket(this.bucketName).exists();
    exists = exists[0];
    if( exists ) return;
    await this.storage.createBucket(this.bucketName);
  }

  getBucketPath(pathname, file) {
    return path.join(this.name, pathname, file).replace(/^\//, '');
  }

  getFileObject(pathname, filename) {
    return this.getBucket(this.bucketName).file(this.getBucketPath(pathname, filename));
  }

  async uploadFile(opts={}) {
    await this.initBucket();

    let localFile = opts.localFile;
    let gcsFile = this.getFileObject(opts.pathname, opts.filename);

    return new Promise((resolve, reject) => {
      fs.createReadStream(localFile)
        .pipe(gcsFile.createWriteStream())
        .on('error', (err) => reject(err))
        .on('finish', () => resolve());
    });
  }

}

module.exports = GCSStorage;