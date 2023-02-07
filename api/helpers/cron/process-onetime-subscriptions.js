const moment = require('moment');

module.exports = {


  friendlyName: 'Process onetime subscriptions',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {    
    sails.log.debug("Helper cron/process-onetime-subscriptions.js started. Inputs:", JSON.stringify(inputs), "\nTime: ", moment().format());
    try {
      let filter = {activation_frequency:'1-TIME',is_expire:false}
      let f_activations = await fan_activations.getFanActivations(filter) 
      
      if (f_activations.length) {           
        let fan_activation_to_expire = []
        for (activation of f_activations) {          
          if (activation.qr_code_usage >= activation.activation_scanlimit) {   
            sails.log(`Scan limit reached for fan_activation id: ${activation.id},it needs to be expired`)
            fan_activation_to_expire.push(activation.id)
          } else {
            let given = moment(activation.purchased_at, "YYYY-MM-DD");
            let current = moment().startOf('day');

            //Difference in number of days
           // let years = moment.duration(current.diff(given)).asYears();
           let years = moment.duration(current.diff(given)).asDays();
    
            if (years >= 1) {      
              sails.log(`1 Year has been passed for fan_activation id: ${activation.id},it needs to be expired`)
              fan_activation_to_expire.push(activation.id)
            }            
          }
          
        }
        if (fan_activation_to_expire.length) {
          sails.log("Ids of '1-TIME' fan_activations to be expired now:" ,fan_activation_to_expire)
          await fan_activations.update({ id: fan_activation_to_expire }).set({is_subscribed:false,is_expire:true})
        } else {
          sails.log("No '1-TIME' fan_activation needs to be expired")
        }
      } else {
        sails.log("No '1-TIME' fan_activation found")
      }
      
    } catch (err) {
      sails.log.error(`Error cron/process-onetime-subscriptions.js. ${err}`)
    }
    sails.log.debug("Helper cron/process-onetime-subscriptions.js ended", "\nTime: ", moment().format());
    return exits.success()
  }


};

