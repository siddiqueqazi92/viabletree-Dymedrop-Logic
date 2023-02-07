const express = require("express");
const { convertUnixToUtc } = require("../../util");
var moment = require("moment");

module.exports = {
  friendlyName: "Webhook",

  description: "",

  inputs: {
    body: {
      type: "ref",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    express.raw({ type: "application/json" });
    let request = this.req;
    let response = this.res;
    try {
      // const event = request.body;
      const event = inputs.body;
      let obj;
      // Handle the event
      console.log(event.data.object);
      obj = event.data.object;
      console.log({ eventType: event.type });
      switch (event.type) {
        case "customer.subscription.deleted":
          console.log({ subscription_id: obj.id });
          update = await sails.models.fan_activations
            .update({
              payment_reference: obj.id,
            })
            .set({
              is_purchased: false,
              is_subscribed: false,
              is_expire: true,
            })
            .fetch();

          break;
        case "customer.subscription.updated":
          let updateSubsmeta = obj.metadata;
          if (updateSubsmeta.t_id) {
            // let updateTrasnfer = await Transfer.updateOne({
            //   id: updateSubsmeta.t_id,
            //   // user_id: chargeMetadata.user_id,
            //   // page_id: chargeMetadata.page_id,
            //   // activation_id: chargeMetadata.activation_id,
            //   // purchased_id: null,
            // }).set({
            //   purchase_id: updateSubsmeta.purchase_id,
            // });
          }
          break;

        case "payment_intent.succeeded":
          let piMetadata = obj;
          if (piMetadata.metadata.activationType == "1-time") {
            let adminShare;
            let settings = await sails.models.setting.find({
              setting_type: "admin_share",
            });
            if (settings.length > 0) {
              adminShare = settings[0].value;
            } else {
              adminShare = 15;
            }

            let totalDeduction =
              piMetadata.amount - (obj.amount * adminShare) / 100;
            let feesCalculations = totalDeduction - (obj.amount * 0.029 + 30);

            let charge_metadata = {
              charge_id: obj.charges.data[0].id,
              transfer_to: piMetadata.metadata.transfer_to,
              user_id: piMetadata.metadata.user_id,
            };
            console.log(piMetadata, "Trasnfermetadata");

            //#region sales
            let purchased_activation = obj.metadata.is_guest
              ? await GuestActivation.findOne({
                  payment_reference: obj.payment_method,
                })
              : await fan_activations.findOne({
                  payment_reference: obj.payment_method,
                });
            let fan_or_guest_activation_id = !_.isUndefined(
              purchased_activation
            )
              ? purchased_activation.id
              : null;
            if (fan_or_guest_activation_id) {
              let sale = await Sale.create({
                total: obj.amount / 100,
                admin_share: (obj.amount * adminShare) / 100 / 100,
                creator_share: Math.floor(totalDeduction / 100),
                fan_or_guest_activation_id,
                activation_id: obj.metadata.activation_id,
                is_guest: obj.metadata.is_guest ? true : false,
              }).fetch();
              console.log({ sale });
            }

            //#endregion
            let createTransfer = await sails.helpers.stripe.transfer.create(
              Math.floor(feesCalculations),
              piMetadata.metadata.transfer_to,
              obj.charges.data[0].id,
              charge_metadata
            );
          }

          break;
        case "invoice.payment_succeeded":
          // obj.subscription = "sub_1MCLFKAy63VsFcXqQcpooivI";//this line is just for testing purpose
          if (obj.subscription) {
            let fan_or_guest_activation_id = null;
            let subscription_response =
              await sails.helpers.stripe.subscriptions.getOne(obj.subscription);
            if (subscription_response.subscription) {
              let subscription = subscription_response.subscription;
              let filter = {
                // activation_id: subscription.metadata.activation_id,
                // fan_user_id: subscription.metadata.user_id,
                payment_reference: subscription.id,
              };
              let f_activation = await fan_activations.getFanActivations(
                filter
              );
              if (f_activation.length) {
                f_activation = f_activation[0];
                fan_or_guest_activation_id = f_activation.id;
                subscription_start = convertUnixToUtc(
                  subscription.current_period_start
                );
                subscription_end = convertUnixToUtc(
                  subscription.current_period_end
                );
                await fan_activations.update({ id: f_activation.id }).set({
                  subscription_start,
                  subscription_end,
                  qr_code_usage: 0,
                  payment_reference: subscription.id,
                  is_subscribed: true,
                  is_purchased: true,
                  is_expire: false,
                });
              }
              let charge_metadata = {
                charge_id: obj.charge,
                transfer_to: subscription.metadata.transfer_to,
                user_id: subscription.metadata.user_id,
              };
              let adminShare;
              let settings = await sails.models.setting.find({
                setting_type: "admin_share",
              });
              if (settings.length > 0) {
                adminShare = settings[0].value;
              } else {
                adminShare = 15;
              }

              let totalDeduction =
                obj.amount_paid - (obj.amount_paid * adminShare) / 100;
              let feesCalculations =
                totalDeduction - (obj.amount_paid * 0.029 + 30);

              console.log(subscription.metadata, "subspaymentdone");
              // await User.updateAvalableAmount(
              //   subscription.metadata.user_id,
              //   feesCalculations / 100
              // );

              //#region sales
              if (
                subscription.metadata.is_guest === true ||
                subscription.metadata.is_guest === "true"
              ) {
                var guest_activation = await GuestActivation.findOne({
                  payment_reference: subscription.id,
                });
                fan_or_guest_activation_id = guest_activation.id;
              }
              console.log({
                fan_or_guest_activation_id,
                is_guest: subscription.metadata.is_guest,
              });
              if (fan_or_guest_activation_id) {
                let sale = await Sale.create({
                  total: obj.amount_paid / 100,
                  admin_share: (obj.amount_paid * adminShare) / 100 / 100,
                  creator_share: Math.floor(totalDeduction / 100),
                  fan_or_guest_activation_id,
                  activation_id: subscription.metadata.activation_id,
                  is_guest:
                    subscription.metadata.is_guest === true ||
                    subscription.metadata.is_guest === "true"
                      ? true
                      : false,
                }).fetch();
                console.log({ sale });
              }
              let transfer = await sails.helpers.stripe.transfer.create(
                Math.floor(feesCalculations),
                subscription.metadata.transfer_to,
                obj.charge,
                charge_metadata
              );
              //#endregion

              // let transferHistory = {
              //   user_id: subscription.metadata.user_id,
              //   page_id: subscription.metadata.page_id
              //     ? subscription.metadata.page_id
              //     : "",
              //   activation_id: subscription.metadata.activation_id
              //     ? subscription.metadata.activation_id
              //     : "",
              //   purchase_id: subscription.metadata.purchased_id
              //     ? subscription.metadata.purchased_id
              //     : "",
              //   amount: Math.floor(feesCalculations),
              //   transfer_date: moment().format(),
              //   transfer_id: transfer.result.id,
              // };
              // let saveTransferHistory = await Transfer.create(
              //   transferHistory
              // ).fetch();

              // let updateCharge =
              //   await sails.helpers.stripe.subscriptions.update(
              //     subscription.id,
              //     {
              //       metadata: {
              //         t_id: saveTransferHistory.id,
              //       },
              //     }
              //   );
            }
          }
          break;
        case "invoice.payment_failed":
          if (obj.subscription) {
            let subscription_response =
              await sails.helpers.stripe.subscriptions.getOne(obj.subscription);
            if (subscription_response.subscription) {
              let subscription = subscription_response.subscription;
              let where = {
                activation_id: subscription.metadata.activation_id,
                fan_user_id: subscription.metadata.user_id,
              };
              await fan_activations.update({ where }).set({
                is_purchased: false,
                is_subscribed: false,
                is_expire: true,
              });
            }
          }
          break;
        case "charge.updated":
          let chargeMetadata = obj.metadata;
          console.log({ chargeMetadata });
          if (chargeMetadata.t_id) {
            // let trasnfer = await Transfer.find({
            //   purchase_id: chargeMetadata.purchase_id,
            // });
            // console.log({ trasnfer });
            // if (trasnfer.length > 0) {
            //   let updateTrasnfer = await Transfer.updateOne({
            //     id: chargeMetadata.t_id,
            //     // user_id: chargeMetadata.user_id,
            //     // page_id: chargeMetadata.page_id,
            //     // activation_id: chargeMetadata.activation_id,
            //     // purchased_id: null,
            //   }).set({
            //     purchase_id: chargeMetadata.purchased_id,
            //   });
            // }
          }

          break;
        case "charge.succeeded":
          let metadata = obj.metadata;
          if (metadata.activationType == "1-time") {
            let charge_metadata = {
              charge_id: obj.id,
              transfer_to: metadata.transfer_to,
              user_id: metadata.user_id,
            };
            console.log(
              obj.amount,
              metadata.transfer_to,
              obj.id,
              charge_metadata
            );
            let adminShare;
            let settings = await sails.models.setting.find({
              setting_type: "admin_share",
            });
            if (settings.length > 0) {
              adminShare = settings[0].value;
            } else {
              adminShare = 10;
            }
            console.log({ adminShare }, obj.amount);

            let totalDeduction = obj.amount - (obj.amount * adminShare) / 100;
            let feesCalculations = totalDeduction - (obj.amount * 0.029 + 30);
            console.log({ totalDeduction, feesCalculations });
            // await User.updateAvalableAmount(
            //   metadata.user_id,
            //   feesCalculations / 100
            // );
            //#region  sales
            let f_activation = await fan_activations.findOne({
              payment_reference: obj.id,
            });
            let fan_or_guest_activation_id = !_.isUndefined(f_activation)
              ? f_activation.id
              : null;
            if (fan_or_guest_activation_id) {
              let sale = await Sale.create({
                total: obj.amount / 100,
                admin_share: (obj.amount * adminShare) / 100 / 100,
                creator_share: Math.floor(totalDeduction / 100),
                fan_or_guest_activation_id,
                activation_id: obj.metadata.activation_id,
              }).fetch();
              console.log({ sale });
            }

            //#endregion
            let charge_response = await sails.helpers.stripe.transfer.create(
              Math.floor(feesCalculations),
              metadata.transfer_to,
              obj.id,
              charge_metadata
            );

            // let transferHistory = {
            //   user_id: metadata.user_id,
            //   page_id: metadata.page_id ? metadata.page_id : "",
            //   activation_id: metadata.activation_id
            //     ? metadata.activation_id
            //     : "",
            //   purchase_id: metadata.purchased_id ? metadata.purchased_id : "",
            //   amount: Math.floor(feesCalculations),
            //   transfer_date: moment().format(),
            //   transfer_id: charge_response.result.id,
            // };
            // let saveTransferHistory = await Transfer.create(
            //   transferHistory
            // ).fetch();

            // let updateCharge = await sails.helpers.stripe.charges.update(
            //   obj.id,
            //   {
            //     metadata: {
            //       t_id: saveTransferHistory.id,
            //     },
            //   }
            // );
          }
          break;
        default:
          // Unexpected event type
          console.log(`Unhandled event type ${event.type}.`);
      }
      // Return a 200 response to acknowledge receipt of the event
      return exits.success();
    } catch (err) {
      sails.log.error(`Error in action stripe/webhook. ${err}`);
    }
    return exits.success({ status: true, session: null });
  },
};
