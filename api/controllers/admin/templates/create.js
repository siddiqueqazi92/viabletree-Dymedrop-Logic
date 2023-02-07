const moment = require('moment')

module.exports = {


    friendlyName: 'Get one',


    description: '',


    inputs: {
        user: {
            type: 'ref'
        },
        // activation_name :{
        //     type :"string",
        //     required : true
        // },
        // activation_price :{
        //     type : "number",
        //     required :true
        // },
        // activation_frequency :{
        //     type :"string",
        //     required :true
        // },
        // activation_description :{
        //     type :"string",
        //     required :true
        // },
        // activation_scanlimit :{
        //     type :"string",
        //     required :true
        // },
        // activation_fanlimit :{
        //     type :"string",
        //     required :true
        // }

        data :{
            type :"ref",
            required :true
        }
    },


    exits: {

    },


    fn: async function (inputs, exits) {

        sails.log.debug('calling user/pages/admin/templates/create\ntime: ', moment())
        try {
            
            const activations = await AdminActivations.create({...inputs.data}).fetch()

            sails.log.debug('user/pages/admin/templates/create executed\ntime: ', moment())
            if(activations)
            {
                return exits.success({
                    status : true,
                    message : "Activations found",
                    data : activations
                })
            }
            else{
                return exits.success({
                    status : false,
                    message : "Erro Occured",
                    data : []
                })
            }
        } catch (error) {
            sails.log.error('error at user/pages/admin/templates/create error: ', error, '\ntime: ', moment())
            return exits.success({
                status: false,
                message: "Unknown server error",
            })
        }


    }


};
