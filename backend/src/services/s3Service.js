const { s3 } = require('../config/aws');
const env = require('../config/env');

async function uploadBuffer({ key, buffer, contentType }) {
  if (!s3 || !env.aws.bucket) {
    return {
      url: `${env.appBaseUrl}/mock-storage/${encodeURIComponent(key)}`,
      mocked: true
    };
  }

  const response = await s3.upload({
    Bucket: env.aws.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }).promise();

  return {
    url: response.Location,
    mocked: false
  };
}

module.exports = { uploadBuffer };
