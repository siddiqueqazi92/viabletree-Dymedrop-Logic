const moment = require("moment");

module.exports = {
  friendlyName: "Disable account",

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

  fn: async function ({ email, user_id }, exits) {
    try {
      sails.log.debug(
        "helper disable-account called. \nTime: ",
        moment().format()
      );
      await sails.getDatastore().transaction(async (db) => {
        let findPage = await Page.find({
          user_id: user_id,
          is_deleted: 0,
        });
        console.log({findPage});
        if (findPage.length > 0) {
          let ids = _.map(findPage, "id");
          console.log({ids});
          let activations = await fan_activations.find({
            page_id: { in: ids },
            // is_subscribed : false,
            is_expire: false,
            is_purchased: true,
          });
          console.log({activations});
          if (activations.length > 0) {
            return exits.success(false);
          }
          else{
            const user = await User.updateOne({ email })
            .set({ is_active: false })
            .usingConnection(db);
          const page = await Page.update({ user_id })
            .set({ is_active: false })
            .fetch()
            .usingConnection(db);

            console.log("False Condition");
          }
          
        }
      });
      return exits.success(true);
    } catch (error) {
      sails.log.error(
        "Error at helper disable-account. Error: ",
        error,
        "\nTime: ",
        moment().format()
      );
      return exits.success(false);
    }
  },
};
