const moment = require("moment");

const { generateRandomString } = require("../../../util");

module.exports = {
  friendlyName: "Purchase Activations/Confirm apple pay",

  description: "Purchase Activations confirm apple pay",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
    activation_id: {
      type: "string",
      required: true,
    },
    payment_reference: {
      type: "string",
      required: false,
      allowNull: true,
    },
    payment_id: {
      type: "string",
      required: false,
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      sails.log.debug(
        "action fan/purchase-act/confirm-apple-pay.js called with inputs: ",
        JSON.stringify(inputs),
        "\nTime: ",
        moment().format()
      );

      const check_user = await sails.models.user.find({
        user_id: inputs.user.id,
      });
      if (check_user.length < 1) {
        return exits.success({
          status: false,
          message: "user not found",
          data: {},
        });
      }
      const check = await sails.models.activations.find({
        id: inputs.activation_id,
      });
      if (check.length < 1) {
        return exits.success({
          status: false,
          message: "Activation not found",
          data: {},
        });
      }

      const is_purchased = await sails.models.fan_activations.find({
        activation_id: check[0].id,
        page_id: check[0].page_id,
        fan_user_id: inputs.user.id,
        is_subscribed: 1,
      });
      if (is_purchased.length) {
        if (check[0].activation_frequency !== "1-TIME") {
          return exits.success({
            status: false,
            message: "Activation already purchased",
            data: {},
          });
        }
      }
      let qr_code = null;
      qr_code = generateRandomString(6) + check_user[0].id;
      do {
        found = await sails.models.fan_activations
          .find({ qr_code: qr_code })
          .limit(1);
        if (found.length) {
          qr_code = generateRandomString(6);
        }
      } while (found.length);

      const currentDateTime = moment().utc().format("YYYY-MM-DD: HH:mm:ss");

      const is_act_exist = await sails.models.fan_activations.find({
        page_id: check[0].page_id,
        fan_user_id: inputs.user.id,
        // activation_id: check[0].id,
        //is_subscribed:0
      });
      if (is_act_exist.length > 0) {
        if (check[0].activation_frequency !== "1-TIME") {
          let data_to_update = { cancel_at_period_end: true };
          subscription_info = await sails.helpers.stripe.subscriptions.update(
            is_act_exist[0].payment_reference,
            data_to_update
          );
        }

        // const des = await sails.models.fan_activations.destroy({
        //   page_id: is_act_exist[0].page_id,
        //   activation_id: is_act_exist[0].activation_id,
        //   fan_user_id: inputs.user.id,
        //   //  is_subscribed:0
        // });
        const des = await sails.models.fan_activations
          .update({
            page_id: check[0].page_id,
            // activation_id: is_act_exist[0].activation_id,
            fan_user_id: inputs.user.id,
            deletedAt: null,
            //  is_subscribed:0
          })
          .set({
            is_subscribed: false,
            deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          });
      }

      const makePurchase = await sails.models.fan_activations
        .create({
          activation_id: check[0].id,
          page_id: check[0].page_id,
          is_purchased: true,
          fan_user_id: inputs.user.id,
          qr_code: qr_code.toUpperCase(),
          is_subscribed: 1,
          purchased_at: currentDateTime,
          payment_reference: inputs.payment_reference || null,
        })
        .fetch();
      console.log(
        "makePurchase in api/controllers/fan/purchase-act/confirm-apple-pay.js"
      );
      console.log({ makePurchase });
      if (!makePurchase) {
        sails.log.debug(
          "action fan/purchase-act/confirm-apple-pay.js called with inputs: User not found \nTime: ",
          moment().format()
        );
        return exits.success({
          status: false,
          message: "Form Submission failed",
          data: {},
        });
      }
      //#region sales
      let adminShare;
      let settings = await sails.models.setting.find({
        setting_type: "admin_share",
      });
      if (settings.length > 0) {
        adminShare = settings[0].value;
      }
      let activation = await Activations.findOne({
        id: makePurchase.activation_id,
      });
      let total = parseFloat(activation.activation_price);
      let totalDeduction = total - (total * adminShare) / 100;
      let sale = await Sale.create({
        total,
        admin_share: (total * adminShare) / 100,
        creator_share: Math.floor(totalDeduction),
        fan_or_guest_activation_id: makePurchase.id,
        activation_id: makePurchase.activation_id,
        is_guest: false,
      }).fetch();

      //#endregion sales
      if (inputs.payment_id) {
        let updatePI = await sails.helpers.stripe.paymentIntents.update(
          inputs.payment_id,
          {
            metadata: {
              t_id: makePurchase.id,
            },
          }
        );
      }

      // const _user = await sails.helpers.jwt.generateToken.with({ user: updateUser });
      sails.log.debug(
        "action fan/purchase-act/confirm-apple-pay.js called with inputs successfully executed \nTime: ",
        moment().format()
      );
      return exits.success({
        status: true,
        message: "Form submitted successfully",
        data: { ...makePurchase },
      });
    } catch (error) {
      sails.log.error(
        "action fan/purchase-act/confirm-apple-pay.js called with inputs execution failed: ",
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
