const moment = require("moment");

module.exports = {
  friendlyName: "Get one",

  description: "",

  inputs: {
    id: {
      type: "number",
    },
  },

  exits: {},

  fn: async function ({ id }, exits) {
    sails.log.debug("calling admin/settings/get-one\ntime: ", moment());
    try {      
     
      const setting = await Setting.findOne({
        id        
      });
      if (!setting) {
        sails.log.debug(
          "admin/settings/get-one error: search/sort/filter error \ntime: ",
          moment()
        );
        return exits.success({
          status: false,
          message: "Unable to GET setting",
        });
      }
      
      sails.log.debug("admin/settings/admin/get-one executed\ntime: ", moment());
      // return exits.success({ status: true, message: 'settings get successfully', data: obj })
      return exits.success({
        status: true,
        message: "Data loaded",
        data: setting,
      });
    } catch (error) {
      sails.log.error(
        "error at admin/settings/admin/get-one error: ",
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
