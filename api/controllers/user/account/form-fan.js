const moment = require("moment");

module.exports = {
  friendlyName: "Form",

  description: "Form account.",

  inputs: {
    user: {
      type: "ref",
      //required: true
    },
    first_name: {
      type: "string",
      required: true,
    },
    last_name: {
      type: "string",
      required: true,
    },
    image_url: {
      type: "string",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      sails.log.debug(
        "action user/account/form-fan.js called with inputs: ",
        moment().format()
      );

      // if (user.email !== email) {
      //   sails.log.debug('action user/account/form-fan.js exited: User not found \nTime: ', moment().format())
      //   return exits.success({
      //     status: false,
      //     message: 'Form Submission failed, email is incorrect',
      //     data: {}
      //   })
      // }

      const updateUser = await User.updateOne({ user_id: inputs.user.id }).set({
        first_name: inputs.first_name,
        last_name: inputs.last_name,
        avatar: inputs.image_url,
        is_form_submitted: true,
        status: "approved",
        // phone_number,
        // organization,
        // job_title,
        // fanbase_size,
        // location,
        // is_form_submitted: true,
        // status: global.STATUS[1]
      });

      if (!updateUser) {
        sails.log.debug(
          "action user/account/form-fan.js exited: User not found \nTime: ",
          moment().format()
        );
        return exits.success({
          status: false,
          message: "Form Submission failed",
          data: {},
        });
      }
      if (updateUser.customer_stripe_id) {
        let objToUpdate = {
          customer_id: updateUser.customer_stripe_id,
          user_id: updateUser.user_id,
          email: updateUser.email,
        };
        if (updateUser.first_name) {
          objToUpdate.name = updateUser.first_name + " " + updateUser.last_name;
        }
        customer_response = await sails.helpers.stripe.customers.update.with(
          objToUpdate
        );
      }

      // const _user = await sails.helpers.jwt.generateToken.with({ user: updateUser });
      sails.log.debug(
        "action user/account/form-fan.js successfully executed \nTime: ",
        moment().format()
      );
      return exits.success({
        status: true,
        message: "Form submitted successfully",
        data: { ...updateUser },
      });
    } catch (error) {
      sails.log.error(
        "action user/account/form-fan.js execution failed: ",
        error,
        " \nTime: ",
        moment().format()
      );
      return exits.success({
        status: false,
        message: error,
        data: {},
      });
    }
  },
};
