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
    is_active: {
      type: "boolean",
      required: false,
    },
    status: {
      type: "string",
      required: false,
    },
  },

  exits: {
    invalidRequest: {
      responseType: "invalidRequest",
      description: "Invalid Request",
    },
  },

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
      let updateUser;
      await sails.getDatastore().transaction(async (db) => {
        updateUser = await User.updateOne({ user_id: inputs.id })
          .set({
            is_form_submitted: true,
            status: global.STATUS[2],
            ...obj,
            user_id: inputs.id,
          })
          .usingConnection(db);
        await Page.update({ user_id: inputs.id })
          .set({ is_blocked: inputs.is_blocked })
          .fetch()
          .usingConnection(db);
      });

      sails.log.debug(
        "user/account/update/user-account executed\ntime: ",
        moment()
      );
      const userDetails = { ...updateUser, id: inputs.id };
      return exits.success({
        status: true,
        message: "Creator Updated Successfully",
        data: userDetails,
      });
      // return exits.invalidRequest({ status: true, message: 'test', data: userDetails })
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
