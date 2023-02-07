const axios = require("axios");
var QRCode = require('qrcode')

module.exports = {
  friendlyName: "Ping",

  description: "Ping something.",

  inputs: {},

  exits: {},

  fn: async function (inputs, exits) {
    let data = {
      svg: null,
    };
    // const options = {
    //     method: 'POST',
    //     url: 'https://qrcode3.p.rapidapi.com/qrcode/text',
    //     headers: {
    //       'content-type': 'application/json',
    //       'X-RapidAPI-Key': 'ff16c585c4msh020337e3cb29c67p1e73f1jsn566f998d84b9',
    //       'X-RapidAPI-Host': 'qrcode3.p.rapidapi.com'
    //     },
    //     data: '{"data":"https://linqr.app","image":{"uri":"icon://appstore","modules":true},"style":{"module":{"color":"black","shape":"default"},"inner_eye":{"shape":"default"},"outer_eye":{"shape":"default"},"background":{}},"size":{"width":200,"quiet_zone":4,"error_correction":"M"},"output":{"filename":"qrcode","format":"svg"}}'
    //   };

    // axios.request(options).then(function (response) {
    //     sails.log(response.data);
    //     data.svg = response.data

    //     return exits.success(data);
    // }).catch(function (error) {
    //     sails.log(error);
    // });

    await QRCode.toString(
      "I am a pony!",
      { type: "terminal" },
      function (err, url) {
        sails.log(url);
        data.svg = url;
      }
    );

    return exits.success({
      status :true,
      message : "QR code generated",
      data : data
    });
  },
};
