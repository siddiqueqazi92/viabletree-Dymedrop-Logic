const moment = require("moment");

const Activations = require("../../models/Activations");
const { generateRandomString } = require("../../util");

async function getNewQRCode(check_user) {
  let qr_code = null;
  qr_code = generateRandomString(6) + check_user.id;
  do {
    found = await sails.models.fan_activations
      .find({ qr_code: qr_code })
      .limit(1);
    if (found.length) {
      qr_code = generateRandomString(6);
    }
  } while (found.length);
  return qr_code;
}
module.exports = {
  friendlyName: "QR Scan Code",

  description: "",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
    qr_code: {
      type: "string",
      //required: true
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      sails.log.debug(
        "action fan/recent-act.js called with inputs: ",
        JSON.stringify(inputs),
        "\nTime: ",
        moment().format()
      );

      const check_user = await sails.models.user.find({
        user_id: inputs.user.id,
      });
      const check = await sails.models.fan_activations.findOne({
        qr_code: inputs.qr_code,
        // fan_user_id:inputs.user.id
      });
      if (!check) {
        return exits.success({
          status: false,
          message: "QR code not matched",
          data: {},
        });
      }
      const check_creator = await sails.models.activations.findOne({
        id: check.activation_id,
        user_id: inputs.user.id,
        page_id: check.page_id,

        // fan_user_id:inputs.user.id
      });
      if (!check_creator) {
        let checkInvitor = await Invitations.find({
          email: inputs.user.email,
          page_id: check.page_id,
          is_removed: 0,
          accepted: 1,
        });
        if (checkInvitor.length < 1) {
          return exits.success({
            status: false,
            message: "QR code is unidentified",
            data: {},
          });
        }
      }
      const check_act_limit = await sails.models.activations.findOne({
        id: check.activation_id,
      });
      if (check.qr_code_usage == check_act_limit.activation_scanlimit) {
        return exits.success({
          status: false,
          message: "All scan consumed",
          data: {},
        });
      }
      const ent = await sails.models.recent_activities.create({
        user_id: check.fan_user_id,
        page_id: check.page_id,
        type: "Attended",
        count: 1,
      });
      let new_qr_code = await getNewQRCode(check_user[0]);
      let add = parseInt(check.qr_code_usage || 0) + 1;
      const add_count = await sails.models.fan_activations
        .updateOne({
          fan_user_id: check.fan_user_id,
          page_id: check.page_id,
          qr_code: inputs.qr_code,
        })
        .set({
          qr_code_usage: add.toString(),
          qr_code: new_qr_code.toUpperCase(),
        });

      //#region sending data message to fan
      let extra_data = { page_id: check.page_id };
      let title = "Data message title";
      let body = "Data message body";
      await sails.helpers.firebase.sendPushNotification(
        check.fan_user_id,
        title,
        body,
        true,
        JSON.stringify(extra_data),
        "qrcode_scanned"
      );
      //#endregion
      return exits.success({
        status: true,
        message: "QR code scaned",
        data: {},
      });
    } catch (error) {
      sails.log.error(
        "action fan/purchase-act.js called with inputs execution failed: ",
        error,
        " \nTime: ",
        moment().format()
      );
      return exits.success({
        status: false,
        message: error.message,
        data: {},
      });
    }
  },
};
