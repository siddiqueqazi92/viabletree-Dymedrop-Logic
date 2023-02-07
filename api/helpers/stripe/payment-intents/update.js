module.exports = {
  friendlyName: "Make payment",

  description: "",

  inputs: {
    payment_id: {
      type: "string",
      required: true,
    },
    data_to_update: {
      type: "ref",
      required: true,
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

      await stripe.paymentIntents
        .update(inputs.payment_id, inputs.data_to_update)
        .then((result) => {
          sails.log.debug("Helper stripe/payment-intents/update ended");
          sails.log({ result });
          data.result = result;
          return exits.success(data);
        })
        .catch((err) => {
          sails.log.error(
            `Stripe Error in helper stripe/payment-intents/update. ${err}`
          );
          data.error = err;
          return exits.success(data);
        });
    } catch (err) {
      sails.log.error(`Error in helper stripe/payment-intents/update. ${err}`);
    }
    // return exits.success(data)
  },
};
