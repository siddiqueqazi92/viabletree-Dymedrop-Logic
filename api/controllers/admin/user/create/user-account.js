const moment = require('moment')

module.exports = {


  friendlyName: 'User account',


  description: '',


  inputs: {
    id: {
      type: 'string'
    },
    avatar: {
      type: 'string',
      required: false
    },
    first_name: {
      type: 'string',
      required: false
    },
    last_name: {
      type: 'string',
      required: false
    },
    email: {
      type: 'string',
      isEmail: true,
      required: false
    },
    phone_number: {
      type: 'string',
      required: false
    },
    organization: {
      type: 'string',
      required: false
    },
    job_title: {
      type: 'string',
      required: false
    },
    fanbase_size: {
      type: 'string',
      required: false
    },
    location: {
      type: 'string',
      required: false
    },
    is_blocked: {
      type: 'boolean',
      required: false
    },
    is_active: {
      type: 'boolean',
      required: false
    },
    status: {
      type: 'string',
      required: false
    },
    currentUser :{
      type: 'string',
      required: false
    },
    full_name :{
        type : "string",
        required :false
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    sails.log.debug('calling user/account/create/user-account\ntime: ', moment())
    sails.log.debug('calling user/account/create/user-account\ninputs: ', JSON.stringify({ ...inputs }))

    const obj = { ...inputs }
    delete obj.id
    delete obj.user_id


    try {
      sails.log({inputs})
      let currentU 
      if(inputs.currentUser)
      {
        currentUser  = inputs.currentUser
      }
      else{
        currentUser = "creator"
      }
      
      const createUser = await User.updateOrCreate({ user_id: inputs.id }, { is_form_submitted: true, status: global.STATUS[2], ...obj, user_id: inputs.id , currentUser : currentUser });
      sails.log.debug('user/account/create/user-account executed\ntime: ', moment())

      // if(currentUser == "creator")
      // {
      //   const createStripeAccount = await sails.helpers.stripe.account.create();
      // }

      const user = { ...createUser, id: inputs.id }

      
      return exits.success({ status: true, data: user })
      // return exits.success({ status: true, message: 'User created successfully', data: user })
    } catch (error) {
      sails.log.error('error at user/account/create/user-account error: ', error, '\ntime: ', moment())
      exits.error({ status: false })
    }

  }


};
