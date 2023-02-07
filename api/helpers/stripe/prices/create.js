module.exports = {


  friendlyName: 'Add price',


  description: '',


  inputs: {
    product_data: {
      type: 'ref',
      required:true
    },
    price: {
      type: 'number',
      required:true
    },
    interval: {
      type: 'string',
      required: true,
      isIn:['month','year','day']
    },
    currency: {
      type: 'string',
      required: false,
      defaultsTo:"usd"
    },
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    sails.log.debug("Helper stripe/prices/create started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
     
      const price = await stripe.prices.create({
        unit_amount: inputs.price*100,
        currency: inputs.currency,
        recurring: {interval: inputs.interval},
        product_data: inputs.product_data,
      });
      if (price) {
        data.price = price
      }
      return exits.success(data);
		} catch (err) {
      sails.log.error(`Error in helper stripe/prices/create. ${err}`);
      data.error = err
      return exits.success(data);
		}
  }


};

