
const moment = require('moment');
module.exports = {


  friendlyName: 'change attributes',


  description: 'change attributes page',


  inputs: {
    user: {
      type: 'ref',
      required:true
    },
    id: {
      type: 'number',
      required:true
    },
   
    perfect_pass: {
      type: 'boolean',    
      required:true      
    },
   
  },


  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
  },


  fn: async function (inputs, exits) {
    sails.log.debug("calling action user/pages/change-attributes started. Inputs:", JSON.stringify(inputs), "\nTime: ", moment().format());
    try {
      let obj = { ...inputs };
      delete obj.id
      delete obj.user
      let page = await Page.updateOne({id:inputs.id}).set(obj)
      if (!page) {
        return exits.ok({
          status: false,
          message: "Unable to update attributes",          
        })
      }      
      return exits.success({
        status: true,
        message: "Page attributes updated successfully",        
      })
    } catch (err) {
      sails.log.error("error in action user/pages/change-attributes", JSON.stringify(inputs), "\nTime: ", moment().format());
    }
    return exits.success(sails.getDatastore('default'));

  }


};
