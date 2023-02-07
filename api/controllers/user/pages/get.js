const moment = require("moment");
module.exports = {
  friendlyName: "Get",

  description: "Get pages.",

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
      "calling action user/pages/get started. Inputs:",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );
    try {
      const filter = { user_id: inputs.user.id, is_deleted: false };
      let pages = await Page.getPages(filter);

      const getInvitedPage = await Invitations.find({
        // user_id: inputs.user.id,
        email: inputs.user.email,
        is_removed: 0,
        accepted: 1,
      });

      // invitations.user_id = '${inputs.user.id}' AND
      let queryInvitation = `
      SELECT invitations.id AS invitation_id  , invitations.page_id, invitations.createdAt as cr,  users.* FROM invitations
      LEFT JOIN users ON users.user_id = invitations.page_owner WHERE 
      
      invitations.email = '${inputs.user.email}' AND 
      invitations.is_removed = 0 AND
      invitations.accepted = 1
      `;
      let getInvitedPageRaw = await sails.sendNativeQuery(queryInvitation);
      getInvitedPageRaw = getInvitedPageRaw.rows;

      let invitedPages;

      if (getInvitedPage.length > 0) {
        sails.log("getInvitedPage called");
        let ownerData = [];
        getInvitedPageRaw.map((data) => {
          ownerData.push({
            invitation_id: data.invitation_id,
            page_id: data.page_id,
            page_owner: data.user_id,
            email: data.email,
            fullname: data.full_name,
            createdAt : data.cr
          });
        });
        let invited_ids = _.map(getInvitedPage, "page_id");
        const filterInvitedPage = {
          id: invited_ids,
          is_deleted: false,
          data: ownerData,
        };
        invitedPages = await Page.getInvitedPage(filterInvitedPage);
        sails.log("getInvitedPage called", invitedPages);
      }

      if (invitedPages) {
        pages = [...pages, ...invitedPages];
      }
      if (!pages.length) {
        return exits.ok({
          status: false,
          message: "Pages not found",
        });
      }
      pages.sort((a,b)=>{
        return b.createdAt - a.createdAt;
        // return moment(b.createdAt).format("YYYY-MM-DD HH:mm:ss") - moment(a.createdAt).format("YYYY-MM-DD HH:mm:ss") ;
        // &&  moment(b.createdAt).format("HH:mm:ss") - moment(a.createdAt).format("HH:mm:ss");
      })
      let page_ids = _.map(pages, "id");
      let re_act = await sails.models.recent_activities.find({
        where: { page_id: page_ids, type: "Attended" },
        select: ["page_id"],
      });
      let recent_acts = _.map(re_act, "page_id");

      let fa = await sails.models.fan_activations.find({
        where: { page_id: recent_acts, qr_code_usage: {">":0} },
        select: [
          "id",
          "fan_user_id",
          "page_id",
          "activation_id",
          "qr_code_usage",
        ],
      });

      let fa_user_ids = _.map(fa, "fan_user_id");
      let fa_users = await sails.models.user.find({
        where: { user_id: fa_user_ids },
        select: ["user_id", "email", "first_name", "last_name", "avatar"],
      });

      let membersQuery = `SELECT page_id , COUNT(*) as members FROM invitations WHERE page_id IN ('${page_ids.join(
        "','"
      )}') AND is_removed = 0  GROUP BY page_id;`;

      const members = await sails.sendNativeQuery(membersQuery);
      sails.log(members.rows, "==>rows");
      fa_users = fa_users.map(function (o) {
        return Object.assign(
          {
            image_url: o.avatar,
          },
          _.omit(o, "avatar")
        );
      });

      let activation_ids = _.map(fa, "activation_id");
      let activations = await sails.models.activations.find({
        where: { id: activation_ids },
        select: ["id", "activation_name"],
      });
      for (page of pages) {
        const pageCount = await Activations.find({
          page_id: page.id,
          published: 1,
          is_deleted: 0,
        });
        page.active_activations = pageCount.length
        page.performance = await sails.helpers.pages.getPerformance(page.id);
        page.top_attendence = fa.filter((p) => p.page_id == page.id);
        if (!_.isUndefined(page.top_attendence) && page.top_attendence.length) {
          for (p of page.top_attendence) {
            p.user = _.find(fa_users, { user_id: p.fan_user_id });
            p.activation = _.find(activations, {
              id: parseInt(p.activation_id),
            });
          }
        }

        let invitedMembers = members.rows.filter((p) => p.page_id == page.id);
        if (invitedMembers.length > 0) {
          console.log({ invitedMembers });
          page.members = invitedMembers[0].members;
        } else {
          page.members = 0;
        }
      }
      console.log({ pages });

      return exits.success({
        status: true,
        message: "Pages found successfully",
        data: pages,
      });
    } catch (err) {
      sails.log.error(
        "error in action user/pages/get",
        JSON.stringify(inputs),
        "\nTime: ",
        moment().format()
      );
      sails.log.error(err);
    }
    return exits.success(sails.getDatastore("default"));
  },
};
