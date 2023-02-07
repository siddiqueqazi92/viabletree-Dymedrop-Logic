module.exports = {
    friendlyName: "Get charges",
  
    description: "",
  
    inputs: {
      transfer_id: {
        type: "string",
        required: true,
      }
    },
  
    exits: {
      success: {
        description: "All done.",
      },
    },
  
    fn: async function (inputs, exits) {
      sails.log.debug("Helper stripe/transfer/update started");
      let data = {};
      try {
        const stripe = require("stripe")(sails.config.stripe.secret_key);
  
        const transfers = await stripe.transfers.retrieve(
          inputs.transfer_id,
        );
        if (transfers) {
          data.transfers = transfers;
        }
        return exits.success(data);
      } catch (err) {
        sails.log.error(`Error in helper stripe/trasnfer/update. ${err}`);
        return exits.success(data);
      }
    },
  };
  