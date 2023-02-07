//const moment = require("moment");
module.exports = {
  friendlyName: "Activation Delete",

  description: "Activation Delete",

  inputs: {
    user: {
      type: "ref",
    },
    create: {
      type: "ref",
      required: false,
    },
    update: {
      type: "ref",
      required: false,
    },
    delete: {
      type: "ref",
      required: false,
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
    try {
      sails.log(
        "action activation/activation started with inputs ",
        JSON.stringify(inputs)
      );
      if (inputs.user) {
        let createData = [];
        let editData = [];
        let deleteData = [];
        let act = {
          notUpdated: [],
          updated: [],
        };

        const checkAccount = await User.find({
          user_id: inputs.user.id,
        });
        sails.log.debug(
          [...inputs.create, ...inputs.update].find(
            (x) => x.activationPublished === 1
          )
        );
        if (checkAccount.length > 0) {
          if (
            checkAccount[0].account_setup == 0 &&
            [...inputs.create, ...inputs.update].find(
              (x) => x.activationPublished === 1
            )
          ) {
            return exits.success({
              status: false,
              message: "Payment setup required.",
              data: {},
            });
          }
        } else {
          return exits.success({
            status: false,
            message: "No user found.",
            data: {},
          });
        }

        if (inputs.hasOwnProperty("create")) {
          const add = inputs.create;
          if (add.length > 0) {
            add.map((e, index) => {
              const createActivation = {
                user_id: inputs.user.id,
                activation_name: inputs.create[index].activationName,
                activation_price: inputs.create[index].activationPrice,
                activation_frequency: inputs.create[index].activationFrequency,
                activation_description:
                  inputs.create[index].activationDescription,
                activation_scanlimit: inputs.create[index].activationScanlimit,
                activation_fanlimit: inputs.create[index].activationFanlimit,
                activation_promocode: inputs.create[index].activationPromocode,
                published: inputs.create[index].activationPublished,
                page_id: inputs.pageId,
              };
              createData.push(createActivation);
            });
            sails.log({ createData });
            const activation = await Activations.createEach(createData).fetch();
            // sails.log("good")
          }
        }
        let unable = [];
        if (inputs.hasOwnProperty("update")) {
          const edit = inputs.update;
          if (edit.length > 0) {
            for (var i = 0; i < edit.length; i++) {
              const editActivation = {
                user_id: inputs.user.id,
                activation_name: inputs.update[i].activationName,
                activation_price: inputs.update[i].activationPrice,
                activation_frequency: inputs.update[i].activationFrequency,
                activation_description: inputs.update[i].activationDescription,
                activation_scanlimit: inputs.update[i].activationScanlimit,
                activation_fanlimit: inputs.update[i].activationFanlimit,
                activation_promocode: inputs.update[i].activationPromocode,
                published: inputs.update[i].activationPublished,
              };
              //   if(inputs.update[i].activationPublished == 0){
              //   //check if subscription in exists
              //   const check_if_act = await sails.models.fan_activations.find({
              //     activation_id:inputs.update[i].id,
              //   })
              //   if(check_if_act.length > 0){
              //           //cancel subscription in DB
              //           const purchased_act = await sails.models.fan_activations.update({
              //             activation_id:inputs.update[i].id,
              //           }).set({
              //             is_subscribed:0
              //           })
              //           //cancel subscription from stripe
              //           for(st of check_if_act){
              //             let data_to_update =  {cancel_at_period_end:true}
              //             subscription_info = await sails.helpers.stripe.subscriptions.update(
              //               st.payment_reference, data_to_update
              //             );
              //           }

              //   }

              // }
              if (inputs.update[i].hasOwnProperty("id")) {
                const checkActivation = await Activations.findOne({
                  id: inputs.update[i].id,
                  // user_id: inputs.user.id,
                });

                if (checkActivation) {
                  const matched = {
                    ...checkActivation,
                    ...editActivation,
                  };
                  const purchased_act = await sails.models.fan_activations.find(
                    {
                      activation_id: inputs.update[i].id,
                      is_subscribed: true,
                    }
                  );

                  if (purchased_act.length) {
                    let data_to_update = { cancel_at_period_end: true };
                    for (let pa of purchased_act) {
                      if (!pa.payment_reference.includes("ch_")) {
                        subscription_info =
                          await sails.helpers.stripe.subscriptions.update(
                            pa.payment_reference,
                            data_to_update
                          );
                      }
                    }

                    //continue;
                  }
                  // act["notUpdated"].push(obj);
                  const updateActivation = await Activations.updateOne({
                    id: inputs.update[i].id,
                    // user_id: inputs.user.id,
                  }).set(matched);
                  if (!inputs.update[i].activationPublished) {
                    await fan_activations
                      .update({ activation_id: inputs.update[i].id })
                      .set({ is_subscribed: false });
                  }
                }
              }
            }

            //  act['notUpdated'].push(unable)
          }
        }

        if (inputs.hasOwnProperty("delete")) {
          const del = inputs.delete;
          //  const deletedAt = moment().format("YYYY-MM-DD HH:mm:ss");
          if (Array.isArray(del)) {
            // for(var i =0; i < del.length; i++)
            // {
            //     delIds.push(del[i].activationId);
            // }
            const deleteActivations = await Activations.update({
              id: { in: del },
              //  user_id: inputs.user.id,
            })
              .set({
                published: 0,
                is_deleted: 1,
              })
              .fetch();

            // start delete activation //
            const del_act = await sails.models.fan_activations
              .update({
                activation_id: { in: del },
              })
              .set({
                is_subscribed: 0,
              })
              .fetch();
            if (del_act) {
              let data_to_update = { cancel_at_period_end: true };
              for (cancel_act of del_act) {
                subscription_info =
                  await sails.helpers.stripe.subscriptions.update(
                    cancel_act.payment_reference,
                    data_to_update
                  );
              }
            }
            // subscription_info = await sails.helpers.stripe.subscriptions.cancel(
            //   is_purchased[0].payment_reference
            //  );
            //   sails.log({subscription_info})
            // ////
            // if (subscription_info.error) {
            //   return exits.success({
            //     status: false,
            //     message: subscription_info.error.message,
            //     data: {}
            //   })
            // }
            // end delete activation //
          } else {
            sails.log(
              "action activation/activation ended with response: Delete must be an array "
            );
            return exits.invalid({
              status: false,
              message: "Delete must be an array",
              data: {},
            });
          }
        }

        const getActivation = await Activations.find({
          // user_id: inputs.user.id,
          page_id: inputs.pageId,
        });

        if (getActivation.length > 0) {
          getActivation.map((e, index) => {
            act["updated"].push({
              id: e.id,
              user_id: e.user_id,
              activationName: e.activation_name,
              activationPrice: e.activation_price,
              activationFrequency: e.activation_frequency,
              activationDescription: e.activation_description,
              activationScanlimit: e.activation_scanlimit,
              activationFanlimit: e.activation_fanlimit,
              activationPromocode: e.activation_promocode,
              activationPublished: e.published,
              pageId: e.page_id,
            });
          });
        }
        sails.log(
          "action activation/activation ended with response: Activation saved successfully "
        );
        return exits.success({
          status: true,
          message: "Activation saved successfully",
          data: act,
        });
      } else {
        sails.log(
          "action activation/activation ended with response: Unauthorized "
        );
        return exits.success({
          status: false,
          message: "Unauthorized",
          data: {},
        });
      }
    } catch (err) {
      sails.log.error(`Error in action activations/activation.js. ${err}`);
      return exits.success({
        status: false,
        message: "Error Occured. Something Went Wrong",
        data: {},
      });
    }
  },
};
