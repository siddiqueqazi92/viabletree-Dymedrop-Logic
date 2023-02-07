module.exports = {
  friendlyName: "Activation Delete",

  description: "Activation Delete",

  inputs: {
    user: {
      type: "ref",
    },
    activationId: {
      type: "number",
      required: true,
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      sails.log("call activation/delete ");
    
      if (inputs.user) {
        let check = await sails.models.fan_activations.find({activation_id:inputs.activationId})
        if(check.length > 0){
          return exits.success({
            status: false,
            message: "cannot delete this activation, activation sold to fan",
            data:{}          
          })
        }
        const activateDelete = await Activations.findOne({
          id: inputs.activationId,
          user_id: inputs.user.id,
        });
       
        if (activateDelete) {
          const activationDelete = await Activations.destroyOne({
            id: inputs.activationId,
            user_id: inputs.user.id,
          });
          sails.log(activationDelete)
          return exits.success({
            status: true,
            message: "Activation Deleted",
            data: activationDelete,
          });
        } else {
          return exits.success({
            status: false,
            message: "No Activation Found",
            data: {},
          });
        }
      } else {
        return exits.success({
          status: false,
          message: "Unauthorized",
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
