const AWS = require('aws-sdk');
const env = require('./env');

let s3 = null;

if (env.aws.region && env.aws.accessKeyId && env.aws.secretAccessKey) {
  AWS.config.update({
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
    region: env.aws.region
  });
  s3 = new AWS.S3();
}

module.exports = { s3 };
