const moment = require("moment");
module.exports = {
  friendlyName: "Create",

  description: "Create pages.",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    screenshot: {
      type: "string",
    },
    image: {
      type: "string",
    },
    image_id: {
      type: "number",
    },
    perfect_pass: {
      type: "boolean",
      defaultsTo: false,
    },
    contact_buttons: {
      type: "ref",
    },
    links: {
      type: "ref",
    },
  },

  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "calling action user/pages/create started. Inputs:",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );
    try {
      // let userInputs = {...inputs}
      let page = await Page.createPage(inputs);

      if (!page) {
        return exits.ok({
          status: false,
          message: "Unable to create page",
        });
      }
     

      return exits.success({
        status: true,
        message: "Page created successfully",
        data: page,
      });
    } catch (err) {
      sails.log.error(
        "error in action user/pages/create",
        JSON.parse(inputs),
        "\nTime: ",
        moment().format()
      );
    }
    return exits.success(sails.getDatastore("default"));
  },
};
