module.exports = {
  friendlyName: "Add card",

  description: "Add card.",

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

      const checkUser = await sails.models.user.find({
        user_id: inputs.user.id,
      });
      if (checkUser.length < 1) {
        return exits.success({
          status: false,
          message: "No user found",
        });
      }
      console.log({ checkUser });
      if (checkUser[0].account_id && checkUser[0].account_setup) {
        return exits.success({
          status: false,
          message: "Account Already setup",
        });
      }

      let accountSetup;
      let accountCreated;

      if (checkUser[0].account_id) {
        if (checkUser[0].account_setup == 0) {
          accountSetup = false;
          accountCreated = true;
        }
      } else {
        accountCreated = false;
        accountSetup = false;
      }
      const account = await sails.helpers.stripe.account.create({
        email: inputs.user.email,
        accountSetup,
        accountCreated,
        accounts: checkUser[0].account_id,
        first_name: inputs.user.first_name,
        last_name: inputs.user.last_name,
      });

      if (account) {
        console.log(account.account.id, "==>acount id");
        const updateUser = await sails.models.user
          .update({
            user_id: inputs.user.id,
          })
          .set({
            account_id: account.account.id,
          });
        console.log({ updateUser });
      }
      return exits.success({
        status: true,
        message: "Stripe Account",
        data: account.account_link,
      });
    } catch (err) {
      sails.log.error(`Error in action test-payment. ${err}`);
      return exits.success(data);
    }
  },
};
