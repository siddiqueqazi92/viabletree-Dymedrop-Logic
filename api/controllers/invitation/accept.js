const { generateRandomString } = require("../../util");
const path = require("path");
var ejs = require("ejs");
module.exports = {
  friendlyName: "Invitation Send",

  description: "Invitation Send",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
    id: {
      type: "string",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      let pageId = inputs.id;

      let acceptInviation = await Invitations.updateOne({
        page_id: pageId,
        email: inputs.user.email,
        // user_id: inputs.user.id,
        is_removed : 0
      }).set({
        accepted: 1,
      });

      if (acceptInviation) {
        return exits.success({
          status: true,
          message: "Invite accepted successfully.",
          data: {},
        });
      } else {
        return exits.success({
          status: false,
          message: "Something went wrong.",
          data: {},
        });
      }
    } catch (err) {
      return exits.success({
        status: false,
        message: "Error Occured. " + err.message,
        data: {},
      });
    }
  },
};
