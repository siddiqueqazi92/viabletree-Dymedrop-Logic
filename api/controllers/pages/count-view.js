
const moment = require('moment');
module.exports = {


  friendlyName: 'Count view',


  description: 'Count view of page.',


  inputs: {

    slug: {
      type: 'string',
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
    sails.log.debug("calling action pages/count-view started. Inputs:", JSON.stringify(inputs), "\nTime: ", moment().format());
    try {
      let page = await Page.getPublishedPage(inputs.slug)
      if (!page || _.isEmpty(page)) {
        return exits.ok({
          status: false,
          message: "Page not found",          
        })
      }
      let count = await Page.countView(inputs.slug)      
      if (!count) {
        return exits.ok({
          status: false,
          message: "Unable to count views",          
        })
      }
     
      return exits.success({
        status: true,
        message: "Page views count updated successfully",
        data:count
      })
    } catch (err) {
      sails.log.error("error in action pages/count-view", JSON.parse(inputs), "\nTime: ", moment().format());
    }
    return exits.success(sails.getDatastore('default'));

  }


};
