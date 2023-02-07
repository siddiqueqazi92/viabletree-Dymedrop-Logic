const moment = require("moment");

const { generateRandomString } = require("../../../util");

module.exports = {
  friendlyName: "Purchase Activations/Confirm apple pay",

  description: "Purchase Activations confirm apple pay",

  inputs: {
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
    header: {
      type: "ref",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      sails.log.debug(
        "action guest/purchase-act/confirm-apple-pay.js called with inputs: ",
        JSON.stringify(inputs),
        "\nTime: ",
        moment().format()
      );

      const checkEmail = await sails.models.user.findOne({
        email: inputs.header.device_id,
      });
      const check_user = await Guest.find({
        device_id: inputs.header.device_id,
        is_deleted: 0,
      });

      if (!checkEmail && check_user.length < 1) {
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

      ///
      let qr_code = null;
      if (checkEmail) {
        const is_purchased = await sails.models.fan_activations.find({
          activation_id: check[0].id,
          page_id: check[0].page_id,
          fan_user_id: checkEmail.user_id,
          is_subscribed: 1,
        });
        if (is_purchased.length > 0) {
          return exits.success({
            status: false,
            message: "Activation already purchased",
            data: {},
          });
        }

        qr_code = generateRandomString(6) + checkEmail.id;
        do {
          found = await sails.models.fan_activations.find({ qr_code }).limit(1);
          if (found.length) {
            qr_code = generateRandomString(6);
          }
        } while (found.length);
        //#region soft deleting existing fan_activation of user
        /////
        const is_act_exist = await sails.models.fan_activations.find({
          page_id: check[0].page_id,
          fan_user_id: checkEmail.user_id,
          // activation_id: check[0].id,
          //is_subscribed:0
        });
        if (is_act_exist.length > 0) {
          let data_to_update = { cancel_at_period_end: true };
          subscription_info = await sails.helpers.stripe.subscriptions.update(
            is_act_exist[0].payment_reference,
            data_to_update
          );
          const des = await sails.models.fan_activations
            .update({
              page_id: check[0].page_id,
              // activation_id: is_act_exist[0].activation_id,
              fan_user_id: checkEmail.user_id,
              deletedAt: null,
              //  is_subscribed:0
            })
            .set({
              is_subscribed: false,
              deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            });
        }
        /////
        //#endregion
      } else {
        const is_purchased = await sails.models.guestactivation.find({
          activation_id: check[0].id,
          page_id: check[0].page_id,
          guest_user_id: check_user[0].id,
          is_subscribed: 1,
        });
        if (is_purchased.length) {
          return exits.success({
            status: false,
            message: "Activation already purchased",
            data: {},
          });
        }
        qr_code = generateRandomString(6) + check_user[0].id;
        do {
          found = await sails.models.guestactivation.find({ qr_code }).limit(1);
          if (found.length) {
            qr_code = generateRandomString(6);
          }
        } while (found.length);
        /////
        const is_act_exist = await sails.models.guestactivation.find({
          page_id: check[0].page_id,
          guest_user_id: check_user[0].id,
          activation_id: check[0].id,
          //is_subscribed:0
        });
        if (is_act_exist.length > 0) {
          let data_to_update = { cancel_at_period_end: true };
          subscription_info = await sails.helpers.stripe.subscriptions.update(
            is_act_exist[0].payment_reference,
            data_to_update
          );
          const des = await sails.models.guestactivation.destroy({
            page_id: is_act_exist[0].page_id,
            activation_id: is_act_exist[0].activation_id,
            guest_user_id: check_user[0].id,
            //  is_subscribed:0
          });
        }
        /////
      }
      ///

      const currentDateTime = moment().utc().format("YYYY-MM-DD: HH:mm:ss");

      let exisingUser = await User.findOne({ email: inputs.header.device_id });
      let makePurchase = null;
      let is_guest = false;
      if (exisingUser) {
        makePurchase = await sails.models.fan_activations
          .create({
            activation_id: check[0].id,
            page_id: check[0].page_id,
            is_purchased: true,
            fan_user_id: exisingUser.user_id,
            qr_code: qr_code.toUpperCase(),
            is_subscribed: 1,
            purchased_at: currentDateTime,
            payment_reference: inputs.payment_reference || null,
          })
          .fetch();
      } else {
        makePurchase = await sails.models.guestactivation
          .create({
            activation_id: check[0].id,
            page_id: check[0].page_id,
            is_purchased: true,
            guest_user_id: check_user[0].id,
            qr_code: qr_code.toUpperCase(),
            is_subscribed: 1,
            purchased_at: currentDateTime,
            payment_reference: inputs.payment_reference || null,
          })
          .fetch();
        is_guest = true;
      }

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
        is_guest,
      }).fetch();

      //#endregion sales
      if (inputs.payment_id) {
        let updatePI = await sails.helpers.stripe.paymentIntents.update(
          inputs.payment_id,
          {
            metadata: {
              t_id: makePurchase.id,
              is_guest: true,
            },
          }
        );
        //temporary for testing purpose
        // const stripe = require("stripe")(sails.config.stripe.secret_key);
        // const paymentIntent = await stripe.paymentIntents.confirm(
        //   inputs.payment_id,
        //   { payment_method: inputs.payment_reference }
        // );
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
