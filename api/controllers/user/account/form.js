const moment = require('moment');

module.exports = {


  friendlyName: 'Form',


  description: 'Form account.',


  inputs: {

    user: {
      type: 'ref',
      required: true
    },
    first_name: {
      type: 'string',
      required: true
    },
    last_name: {
      type: 'string',
      required: true
    },
    // email: {
    //   type: 'string',
    //   isEmail: true,
    //   required: true
    // },
    phone_number: {
      type: 'string',
      // required: true
    },
    organization: {
      type: 'string',
      // required: true
    },
    job_title: {
      type: 'string',
      // required: true
    },
    fanbase_size: {
      type: 'string',
      // required: true
    },
    location: {
      type: 'string',
      // required: true
    },

  },


  exits: {

  },


  fn: async function ({ first_name, last_name, user, phone_number, organization, job_title, fanbase_size, location }, exits) {
    try {

      sails.log.debug('action user/account/form.js called with inputs: ', JSON.stringify({ first_name, last_name, user, phone_number, organization, job_title, fanbase_size, location }), '\nTime: ', moment().format())

      // if (user.email !== email) {
      //   sails.log.debug('action user/account/form.js exited: User not found \nTime: ', moment().format())
      //   return exits.success({
      //     status: false,
      //     message: 'Form Submission failed, email is incorrect',
      //     data: {}
      //   })
      // }
      console.log({user});

      let userStatus;
      if(user.currentUser == "invitee")
      {
        userStatus = "approved"
      }
      else{
        userStatus =global.STATUS[1]
      }
      const updateUser = await User.updateOne({ email: user.email, is_form_submitted: false }).set({
        first_name,
        last_name,
        phone_number,
        organization,
        job_title,
        fanbase_size,
        location,
        is_form_submitted: true,
        // status: global.STATUS[1]
        status : userStatus
      })

      if (!updateUser) {
        sails.log.debug('action user/account/form.js exited: User not found \nTime: ', moment().format())
        return exits.success({
          status: false,
          message: 'Form Submission failed',
          data: {}
        })
      }

      // const _user = await sails.helpers.jwt.generateToken.with({ user: updateUser });
      sails.log.debug('action user/account/form.js successfully executed \nTime: ', moment().format())
      return exits.success({
        status: true,
        message: 'Form submitted successfully',
        data: { ...updateUser }
      })

    } catch (error) {

      sails.log.error('action user/account/form.js execution failed: ', error, ' \nTime: ', moment().format())
      return exits.success({
        status: false,
        message: 'Form Submission failed, unknown server error',
        data: {}
      })
    }

  }


};
