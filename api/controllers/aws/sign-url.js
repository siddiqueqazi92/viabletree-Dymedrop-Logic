const moment = require('moment')

module.exports = {


  friendlyName: 'Sign url',


  description: '',


  inputs: {
    folder: {
      type: 'string',
      defaultsTo: ''
    }
  },

  exits: {

  },


  fn: async function ({ folder }, exits) {
    sails.log.debug('calling action aws/sign-url with optional Data(folder): ', folder, '\nTime: ', moment().format());
    try {
      const url = await sails.helpers.aws.sign.with({
        folder
      });
      if (!url) { throw new Error('Error while generating URL at helper/aws/sign') }
      sails.log.debug('action aws/sign-url executed succesfully and provided url: ', url, '\nTime: ', moment().format());
      return exits.success({
        status: true,
        data: { url },
        message: "URL provided successfully"
      });
    } catch (e) {
      sails.log.debug('action aws/sign-url encounered with an Error: ', e, '\nTime: ', moment().format());
      return exits.success({
        status: false,
        data: {},
        message: "Unknown Server Error"
      });
    }
  }


};
