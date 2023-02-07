const { initConfig } = require("grunt");
const moment = require("moment");

const { generateRandomString, convertUnixToUtc } = require("../../../util");

module.exports = {
  friendlyName: "Create customer for apple pay",

  description: "Create customer for apple pay",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      sails.log.debug("action fan/purchase-act/create-customer.js started");

      const check = await sails.models.user.findOne({
        user_id: inputs.user.id,
      });
      if (check.customer_stripe_id == "") {
        let customerObj = { user_id: inputs.user.id, email: inputs.user.email };
        if (inputs.user.first_name) {
          customerObj.name =
            inputs.user.first_name + " " + inputs.user.last_name;
        }
        const data = await sails.helpers.stripe.customers.create.with(
          customerObj
        );
        if (data) {
          const ins_in_user = await sails.models.user
            .updateOne({
              user_id: inputs.user.id,
            })
            .set({
              customer_stripe_id: data.customer.id,
            })
            .fetch();

          sails.log.debug("action fan/purchase-act/create-customer.js ended");
          return exits.success({
            status: true,
            message: "customer stripe id",
            data: ins_in_user,
          });
        }
      } else {
        return exits.success({
          status: true,
          message: "customer stripe id",
          data: check,
        });
      }

      return exits.success({
        status: false,
        message: "cannot customer created for stripe",
        data: {},
      });
    } catch (error) {
      sails.log.error(
        "action fan/purchase-act/create-customer.js called with inputs execution failed: ",
        error,
        " \nTime: ",
        moment().format()
      );
      return exits.success({
        status: false,
        message: error.message,
        data: {},
      });
    }
  },
};
