const { initConfig } = require("grunt");
const moment = require("moment");

const { generateRandomString, convertUnixToUtc } = require("../../../util");

module.exports = {
  friendlyName: "Purchase Activations using apple pay",

  description: "Purchase Activations using apple pay by fans",

  inputs: {
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
    header: {
      type: "ref",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      if (!inputs.header.device_id) {
        return exits.success({
          status: false,
          message: "Device ID required in headers",
          data: {},
        });
      }

      sails.log.debug(
        "action guest/guest-purchase/apple-pay.js called with inputs: ",
        JSON.stringify(inputs),
        "\nTime: ",
        moment().format()
      );
      console.log(inputs.payment_method_id);

      // return exits.success({
      //   status: false,
      //   message: "Device ID required in headers",
      //   data: {},
      // });
      const checkEmail = await sails.models.user.findOne({
        email: inputs.header.device_id,
      });
      if (checkEmail) {
        if (
          checkEmail.currentUser == "creator" ||
          checkEmail.currentUser == "invitee"
        ) {
          return exits.success({
            status: false,
            message: "This email is registered as Creator or Teammate",
            data: {},
          });
        }
        const actStatus = await sails.models.fan_activations.find({
          fan_user_id: checkEmail.user_id,
          activation_id: inputs.activation_id,
          is_subscribed: 1,
        });

        if (actStatus.length) {
          return exits.success({
            status: false,
            message: "Activation already purchased",
            data: {},
          });
        }
      }
      console.log(inputs.header.device_id, "===>device_id");
      const check_user = await sails.models.guest.find({
        device_id: inputs.header.device_id,
        is_deleted: 0,
      });
      if (!checkEmail && check_user.length < 1) {
        return exits.success({
          status: false,
          message: "User not found",
          data: {},
        });
      }
      // if (user.email !== email) {
      //   sails.log.debug('action guest/guest-purchase/apple-pay.js exited: User not found \nTime: ', moment().format())
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
          return exits.success({
            status: false,
            message: "No Owner found against this activations",
            data: {},
          });
        }
      }

      const getActivations = await sails.models.activations.find({
        page_id: check[0].page_id,
      });

      if (getActivations.length > 0) {
        let activationsArray = [];
        getActivations.map((data) => {
          activationsArray.push(data.id);
        });

        console.log({ activationsArray });
        if (!checkEmail) {
          const checkifUserPurchasedAnyActivations =
            await sails.models.guestactivation.find({
              page_id: check[0].page_id,
              guest_user_id: check_user[0].id,
              is_subscribed: 1,
            });

          if (checkifUserPurchasedAnyActivations.length > 0) {
            return exits.success({
              status: false,
              message: "You have already purchased activation of this page.",
              data: {},
            });
          }
        }
      } else {
        return exits.success({
          status: false,
          message: "No activations found",
          data: {},
        });
      }

      // const check_page = await sails.models.guestactivation.find({
      //   page_id:check[0].page_id,
      // })
      // if(check_page.length > 0){
      //   return exits.success({
      //       status: false,
      //       message: 'Activation already bought against this page',
      //       data: {}
      //     })
      // }
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
      } else {
        const is_purchased = await sails.models.guestactivation.find({
          activation_id: check[0].id,
          page_id: check[0].page_id,
          guest_user_id: check_user[0].id,
          is_subscribed: 1,
        });
        if (is_purchased.length > 0) {
          return exits.success({
            status: false,
            message: "Activation already purchased",
            data: {},
          });
        }
      }

      let total_activations = await sails.models.guestactivation.count({
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

      if (checkEmail) {
        qr_code = generateRandomString(6) + checkEmail.id;
        do {
          found = await sails.models.fan_activations
            .find({ qr_code: qr_code })
            .limit(1);
          if (found.length) {
            qr_code = generateRandomString(6);
          }
        } while (found.length);
      } else {
        qr_code = generateRandomString(6) + check_user[0].id;
        do {
          found = await sails.models.guestactivation
            .find({ qr_code: qr_code })
            .limit(1);
          if (found.length) {
            qr_code = generateRandomString(6);
          }
        } while (found.length);
      }

      const currentDateTime = moment().utc().format("YYYY-MM-DD: HH:mm:ss");
      ///payment

      let payment_info = null;
      let activation_frequency = check[0].activation_frequency.toUpperCase();
      let customer_response = {
        customer: {
          id: checkEmail
            ? checkEmail.customer_stripe_id
            : check_user[0].customer_stripe_id,
        },
      };
      // await sails.helpers.stripe.customers.create(
      //   check_user[0].id,
      //   inputs.user.email
      // );

      console.log({ check_user });
      console.log({ checkEmail });
      console.log({ customer_response });
      console.log({ inputs });
      let metadata = {};
      switch (activation_frequency) {
        case "1-TIME":
          metadata = {
            fan_id: checkEmail ? checkEmail.email : check_user[0].device_id,
            fan_user_id: checkEmail ? checkEmail.user_id : null,
            user_id: ownerInfo[0].user_id,
            activation_id: inputs.activation_id,
            page_id: check[0].page_id,
            transfer_to: ownerInfo[0].account_id,
            activationType: "1-time",
            is_guest: checkEmail ? false : true,
          };
          payment_info = await sails.helpers.stripe.paymentIntents.create(
            check[0].activation_price,
            "usd",
            metadata,
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
          let checkCustomer = true;
          while (checkCustomer) {
            const updateData = await sails.helpers.stripe.customers.update.with(
              {
                customer_id: customer_response.customer.id,
                user_id: checkEmail
                  ? checkEmail.user_id
                  : check_user[0].device_id,
                default_payment_method:
                  payment_method_response.payment_method.id,
              }
            );
            console.log("WHILE CONDITIONS CALLED");
            if (Object.keys(updateData).length > 0) {
              checkCustomer = false;
              customer_response = { ...updateData };
            }
          }

          // if(customer_response){
          //ddddd   return exits.success({
          //     status: false,
          //     message: 'Customer not found',
          //     data: {}
          //   })
          // }
          console.log({ customer_response });
          console.log({ customer_response });
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
          metadata = {
            user_id: ownerInfo[0].user_id,
            fan_id: checkEmail ? checkEmail.email : check_user[0].device_id,
            activation_id: inputs.activation_id,
            page_id: check[0].page_id,
            transfer_to: ownerInfo[0].account_id,
            is_guest: checkEmail ? false : true,
          };
          payment_info = await sails.helpers.stripe.subscriptions.create.with({
            customer: customer_response.customer.id,
            items,
            metadata,
          });

          ////
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
      payment_reference = payment_info.subscription.id;
      if (checkEmail) {
        const is_act_exist = await sails.models.fan_activations.find({
          page_id: check[0].page_id,
          fan_user_id: checkEmail.user_id,
          activation_id: check[0].id,
          is_subscribed: 0,
        });
        if (is_act_exist.length > 0) {
          let data_to_update = { cancel_at_period_end: true };
          subscription_info = await sails.helpers.stripe.subscriptions.update(
            is_act_exist[0].payment_reference,
            data_to_update
          );

          let des = await sails.models.fan_activations
            .update({
              page_id: is_act_exist[0].page_id,
              activation_id: is_act_exist[0].activation_id,
              fan_user_id: checkEmail.user_id,
              is_subscribed: 0,
            })
            .set({ deletedAt: moment().format("YYYY-MM-DD HH:mm:ss") });
        }
      } else {
        const is_act_exist = await sails.models.guestactivation.find({
          page_id: check[0].page_id,
          guest_user_id: check_user[0].id,
          activation_id: check[0].id,
          //  is_subscribed:0
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
      }

      let makePurchase;
      if (checkEmail) {
        sails.log("User is a registered user, creating fan_activation");
        makePurchase = await sails.models.fan_activations
          .create({
            activation_id: check[0].id,
            page_id: check[0].page_id,
            is_purchased: true,
            fan_user_id: checkEmail.user_id,
            qr_code: qr_code.toUpperCase(),
            is_subscribed: 1,
            purchased_at: currentDateTime,
            subscription_start,
            subscription_end,
            payment_reference,
          })
          .fetch();
      } else {
        sails.log("User is a guest user, creating guest_activation");
        makePurchase = await sails.models.guestactivation
          .create({
            activation_id: check[0].id,
            page_id: check[0].page_id,
            is_purchased: true,
            guest_user_id: check_user[0].id,
            qr_code: qr_code.toUpperCase(),
            is_subscribed: 1,
            purchased_at: currentDateTime,
            subscription_start,
            subscription_end,
            payment_reference,
          })
          .fetch();
      }
      console.log(
        "makePurchase in api/controllers/guest/guest-purchase/apple-pay.js"
      );
      console.log({ makePurchase });
      if (!makePurchase) {
        sails.log.debug(
          "action guest/guest-purchase/apple-pay.js called: User not found \nTime: ",
          moment().format()
        );
        return exits.success({
          status: false,
          message: "Form Submission failed",
          data: {},
        });
      }

      // const _user = await sails.helpers.jwt.generateToken.with({ user: updateUser });
      // sails.log.debug(
      //   "action guest/guest-purchase/apple-pay.js called with inputs successfully executed \nTime: ",
      //   moment().format()
      // );
      // return exits.success({
      //   status: true,
      //   message: "Form submitted successfully",
      //   data: {
      //     client_secret: payment_info.subscription.payment_intent.client_secret,
      //   },
      // });

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
          "action guest/guest-purchase/apple-pay.js called with inputs successfully executed \nTime: ",
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
    } catch (error) {
      sails.log.error(
        "action guest/guest-purchase/apple-pay.js called with inputs execution failed: ",
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
