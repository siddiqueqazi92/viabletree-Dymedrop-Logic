const moment = require("moment");

module.exports = {
  friendlyName: "Get one",

  description: "",

  inputs: {
    id: {
      type: "number",
    },
    data: {
      type: 'ref',
      required:true
    }
  },

  exits: {},

  fn: async function ({ id,data }, exits) {
    sails.log.debug("calling admin/settings/update\ntime: ", moment());
    try {      
     
      let setting = await Setting.findOne({
        id        
      });
      if (!setting) {
        sails.log.debug(
          "admin/settings/update error: search/sort/filter error \ntime: ",
          moment()
        );
        return exits.success({
          status: false,
          message: "Unable to GET setting",
        });
      }
      
      setting = await Setting.updateOne({id}).set({value:data.value})
      sails.log.debug("admin/settings/admin/update executed\ntime: ", moment());
      // return exits.success({ status: true, message: 'settings get successfully', data: obj })
      return exits.success({
        status: true,
        message: "Setting updated successfully",
        data: setting,
      });
    } catch (error) {
      sails.log.error(
        "error at admin/settings/admin/update error: ",
        error,
        "\ntime: ",
        moment()
      );
      return exits.success({
        status: false,
        message: "Unknown server error",
      });
    }
  },
};
