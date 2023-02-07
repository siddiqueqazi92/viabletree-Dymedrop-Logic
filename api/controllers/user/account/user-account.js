const moment = require("moment");

module.exports = {
  friendlyName: "User account",

  description: "",

  inputs: {
    id: {
      type: "string",
    },
    avatar: {
      type: "string",
      required: false,
    },
    first_name: {
      type: "string",
      required: false,
    },
    last_name: {
      type: "string",
      required: false,
    },
    email: {
      type: "string",
      isEmail: true,
      required: false,
    },
    phone_number: {
      type: "string",
      required: false,
    },
    organization: {
      type: "string",
      required: false,
    },
    job_title: {
      type: "string",
      required: false,
    },
    fanbase_size: {
      type: "string",
      required: false,
    },
    location: {
      type: "string",
      required: false,
    },
    is_blocked: {
      type: "boolean",
      required: false,
    },
    is_invited: {
      type: "boolean",
      required: false,
    },
    is_active: {
      type: "boolean",
      required: false,
    },
    currentUser: {
      type: "string",
      required: false,
    },
    full_name: {
      type: "string",
      required: false,
    },
    status: {
      type: "string",
      required: false,
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug(
      "calling user/account/update/user-account\ntime: ",
      moment()
    );
    sails.log.debug(
      "calling user/account/update/user-account\ninputs: ",
      JSON.stringify({ ...inputs })
    );

    const obj = { ...inputs };
    delete obj.id;
    delete obj.user_id;

    try {
      const updateUser = await User.updateOrCreate(
        { user_id: inputs.id },
        { ...obj, user_id: inputs.id }
      );
      console.log({ updateUser });

      const checkUser = await User.find({
        user_id: inputs.id,
      });
      console.log({ checkUser });
      if (checkUser.length > 0) {
        const updateInvite = await Invitations.updateOne({
          email: checkUser[0].email,
        }).set({
          //   accepted: 1,
          full_name: `${checkUser[0].first_name} ${checkUser[0].last_name}`,
          user_id: checkUser[0].user_id,
        });

        //#region updating stripe customer details
        const guest = await Guest.find({
          device_id: checkUser[0].email,
          is_deleted: 0,
        });
        let customer_stripe_id = checkUser[0].customer_stripe_id;
        let objToUpdate = {
          user_id: checkUser[0].user_id,
          email: checkUser[0].email,
        };
        if (guest.length > 0) {
          customer_stripe_id = guest[0].customer_stripe_id;
          await User.updateOne({ user_id: checkUser[0].user_id }).set({
            customer_stripe_id: guest[0].customer_stripe_id,
          });
          const updateGuest = await Guest.destroy({
            device_id: checkUser[0].email,
          });

          objToUpdate.customer_id = guest[0].customer_stripe_id;
        }
        if (customer_stripe_id) {
          if (checkUser[0].first_name) {
            objToUpdate.name =
              checkUser[0].first_name + " " + checkUser[0].last_name;
          }
          customer_response = await sails.helpers.stripe.customers.update.with(
            objToUpdate
          );
        }
        //#endregion
      }

      sails.log.debug(
        "user/account/update/user-account executed\ntime: ",
        moment()
      );
      const user = { ...updateUser[0], id: inputs.id };
      return exits.success(user);
    } catch (error) {
      sails.log.error(
        "error at user/account/update/user-account error: ",
        error,
        "\ntime: ",
        moment()
      );
      exits.error();
    }
  },
};
