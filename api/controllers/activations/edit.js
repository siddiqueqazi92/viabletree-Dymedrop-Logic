module.exports = {
  friendlyName: "Activation Edit",

  description: "Activation Edit",

  inputs: {
    user: {
      type: "ref",
    },
    activateId: {
      type: "number",
      required: true,
    },
    activationName: {
      type: "string",
      required: false,
    },
    activationPrice: {
      type: "number",
      required: false,
    },
    activationFrequency: {
      type: "string",
      required: false,
    },
    activationDescription: {
      type: "string",
      required: false,
    },
    activationScanlimit: {
      type: "string",
      required: false,
    },
    activationFanlimit: {
      type: "string",
      required: false,
    },
    activationPromocode: {
      type: "string",
      required: false,
    },
    activationPublished: {
      type: "number",
      required: false,
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      sails.log("call activation/edit ");
      const editActivation = {
        user_id: inputs.user.id,
        activation_name: inputs.activationName,
        activation_price: inputs.activationPrice,
        activation_frequency: inputs.activationFrequency,
        activation_description: inputs.activationDescription,
        activation_scanlimit: inputs.activationScanlimit,
        activation_fanlimit: inputs.activationFanlimit,
        activation_promocode: inputs.activationPromocode,
        published: inputs.activationPublished,
      };
      const check = await sails.models.fan_activations.findOne({
        activation_id:inputs.activationId,
      })
      if(check){
        return exits.success({
          status: false,
          message: "Activation sold to fan, cannot perform edit",
          data: {},
        });
      }
      const checkActivation = await Activations.findOne({
        id: inputs.activationId,
        user_id: inputs.user.id,
      });

      if (checkActivation) {
        const matched = {
          ...checkActivation,
          ...editActivation,
        };
        const updateActivation = await Activations.updateOne({
          id: inputs.activationId,
          user_id: inputs.user.id,
        }).set(matched);
        if (updateActivation) {
          return exits.success({
            status: true,
            message: "Activation Edited Successfully",
            data: activationDelete,
          });
        } else {
          return exits.success({
            status: false,
            message: "Error Occured",
            data: {},
          });
        }
      } else {
        return exits.success({
          status: false,
          message: "No Activation Found",
          data: {},
        });
      }
    } catch (err) {
      return exits.success({
        status: false,
        message: "Error Occured. Something Went Wrong",
        data: {},
      });
    }
  },
};
