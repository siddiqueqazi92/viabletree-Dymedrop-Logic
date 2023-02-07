const moment = require("moment");

module.exports = {
  friendlyName: "Get one",

  description: "",

  inputs: {
    user: {
      type: "ref",
    },
    id: {
      type: "string",
    },
    activation: {
      type: "number",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug(
      "calling user/pages/admin/templates/activate-deactive\ntime: ",
      moment()
    );
    sails.log("Inputs ", inputs);
    try {
      sails.log(inputs.activation != 0);
      if (inputs.activation == 0 || inputs.activation == 1) {
        const activations = await AdminActivations.find({
          id: inputs.id,
        });

        if (activations.length < 1) {
          return exits.success({
            status: false,
            message: "No listing found",
            data: [],
          });
        }

        if (activations[0].published == inputs.activation) {
          return exits.success({
            status: false,
            message: "Template is already active or deactive",
            data: [],
          });
        }
        const updateActivation = await AdminActivations.updateOne({
          id: inputs.id,
        }).set({
          published: inputs.activation,
        });

        sails.log.debug(
          "user/pages/admin/templates/activate-deactive executed\ntime: ",
          moment()
        );
        if (updateActivation) {
          return exits.success({
            status: true,
            message: "Activations updated",
            data: updateActivation,
          });
        } else {
          return exits.success({
            status: false,
            message: "No listing found",
            data: [],
          });
        }
      } else {
        return exits.success({
          status: false,
          message: "activation must be 0 or 1",
          data: [],
        });
      }
    } catch (error) {
      sails.log.error(
        "error at user/pages/admin/templates/activate-deactive error: ",
        error,
        "\ntime: ",
        moment()
      );
      return exits.success({
        status: false,
        message: "Unknown server error",
      });
    }
  },
};
