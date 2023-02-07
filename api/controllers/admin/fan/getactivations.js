module.exports = {
    friendlyName: "Get Activations of fans",
  
    description: "Purchased activations of fans",
  
    inputs: {
        id :{
            type :"string"
        }
    },
  
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
        sails.log("Calling admin/fan/activations ")
        try {
            
            const id = inputs.id

            const purchasedActivations = await sails.models.fan_activations.getFanActivations({fan_user_id: id})
            console.log({purchasedActivations});


            return exits.success({
                status : true,
                message :"Purchased Activations found",
                data :purchasedActivations
            })

        } catch (error) {
            return exits.serverError({
                status : false,
                message : error.message
            })
        }
    },
  };
  