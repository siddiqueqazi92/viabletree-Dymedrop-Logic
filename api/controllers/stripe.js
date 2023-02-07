module.exports = {
    friendlyName: "Ping",
  
    description: "Ping something.",
  
    inputs: {},
  
    exits: {},
  
    fn: async function (inputs, exits) {
      const account = await sails.helpers.stripe.account.create({
        email : "dymedrop2@yopmail.com"
      })
      return exits.success({
        status : true,
        message : "Stripe Account",
        data : account
      });
    },
  };
  