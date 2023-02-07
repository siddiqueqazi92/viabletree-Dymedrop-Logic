module.exports = {
	friendlyName: "Make payment",

	description: "",

	inputs: {
		amount: {
			type: "number",
			required: true,
		},
		token: {
			type: "string",
			required: false,
		},
		metadata: {
			type: "ref",
			required: false,
		},
		currency: {
			type: "string",
			defaultsTo: "usd",
		},
		customer_id: {
			type: "string",
			required: false,
		},
		description: {
			type: "string",
			defaultsTo: "Activation payment ( Charge Created for 1-time user )",
		},
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/charges/create started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
			let input_obj = {
				amount: inputs.amount*100, // Unit: cents
				currency: inputs.currency,				
				description: inputs.description
			};
			if (inputs.token) {
				input_obj.source = inputs.token
			}
			if (inputs.customer_id) {
				input_obj.customer = inputs.customer_id;
			}
			if (inputs.metadata) {
				input_obj.metadata = inputs.metadata;
			}
			await stripe.charges
				.create(input_obj)
				.then((result) => {
					sails.log.debug("Helper stripe/charges/create ended");
					sails.log({ result });
					data.result = result;
					return exits.success(data);
				})
				.catch((err) => {
					sails.log.error(
						`Stripe Error in helper stripe/charges/create. ${err}`
					);
					data.error = err;
					return exits.success(data);
				});
		} catch (err) {
			sails.log.error(`Error in helper stripe/charges/create. ${err}`);
		}
		// return exits.success(data)
	},
};
