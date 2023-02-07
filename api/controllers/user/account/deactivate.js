const moment = require("moment");

module.exports = {
  friendlyName: "Deactivate",

  description: "Deactivate Account",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
    permanently_delete: {
      type: "boolean",
      required: true,
    },
  },

  exits: {
    ok: {
      description: "Send ok response",
      responseType: "ok",
    },
    badRequest: {
      description: "Send badRequest response",
      responseType: "badRequest",
    },
  },

  fn: async function ({ user, permanently_delete }, exits) {
    sails.log.debug(
      "user/accounts/deactivate called. \nTime: ",
      moment().format()
    );
    try {
      let done;
      if (!permanently_delete) {
        done = await sails.helpers.user.disableAccount(user.id, user.email);
        console.log({ done });
        if (!done) {
          // throw new Error(
          //   "You have purchased activations. So you can not deactivate this account."
          // );
          sails.log.debug(
            "user account temperory-disabled . \nTime: ",
            moment().format()
          );
          return exits.success({
            status: false,
            data: [],
            message:
              "Either you have invitees or active purchase activations.",
          });
        }
      } else {
        done = await sails.helpers.user.deleteAccount(user.id, user.email);
        if (!done) {
          throw new Error(
            "You have purchased activations. So you can not deactivate this account."
          );
          //   return exits.success({
          //     status: false,
          //     data: [],
          //     message:
          //       "You have purchased activations. So you can not deactivate this account.",
          //   });
        }
        sails.log.debug(
          "user account permanently disabled . \nTime: ",
          moment().format()
        );
      }

      sails.log.debug(
        "disabled user's token is discarded . \nTime: ",
        moment().format()
      );
      return exits.success({
        status: true,
        data: [],
        message: "User Deactivated",
      });
    } catch (e) {
      sails.log.error(
        "attempt to deactivate account failed ",
        e,
        "\nTime: ",
        moment().format()
      );

      return exits.ok({
        status: false,
        data: [],
        message: e.message || "server error",
      });
    }
  },
};
