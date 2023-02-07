module.exports = {
  friendlyName: "Create Account",

  description: "",

  inputs: {
    data: {
      type: "ref",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug("Helper stripe/account/get started");
    let data = {};
    try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);

      const account = await stripe.accounts.retrieve(inputs.data.account_id);
      if (account) {
        data.account = account;
      }
      return exits.success(data);

      // data.loginLink = loginLink;
    } catch (err) {
      sails.log.error(`Error in helper stripe/account/get. ${err}`);
      return exits.success(data);
    }
  },
};
