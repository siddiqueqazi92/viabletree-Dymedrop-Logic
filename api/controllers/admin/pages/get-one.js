const moment = require("moment");

module.exports = {
  friendlyName: "Get one",

  description: "",

  inputs: {
    id: {
      type: "string",
    },
  },

  exits: {},

  fn: async function ({ id }, exits) {
    sails.log.debug("calling user/pages/admin/get-one\ntime: ", moment());
    try {
      let page = await Page.getOnePage(id); //({
      if (!page) {
        sails.log.debug(
          "user/pages/admin/get-one error: search/sort/filter error \ntime: ",
          moment()
        );
        return exits.success({
          status: false,
          message: "Unable to GET page",
        });
      }
      const activations = await Activations.find({
        is_deleted: 0,
        page_id: page.id,
      });

      const usersBuyActivations = await fan_activations.find({
        page_id: page.id,
      });

      const getUsers = [];
      usersBuyActivations.map((data) => {
        getUsers.push(data.fan_user_id);
      });

      const users = await User.find({
        user_id: { in: getUsers },
      });
      const buyer = [];
      usersBuyActivations.map((d) => {
        users.map((e) => {
          if (d.fan_user_id == e.user_id) {
            d.fan_name = e.first_name;
            d.fan_image = e.avatar;
            d.fan_id = e.user_id;
          }
        });
        // buyer.push(...d)
      });

      let query = `SELECT invitations.id AS invitation_id, invitations.email AS invite_email ,  
      invitations.page_id AS invited_page_id ,invitations.accepted,invitations.is_removed , 
        CONCAT(users.first_name, ' ' , users.last_name) AS fullname, users.user_id ,users.avatar ,users.currentUser,
        users.email FROM invitations LEFT JOIN users ON invitations.email = users.email
        WHERE invitations.is_removed = 0 AND invitations.page_id = ${id}
        `;
      const invitePersons = await sails.sendNativeQuery(query);
      invitePersons.rows.map((data)=>{
        data.accepted = data.accepted == 0 ? false : true
      })

      // let obj = { ...page, url: `${sails.config.dymedrop.web_url}${page.url}` }//, ...page.published_contact_buttons[0] }
      let obj = {
        ...page,
        ...page.published_pages[0],
        ...page.published_contact_buttons[0],
        id: page.id,
        activations: activations,
        buyers: usersBuyActivations,
        invitePersons: invitePersons.rows,
        url: `${sails.config.dymedrop.web_url}${page.url}`,
      }; //, ...page.published_contact_buttons[0] }
      delete obj.published_pages;
      delete obj.published_contact_buttons;
      sails.log.debug("user/pages/admin/get-one executed\ntime: ", moment());
      // return exits.success({ status: true, message: 'pages get successfully', data: obj })
      return exits.success({
        status: true,
        message: "Data loaded",
        data: obj,
      });
    } catch (error) {
      sails.log.error(
        "error at user/pages/admin/get-one error: ",
        error,
        "\ntime: ",
        moment()
      );
      return exits.success({
        status: false,
        message: "Unknown server error",
      });
    }
  },
};
