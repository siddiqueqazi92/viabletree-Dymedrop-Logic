const moment = require("moment");
module.exports = {
  friendlyName: "Get all publish pages",

  description: "Get all publish pages.",

  inputs: {
    id: {
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
      const page = await sails.models.activations.find({
        page_id: inputs.id,
        published: 1,
      });
      if (!page || _.isEmpty(page)) {
        return exits.ok({
          status: false,
          message: "Page not found",
        });
      }
      let creator = await User.findOne({
        where: { user_id: page[0].user_id },
        select: ["first_name", "last_name"],
      });
      const pageData = page.map((e, index) => {
        return {
          id: e.id,
          userId: e.user_id,
          activationName: e.activation_name,
          activationPrice: e.activation_price,
          activationFrequency: e.activation_frequency,
          activationDescription: e.activation_description,
          activationScanlimit: e.activation_scanlimit,
          activationFanlimit: e.activation_fanlimit,
          activationPromocode: e.activation_promocode,
          activationPublished: e.published,
          pageId: e.page_id,
          businessProfileName: creator.first_name + " " + creator.last_name,
        };
      });

      return exits.success({
        status: true,
        message: "Page found successfully",
        data: pageData,
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
