const moment = require('moment')

module.exports = {


    friendlyName: 'Disable account',


    description: '',


    inputs: {
        user: {
            type: 'ref',
            required: true,
        },
    },


    exits: {

        success: {
            description: 'All done.',
        },

    },


    fn: async function ({ user }, exits) {
        const { email, id ,account_id} = user;
        try {
            sails.log.debug('controller user/account/activate.js called. \nTime: ', moment().format());
            await sails.getDatastore().transaction(async (db) => {
                let u = await User.updateOne({ email }).set({ is_active: true }).usingConnection(db);
                //#region stripe account update, temporary
                if (u && !_.isUndefined(u.account_id) ) {
                    ///temporary, update stripe connected account schedule to manual 
                    try {
                        const stripe = require("stripe")(sails.config.stripe.secret_key);

                        const account = await stripe.accounts.update(
                        u.account_id,
                        {settings: {payouts: {schedule: {interval: 'manual'}}}}
                        );
                        console.log({stripeAccount:account})
                        } catch (err) {
                        
                    }
                    
                }
                //#endregion
                await Page.update({ user_id: id }).set({ is_active: true }).usingConnection(db);
            })//.usingConnection(db);
            delete user.password;
            return exits.success({
                status: true,
                message: "User logged in successfully",
                data: { ...user, activation_message: "Welcome back!" },
            })
        } catch (error) {
            sails.log.error('Error at controller user/account/activate.js . Error: ', error, '\nTime: ', moment().format())
            return exits.success(false);
        }
    }
};
