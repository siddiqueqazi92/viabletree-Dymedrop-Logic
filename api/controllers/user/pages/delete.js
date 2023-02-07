const moment = require("moment");
module.exports = {
  friendlyName: "Delete",

  description: "Delete page.",

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
      "calling action user/pages/delete started. Inputs:",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );
    try {
      // let check = await sails.models.fan_activations.find({page_id:inputs.id})
      // if(check.length > 0){
      //   return exits.ok({
      //     status: false,
      //     message: "cannot deleted this page, page sold to fan",
      //   })
      // }
      let deleted = await Page.deletePage(inputs.id);
      const del_act = await sails.models.fan_activations
        .update({
          page_id: inputs.id,
        })
        .set({
          is_subscribed: 0,
        })
        .fetch();
      let data_to_update = { cancel_at_period_end: true };
      let subscription_info;
      for (cancel_act of del_act) {
        if (!cancel_act.payment_reference.includes("ch_")) {
          subscription_info = await sails.helpers.stripe.subscriptions.update(
            cancel_act.payment_reference,
            data_to_update
          );
        }
      }
      // subscription_info = await sails.helpers.stripe.subscriptions.cancel(
      //   is_purchased[0].payment_reference
      //  );
      sails.log({ subscription_info });
      ////
      // if (!subscription_info) {
      //   return exits.success({
      //     status: false,
      //     message: "page deleted ",
      //     data: {},
      //   });
      // }
      if (!deleted) {
        return exits.ok({
          status: false,
          message: "Unable to delete page",
        });
      }

      return exits.success({
        status: true,
        message: "Page deleted successfully",
      });
    } catch (err) {
      sails.log.error(
        "error in action user/pages/delete",
        JSON.stringify(inputs),
        "\nTime: ",
        moment().format()
      );
      sails.log("Error deleting page : ", err.message)
    }
    return exits.success(sails.getDatastore("default"));
  },
};
