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
    sails.log.debug("Helper stripe/account/login started");
    let data = {};
    try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);

      const loginLink = await stripe.accounts.createLoginLink(
        inputs.data.account_id
      );
      if (loginLink) {
        data.link = loginLink;
      }
      return exits.success(data);

      // data.loginLink = loginLink;
    } catch (err) {
      sails.log.error(`Error in helper stripe/account/login. ${err}`);
      data.error = error.message
      return exits.success(data);
    }
  },
};
