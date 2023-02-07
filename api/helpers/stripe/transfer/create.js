module.exports = {
	friendlyName: "Make payment",

	description: "",

	inputs: {
		amount: {
			type: "number",
			required: true,
		},
		destination: {
			type: "string",
			required: true,
		},
        source_transaction: {
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
		
		description: {
			type: "string",
			defaultsTo: "Transfer to creator",
		},
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Helper stripe/transfer/create started");
		let data = {};
		try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
			let input_obj = {
				amount: inputs.amount, // Unit: cents
				currency: inputs.currency,				
				description: inputs.description
			};
			if (inputs.destination) {
				input_obj.destination = inputs.destination
			}
			if (inputs.source_transaction) {
				input_obj.source_transaction = inputs.source_transaction;
			}
			if (inputs.metadata) {
				input_obj.metadata = inputs.metadata;
			}
			await stripe.transfers
				.create(input_obj)
				.then((result) => {
					sails.log.debug("Helper stripe/transfer/create ended");
					sails.log({ result });
					data.result = result;
					return exits.success(data);
				})
				.catch((err) => {
					sails.log.error(
						`Stripe Error in helper stripe/transfer/create. ${err}`
					);
					data.error = err;
					return exits.success(data);
				});
		} catch (err) {
			sails.log.error(`Error in helper stripe/transfer/create. ${err}`);
		}
		// return exits.success(data)
	},
};
