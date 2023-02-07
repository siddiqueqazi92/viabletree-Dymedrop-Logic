module.exports = {
	friendlyName: "Create customer",

	description: "",

	inputs: {
		
	},

	exits: {
		success: {
			description: "All done.",
		},
	},

	fn: async function (inputs, exits) {
		sails.log.debug("Action test-payment started");
		let data = {};
        try {
			const stripe = require("stripe")(sails.config.stripe.secret_key);
			// const customer_response = await sails.helpers.stripe.customers.create(
			// 	"abc123",
			// 	'siddique.qazi@viabletree.com'
			// );
			const token = await stripe.tokens.create({
				card: {
				  number: '4242424242424242',
				  exp_month: 1,
				  exp_year: 2023,
				  cvc: '314',
				},
				// customer:customer_response.customer.id
			});
			return exits.success(token)
			if (token) {
				const card_response = await sails.helpers.stripe.cards.add(					
					customer_response.customer.id,
					token.id,
				);
				// let payment_info = await sails.helpers.stripe.charges.create(
				// 	5 * 100,
				// 	token.id,
				// 	"usd",
				// 	// customer_response.customer.id
				// 	// inputs.user.customer_id,
				// 	// metadata
				// );
				// sails.log({payment_info})
			
				let price_response = await sails.helpers.stripe.prices.create(
					{ name: 'test product' },
					1,
					"month",
				);
				if (price_response) {
					let items = []
					items.push({ price: price_response.price.id })
					let subscription_response = await sails.helpers.stripe.subscriptions.create(
						customer_response.customer.id,
						items,
						card_response.card.id

					
					);
					sails.log({ subscription_response })
				}
			}
		
			
			return exits.success(data);
		} catch (err) {
			sails.log.error(`Error in action test-payment. ${err}`);
			return exits.success(data);
		}
	},
};
