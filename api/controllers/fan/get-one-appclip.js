const moment = require("moment");
const axios = require("axios");
var QRCode = require("qrcode");

module.exports = {
  friendlyName: "Get for fan",

  description: "Get one page for fan.",

  inputs: {
    id: {
      type: "ref",
      required: true,
    },
    device_id: {
      type: "string",
    },
    headers: {
      type: "ref",
    },
  },

  exits: {
    ok: {
      responseType: "ok",
      description: "",
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug(
      "calling action user/pages/get-one-appclip started. Inputs:",
      JSON.stringify(inputs),
      "\nTime: ",
      moment().format()
    );
    try {
      let page = await Page.getPublishedPage(inputs.id, "slug", false);

      if (!page || _.isEmpty(page)) {
        let filter = { slug: inputs.id, is_deleted: false };
        page = await Page.getPage(filter);
      }
      if (!page || _.isEmpty(page)) {
        return exits.ok({
          status: false,
          message: "Page not found",
        });
      }
      sails.log("headers", inputs.device_id);
      // const getGuestUser = await sails.models.guest.find({
      //   device_id  : inputs.headers.device_id
      // })
      // const getGuestUser = await sails.models.guest
      //   .getDatastore()
      //   .sendNativeQuery(
      //     `SELECT * FROM guestusers WHERE device_id = '${inputs.device_id}' AND is_deleted = 0`
      //   );
      // console.log({ getGuestUser });
      // if (!getGuestUser.rows) {
      //   return exits.success({
      //     status: false,
      //     message: "No user found",
      //     data: page,
      //   });
      // }
      // let sql = `SELECT a.id,af.is_expire,af.id as activationsId,af.qr_code,af.qr_code_usage,af.is_purchased,af.is_subscribed,af.createdAt,af.id as purchaseId, a.activation_name,a.activation_price,a.activation_frequency,a.activation_description,a.activation_scanlimit,a.activation_fanlimit,a.activation_promocode,a.published,pp.screenshot ,
      // pp.title
      // from guest_activations af
      // join activation a on af.activation_id = a.id
      // JOIN published_pages pp on a.page_id = pp.page_id
      // WHERE af.guest_user_id = '${getGuestUser.rows[0].id}' AND af.page_id = '${inputs.id}' AND af.is_purchased = 1 `;
      // sails.log.debug(sql);
      page.performance = await sails.helpers.pages.getPerformance(page.id);
      //getting all activations for ticket-no: 1268
      page.activation_all = await sails.models.activations.find({
        page_id: page.id,
        published: 1,
      });
      // const activation = await GuestActivation.getDatastore().sendNativeQuery(
      //   sql
      // );
      // let obj = {};
      // if (activation.rows.length < 1) {
      //   obj = {};
      //   page.isPurchased = false;
      // } else {
      //   if (activation.rows[0].is_purchased == 1) {
      //     let yearDifference;
      //     let monthDifference;
      //     let st = Boolean(activation.rows[0].is_subscribed);
      //     const yearDate = activation.rows[0].createdAt;
      //     const monthDate = activation.rows[0].createdAt;
      //     let activationTime = null;
      //     if (activation.rows[0].activation_frequency === "ANNUAL") {
      //       yearDifference = yearDate.setFullYear(yearDate.getFullYear() + 1);

      //       activationTime = yearDifference;
      //     } else if (activation.rows[0].activation_frequency === "MONTHLY") {
      //       monthDifference = monthDate.setMonth(monthDate.getMonth() + 1);

      //       activationTime = monthDifference;
      //     } else if (activation.rows[0].activation_frequency === "1-TIME") {
      //       yearDifference = yearDate.setFullYear(yearDate.getFullYear() + 1);

      //       activationTime = yearDifference;
      //     }
      //     let status = null;
      //     let current_time_moment = moment(new Date());
      //     let current_time = current_time_moment.format("DD/MM/YYYY");
      //     let c_dt_moment = moment(activationTime);
      //     let c_dt = c_dt_moment.format("L");
      //     let activationIsFutureDate =
      //       activationTime == "UNLIMITED"
      //         ? true
      //         : c_dt_moment.diff(current_time_moment, "hour") > 0;
      //     sails.log.debug({ foo: activationIsFutureDate });
      //     if (activation.rows[0].is_purchased == 0) {
      //       activationIsFutureDate = false;
      //     }

      //     obj = {
      //       id: activation.rows[0].activationsId, //fan activations id
      //       activationId: activation.rows[0].id, // activation id
      //       activationName: activation.rows[0].activation_name,
      //       activationPrice: activation.rows[0].activation_price,
      //       activationFrequency: activation.rows[0].activation_frequency,
      //       activationDescription: activation.rows[0].activation_description,
      //       activationScanlimit: activation.rows[0].activation_scanlimit,
      //       activationFanlimit: activation.rows[0].activation_fanlimit,
      //       activationPromocode: activation.rows[0].activation_promocode,
      //       published: activation.rows[0].published,
      //       purchaseId: activation.rows[0].purchaseId,
      //       activationPageName: activation.rows[0].title,
      //       activationPageImage: activation.rows[0].screenshot,
      //       activationTime: activationTime,
      //       activationStatus: activationIsFutureDate,
      //     };

      //     // const options = {
      //     //   method: "POST",
      //     //   url: "https://qrcode3.p.rapidapi.com/qrcode/text",
      //     //   headers: {
      //     //     "content-type": "application/json",
      //     //     "X-RapidAPI-Key":
      //     //       "ff16c585c4msh020337e3cb29c67p1e73f1jsn566f998d84b9",
      //     //     "X-RapidAPI-Host": "qrcode3.p.rapidapi.com",
      //     //   },
      //     //   data: '{"data":"https://linqr.app","image":{"uri":"icon://appstore","modules":true},"style":{"module":{"color":"black","shape":"default"},"inner_eye":{"shape":"default"},"outer_eye":{"shape":"default"},"background":{}},"size":{"width":200,"quiet_zone":4,"error_correction":"M"},"output":{"filename":"qrcode","format":"svg"}}',
      //     // };

      //     // await axios(options).then(function (response) {
      //     //   sails.log(response.data);
      //     //   obj.qr_svg = response.data;
      //     // });

      //     await QRCode.toDataURL(activation.rows[0].qr_code)
      //       .then((url) => {
      //         console.log(url);
      //         obj.qr_svg2 = url
      //       })
      //       .catch((err) => {
      //         console.error(err);
      //       });

      //     // await QRCode.toString(
      //     //   activation.rows[0].qr_code,
      //     //   { type: "terminal" },
      //     //   function (err, url) {
      //     //     obj.qr_svg = url;
      //     //   }
      //     // );

      //     page.isPurchased = true;
      //     page.qrCode = activation.rows[0].qr_code;
      //     page.qrCodeScanCount = activation.rows[0].qr_code_usage;
      //     page.isSubscribed = st;
      //     page.isExpire = Boolean(activation.rows[0].is_expire);
      //   }
      // }

      // sails.log.debug(obj);
      // page.activation = obj;

      return exits.success({
        status: true,
        message: "Page found successfully",
        data: page,
      });
    } catch (err) {
      // sails.log.error("error in action user/pages/get-one", JSON.stringify(inputs), "\nTime: ", moment().format(),err);
      sails.log.debug(err.message);
    }
    return exits.success(sails.getDatastore("default"));
  },
};
