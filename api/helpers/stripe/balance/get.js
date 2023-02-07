module.exports = {
  friendlyName: "Get balance",

  description: "",

  inputs: {
    account_id: {
      type: "ref",
      required: false,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug("Helper stripe/balance/get started");
    let data = {};
    try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);
      if (inputs.account_id) {
        balance = await stripe.balance.retrieve(
          {
            stripeAccount: inputs.account_id
          });
      } else {
        balance = await stripe.balance.retrieve();
      }
     
      if (balance) {
        data.balance = balance;
      }
      return exits.success(data);

      // data.loginLink = loginLink;
    } catch (err) {
      sails.log.error(`Error in helper stripe/balance/get. ${err}`);
      return exits.success(data);
    }
  },
};
