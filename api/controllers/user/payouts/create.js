const moment = require('moment')

module.exports = {


    friendlyName: 'create',


    description: 'Create payout stripe',


    inputs: {
        user: {
            type: 'ref',
            required: true,
        },
        available_amount: {
            type: 'number',
            required:false
        }
    },


    exits: {

        success: {
            description: 'All done.',
        },

    },


    fn: async function (inputs, exits) {        
        try {
            let user = inputs.user            
            sails.log.debug('controller user/payouts/create.js called. \nTime: ', moment().format());     
                
            let available_amount = inputs.available_amount || 0;
            if (available_amount <= 0) {
                let balance_response = await sails.helpers.stripe.balance.get(user.account_id)
                if (!_.isUndefined(balance_response.balance) && !_.isUndefined(balance_response.balance.available) && balance_response.balance.available.length) {
                  available_amount = balance_response.balance.available[0].amount/100
                }
            }
          
            if (available_amount <= 0) {
                return exits.success({
                    status: false,
                    message: 'You have insufficient funds in your Stripe account for this transfer',                                
                })
            }
            let metadata = {                
                transfer_to: user.account_id,
                user_id: user.id,
              };
            let payout_response = await sails.helpers.stripe.payouts.create.with({
                amount:available_amount,
                stripe_account_id:user.account_id,                
                metadata
            });
            if (payout_response.error) {
                return exits.success({
                    status: false,
                    message: payout_response.error.message.split(".")[0],                                
                })
            }
            let transferHistory = {
              user_id:user.id,
            //   page_id: metadata.page_id ? metadata.page_id : "",
            //   activation_id: metadata.activation_id
            //     ? metadata.activation_id
            //     : "",
            //   purchase_id: metadata.purchased_id ? metadata.purchased_id : "",
              amount:  Math.round(available_amount*100),
              transfer_date: moment().format(),              
              transfer_id: payout_response.result.id,
            };
            let saveTransferHistory = await Transfer.create(
              transferHistory
            ).fetch();
            await User.updateOne({user_id:user.id}).set({available_amount:0})
            return exits.success({
                status: true,
                message: "Payout created successfully",                
            })
        } catch (error) {
            sails.log.error('Error at controller user/payouts/create.js . Error: ', error, '\nTime: ', moment().format())
            return exits.success(false);
        }
    }
};
