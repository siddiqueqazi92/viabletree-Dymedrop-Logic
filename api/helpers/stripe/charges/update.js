module.exports = {
	friendlyName: "Get charges",

	description: "",

  inputs: {
    charge_id: {
      type: 'string',
      required:true
    },    
    data_to_update :{
        type: 'ref',
      required:true
    }
  },

	exits: {
		success: {
			description: "All done.",
		},
	},

  fn: async function (inputs, exits) {
    sails.log.debug('Helper stripe/charges/update started')
    let data = {}
		try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);

      const charges = await stripe.charges.update(inputs.charge_id , inputs.data_to_update);
      if (charges) {
        data.charges = charges
      }
      return exits.success(data)
		
    } catch (err) {
      sails.log.error(`Error in helper stripe/charges/update. ${err}`)
      return exits.success(data)
    }    
	},
};
