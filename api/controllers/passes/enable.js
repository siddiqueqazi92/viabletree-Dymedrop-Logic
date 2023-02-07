const _delete = require("../activations/delete");

module.exports = {
  friendlyName: "Pass Enable",

  description: "Pass Enable.",

  inputs: {
    user: {
      type: "ref",
    },
    perfectPass: {
      type: "boolean",
      required: true,
    },
    pageId: {
      type: "number",
      required: true,
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
    sails.log("calling passes/enable.js with inputs ", JSON.stringify(inputs));
    let successMessage = {
      message: null,
    };
    let perfectpass;
    let data;
    const page = await Page.findOne({
      id: inputs.pageId,
    //   user_id: inputs.user.id,
    });

    if (page) {
      sails.log({ page });
      if (page.passenable == inputs.perfectPass) {
        return exits.success({
          status: false,
          message: "Pass is already enabled or disabled",
          data: {},
        });
      }
      const pageUpdate = await Page.updateOne({
        id: inputs.pageId,
        // user_id: inputs.user.id,
      }).set({
        passenable: inputs.perfectPass,
      });
      if (pageUpdate) {
        const publishPageUpdate = await sails.models.published_page
          .updateOne({
            page_id: inputs.pageId,
          })
          .set({
            is_deleted: 1,
          });
        if (inputs.perfectPass == false) {
          //unpublish activations is perfect pass/passenable is false
          const cancelAct = await sails.models.activations.update({
            page_id: inputs.pageId,
             published: 1,
          }).set({
             published: 0,
          })
          .fetch();
          //set cancelation on stripe for subscriptions related to this page 
          //is perfect pass/passenable is false
          const check = await sails.models.fan_activations.find({
            page_id: inputs.pageId,
            is_subscribed: 1,
          });
         
          if (check.length > 0) {
            const cancel_act = await sails.models.fan_activations
              .update({
                page_id: inputs.pageId,
                //  user_id : inputs.user.id
              })
              .set({
                is_subscribed: 0,
              })
              .fetch();
            for (st of check) {
              let data_to_update = { cancel_at_period_end: true };
              subscription_info =
                await sails.helpers.stripe.subscriptions.update(
                  st.payment_reference,
                  data_to_update
                );
            }
          }
        }
        if (publishPageUpdate) {
          return exits.success({
            status: true,
            message: "Perfect Pass Enabled",
            data: pageUpdate,
          });
        }
      } else {
        return exits.invalid({
          status: true,
          message: "Error Occured",
          data: {},
        });
      }
      // if(page.perfect_pass == '1' && inputs.perfectPass != '1')
      // {
      //     data = {
      //         perfect_pass  : inputs.perfectPass,
      //     }
      //      perfectpass = await Page.updateOne({
      //         id : inputs.pageId ,
      //         user_id : inputs.user.id
      //     }).set(data).fetch();
      //     successMessage.message = "Perfect Pass Disabled"
      // }else if(page.perfect_pass == '0' && inputs.perfectPass != '0'){

      //     data = {
      //         perfect_pass  : inputs.perfectPass,
      //         passenable : null
      //     }
      //     if(page.passenable == '0' || !page.passenable)
      //     {
      //         data.passenable = 1
      //         const getAdminTemplate = await AdminActivations.find();
      //         getAdminTemplate.map((e,index)=>{
      //             delete e.id
      //             e.user_id = inputs.user.id
      //         })
      //         sails.log({getAdminTemplate})

      //         const addActivationOnFirst = await Activations.createEach(getAdminTemplate);

      //     }
      //     else{
      //         delete data.passenable
      //     }
      //      perfectpass = await Page.updateOne({
      //         id : inputs.pageId ,
      //         user_id : inputs.user.id
      //     }).set(data).fetch();

      //     successMessage.message = "Perfect Pass Enabled"
      // }
      // else{
      //     return exits.invalid({
      //         status : false,
      //         message : "Something went wrong."
      //     });
      // }
    } else {
      return exits.success({
        status: false,
        message: "No such page found.",
        data: {},
      });
    }

    return exits.success();
  },
};
