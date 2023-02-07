const { generateRandomString } = require("../../util");
const path = require("path");
var ejs = require("ejs");
const moment = require("moment");
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
      let pageId = inputs.id;
      console.log({ inputs });
      let createData = [];
      let ownerId;
      let emails = [];
      let pp = await Published_page.find({
        page_id : pageId
      })
      if(pp.length < 1)
      {
        return exits.success({
          status : false,
          message  : "No Page Found",
          data :{}
        })
      }
      const checkUserIsOwner = await Page.find({
        id: inputs.id,
      });
      if (checkUserIsOwner.length > 0) {
        ownerId = checkUserIsOwner[0].user_id;
      }

      if (inputs.user) {
        if (inputs.hasOwnProperty("create")) {
          const add = inputs.create;

          if (add.length > 0) {
            add.map((e, index) => {
              const createActivation = {
                page_id: inputs.id,
                createdAt : moment().format("YYYY-MM-DD HH:mm:ss"),
                fullname: e.fullname,
                email: e.email,
                page_owner: ownerId ? ownerId : inputs.user.id,
                color : "hsla(" + Math.floor(Math.random() * 360) + ", 100%, 70%, 1)"
              };
              if (e.user_id) {
                // createActivation.accepted = true;
                createActivation.user_id = e.user_id;
              }
              if (!e.invitation_id) {
                if (!e.owner) {
                  createData.push(createActivation);
                  emails.push({
                    email: e.email,
                    user: e.user,
                    invitee: false,
                  });
                }
              }
            });
            sails.log({ createData });
            const activation = await Invitations.createEach(createData).fetch();
            // sails.log("good")
          }
        }
        if (inputs.hasOwnProperty("delete")) {
          const del = inputs.delete;
          //  const deletedAt = moment().format("YYYY-MM-DD HH:mm:ss");
          if (Array.isArray(del)) {
            const deleteActivations = await Invitations.update({
              id: { in: del },
            })
              .set({
                is_removed: 1,
              })
              .fetch();
          }
        }

        //Check which invitee has already signup and a teammate

        let userEmail = [];
        emails.map((data) => {
          userEmail.push(data.email);
        });

        let checkUser = await User.find({
          email: userEmail,
          currentUser: "invitee",
        });

        if (checkUser.length > 0) {
          let e = _.map(checkUser, "email");
          emails.map((data) => {
            if (e.includes(data.email)) {
              data.invitee = true;
            }
          });
        }

        sails.log("here");
        let query = `SELECT invitations.id AS invitation_id, invitations.email AS invite_email ,invitations.color AS color,
        invitations.accepted,invitations.is_removed , 
        CONCAT(users.first_name, ' ' , users.last_name) AS fullname, users.user_id ,users.avatar ,
        users.email FROM invitations LEFT JOIN users ON invitations.email = users.email
        WHERE invitations.is_removed = 0 AND invitations.page_id = ${pageId}
        `;
        sails.log({ query });
        const invitePersons = await sails.sendNativeQuery(query);
        let owner = await Page.find({
          id: inputs.id,
        });
        let ownerInfo;
        if (owner.length > 0) {
          ownerInfo = await User.find({
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
        sails.log({ invitePersons });
        invitePersons.rows.map((data) => {
          if (data.accepted == 1) {
            data.accepted = true;
          }
          if (data.accepted == 0) {
            data.accepted = false;
          }
        });
        if (invitePersons.rows.length > 0) {
          if (emails.length > 0) {
            console.log(sails.config.dymedrop.gateway, "config url");
            for (let index = 0; index < emails.length; index++) {
              console.log({ ownerInfo });
              ejs.renderFile(
                path.join(
                  __dirname,
                  "..",
                  "..",
                  "..",
                  "views",
                  "mails",
                  "invitation.ejs"
                ),
                {
                  sender: inputs.user.email,
                  link: `${sails.config.dymedrop.gateway}`,
                  user: emails[index].user,
                  pageId: pageId,
                  email: emails[index].email,
                  ownerName: `${ownerInfo[0].first_name} ${ownerInfo[0].last_name}`,
                  invitee: emails[index].invitee,
                  title : pp[0].title
                },
                function (err, data) {
                  if (err) {
                    sails.log(`Action auth/register caught an error while views for email (.ejs). Error: ${err}
            Time: ${moment().format()}`);
                    return exits.success({
                      status: false,
                      message: err.message,
                      data: [],
                    });
                  } else {
                    const subject = `You are invited to ${pp[0].title} on Dymedrop`;
                    sails.helpers.mail.mandrill.send(
                      [emails[index].email],
                      subject,
                      data
                    );
                  }
                }
              );
            }
          }

          return exits.success({
            status: true,
            message: "Invite send successfully.",
            data: invitePersons.rows,
          });
        } else {
          return exits.success({
            status: true,
            message: "Invites list successfully",
            data: [],
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
