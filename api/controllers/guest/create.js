const { generateRandomString } = require("../../util");
const moment = require("moment");
module.exports = {
  friendlyName: "Activation Create",

  description: "Activation Create",

  inputs: {
    header: {
      type: "ref",
      required: true,
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug(
      "action guest/create.js started with inputs: ",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );
    try {
      console.log({ inputs });
      if (inputs.header.device_id) {
        const device_id = inputs.header.device_id;
        let existingUser = await User.findOne({
          where: { email: device_id },
          // select: ["user_id", "customer_stripe_id"],
        });
        console.log({ existingUser });
        if (existingUser) {
          sails.log.debug(
            `User already registered with email '${device_id}'. No need to create as a guest user`
          );
          sails.log.debug(
            "action guest/create.js ended with response: ",
            JSON.stringify(existingUser),
            "\nTime: ",
            moment().format()
          );
          return exits.success({
            status: true,
            message:
              "User already registered. No need to create as a guest user",
            data: existingUser,
          });
        }
        const guest = await Guest.find({
          device_id: device_id,
          is_deleted: 0,
        });

        if (guest.length > 0) {
          return exits.success({
            status: true,
            message: "Guest user already created",
            data: guest[0],
          });
        }

        const first_name = "Guest";
        const last_name = await generateRandomString(5);

        const guestUser = await Guest.create({
          guest_user_id: 0,
          device_id: device_id,
          first_name: first_name,
          last_name: last_name,
        }).fetch();
        if (guestUser) {
          const data = await sails.helpers.stripe.customers.create(
            inputs.header.device_id
          );
          if (data) {
            const ins_in_user = await Guest.update({
              device_id: inputs.header.device_id,
            }).set({
              customer_stripe_id: data.customer.id,
            });

            const guestUpdated = await Guest.find({
              device_id: device_id,
              is_deleted: 0,
            });

            sails.log.debug(
              "action guest/create.js ended with response: ",
              JSON.stringify(guestUpdated),
              "\nTime: ",
              moment().format()
            );
            return exits.success({
              status: true,
              message: "Guest User Created",
              data: guestUpdated,
            });
          }
        } else {
          sails.log.debug(
            "action guest/create.js ended. Guest user could not be created ",
            "\nTime: ",
            moment().format()
          );
          return exits.success({
            status: false,
            message: "Guest user could not be created",
            data: {},
          });
        }
      } else {
        sails.log.debug(
          "action guest/create.js ended. Device ID is required ",
          "\nTime: ",
          moment().format()
        );
        return exits.success({
          status: false,
          message: "Device ID is required",
          data: {},
        });
      }
    } catch (err) {
      sails.log.debug(
        `action guest/create.js ended. ${err}`,
        "\nTime: ",
        moment().format()
      );
      return exits.success({
        status: false,
        message: "Error Occured. " + err.message,
        data: {},
      });
    }
  },
};
