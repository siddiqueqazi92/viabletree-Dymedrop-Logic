const { generateRandomString } = require("../../util");

module.exports = {
  friendlyName: "Invitation Send",

  description: "Invitation Send",

  inputs: {
    user: {
      type: "ref",
    },
    create: {
      type: "ref",
    },
    delete: {
      type: "ref",
    },
    id: {
      type: "string",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    try {
      console.log({ inputs });
      let pageOwnerShip = await Page.find({
        id: inputs.id,
        user_id: inputs.user.id,
      });

      if (pageOwnerShip.length < 1) {
        return exits.success({
          status: false,
          message: "No Page Found",
          data: {},
        });
      }

      if (inputs.user) {
        let query = `SELECT invitations.id AS invitation_id, invitations.email AS invite_email ,invitations.color AS color,
        invitations.accepted,invitations.is_removed , 
        CONCAT(users.first_name, ' ' , users.last_name) AS fullname, users.user_id ,users.avatar ,
        users.email FROM invitations LEFT JOIN users ON invitations.email = users.email
        WHERE invitations.is_removed = 0 AND invitations.page_id = ${inputs.id}
        `;
        const invitePersons = await sails.sendNativeQuery(query);
        let owner = await Page.find({
          id: inputs.id,
        });
        if (owner.length > 0) {
          let ownerInfo = await User.find({
            user_id: owner[0].user_id,
          });
          if (ownerInfo) {
            invitePersons.rows.splice(0, 0, {
              email: ownerInfo[0].email,
              avatar: ownerInfo[0].avatar,
              owner: true,
              color:
                // "hsla(" + Math.floor(Math.random() * 360) + ", 100%, 70%, 1)",

                "hsla(" + 214 + ", 100%, 70%, 1)",
            });
          }
        }

        invitePersons.rows.map((data) => {
          if (data.accepted == 1) {
            data.accepted = true;
          }
          if (data.accepted == 0) {
            data.accepted = false;
          }
          // data.color =
          //   "hsla(" + Math.floor(Math.random() * 360) + ", 100%, 70%, 1)";
        });
        if (invitePersons.rows.length > 0) {
          return exits.success({
            status: true,
            message: "Invitations Found",
            data: invitePersons.rows,
          });
        } else {
          return exits.success({
            status: false,
            message: "No invitations found",
          });
        }
      } else {
        return exits.success({
          status: false,
          message: "User not found",
          data: {},
        });
      }
    } catch (err) {
      return exits.success({
        status: false,
        message: "Error Occured. " + err.message,
        data: {},
      });
    }
  },
};
