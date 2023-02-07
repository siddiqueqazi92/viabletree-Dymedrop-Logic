const moment = require("moment");

module.exports = {
  friendlyName: "Get one",

  description: "",

  inputs: {
    user: {
      type: "ref",
    },
    id: {
      type: "string",
    },
  },

  exits: {},

  fn: async function (inputs, exits) {
    sails.log.debug(
      "calling user/pages/admin/pages/activations/getone-activations\ntime: ",
      moment()
    );
    try {
      console.log({ inputs });
      const activations = await Activations.findOne({
        is_deleted: 0,
        id: inputs.id,
      });

      if (activations) {
        sails.log.debug("user/pages/admin/pages/activations/getone-activations executed\ntime: ", moment());


        const usersBuyActivations = await fan_activations.find({
            activation_id : inputs.id
        })

        const getUsers = []
        usersBuyActivations.map((data)=>{
            getUsers.push(data.fan_user_id)
        })

        const users = await User.find({
            user_id  : {in : getUsers }
        })
        const buyer = []
        usersBuyActivations.map((d)=>{
            users.map((e)=>{
                if(d.fan_user_id == e.user_id)
                {
                    d.fan_name = e.first_name
                    d.fan_image = e.avatar
                    d.fan_id = e.user_id
                }
            })
            // buyer.push(...d)
        })

        activations.buyer = usersBuyActivations

        // return exits.success({ status: true, message: 'pages get successfully', data: obj })
        return exits.success({
          status: true,
          message: "Activations found",
          data: activations,
        });
      } else {
        sails.log.debug("user/pages/admin/pages/activations/getone-activations executed\ntime: ", moment());
        // return exits.success({ status: true, message: 'pages get successfully', data: obj })
        return exits.success({
          status: false,
          message: "No activations found",
        });
      }
    } catch (error) {
      sails.log.error(
        "error at user/pages/pages/activations/getone-activations error: ",
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
