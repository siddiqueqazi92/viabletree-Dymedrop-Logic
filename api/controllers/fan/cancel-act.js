const moment = require('moment');
const checkOriginUrl = require('sails-hook-sockets/lib/util/check-origin-url');
const Activations = require('../../models/Activations');
const { generatePageUrl,generateRandomString, convertUnixToUtc } = require("../../util");

module.exports = {


  friendlyName: 'Purchase Activations',


  description: 'Purchase Activations by fans',


  inputs: {

    user: {
      type: 'ref',
      required: true
    },
    activation_id: {
      type: 'string',
      required: true
    },   
        
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    try {    

      sails.log.debug('action fan/cancel-act.js called with inputs: ', JSON.stringify(inputs), '\nTime: ', moment().format())

      const check_user = await sails.models.user.find({
            user_id:inputs.user.id
      })
      if(check_user.length < 1){
        return exits.success({
            status: false,
            message: 'User not found',
            data: {}
          })
      }
    
      const check = await sails.models.activations.find({
        id: inputs.activation_id        
      })
      if(check.length < 1){
        return exits.success({
            status: false,
            message: 'Activation not found',
            data: {}
          })
      }
     
     const is_purchased = await sails.models.fan_activations.find({
      activation_id:check[0].id,
      page_id:check[0].page_id,
      fan_user_id:inputs.user.id
    })
    if(!is_purchased.length){
      return exits.success({
          status: false,
          message: 'Activation not purchased',
          data: {}
        })
    }

    const un_subscribed = await sails.models.fan_activations.updateOne({
      activation_id:check[0].id,
      page_id:check[0].page_id,
      fan_user_id:inputs.user.id
    }).set({
      is_subscribed:0
    })
     
    let data_to_update =  {cancel_at_period_end:true}  
    subscription_info = await sails.helpers.stripe.subscriptions.update(
      is_purchased[0].payment_reference, data_to_update          
     );            
    // subscription_info = await sails.helpers.stripe.subscriptions.cancel(
    //   is_purchased[0].payment_reference          
    //  );            
      sails.log({subscription_info})
    ////
    if (subscription_info.error) {
      return exits.success({
        status: false,
        message: subscription_info.error.message,
        data: {}
      })
    }
    

      // const _user = await sails.helpers.jwt.generateToken.with({ user: updateUser });
      sails.log.debug('action fan/cancel-act.js called with inputs successfully executed \nTime: ', moment().format())
      return exits.success({
        status: true,
        message: 'Cancelled successfully',
        data: {}
      })

    } catch (error) {

      sails.log.error('action fan/cancel-act.js called with inputs execution failed: ', error, ' \nTime: ', moment().format())
      return exits.success({
        status: false,
        message: error.message,
        data: {}
      })
    }

  }


};
