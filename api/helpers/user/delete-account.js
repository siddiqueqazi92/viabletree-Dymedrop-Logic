const moment = require("moment");

module.exports = {
  friendlyName: "Delete account",

  description: "",

  inputs: {
    user_id: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function ({ user_id, email }, exits) {
    try {
      sails.log.debug(
        "helper delete-account called. \nTime: ",
        moment().format()
      );
      await sails.getDatastore().transaction(async (db) => {
        let findPage = await Page.find({
          user_id: user_id,
          is_deleted: 0,
        });

        if (findPage.length > 0) {
          let ids = _.map(findPage, "id");
          let activations = await fan_activations.find({
            page_id: { in: ids },
            // is_subscribed : false,
            is_expire: false,
            is_purchased: true,
          });
          if (activations.length > 0) {
            return exits.success(false);
          }
        }

        await Deleted_user.create({ user_id, email }).usingConnection(db);
          await Page.update({ user_id })
            .set({ deletedAt: moment().format(), is_active: false })
            .usingConnection(db);
          await User.destroyOne({ user_id }).usingConnection(db);
      }); //.usingConnection(db);
      return exits.success(true);
    } catch (error) {
      sails.log.error(
        "Error at helper delete-account. Error: ",
        error,
        "\nTime: ",
        moment().format()
      );
      return exits.success(false);
    }
  },
};
