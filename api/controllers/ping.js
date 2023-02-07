module.exports = {
  friendlyName: "Ping",

  description: "Ping something.",

  inputs: {},

  exits: {
    invalid: {
      responseType: "badRequest",
    },
    unauthorized: {
      responseType: "unauthorized",
    },
    forbidden: {
      responseType: "forbidden",
    },
    serverError: {
      responseType: "serverError",
    },
    notFound: {
      responseType: "notFound",
    },
  },

  fn: async function (inputs, exits) {
    // sails.log("Action ping started");
    // sails.log("Action ping ended");
    return exits.success();
  },
};
