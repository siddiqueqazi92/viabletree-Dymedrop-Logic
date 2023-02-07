const moment = require('moment');
const aws = require('aws-sdk');
const crypto = require('crypto');
const util = require('util');
const randomBytes = util.promisify(crypto.randomBytes);



const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;


module.exports = {
  friendlyName: 'Upload file to aws bucket',

  description: '',

  inputs: {
    folder: {
      type: 'string',
      defaultsTo: ''
    }
  },

  exits: {},

  fn: async function ({ folder }, exits) {



    sails.log.debug('calling helpers/aws/sign with input(folder): ', folder, '\nTime: ', moment().format());
    // require('dotenv').config(); // Configure dotenv to load in the .env file
    const s3 = new aws.S3({
      region,
      accessKeyId,
      secretAccessKey,
      signatureVersion: 'v4'
    });
    sails.log.debug('helpers/aws/sign generating random bytes for image name \nTime: ', moment().format());
    try {
      const rawBytes = await randomBytes(16);
      const imageName = rawBytes.toString('hex');

      const fileName = folder === '' ? imageName + '.png' : folder + '/' + imageName + '.png';
      const params = ({
        Bucket: bucketName,
        Key: fileName,
        Expires: 120
      });

       sails.log.debug('helpers/aws/sign getting url from s3 \nTime: ', moment().format());
      const uploadURL = await s3.getSignedUrlPromise('putObject', params);
      sails.log.debug('helpers/aws/sign successfully executed and returned: ', uploadURL, '\nTime: ', moment().format());
      return exits.success(uploadURL);
    } catch (error) {
      sails.log.debug('helpers/aws/sign encountred an error: ', error, '\nTime: ', moment().format());
      return exits.success(false);
    }
  },
};