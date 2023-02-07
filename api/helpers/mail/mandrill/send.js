const nodemailer = require("nodemailer");
var mandrillTransport = require("nodemailer-mandrill-transport");
const moment = require("moment");

module.exports = {
  friendlyName: "Send email",

  description: "",
  sync: true,
  inputs: {
    recipient: {
      type: "ref",
      required: true,
    },
    subject: {
      type: "string",
      required: true,
    },
    body: {
      type: "string",
      required: true,
    },
    reply_to: {
      type: "string",
      required: false,
      allowNull: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: function (inputs, exits) {
    sails.log(
      "calling action helper/mail/mandrill/send start \nTime: ",
      moment().format()
    );

    try {
      
    
    /*
     * Configuring mandrill transport.
     * Copy your API key here.
     */

    var smtpTransport = nodemailer.createTransport(
      mandrillTransport({
        auth: {
          apiKey: sails.config.mail.mandrill.api_key,
        },
      })
    );

    // Put in email details.

    let mailOptions = {
      from: `"Dymedrop " <${
        sails.config.mail.from || sails.config.mail.username
      }>`, // sender address
      to: inputs.recipient,
      subject: inputs.subject,
      html: inputs.body,
    };

    // Sending email.
    smtpTransport.sendMail(mailOptions, function (err, response) {
      if (err) {
        sails.log(
          `Error in helper/mail/mandrill/send. ${err} \nTime: `,
          moment().format()
        );
      }
      console.log("Message sent: " + JSON.stringify(response));
    });
    return exits.success();
  } catch (error) {
      sails.log("Erro sending mail : " , error.message)
  }
  },
};
