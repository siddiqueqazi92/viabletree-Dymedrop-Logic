const moment = require('moment')

module.exports = {


    friendlyName: 'Get one',


    description: '',


    inputs: {
        user: {
            type: "ref"
        },
        id :{
            type :"string",
            required :true
        }
    },


    exits: {

    },


    fn: async function (inputs, exits) {

        sails.log.debug('calling user/pages/admin/templates/list\ntime: ', moment())
        try {
            
            const activations = await AdminActivations.findOne({
                id : inputs.id
            })

            sails.log.debug('user/pages/admin/templates/list executed\ntime: ', moment())
            if(activations)
            {
                if(activations.activation_scanlimit == "unlimited")
                {
                    activations.is_unlimited_scanlimit = true
                }
                else{
                    activations.is_unlimited_scanlimit = false
                }

                if(activations.activation_fanlimit == "unlimited")
                {
                    activations.is_unlimited_fanlimit = true
                }
                else{
                    activations.is_unlimited_fanlimit = false
                }
                


                return exits.success({
                    status : true,
                    message : "Activations found",
                    data : activations
                })
            }
            else{
                return exits.success({
                    status : false,
                    message : "No activations found",
                    data : []
                })
            }
        } catch (error) {
            sails.log.error('error at user/pages/admin/templates/list error: ', error, '\ntime: ', moment())
            return exits.success({
                status: false,
                message: "Unknown server error",
            })
        }


    }


};
