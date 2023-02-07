module.exports = {


  friendlyName: 'Add card',


  description: '',


  inputs: {
    customer: {
      type: 'string',
      required: true,
     description:"Stripe Customer ID"
    },
    items: {
      type: 'ref',
      required:true
    },
    default_payment_method: {
      type: 'string',
      required:false
    },
    metadata: {
      type:'ref'
    },
    description: {
			type: "string",
			defaultsTo: "Activation subscription",
		},
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    sails.log.debug("Helper stripe/subscriptions/create started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
      let obj = { ...inputs }
      
      const subscription = await stripe.subscriptions.create(obj);
      if (subscription) {
        const invoice = await stripe.invoices.retrieve(
          subscription.latest_invoice
        );
        subscription.payment_intent = await stripe.paymentIntents.retrieve(
          invoice.payment_intent
        );
        
        data.subscription = subscription
      }
      return exits.success(data);
		} catch (err) {
      sails.log.error(`Error in helper stripe/subscriptions/create. ${err}`);
      data.error = err
      return exits.success(data);
		}
  }


};

