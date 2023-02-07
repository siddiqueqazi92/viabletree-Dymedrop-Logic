module.exports = {
  friendlyName: "Create customer",

  description: "",

  inputs: {
    customer_id: {
      type: "string",
      required: true,
    },
    user_id: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: false,
    },
    phone: {
      type: "string",
      required: false,
    },
    name: {
      type: "string",
      required: false,
    },
    default_payment_method: {
      type: "string",
      required: false,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "Helper stripe/customers/update started",
      JSON.stringify(inputs)
    );
    let data = {};
    try {
      const stripe = require("stripe")(sails.config.stripe.secret_key);
      let obj = { metadata: { user_id: inputs.user_id } };
      if (inputs.email) {
        obj.email = inputs.email;
      }
      if (inputs.phone) {
        obj.phone = inputs.phone;
      }
      if (inputs.name) {
        obj.name = inputs.name;
      }
      if (inputs.default_payment_method) {
        obj.invoice_settings = {
          default_payment_method: inputs.default_payment_method,
        };
      }
      let existing = await stripe.customers.search({
        query: `metadata[\'user_id\']:\'${inputs.user_id}\'`,
      });
      if (existing.data && existing.data.length) {
        existing = existing.data[0];
      } else {
        existing = await stripe.customers.retrieve(inputs.customer_id);
      }
      if (existing) {
        let customer = await stripe.customers.update(inputs.customer_id, obj);
        if (customer) {
          data.customer = customer;
        }
      }

      return exits.success(data);
    } catch (err) {
      sails.log.error(`Error in helper stripe/customers/update. ${err}`);
      return exits.success(data);
    }
  },
};
