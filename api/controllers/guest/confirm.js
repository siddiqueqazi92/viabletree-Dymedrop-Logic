const { generateRandomString } = require("../../util");
const moment = require("moment");
module.exports = {
  friendlyName: "Guest User Confirmation",

  description: "Guest User Confirmation",

  inputs: {
    device_id: {
      type: "string",
    },
    user_id: {
      type: "string",
    },
    header: {
      type: "ref",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug(
      "action guest/confirm.js called with inputs: ",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );
    try {
      console.log({ inputs });
      if (inputs.device_id) {
        const device_id = inputs.device_id;
        const guest = await Guest.find({
          device_id: device_id,
          is_deleted: 0,
        });
        if (guest.length > 0) {
          const getGuestActivations = await GuestActivation.find({
            guest_user_id: guest[0].id,
          });

          sails.log({ getGuestActivations });
          if (getGuestActivations.length) {
            let gas = [];

            getGuestActivations.map((data) => {
              data.fan_user_id = inputs.user_id;
              gas.push({
                id: data.id,
                payment_reference: data.payment_reference,
              });
              delete data.guest_user_id;
              delete data.id;
            });

            sails.log({ getGuestActivations });

            const UpdateFansActivations = await fan_activations
              .createEach(getGuestActivations)
              .fetch();

            await GuestActivation.destroy({ id: _.map(gas, "id") });
            if (UpdateFansActivations.length) {
              for (let fa of UpdateFansActivations) {
                let ga = _.find(gas, {
                  payment_reference: fa.payment_reference,
                });

                let sales = await Sale.update({
                  fan_or_guest_activation_id: ga.id,
                  is_guest: true,
                })
                  .set({ fan_or_guest_activation_id: fa.id, is_guest: false })
                  .fetch();
                console.log({ sales });
              }
            }
            sails.log({ UpdateFansActivations });
          }

          // const updateSubscription = await sails.helpers.stripe.subscriptions.update()

          return exits.success({
            status: true,
            message: "Guest user already created",
            data: updateGuest,
          });
        } else {
          return exits.success({
            status: true,
            message: "No Guest User Foudd",
            data: {},
          });
        }
      } else {
        return exits.success({
          status: false,
          message: "Device ID is required",
          data: {},
        });
      }
    } catch (err) {
      sails.log.error(
        `Error in action api/controllers/guest/confirm.js, ${err}`
      );
      return exits.success({
        status: false,
        message: "Error Occured. " + err.message,
        data: {},
      });
    }
  },
};
