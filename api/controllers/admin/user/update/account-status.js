const moment = require('moment')

module.exports = {


  friendlyName: 'Account status',


  description: '',


  inputs: {
    user_id: {
      type: 'string',
      required: true
    },
    is_blocked: {
      type: 'boolean',
      required: true,
    }
  },


  exits: {

  },


  fn: async function ({ is_blocked, user_id }, exits) {
    sails.log.debug('calling user/account/update/account-status\ntime: ', moment())
    try {
      let updateUser;
      await sails.getDatastore().transaction(async (db) => {
        updateUser = await User.update({ user_id }).set({ is_blocked }).fetch().usingConnection(db);
        const page = await Page.update({ user_id }).set({ is_blocked }).fetch().usingConnection(db);
      })
      sails.log.debug('user/account/update/account-status executed\ntime: ', moment())
      exits.success(updateUser)
    } catch (error) {
      sails.log.error('error at user/account/update/account-status error: ', error, '\ntime: ', moment())
      exits.error()
    }

  }


};
