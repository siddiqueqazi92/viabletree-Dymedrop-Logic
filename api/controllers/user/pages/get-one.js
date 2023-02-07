const moment = require("moment");
module.exports = {
  friendlyName: "Get",

  description: "Get one page.",

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
      "calling action user/pages/get-one started. Inputs:",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );
    try {
      const filter = {
        id: inputs.id,
        is_deleted: false,
        user_id: inputs.user.id,
        u_id : inputs.user.id,
        u_email : inputs.user.email
      };
      let page;
      let is_purchased_act = false;
      const act = await sails.models.fan_activations.find({
        page_id:inputs.id
      })
      if(act.length > 0){
      for(acts of act){
         if(acts.is_purchased == 1){
          is_purchased_act = true
         }
      }
    }
      page = await Page.getPage(filter);
      sails.log({page})
      if (Object.keys(page)<1) {
        delete filter.user_id;
        page = await Page.getPage(filter);
        sails.log({page})
        if (Object.keys(page)<1) {
          return exits.ok({
            status: false,
            message: "Page not found",
          });
        }
      }
      let members = await Invitations.count({
        page_id: inputs.id,
        is_removed: 0,
      });

      page.members = members ? members : 0
      page.performance = await sails.helpers.pages.getPerformance(page.id);
      page.isPurchased = is_purchased_act;
      return exits.success({
        status: true,
        message: "Page found successfully",
        data: page,
      });
    } catch (err) {
      sails.log.error(
        "error in action user/pages/get-one",
        JSON.stringify(inputs),
        "\nTime: ",
        moment().format(),
        err
      );
    }
    return exits.success(sails.getDatastore("default"));
  },
};
