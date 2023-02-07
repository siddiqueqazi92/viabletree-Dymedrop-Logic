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

      let acceptInviation = await Invitations.find({
        page_id: pageId,
        email: inputs.user.email,
        // user_id: inputs.user.id,
        is_removed: 0,
      });

      if (acceptInviation.length > 0) {
        if (acceptInviation[0].accepted == 1) {
          return exits.success({
            status: false,
            message: "Invite accepted successfully.",
            data: {},
            authorize: true,
          });
        } else {
          return exits.success({
            status: true,
            message: "Invite not accepted.",
            data: {},
            authorize: true,
          });
        }
      } else {
        return exits.success({
          status: false,
          message: "No Invitation found.",
          data: {},
          authorize: false,
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
