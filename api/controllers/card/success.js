module.exports = {
  friendlyName: "Add card",

  description: "Add card.",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
    account_setup: {
      type: "boolean",
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

      let accountSetup;

      if (inputs.account_setup == true) {
        accountSetup = 1;
      } else {
        accountSetup = 0;
      }
      let updateUser = await sails.models.user
        .updateOne({
          user_id: inputs.user.id,
        })
        .set({
          account_setup: accountSetup,
        });

      if (updateUser) {
        return exits.success({
          status: true,
          message: "Account Setup Succesfully",
        });
      } else {
        return exits.success({
          status: true,
          message: "Some error occured.",
        });
      }
    } catch (err) {
      sails.log.error(`Error in action test-payment. ${err}`);
      return exits.success(data);
    }
  },
};
