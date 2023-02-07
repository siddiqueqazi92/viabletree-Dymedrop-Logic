module.exports = {
  friendlyName: "Invitation Send",

  description: "Invitation Send",

  inputs: {
    email: {
      type: "string",
      required: true,
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      let fanExist = await User.findOne({
        email: inputs.email,
      });

      if (fanExist) {
        return exits.success({
          status: true,
          message: `Fan exists with email '${inputs.email}'`,
        });
      } else {
        return exits.success({
          status: false,
          message: `Fan does not exist with email '${inputs.email}'`,
        });
      }
    } catch (err) {
      return exits.success({
        status: false,
        message: "Error Occured. " + err.message,
        data: {},
      });
    }
  },
};
