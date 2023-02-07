/**
 * Local environment settings
 *
 * Use this file to specify configuration settings for use while developing
 * the app on your personal system.
 *
 * For more information, check out:
 * https://sailsjs.com/docs/concepts/configuration/the-local-js-file
 */

module.exports = {
  port: 1338,
  fcm: {
    user: {
      type: process.env.FCM_USER_TYPE,
      project_id: process.env.FCM_USER_PROJECT_ID,
      private_key_id: process.env.FCM_USER_PRIVATE_KEY_ID,
      private_key: process.env.FCM_USER_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FCM_USER_CLIENT_EMAIL,
      client_id: process.env.FCM_USER_CLIENT_ID,
      auth_uri: process.env.FCM_USER_AUTH_URI,
      token_uri: process.env.FCM_USER_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FCM_USER_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FCM_USER_CLIENT_X509_CERT_URL,
      databaseURL: process.env.FCM_USER_DATABASE_URL,
    },
  },
  JWT: {
    ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN,
    REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,
  },

  // Any configuration settings may be overridden below, whether it's built-in Sails
  // options or custom configuration specifically for your app (e.g. Stripe, Sendgrid, etc.)
  database: {
    url: process.env.DATABASE_URL,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    recepient: process.env.MAIL_RECEPIENT,
    service: process.env.MAIL_SERVICE,
  },
};
