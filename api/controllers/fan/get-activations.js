const moment = require("moment");
module.exports = {
  friendlyName: "Get Activations",

  description: "Get Activations.",

  inputs: {
    user: {
      type: "ref",
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
      const check = await sails.models.user.find({ user_id: inputs.user.id });

      if (!check || _.isEmpty(check)) {
        return exits.ok({
          status: false,
          message: "user not found",
        });
      }
      const act_id = [];
      const getActivations = await sails.models.fan_activations.find({
        fan_user_id: check[0].user_id,
      });

      getActivations.map((e) => {
        act_id.push(e.activation_id);
      });
      //         const getAllPurchasedAct = await sails.models.activations.getDatastore().sendNativeQuery(`SELECT a.*,pp.screenshot ,pp.title from activation a
      //   join published_pages pp on a.page_id = pp.page_id
      //   where a.id in ('${act_id.join("','")}')`);
      //const ret = await sails.helpers.cron.processOnetimeSubscriptions();

      let query = `SELECT  DISTINCT (a.id),
        a.activation_name,a.activation_price,a.activation_frequency,a.activation_description,a.activation_scanlimit,a.activation_fanlimit,a.activation_promocode,a.published,a.page_id  
        , fan_activations.createdAt,fan_activations.is_expire,fan_activations.is_subscribed,fan_activations.id as purchase_id,fan_activations.is_purchased,
        pp.screenshot ,
        pp.title
          from
              fan_activations
          join activation a on
              fan_activations.activation_id = a.id
          JOIN published_pages pp on
          a.page_id = pp.page_id WHERE fan_activations.fan_user_id = '${check[0].user_id}' AND fan_activations.is_purchased = 1 AND fan_activations.deletedAt IS NULL  ORDER BY fan_activations.createdAt DESC`;
      console.log(query);
      const getAllPurchasedAct = await sails.models.activations
        .getDatastore()
        .sendNativeQuery(query);

      sails.log.debug(getAllPurchasedAct.rows);
      const qw = getAllPurchasedAct.rows;
      if (!getAllPurchasedAct || _.isEmpty(getAllPurchasedAct)) {
        return exits.ok({
          status: false,
          message: "No purchase activation found",
        });
      }
      const pageData = qw.map((x, index) => {
        // const abc = object.assign(e)
        const e = { ...x };

        const yearDate = e.createdAt;
        const monthDate = e.createdAt;
        let activationTime = null;
        let yearDifference;
        let monthDifference;
        if (e.activation_frequency === "ANNUAL") {
          yearDifference = yearDate.setFullYear(yearDate.getFullYear() + 1);
          activationTime = yearDifference;
        } else if (e.activation_frequency === "MONTHLY") {
          monthDifference = monthDate.setMonth(monthDate.getMonth() + 1);

          activationTime = monthDifference;
        } else if (e.activation_frequency === "1-TIME") {
          yearDifference = yearDate.setFullYear(yearDate.getFullYear() + 1);

          activationTime = yearDifference;
        }
        let status = null;
        let current_time_moment = moment(new Date());
        let current_time = current_time_moment.format("DD/MM/YYYY");
        let c_dt_moment = moment(activationTime);
        let c_dt = c_dt_moment.format("L");
        let activationIsFutureDate =
          activationTime == "UNLIMITED"
            ? true
            : c_dt_moment.diff(current_time_moment, "hour") > 0;
        sails.log.debug({ foo: activationIsFutureDate });
        if (e.is_purchased == 0) {
          activationIsFutureDate = false;
        }
        sails.log.debug({ foo: activationIsFutureDate });

        // sails.log.debug(current_time);
        // sails.log.debug(activationTime);
        // if(c_dt < current_time){
        //     status = false
        // }else{
        //     status = true
        // }
        return {
          id: e.id,
          userId: e.user_id,
          pageId: e.page_id,
          activationName: e.activation_name,
          activationPrice: e.activation_price,
          activationFrequency: e.activation_frequency,
          activationDescription: e.activation_description,
          activationScanlimit: e.activation_scanlimit,
          activationFanlimit: e.activation_fanlimit,
          activationPromocode: e.activation_promocode,
          activationPublished: e.published,
          pageId: e.page_id,
          activationPageName: e.title,
          activationPageImage: e.screenshot,
          isPurchased: e.is_purchased,
          activationTime: activationTime,
          activationStatus: activationIsFutureDate,
          purchaseId: Boolean(e.purchase_id),
          isSubscribed: Boolean(e.is_subscribed),
          isExpire: Boolean(e.is_expire),
        };
      });

      return exits.success({
        status: true,
        message: "Page found successfully",
        data: pageData,
      });
    } catch (err) {
      //  sails.log.error("error in action pages/get-one", "\nTime: ", moment().format());
      //   sails.log.error(err)
      sails.log.error(err.message);
    }
    return exits.success(sails.getDatastore("default"));
  },
};
