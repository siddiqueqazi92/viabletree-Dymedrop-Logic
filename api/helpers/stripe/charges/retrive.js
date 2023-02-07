module.exports = {
	friendlyName: "Get charges",

	description: "",

  inputs: {
    charge_id: {
      type: 'string',
      required:true
    },    
  },

	exits: {
		success: {
			description: "All done.",
		},
	},

  fn: async function (inputs, exits) {
    sails.log.debug('Helper stripe/charges/get started')
    let data = {}
		try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);

      const charges = await stripe.charges.retrieve(inputs.charge_id);
      if (charges) {
        data.charges = charges
      }
      return exits.success(data)
		
    } catch (err) {
      sails.log.error(`Error in helper stripe/charges/create. ${err}`)
      return exits.success(data)
    }    
	},
};
