module.exports = {
    friendlyName: "Activation GET",
  
    description: "Activation GET",
  
    inputs: {
      user: {
        type: "ref",
      },
      pageId :{
        type : "number",
        required : true
      }
    },
  
    exits: {},
  
    fn: async function (inputs, exits) {
      try {
        sails.log("call activation/get ");
        const getActivation = await Activations.find({
            // user_id: inputs.user.id,
            page_id : inputs.pageId,
            is_deleted:0
            
          }).populate('fanActivation');
        let act = []
        let message = {
          message : null
        }
        let checkPurchased = false;
        if(getActivation.length > 0 ){
          message.message = "Activation found successfully"
          getActivation.map((e,index) => {
            if(e.fanActivation.length > 0){
            for(fanAct of e.fanActivation){
                if(fanAct.is_purchased == 1){
                  checkPurchased = true
                }
            }
          }else{
            checkPurchased = false
          }
            act.push({
              id : e.id,
              user_id: e.user_id,
              activationName:e.activation_name,
              activationPrice :e.activation_price,
              activationFrequency :e.activation_frequency,
              activationDescription : e.activation_description,
              activationScanlimit :e.activation_scanlimit,
              activationFanlimit :e.activation_fanlimit,
              activationPromocode :e.activation_promocode,
              activationPublished : e.published,
              pageId : e.page_id,
              isPurchased: checkPurchased
            })
          })
        }
        else{
          message.message = "No Activations Found"
        }
        
          return exits.success({
            status: true,
            message:message.message,
            data: act
          });
      } catch (err) {
        return exits.success({
          status: false,
          message: "Error Occured. Something Went Wrong",
          data: {},
        });
      }
    },
  };
  