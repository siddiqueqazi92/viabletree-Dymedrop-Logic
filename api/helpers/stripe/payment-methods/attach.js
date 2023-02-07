module.exports = {


  friendlyName: 'Add card',


  description: '',


  inputs: {
    customer_id: {
      type: 'string',
      required:true
    },
    payment_method_id: {
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
    sails.log.debug("Helper stripe/payment-methods/attach started");
		let data = {};
		try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);    
      
      // const paymentMethod = await stripe.paymentMethods.create({
      //   type: 'card',
      //   card: {
      //     number: '4242424242424242',
      //     exp_month: 8,
      //     exp_year: 2023,
      //     cvc: '314',
      //   },
      // });
      // console.log(paymentMethod)

      const payment_method = await stripe.paymentMethods.attach(
        inputs.payment_method_id,
        // paymentMethod.id,
        {customer: inputs.customer_id}
      );
      if (payment_method) {
        data.payment_method = payment_method
      }
      return exits.success(data);
		} catch (err) {
      sails.log.error(`Error in helper stripe/payment-methods/attach. ${err}`);
      data.error = err
      return exits.success(data);
		}
  }


};

