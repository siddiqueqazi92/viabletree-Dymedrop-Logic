const moment = require("moment");
const checkOriginUrl = require("sails-hook-sockets/lib/util/check-origin-url");
const Activations = require("../../models/Activations");
const {
  generatePageUrl,
  generateRandomString,
  convertUnixToUtc,
} = require("../../util");

module.exports = {
  friendlyName: "Purchase Activations",

  description: "Purchase Activations by fans",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
    activation_id: {
      type: "string",
      required: true,
    },
    card_token: {
      type: "string",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      if (!inputs.card_token) {
        return exits.success({
          status: false,
          message: "Card not provided",
          data: {},
        });
      }

      sails.log.debug(
        "action fan/purchase-act.js called with inputs: ",
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
      // if (user.email !== email) {
      //   sails.log.debug('action user/account/form.js exited: User not found \nTime: ', moment().format())
      //   return exits.success({
      //     status: false,
      //     message: 'Form Submission failed, email is incorrect',
      //     data: {}
      //   })
      // }
      const check = await sails.models.activations.find({
        id: inputs.activation_id,
        published: 1,
        is_deleted: 0,
      });
      if (check.length < 1) {
        return exits.success({
          status: false,
          message: "Activation not found",
          data: {},
        });
      }

      // const check_page = await sails.models.fan_activations.find({
      //   page_id:check[0].page_id,
      // })
      // if(check_page.length > 0){
      //   return exits.success({
      //       status: false,
      //       message: 'Activation already bought against this page',
      //       data: {}
      //     })
      // }

      const getActivations = await sails.models.activations.find({
        page_id: check[0].page_id,
      });

      if (getActivations.length > 0) {
        let activationsArray = [];
        getActivations.map((data) => {
          activationsArray.push(data.id);
        });

        var ownerInfo;
        var pageInfo = await Page.find({
          id: check[0].page_id,
        });
        if (pageInfo.length > 0) {
          ownerInfo = await User.find({
            user_id: pageInfo[0].user_id,
          });
          if (ownerInfo.length < 1) {
            return exits.success({
              status: false,
              message: "No Owner found against this activations",
              data: {},
            });
          }
        }
        // if(check[0].activation_frequency == "YEARLY" || check[0].activation_frequency == "ANNUAL"){
        //       const checkifUserPurchasedAnyActivations =
        //       await sails.models.fan_activations.find({
        //       page_id: check[0].page_id,
        //       fan_user_id: check_user[0].user_id,
        //       is_subscribed: 1,
        //       });

        //       if (checkifUserPurchasedAnyActivations.length > 0) {
        //       return exits.success({
        //       status: false,
        //       message: "You have already purchased activation of this page.",
        //       data: {},
        //       });
        //       }
        //       } else {
        //       return exits.success({
        //       status: false,
        //       message: "No activations found",
        //       data: {},
        //       });
        //       }
      }
      const already_purchased = await sails.models.fan_activations.find({
        activation_id: check[0].id,
        page_id: check[0].page_id,
        fan_user_id: inputs.user.id,
        is_subscribed: 1,
      });
      const purchased_act = await sails.models.fan_activations
        .find({
          page_id: check[0].page_id,
          fan_user_id: inputs.user.id,
          is_subscribed: 1,
        })
        .populate("activation_id");
      if (
        already_purchased.length > 0 &&
        check[0].activation_frequency !== "1-TIME"
      ) {
        return exits.success({
          status: false,
          message: "Activation already purchased",
          data: {},
        });
      }
      let total_activations = await sails.models.fan_activations.count({
        activation_id: inputs.activation_id,
      });
      if (total_activations >= check[0].activation_fanlimit) {
        return exits.success({
          status: false,
          message: "Activation limit reached",
          data: {},
        });
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
      ///payment
      let subscription_end_1hour;
      let payment_info = null;
      let activation_frequency = check[0].activation_frequency.toUpperCase();
      let subscription_start = null;
      let subscription_end = null;
      let payment_reference = null;
      switch (activation_frequency) {
        case "1-TIME":
          let customer_id;
          if (_.isEmpty(check_user[0].customer_stripe_id)) {
            customer_res = await sails.helpers.stripe.customers.create(
              inputs.user.id,
              inputs.user.email
            );
            customer_id = customer_res.customer.id;
          } else {
            customer_id = check_user[0].customer_stripe_id;
          }

          let metaData = {
            fan_id: inputs.user.id,
            user_id: ownerInfo[0].user_id,
            activation_id: inputs.activation_id,
            transfer_to: ownerInfo[0].account_id,
            activationType: "1-time",
            page_id: check[0].page_id,
          };
          let cus_card_response = await sails.helpers.stripe.cards.add(
            customer_id,
            inputs.card_token
          );
          // if (!_.isUndefined(cus_card_response.error.statusCode) == 400) {
          //   return exits.success({
          //     status: false,
          //     message: "Token not valid. Please generate new",
          //     data: {},
          //   });
          // }

          payment_info = await sails.helpers.stripe.charges.create(
            check[0].activation_price,
            cus_card_response.card.id,
            metaData,
            "usd",
            customer_id
          );

          break;
        case "MONTHLY":
        case "ANNUAL":
          let interval = activation_frequency == "MONTHLY" ? "month" : "year";
          // let interval = "day";
          const customer_response = await sails.helpers.stripe.customers.create(
            inputs.user.id,
            inputs.user.email
          );
          let card_response = await sails.helpers.stripe.cards.add(
            customer_response.customer.id,
            inputs.card_token
          );
          if (card_response.error) {
            return exits.success({
              status: false,
              message: card_response.error.message,
              data: {},
            });
          }
          let price_response = await sails.helpers.stripe.prices.create(
            { name: check[0].activation_name },
            check[0].activation_price,
            interval
          );
          if (price_response.error) {
            return exits.success({
              status: false,
              message: price_response.error.message,
              data: {},
            });
          }

          let items = [];
          items.push({ price: price_response.price.id });
          let metadata = {
            fan_id: inputs.user.id,
            user_id: ownerInfo[0].user_id,
            activation_id: inputs.activation_id,
            transfer_to: ownerInfo[0].account_id,
            page_id: check[0].page_id,
          };
          payment_info = await sails.helpers.stripe.subscriptions.create(
            customer_response.customer.id,
            items,
            card_response.card.id,
            metadata
          );

          break;
      }
      sails.log({ payment_info });
      ////
      if (payment_info.error) {
        return exits.success({
          status: false,
          message: payment_info.error.message,
          data: {},
        });
      }

      if (payment_info.subscription) {
        subscription_start = convertUnixToUtc(
          payment_info.subscription.current_period_start
        );
        subscription_end = convertUnixToUtc(
          payment_info.subscription.current_period_end
        );
        subscription_end_1hour = moment(subscription_start).add(1, "hours");
        payment_reference = payment_info.subscription.id;
      } else {
        payment_reference = payment_info.result.id;
      }
      let is_act_exist = await sails.models.fan_activations.find({
        page_id: check[0].page_id,
        fan_user_id: inputs.user.id,
        deletedAt: null,
      });
      if (is_act_exist.length > 0) {
        // let des = await sails.models.fan_activations.destroy({
        //   page_id: is_act_exist[0].page_id,
        //   activation_id: is_act_exist[0].activation_id,
        //   fan_user_id: inputs.user.id,
        //   is_subscribed: 0,
        // });
        let des = await sails.models.fan_activations
          .update({
            page_id: check[0].page_id,
            fan_user_id: inputs.user.id,
            is_subscribed: false,
          })
          .set({ deletedAt: moment().format("YYYY-MM-DD HH:mm:ss") });
      }
      let res = {
        activation_id: check[0].id,
        page_id: check[0].page_id,
        is_purchased: true,
        fan_user_id: inputs.user.id,
        qr_code: qr_code.toUpperCase(),
        is_subscribed: 1,
        purchased_at: currentDateTime,
        subscription_start,
        subscription_end,
        payment_reference,
      };
      let makePurchase;
      if (
        purchased_act.length > 0 &&
        check[0].activation_frequency !== "1-TIME"
      ) {
        let data_to_update = { cancel_at_period_end: true };
        subscription_info = await sails.helpers.stripe.subscriptions.update(
          purchased_act[0].payment_reference,
          data_to_update
        );
        makePurchase = await sails.models.fan_activations
          .updateOne({ id: purchased_act[0].id })
          .set({
            activation_id: check[0].id,
            page_id: check[0].page_id,
            is_purchased: true,
            fan_user_id: inputs.user.id,
            qr_code: qr_code.toUpperCase(),
            is_subscribed: 1,
            purchased_at: currentDateTime,
            subscription_start,
            // subscription_end : subscription_end_1hour ? subscription_end_1hour : subscription_end ,
            subscription_end,
            payment_reference,
          });
      } else {
        makePurchase = await sails.models.fan_activations
          .create({
            activation_id: check[0].id,
            page_id: check[0].page_id,
            is_purchased: true,
            fan_user_id: inputs.user.id,
            qr_code: qr_code.toUpperCase(),
            is_subscribed: 1,
            purchased_at: currentDateTime,
            subscription_start,
            // subscription_end : subscription_end_1hour ? subscription_end_1hour : subscription_end ,
            subscription_end,
            payment_reference,
          })
          .fetch();
      }
      if (!makePurchase) {
        sails.log.debug(
          "action fan/purchase-act.js called with inputs: User not found \nTime: ",
          moment().format()
        );
        return exits.success({
          status: false,
          message: "Form Submission failed",
          data: {},
        });
      }

      if (payment_info.subscription) {
        let updateSubscription =
          await sails.helpers.stripe.subscriptions.update(
            payment_info.subscription.id,
            {
              metadata: {
                purchased_id: makePurchase.id,
              },
            }
          );

        if (!updateSubscription.subscription) {
          sails.log.error(
            "action fan/purchase-act.js called with inputs execution failed: ",
            error,
            " \nTime: ",
            moment().format()
          );
          return exits.success({
            status: false,
            message: "Subscription update failed",
            data: {},
          });
        }
      } else {
        let updateCharge = await sails.helpers.stripe.charges.update(
          payment_info.result.id,
          {
            metadata: {
              purchased_id: makePurchase.id,
            },
          }
        );
        if (!updateCharge.charges) {
          sails.log.error(
            "action update/charge.js called with inputs execution failed: ",
            error,
            " \nTime: ",
            moment().format()
          );
          return exits.success({
            status: false,
            message: "Charge update failed",
            data: {},
          });
        }
        if (already_purchased.length) {
          await fan_activations.update({ id: already_purchased[0].id }).set({
            is_subscribed: false,
            deletedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          });
        }
      }

      let earnings;
      if (ownerInfo[0].total_earnings != "") {
        earnings = parseFloat(ownerInfo[0].total_earnings);
      } else {
        earnings = 0;
      }
      let share;
      let settings = await Setting.find({
        setting_type: "admin_share",
      });
      if (settings.length > 0) {
        share = settings[0].value;
      } else {
        share = 10;
      }
      let fees = parseFloat(
        check[0].activation_price - check[0].activation_price / share
      );
      let feesCalculations = fees - check[0].activation_price * 0.03;
      let updatePayment = earnings + feesCalculations;
      let updateUser = await User.updateOne({
        user_id: pageInfo[0].user_id,
      }).set({
        total_earnings: updatePayment.toString(),
      });
      if (updateUser) {
        // const _user = await sails.helpers.jwt.generateToken.with({ user: updateUser });
        sails.log.debug(
          "action fan/purchase-act.js called with inputs successfully executed \nTime: ",
          moment().format()
        );
        return exits.success({
          status: true,
          message: "Form submitted successfully",
          data: { ...makePurchase },
        });
      }
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
