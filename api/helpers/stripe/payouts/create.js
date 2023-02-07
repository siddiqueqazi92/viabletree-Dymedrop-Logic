module.exports = {
	friendlyName: "Create payout",

	description: "",

	inputs: {
		amount: {
			type: "number",
			required: true,
		},
		stripe_account_id: {
			type: "string",
			required: true,
		},     
		metadata: {
			type: "ref",
			required: false,
		}, 
		source_type: {
			type: "string",
			required: false,
		}, 
		currency: {
			type: "string",
			defaultsTo: "usd",
		},
		description: {
			type: "string",
			defaultsTo: "Payout to creator external account",
		},
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/payouts/create started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
			let input_obj = {
				amount: Math.round(inputs.amount*100), // Unit: cents
				currency: inputs.currency,				
				description: inputs.description
			};		
			if (inputs.source_type) {
				input_obj.source_type = inputs.source_type;
			}
			if (inputs.metadata) {
				input_obj.metadata = inputs.metadata;
			}
			const payout = await stripe.payouts.create(input_obj, {
				stripeAccount: inputs.stripe_account_id,
			});
			if (payout) {
				console.log({payout})
				data.result = payout
			}
			
		} catch (err) {
			sails.log.error(`Error in helper stripe/payouts/create. ${err}`);
			data.error = err
		}
		 return exits.success(data)
	},
};
