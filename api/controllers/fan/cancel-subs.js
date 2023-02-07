
const moment = require('moment');
module.exports = {


  friendlyName: 'Cancel Subscription',


  description: 'Cancel Subscription.',


  inputs: {
    user: {
      type: 'ref',
      required:true
    },  
    id: {
      type: 'number',
      required:true
    }
  },


  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
  },


  fn: async function (inputs, exits) {
    sails.log.debug("calling action user/pages/get-one started. Inputs:", JSON.stringify(inputs), "\nTime: ", moment().format());
    try {
      
      let qt = await sails.models.fan_activations.updateOne({
        id:inputs.id,
        fan_user_id: inputs.user.id
        
      }).set({
        is_subscribed:0
      })  
      return exits.success({
        status: true,
        message: "unsubscribe successfully",
        data:qt
      })
      
    } catch (err) {
      sails.log.error("error in action user/pages/get-one", JSON.stringify(inputs), "\nTime: ", moment().format(),err);
    }
    return exits.success(sails.getDatastore('default'));

  }


};
