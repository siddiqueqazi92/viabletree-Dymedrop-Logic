const moment = require("moment");

module.exports = {
  friendlyName: "Get all",

  description: "",

  inputs: {
    user: {
      type: "ref",
    },
    id: {
      type: "string",
      required: true,
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug("calling invitee/getone\ntime: ", moment());

    try {
      let users = await User.find({
        user_id: inputs.id,
      });

      let query = `SELECT i.id ,i.page_id, i.email , i.user_id,
      pages.published_at, pages.is_blocked , pages.is_active , pages.passenable , pages.views,pages.url ,
      users.email as creator_email , users.user_id as creator_id,
      pp.title , pp.image , pp.description FROM invitations AS i 
      INNER JOIN published_pages AS pp ON i.page_id = pp.page_id 
      INNER JOIN pages ON i.page_id = pages.id 
      INNER JOIN users ON pages.user_id = users.user_id
      WHERE 
      pages.is_deleted = 0 AND 
      i.is_removed = 0 AND
      i.email = '${users[0].email}'
      `;
      //pp.is_deleted = 0 AND
      let invitations = await sails.sendNativeQuery(query);

      users.map((user) => {
        user.id = user.user_id;
        delete user.user_id;
      });
      invitations.rows.map((data) => {
        data.url = `${sails.config.dymedrop.web_url}${data.url}`;
        if (data.passenable == 0) {
          data.passenable = false;
        }
        if (data.passenable == 1) {
          data.passenable = true;
        }
        if (data.is_active == 0) {
          data.is_active = false;
        }
        if (data.is_active == 1) {
          data.is_active = true;
        }
      });
      users[0].invitations = invitations.rows;
      console.log({ users });

      sails.log.debug("invitee/getone executed\ntime: ", moment());

      return exits.success({
        status: true,
        message: "User Found",
        data: users[0],
      });
    } catch (error) {
      sails.log.error(
        "error at invitee/listerror: ",
        error,
        "\ntime: ",
        moment()
      );
      return exits.success({
        status: false,
        data: {},
        message: "Unknown server error",
      });
    }
  },
};
