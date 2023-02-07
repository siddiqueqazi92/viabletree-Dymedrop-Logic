
const moment = require('moment');
module.exports = {


  friendlyName: 'Edit',


  description: 'Edit page',


  inputs: {
    user: {
      type: 'ref',
      required:true
    },
    id: {
      type: 'number',
      required:true
    },
    title: {
      type: 'string',
      required:true
    },
    description: {
      type:'string'
    },
    screenshot: {
      type:'string'
    },
    image: {
      type:'string'
    },
    image_id: {
      type:'number'
    },
    perfect_pass: {
      type: 'boolean',      
      defaultsTo:false
    },
    contact_buttons: {
      type: 'ref',
      
    },
    links: {
      type: 'ref',
      
    },
  },


  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
  },


  fn: async function (inputs, exits) {
    sails.log.debug("calling action user/pages/edit started. Inputs:", JSON.stringify(inputs), "\nTime: ", moment().format());
    try {
      // let check = await sails.models.fan_activations.find({page_id:inputs.id})
      // if(check.length > 0){
      //   return exits.ok({
      //     status: false,
      //     message: "cannot update this page, page sold to fan",          
      //   })
      // }
      let page = await Page.updatePage(inputs)
      if (!page) {
        return exits.ok({
          status: false,
          message: "Unable to update page",          
        })
      }
      const actve_activations = await Activations.find({
        page_id: page.id,
        published: 1,
        is_deleted: 0,
      });
      page.active_activations = actve_activations.length;
      page.links = await Draft_page_link.find({where:{page_id:page.id}}).sort("order ASC");
      page.performance = await sails.helpers.pages.getPerformance(page.id);
      return exits.success({
        status: true,
        message: "Page updated successfully",
        data:page
      })
    } catch (err) {
      sails.log.error("error in action user/pages/edit", JSON.stringify(inputs), "\nTime: ", moment().format());
    }
    return exits.success(sails.getDatastore('default'));

  }


};
