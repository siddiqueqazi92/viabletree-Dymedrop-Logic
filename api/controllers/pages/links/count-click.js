
const moment = require('moment');
module.exports = {


  friendlyName: 'Count click',


  description: 'Count click of link of page.',


  inputs: {

    id: {
      type: 'number',
      required:true
    }
  },


  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
  },


  fn: async function (inputs, exits) {
    sails.log.debug("calling action pages/links/count-click started. Inputs:", JSON.stringify(inputs), "\nTime: ", moment().format());
    try {
      let count = await Published_page_link.countClick(inputs.id)      
      if (!count) {
        return exits.ok({
          status: false,
          message: "Unable to count clicks",          
        })
      }
     
      return exits.success({
        status: true,
        message: "Link clicks count updated successfully",
        data:count
      })
    } catch (err) {
      sails.log.error("error in action pages/links/count-click", JSON.parse(inputs), "\nTime: ", moment().format());
    }
    return exits.success(sails.getDatastore('default'));

  }


};
