const utils = require("viable-utils");
module.exports = {
  friendlyName: "Activation Voucher GET",

  description: "Activation Voucher GET",

  inputs: {
    user: {
      type: "ref",
    },
    code: {
      type: "string",
      required: true,
    },
    voucher_id: {
      type: "string",
    //  required: true,
    },
  },

  exits: {
    invalid: {
      responseType: "badRequest",
    },
    unauthorized: {
      responseType: "unauthorized",
    },
    forbidden: {
      responseType: "forbidden",
    },
    serverError: {
      responseType: "serverError",
    },
    notFound: {
      responseType: "notFound",
    },
  },

  fn: async function (inputs, exits) {
    try {
      sails.log("call activation/voucher ");
      const randomCode = inputs.code;
      const voucherId = inputs.id;

      if (randomCode.length >= 6 && randomCode.length <= 8) {
        const checkIfCodeExist = await Activations.find({
          activation_promocode: randomCode,
        });
        let status = {
          status: null,
        };
        if (checkIfCodeExist. length > 0) {
          const c = /^\d+$/.test(inputs.voucher_id)
          if(c){
            if(checkIfCodeExist[0].id == inputs.voucher_id){
            status.status = false;
            return exits.success({
              status: false,
              message: "Already in use",
              data: {
                status: status.status,
              },
            });
          }else{
            status.status = true;
            return exits.success({
              status: true,
              message: "Code generated",
              data: {
                status: status.status,
              },
            });
          }
        }else{
          status.status = false;
          return exits.success({
            status: false,
            message: "already in use",
            data: {
              status: status.status,
            },
          });
        }
        } else {
          status.status = true;
        }

        return exits.success({
          status: true,
          message: "Code generated",
          data: {
            status: status.status,
          },
        });
      } else {
        return exits.success({
          status: false,
          message: "Code must range between 6 to 8 characters.",
          data: {},
        });
      }
    } catch (err) {
      return exits.success({
        status: false,
        message: "Error Occured. Something Went Wrong",
        data: {},
      });
    }
  },
};
