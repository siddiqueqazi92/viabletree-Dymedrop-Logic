module.exports = {


  friendlyName: 'Get cards',


  description: '',


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
    sails.log.debug("Helper stripe/subscriptions/get-one started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);

      const subscription = await stripe.subscriptions.retrieve(
        inputs.subscription_id
      );
      if (subscription) {
        data.subscription = subscription
      }
      return exits.success(data);
		} catch (err) {
      sails.log.error(`Error in helper stripe/subscriptions/get-one. ${err}`);
      data.error = err
      return exits.success(data);
		}
  }


};

