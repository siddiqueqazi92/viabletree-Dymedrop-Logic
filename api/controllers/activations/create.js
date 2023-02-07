module.exports = {
  friendlyName: "Activation Create",

  description: "Activation Create",

  inputs: {
    user: {
      type: "ref",
    },
    activationName: {
      type: "string",
      required: true,
    },
    activationPrice: {
      type: "number",
      required: true,
    },
    activationFrequency: {
      type: "string",
      required: true,
    },
    activationDescription: {
      type: "string",
      required: true,
    },
    activationScanlimit: {
      type: "string",
      required: true,
    },
    activationFanlimit: {
      type: "string",
      required: true,
    },
    activationPromocode: {
      type: "string",
      required: false,
    },
    activationPublished :{
        type: "number",
        required: false,
    }
  },

  exits: {},

  fn: async function (inputs, exits) {

    try{
       
        if(inputs.user)
        {
            const createActivation = {
                user_id: inputs.user.id,
                activation_name:inputs.activationName,
                activation_price :inputs.activationPrice,
                activation_frequency :inputs.activationFrequency,
                activation_description : inputs.activationDescription,
                activation_scanlimit :inputs.activationScanlimit,
                activation_fanlimit :inputs.activationFanlimit,
                activation_promocode :inputs.activationPromocode,
                published : inputs.activationPublished
            }
            const activation = await Activations.create(createActivation).fetch()
            return exits.success({
                status: true,
                message :"Activation Created",
                data : activation
            });
        }
        else{
            return exits.success({
                status :false,
                message :"Unauthorized",
                data :{}
            })
        }
       
    }
    catch(err)
    {
        return exits.success({
            status :false,
            message : "Error Occured. Something Went Wrong",
            data :{}
        })
    }
    
  },
};
