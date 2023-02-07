module.exports = {
  friendlyName: "Make payment",

  description: "",

  inputs: {
    amount: {
      type: "number",
      required: true,
    },
    currency: {
      type: "string",
      defaultsTo: "usd",
    },
    metadata: {
      type: "ref",
    },
    customer: {
      type: "string",
    },
    description: {
      type: "string",
      defaultsTo: "One Time Activation Purchased",
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug("Helper stripe/payment-intents/create started");
    let data = {};
    try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);
      let input_obj = {
        amount: inputs.amount * 100, // Unit: cents
        currency: inputs.currency,
      };

      if (inputs.metadata) {
        input_obj.metadata = inputs.metadata;
      }
      if (inputs.customer) {
        input_obj.customer = inputs.customer;
      }
      if (inputs.description) {
        input_obj.description = inputs.description;
      }
      await stripe.paymentIntents
        .create(input_obj)
        .then((result) => {
          sails.log.debug("Helper stripe/payment-intents/create ended");
          sails.log({ result });
          data.result = result;
          return exits.success(data);
        })
        .catch((err) => {
          sails.log.error(
            `Stripe Error in helper stripe/payment-intents/create. ${err}`
          );
          data.error = err;
          return exits.success(data);
        });
    } catch (err) {
      sails.log.error(`Error in helper stripe/payment-intents/create. ${err}`);
    }
    // return exits.success(data)
  },
};
