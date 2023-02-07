const { initConfig } = require("grunt");
const moment = require("moment");

const { generateRandomString, convertUnixToUtc } = require("../../../util");

module.exports = {
  friendlyName: "Purchase Activations using apple pay",

  description: "Purchase Activations using apple pay by fans",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
    activation_id: {
      type: "string",
      required: true,
    },
    payment_method_id: {
      type: "string",
    },
    client_stripe_customer: {
      type: "string",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      if (!inputs.card_token) {
        // return exits.success({
        //   status: false,
        //   message: 'Card not provided',
        //   data: {}
        // })
      }

      sails.log.debug(
        "action fan/purchase-act/apple-pay.js started with inputs: ",
        JSON.stringify(inputs),
        "\nTime: ",
        moment().format()
      );

      const check_user = await sails.models.user.find({
        user_id: inputs.user.id,
      });
      if (check_user.length < 1) {
        sails.log.debug(
          "action fan/purchase-act/apple-pay.js ended. User not found \nTime: ",
          moment().format()
        );
        return exits.success({
          status: false,
          message: "User not found",
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
      });
      if (check.length < 1) {
        sails.log.debug(
          "action fan/purchase-act/apple-pay.js ended. Activation not found \nTime: ",
          moment().format()
        );
        return exits.success({
          status: false,
          message: "Activation not found",
          data: {},
        });
      }

      let ownerInfo;
      let pageInfo = await Page.find({
        id: check[0].page_id,
      });
      if (pageInfo.length > 0) {
        ownerInfo = await User.find({
          user_id: pageInfo[0].user_id,
        });
        if (ownerInfo.length < 1) {
          sails.log.debug(
            "action fan/purchase-act/apple-pay.js ended. No Owner found against this activation \nTime: ",
            moment().format()
          );
          return exits.success({
            status: false,
            message: "No Owner found against this activation",
            data: {},
          });
        }
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
      const is_purchased = await sails.models.fan_activations.find({
        activation_id: check[0].id,
        page_id: check[0].page_id,
        fan_user_id: inputs.user.id,
        is_subscribed: 1,
      });
      if (is_purchased.length > 0) {
        if (check[0].activation_frequency !== "1-TIME") {
          sails.log.debug(
            "action fan/purchase-act/apple-pay.js ended. Activation already purchased \nTime: ",
            moment().format()
          );
          return exits.success({
            status: false,
            message: "Activation already purchased",
            data: {},
          });
        }
      }
      let total_activations = await sails.models.fan_activations.count({
        activation_id: inputs.activation_id,
      });
      if (total_activations >= check[0].activation_fanlimit) {
        sails.log.debug(
          "action fan/purchase-act/apple-pay.js ended. Activation limit reached \nTime: ",
          moment().format()
        );
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

      let payment_info = null;
      let activation_frequency = check[0].activation_frequency.toUpperCase();
      let customer_response = {
        customer: { id: check_user[0].customer_stripe_id },
      };
      // await sails.helpers.stripe.customers.create(
      //   inputs.user.id,
      //   inputs.user.email
      // );
      switch (activation_frequency) {
        case "1-TIME":
          payment_info = await sails.helpers.stripe.paymentIntents.create(
            check[0].activation_price,
            "usd",
            {
              fan_id: inputs.user.id,
              user_id: ownerInfo[0].user_id,
              activation_id: inputs.activation_id,
              page_id: check[0].page_id,
              transfer_to: ownerInfo[0].account_id,
              activationType: "1-time",
            },
            customer_response.customer.id
          );
          // payment_info = await sails.helpers.stripe.charges.create.with({
          //  amount: check[0].activation_price,
          //   customer_id:customer_response.customer.id,
          // }
          // );

          break;
        case "MONTHLY":
        case "ANNUAL":
          let interval = activation_frequency == "MONTHLY" ? "month" : "year";
          // let interval = "day";
          let payment_method_response =
            await sails.helpers.stripe.paymentMethods.attach(
              customer_response.customer.id,
              inputs.payment_method_id
            );
          if (payment_method_response.error) {
            return exits.success({
              status: false,
              message: payment_method_response.error.message,
              data: {},
            });
          }
          customer_response = await sails.helpers.stripe.customers.update.with({
            customer_id: customer_response.customer.id,
            user_id: inputs.user.id,
            default_payment_method: payment_method_response.payment_method.id,
          });
          // if(customer_response){
          //   return exits.success({
          //     status: false,
          //     message: 'Customer not found',
          //     data: {}
          //   })
          // }
          let price_response = await sails.helpers.stripe.prices.create(
            { name: check[0].activation_name },
            check[0].activation_price,
            interval
          );
          if (price_response.error) {
            sails.log.debug(
              "action fan/purchase-act/apple-pay.js ended. Stripe Error \nTime: ",
              price_response.error,
              moment().format()
            );
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
            page_id: check[0].page_id,
            transfer_to: ownerInfo[0].account_id,
          };
          payment_info = await sails.helpers.stripe.subscriptions.create.with({
            customer: customer_response.customer.id,
            items,
            metadata,
          });

          break;
      }
      sails.log({ payment_info });
      ////
      if (payment_info.error) {
        sails.log.debug(
          "action fan/purchase-act/apple-pay.js ended. Payment error stripe \nTime: ",
          payment_info.error,
          moment().format()
        );
        return exits.success({
          status: false,
          message: payment_info.error.message,
          data: {},
        });
      }
      if (payment_info.result) {
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
          share = 1;
        }

        let fees = parseFloat(
          check[0].activation_price - check[0].activation_price / share
        );
        let feesCalculations = fees - check[0].activation_price * 0.03;
        let updatePayment = earnings + feesCalculations;
        // let updatePayment =
        //   earnings +
        //   parseFloat(
        //     check[0].activation_price - check[0].activation_price / share
        //   );

        let updateUser = await User.updateOne({
          user_id: pageInfo[0].user_id,
        }).set({
          total_earnings: updatePayment.toString(),
        });
        if (updateUser) {
          sails.log.debug(
            "action fan/purchase-act/apple-pay.js ended. Processed successfully ",
            "\nTime: ",
            moment().format()
          );
          return exits.success({
            status: true,
            message: "Processed successfully",
            data: {
              client_secret: payment_info.result.client_secret,
              payment_id: payment_info.result.id,
            },
          });
        }
      }
      subscription_start = convertUnixToUtc(
        payment_info.subscription.current_period_start
      );
      subscription_end = convertUnixToUtc(
        payment_info.subscription.current_period_end
      );
      const subscription_end_1hour = moment(subscription_start).add(1, "hours");
      payment_reference = payment_info.subscription.id;
      const is_act_exist = await sails.models.fan_activations.find({
        page_id: check[0].page_id,
        fan_user_id: inputs.user.id,
        activation_id: check[0].id,
        //  is_subscribed:0
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
      }
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
      console.log({ subscription_start }, { subscription_end });
      const makePurchase = await sails.models.fan_activations
        .create({
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
        })
        .fetch();
      if (!makePurchase) {
        sails.log.debug(
          "action fan/purchase-act/apple-pay.js ended. Form submission failed \nTime: ",
          moment().format()
        );

        return exits.success({
          status: false,
          message: "Form Submission failed",
          data: {},
        });
      }
      let updateSubs;
      if (payment_info.subscription) {
        updateSubs = await sails.helpers.stripe.subscriptions.update(
          payment_info.subscription.id,
          {
            metadata: {
              t_id: makePurchase.id,
            },
          }
        );
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
        share = 1;
      }

      let fees = parseFloat(
        check[0].activation_price - check[0].activation_price / share
      );
      let feesCalculations = fees - check[0].activation_price * 0.03;
      let updatePayment = earnings + feesCalculations;

      // let updatePayment =
      //   earnings +
      //   parseFloat(check[0].activation_price - check[0].activation_price / share);

      let updateUser = await User.updateOne({
        user_id: pageInfo[0].user_id,
      }).set({
        total_earnings: updatePayment.toString(),
      });

      if (updateUser) {
        sails.log.debug(
          "action fan/purchase-act/apple-pay.js ended. Form submitted successfully \nTime: ",
          moment().format()
        );
        return exits.success({
          status: true,
          message: "Form submitted successfully",
          data: {
            client_secret:
              payment_info.subscription.payment_intent.client_secret,
          },
        });
      }

      // const _user = await sails.helpers.jwt.generateToken.with({ user: updateUser });
    } catch (error) {
      sails.log.error(
        "action fan/purchase-act/apple-pay.js ended. Execution failed: ",
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
