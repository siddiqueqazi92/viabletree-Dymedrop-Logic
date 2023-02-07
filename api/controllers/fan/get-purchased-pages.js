const moment = require("moment");
module.exports = {
  friendlyName: "Get all publish pages",

  description: "Get all publish pages.",

  inputs: {
    user: {
      type: "ref",
      // required:true
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
      "calling action fan/get-purchased-pages.js started. Inputs:",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );
    try {
      const check = await sails.models.user.find({ user_id: inputs.user.id });

      if (!check || _.isEmpty(check)) {
        return exits.ok({
          status: false,
          message: "User not found",
        });
      }
      let query = `SELECT a.page_id as id,a.is_expire,a.is_subscribed,a.is_purchased, pp.title, pp.screenshot, a.createdAt 
      from fan_activations a 
      join published_pages pp on a.page_id = pp.page_id 
      WHERE a.fan_user_id = '${check[0].user_id}'
      GROUP BY a.page_id
      ORDER BY a.createdAt DESC`;
      const getActPages = await sails.models.fan_activations
        .getDatastore()
        .sendNativeQuery(query);
      console.log(query);
      const ty = getActPages.rows;
      // let recent_ac = []
      // ty.map((q)=>{
      //   recent_ac.push(q.id)
      // })
      // recentActivity = []

      const res = [];
      for (let i = 0; i < ty.length; i++) {
        let st = Boolean(ty[i].is_subscribed);
        let pt = Boolean(ty[i].is_purchased);
        let ex = Boolean(ty[i].is_expire);
        const obj = {
          id: ty[i].id,
          screenshot: ty[i].screenshot,
          isSubscribed: st,
          isPurchased: pt,
          isExpire: ex,
          usage: {
            title: ty[i].title,
            activeDate: ty[i].createdAt,
            views: await sails.models.recent_activities.count({
              page_id: ty[i].id,
              user_id: inputs.user.id,
              type: "Viewed",
            }),
            attendance: await sails.models.recent_activities.count({
              page_id: ty[i].id,
              user_id: inputs.user.id,
              type: "Attended",
            }),
            recentActivity: [],
          },
        };
        let recent_act = await sails.models.recent_activities
          .find({ page_id: ty[i].id, user_id: inputs.user.id })
          .sort("createdAt DESC")
          .limit(10);
        if (recent_act.length > 0) {
          obj.usage.recentActivity.push(...recent_act);
        }

        res.push(obj);
      }
      // if (!ty || _.isEmpty(ty)) {
      //   return exits.ok({
      //     status: false,
      //     message: "Page not found",
      //   })
      // }
      // const pageData = page.map((e,index) => {

      //   return  {
      //     id:e.id,
      //     userId: e.user_id,
      //     activationName:e.activation_name,
      //     activationPrice :e.activation_price,
      //     activationFrequency :e.activation_frequency,
      //     activationDescription : e.activation_description,
      //     activationScanlimit :e.activation_scanlimit,
      //     activationFanlimit :e.activation_fanlimit,
      //     activationPromocode :e.activation_promocode,
      //     activationPublished : e.published,
      //     pageId : e.page_id}

      // })

      return exits.success({
        status: true,
        message: "Page found successfully",
        data: res,
      });
    } catch (err) {
      sails.log.error(
        "error in action fan/get-purchased-pages.js",
        "\nTime: ",
        moment().format()
      );
    }
    return exits.success(sails.getDatastore("default"));
  },
};
