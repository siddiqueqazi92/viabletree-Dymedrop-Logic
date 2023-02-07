const moment = require('moment');
const Activations = require('../../models/Activations');

module.exports = {


  friendlyName: 'Receny Activations',


  description: 'Recent activites on activation by fan (counts, clicks and etc)',


  inputs: {

    user: {
      type: 'ref',
      required: true
    },
    page_id: {
      type: 'number',
      //required: true
    },
        
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    try {

      sails.log.debug('action fan/recent-act.js called with inputs: ', JSON.stringify(inputs), '\nTime: ', moment().format())

      const check = await sails.models.published_page.findOne({
        page_id:inputs.page_id
      })
        if(check.length < 1){
        return exits.success({
            status: false,
            message: 'Page not found',
            data: {}
          })
      }
      const ent =  await sails.models.recent_activities.create({
        user_id:inputs.user.id,
        page_id:inputs.page_id,
        type:'Viewed',
        activation_id:123,
        count: 1
      })
    
     
    return exits.success({
      status: true,
             message: 'Recent activity inserted',
             data: ent
    })
     
    } catch (error) {

      sails.log.error('action fan/purchase-act.js called with inputs execution failed: ', error, ' \nTime: ', moment().format())
      return exits.success({
        status: false,
        message: error.message,
        data: {}
      })
    }

  }


};
