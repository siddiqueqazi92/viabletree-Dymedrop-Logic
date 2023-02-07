const moment = require("moment");
module.exports = {
  friendlyName: "Get",

  description: "Get one page.",

  inputs: {
    user: {
      type: "ref",
    },
    slug: {
      type: "string",
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
      "calling action pages/get-one started. Inputs:",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );

    try {
      let is_deleted = false;
      if (inputs.user) {
        let purchased_count =
          await sails.models.fan_activations.getFanActivationCountByPage(
            inputs.user.id,
            inputs.slug
          );
        if (purchased_count) {
          is_deleted = null;
        }
      }
      let page = await Page.getPublishedPage(inputs.slug, "slug", is_deleted);
      if (!page || _.isEmpty(page)) {
        return exits.ok({
          status: false,
          message: "Page not found",
        });
      }

      return exits.success({
        status: true,
        message: "Page found successfully",
        data: page,
      });
    } catch (err) {
      sails.log.error(
        "error in action pages/get-one",
        JSON.parse(inputs),
        "\nTime: ",
        moment().format()
      );
    }
    return exits.success(sails.getDatastore("default"));
  },
};
