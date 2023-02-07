module.exports = {
  friendlyName: "Get cards",

  description: "",

  inputs: {
    payment_intent_id: {
      type: "string",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug("Helper stripe/payment-intents/get-one started");
    let data = {};
    try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);

      const payment_intent = await stripe.paymentIntents.retrieve(
        inputs.payment_intent_id
      );
      if (payment_intent) {
        data.payment_intent = payment_intent;
      }
      return exits.success(data);
    } catch (err) {
      sails.log.error(`Error in helper stripe/payment-intents/get-one. ${err}`);
      data.error = err;
      return exits.success(data);
    }
  },
};
