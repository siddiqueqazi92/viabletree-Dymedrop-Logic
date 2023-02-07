const moment = require("moment");
module.exports = {
  friendlyName: "Get",

  description: "Get pages.",

  inputs: {
    user: {
      type: "ref",
      required: true,
    },
    id: {
      type: "number",
      required: true,
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
      "calling action user/pages/publish started. Inputs:",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );
    try {
      let found = await Page.count({ id: inputs.id, 
        // user_id: inputs.user.id 
      });
      if (!found) {
        return exits.ok({
          status: false,
          message: "Invalid ID",
        });
      }
      // let page = await Page.publishPage(inputs.id, inputs.user.id);
      let page = await Page.publishPage(inputs.id , inputs.user.id , inputs.user.email);
      if (!page || _.isEmpty(page)) {
        return exits.ok({
          status: false,
          message: "Unable to publish",
        });
      }
      const pageCount = await Activations.find({
        page_id: inputs.id,
        published: 1,
        is_deleted: 0,
      });
      const pass = await Page.findOne({
        id: inputs.id,
        is_published: 1,
        is_deleted: 0,
      });
      page.passenable = pass.passenable
      page.active_activations = pageCount.length
      page.performance = await sails.helpers.pages.getPerformance(page.id);
      return exits.success({
        status: true,
        message: "Page published successfully",
        data: page,
      });
    } catch (err) {
      sails.log.error(
        `error in action user/pages/publish. ${err}`,
        JSON.stringify(inputs),
        "\nTime: ",
        moment().format()
      );
    }
    return exits.success(sails.getDatastore("default"));
  },
};
