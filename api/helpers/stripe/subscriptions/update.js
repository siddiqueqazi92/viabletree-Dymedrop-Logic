module.exports = {


  friendlyName: 'update',


  description: 'Update subscription',


  inputs: {
    subscription_id: {
      type: 'string',
      required:true
    },
    data_to_update: {
      type: 'ref',
      required:true
    },
   
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    sails.log.debug("Helper stripe/subscriptions/update started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
     
      const subscription = await stripe.subscriptions.update(inputs.subscription_id,
       inputs.data_to_update);
      if (subscription) {
        data.subscription = subscription
      }
      return exits.success(data);
		} catch (err) {
      sails.log.error(`Error in helper stripe/subscriptions/update. ${err}`);
      data.error = err
      return exits.success(data);
		}
  }


};

