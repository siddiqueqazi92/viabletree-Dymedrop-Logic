const { initConfig } = require("grunt");
const moment = require("moment");

const { generateRandomString, convertUnixToUtc } = require("../../../util");

module.exports = {
  friendlyName: "Create customer for apple pay",

  description: "Create customer for apple pay",

  inputs: {
    header: {
      type: "ref",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      sails.log.debug("action guest/guest-purchase/create-customer.js");

      const check = await sails.models.guest.findOne({
        device_id: inputs.header.device_id,
        is_deleted: 0,
      });
      if (check.customer_stripe_id == "") {
        let customerObj = {
          user_id: inputs.header.device_id,
        };
        if (check.first_name) {
          customerObj.name = check.first_name + " " + check.last_name;
        }
        const data = await sails.helpers.stripe.customers.create(customerObj);
        if (data) {
          const ins_in_user = await sails.models.guest
            .updateOne({
              device_id: inputs.header.device_id,
            })
            .set({
              customer_stripe_id: data.customer.id,
            })
            .fetch();

          sails.log.debug(
            "action fan/create-customer-apple-pay/created-successfully"
          );
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
        "action guest/guest-purchase/create-customer.js called with inputs execution failed: ",
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
