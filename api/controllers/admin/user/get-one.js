const moment = require("moment");

module.exports = {
  friendlyName: "Get one",

  description: "",

  inputs: {
    id: {
      type: "string",
      required: true,
    },
  },

  exits: {},

  fn: async function ({ id }, exits) {
    sails.log.debug("calling user/account/get-one\ntime: ", moment());
    // const id = this.req.params.id;
    try {
      const user = await User.findOne({ user_id: id }); //.populate('pages', { where: { published_at: { '!=': null }, deletedAt: null } })
      let query = `SELECT i.id ,i.page_id, i.email , i.user_id,
      pages.published_at, pages.is_blocked , pages.is_active , pages.passenable , pages.views,pages.url ,
      users.email as creator_email , users.user_id as creator_id,
      pp.title , pp.image , pp.description FROM invitations AS i 
      INNER JOIN published_pages AS pp ON i.page_id = pp.page_id  
      INNER JOIN pages ON i.page_id = pages.id 
      INNER JOIN users ON pages.user_id = users.user_id
      WHERE 
      i.is_removed = 0 AND
      i.accepted = 1 AND
      pages.is_deleted = 0 AND 
      i.email = '${user.email}'
      `;
      //pp.is_deleted = 0 AND

      let invitations = await sails.sendNativeQuery(query);

      invitations.rows.map((data) => {
        data.url = `${sails.config.dymedrop.web_url}${data.url}`;
        if (data.passenable == 0) {
          data.passenable = false;
        }
        if (data.passenable == 1) {
          data.passenable = true;
        }
      });
      user.password = "";
      user.confirm_password = "";
      user.id = user.user_id;
      user.invitations = invitations.rows
      delete user.user_id;
      sails.log.debug("user/account/get-one executed\ntime: ", moment());
      return exits.success({
        status: true,
        message: "Data loaded",
        data: user,
      });
      // exits.success({ status: true, message: 'user get successfully', data: user })
    } catch (error) {
      sails.log.error(
        "error at user/account/get-one error: ",
        error,
        "\ntime: ",
        moment()
      );
      return exits.error();
    }
  },
};
