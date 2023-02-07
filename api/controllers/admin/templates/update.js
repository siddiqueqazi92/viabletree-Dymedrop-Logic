const moment = require('moment')

module.exports = {


    friendlyName: 'Get one',


    description: '',


    inputs: {
        user: {
            type: 'ref'
        },
        id :{
            type :"string",
            required : true
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
            type : "ref"
        }
    },


    exits: {

    },


    fn: async function (inputs, exits) {

        sails.log.debug('calling user/pages/admin/templates/create\ntime: ', moment())
        try {
            
            const getActivations = await AdminActivations.find({
                id : inputs.id
            })
            if(getActivations.length < 1 )
            {
                return exits.success({
                    status : false,
                    message : "No template foud",
                    data : []
                })
            }

            let obj = {

                ...getActivations[0],
                ...inputs.data
            }

            console.log({obj});

            const activations = await AdminActivations.updateOne({
                id : inputs.id
            }).set(obj)



            sails.log.debug('user/pages/admin/templates/create executed\ntime: ', moment())
            if(activations)
            {
                return exits.success({
                    status : true,
                    message : "Activations updated",
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
