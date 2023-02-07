module.exports = {
  friendlyName: "Add List",

  description: "Add List.",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      if (!inputs.user) {
        return exits.success({
          status: false,
          message: "No user found",
        });
      }
      const user = await sails.models.user.find({
        user_id: inputs.user.id,
      });

      if (user.length < 1) {
        return exits.success({
          status: true,
          message: "No user found",
        });
      }
      const account = await sails.helpers.stripe.account.get({
        account_id: user[0].account_id,
      });

      if (account) {
        return exits.success({
          status: true,
          message: "Stripe Account",
          data: account.account.external_accounts.data,
        });
      }
    } catch (err) {
      sails.log.error(`Error in action test-payment. ${err}`);
      return exits.success({
        status: true,
        message: err.message,
      });
    }
  },
};
