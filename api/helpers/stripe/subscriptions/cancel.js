module.exports = {


  friendlyName: 'cancel',


  description: 'Cancel subscription',


  inputs: {
    subscription_id: {
      type: 'string',
      required:true
    },   
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    sails.log.debug("Helper stripe/subscriptions/cancel started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
     
      const deleted = await stripe.subscriptions.del(
        inputs.subscription_id
      );
      if (deleted) {
        data.subscription = deleted
      }
      return exits.success(data);
		} catch (err) {
      sails.log.error(`Error in helper stripe/subscriptions/cancel. ${err}`);
      data.error = err
      return exits.success(data);
		}
  }


};

