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
    sails.log.debug("Helper stripe/account/create started");
    let data = {};
    try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);
      let account;
      if (!inputs.data.accountCreated) {
        account = await stripe.accounts.create({
          type: "express",
          email: inputs.data.email,
          business_type: "individual",
          capabilities: {
            // card_payments: { requested: true },
            transfers: { requested: true },
          },
          settings: { payouts: { schedule: { interval: "manual" } } },
          business_profile: {
            name: `${inputs.data.first_name} ${inputs.data.last_name}`,
          },
        });
      } else {
        account = await stripe.accounts.retrieve(inputs.data.accounts);
      }

      if (account) {
        let account_link = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${sails.config.dymedrop.web_url}/user/stripe/return?type=fail`,
          return_url: `${sails.config.dymedrop.web_url}/user/stripe/return?type=success`,
          type: "account_onboarding",
        });
        if (account_link) {
          data.account = account;
          data.account_link = account_link;
        }
      }

      return exits.success(data);

      // if (account_link) {
      //   // data.account = account;
      //   data.account_link = account_link
      // }

      // const loginLink = await stripe.accounts.createLoginLink(
      //   "acct_1Lk69zPlYAk8eeDk"
      // );

      // data.loginLink = loginLink;
    } catch (err) {
      sails.log.error(`Error in helper stripe/tokens/create. ${err}`);
      return exits.success(data);
    }
  },
};
