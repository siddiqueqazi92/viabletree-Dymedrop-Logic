
const moment = require('moment');
module.exports = {


  friendlyName: 'Get for fan',


  description: 'Get one page for fan.',


  inputs: {
    user: {
      type: 'ref',
      required:true
    },  
    id: {
      type: 'number',
      required:true
    }
  },


  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
  },


  fn: async function (inputs, exits) {
    sails.log.debug("calling action user/pages/get-one started. Inputs:", JSON.stringify(inputs), "\nTime: ", moment().format());
    try {
        
      let page = await Page.getPublishedPage(inputs.id, "id")     
      if (!page || _.isEmpty(page)) { 
         page = await Page.getPage(inputs.id)     
      }
      if (!page || _.isEmpty(page)) {
        return exits.ok({
          status: false,
          message: "Page not found",          
        })
      }
      let sql = `SELECT a.id,af.is_expire,af.id as activationsId,af.qr_code,af.qr_code_usage,af.is_purchased,af.is_subscribed,af.createdAt,af.id as purchaseId, a.activation_name,a.activation_price,a.activation_frequency,a.activation_description,a.activation_scanlimit,a.activation_fanlimit,a.activation_promocode,a.published,pp.screenshot ,
      pp.title 
      from fan_activations af 
      join activation a on af.activation_id = a.id 
      JOIN published_pages pp on a.page_id = pp.page_id
      WHERE af.fan_user_id = '${inputs.user.id}' AND af.page_id = '${inputs.id}' AND af.is_purchased = 1 `
      sails.log.debug(sql)
      page.performance = await sails.helpers.pages.getPerformance(page.id);
      //getting all activations for ticket-no: 1268
      page.activation_all = await sails.models.activations.find({page_id:inputs.id,published:1});
      const activation = await sails.models.fan_activations.getDatastore().sendNativeQuery(sql);
      let obj = {} 
      if(activation.rows.length < 1){
        obj ={}
        page.isPurchased = false;
      }else{
           
          if(activation.rows[0].is_purchased == 1){
            let yearDifference;
            let monthDifference
             let st = Boolean(activation.rows[0].is_subscribed)   
            const yearDate = activation.rows[0].createdAt;
            const monthDate = activation.rows[0].createdAt;
            let activationTime = null
            if (activation.rows[0].activation_frequency === "ANNUAL") {
              yearDifference = yearDate.setFullYear(yearDate.getFullYear() + 1);
           
                activationTime = yearDifference
            } else if (activation.rows[0].activation_frequency === "MONTHLY") {
                monthDifference = monthDate.setMonth(monthDate.getMonth() + 1);
            
                activationTime = monthDifference
            } else if(activation.rows[0].activation_frequency === "1-TIME") {
              yearDifference = yearDate.setFullYear(yearDate.getFullYear() + 1);

              activationTime = yearDifference
          }
            let status = null
            let current_time_moment = moment(new Date());
            let current_time = current_time_moment.format("DD/MM/YYYY");
            let c_dt_moment = moment(activationTime);
            let c_dt = c_dt_moment.format('L');
            let activationIsFutureDate = activationTime == "UNLIMITED" ? true : c_dt_moment.diff(current_time_moment, 'hour') > 0;
            sails.log.debug({ foo: activationIsFutureDate });
            if(activation.rows[0].is_purchased == 0){
                activationIsFutureDate = false
            }
          obj = {
            id: activation.rows[0].activationsId, //fan activations id
            activationId: activation.rows[0].id, // activation id
            activationName:activation.rows[0].activation_name,
            activationPrice:activation.rows[0].activation_price,
            activationFrequency:activation.rows[0].activation_frequency,
            activationDescription:activation.rows[0].activation_description,
            activationScanlimit:activation.rows[0].activation_scanlimit,
            activationFanlimit:activation.rows[0].activation_fanlimit,
            activationPromocode:activation.rows[0].activation_promocode,
            published:activation.rows[0].published,
            purchaseId:activation.rows[0].purchaseId,
            activationPageName: activation.rows[0].title,
            activationPageImage: activation.rows[0].screenshot,
            activationTime: activationTime,
            activationStatus: activationIsFutureDate,
                    
          }
          page.isPurchased = true;
          page.qrCode = activation.rows[0].qr_code;
          page.qrCodeScanCount = activation.rows[0].qr_code_usage;
          page.isSubscribed = st;  
          page.isExpire = Boolean(activation.rows[0].is_expire);
           
        }
        
      }
      
      sails.log.debug(obj)
      page.activation = obj
      
      
      return exits.success({
        status: true,
        message: "Page found successfully",
        data:page
      })
      
    } catch (err) {
     // sails.log.error("error in action user/pages/get-one", JSON.stringify(inputs), "\nTime: ", moment().format(),err);
      sails.log.debug(err.message)
    }
    return exits.success(sails.getDatastore('default'));

  }


};
