var admin = require("firebase-admin");
const moment = require("moment");

const userAppServiceAccount = {
  type: sails.config.fcm.user.type,
  project_id: sails.config.fcm.user.project_id,
  private_key_id: sails.config.fcm.user.private_key_id,
  private_key: sails.config.fcm.user.private_key,
  client_email: sails.config.fcm.user.client_email,
  client_id: sails.config.fcm.user.client_id,
  auth_uri: sails.config.fcm.user.auth_uri,
  token_uri: sails.config.fcm.user.token_uri,
  auth_provider_x509_cert_url:
    sails.config.fcm.user.auth_provider_x509_cert_url,
  client_x509_cert_url: sails.config.fcm.user.client_x509_cert_url,
};

let appObj = null;
module.exports = {
  send: async function (
    deviceId,
    title,
    body,
    silent,
    data = {},
    app = "user"
  ) {
    if (!admin.apps.length) {
      appObj = admin.initializeApp(
        {
          credential: admin.credential.cert(userAppServiceAccount),
          databaseURL: process.env.FCM_USER_DATABASE_URL,
        },
        // "com.aha_mobileapp"
        "com.ahaart.app"
      );
    }

    sails.log("Calling api/lib/PushNotifications/firebasePushNotification");
    //  deviceId = ['e9q0usIz3oY:APA91bGIsnQi1BZgPvhce3Qu5JKPDZCvbg5t3PU-TJOkVpZw9VwlG2UTt1MKkdlobpbP-0L4jRFsnCxQu3HTpage7xLDtOLI9Wp4-0pNH9xVu_YlPQWTn0GqsYQU8q_NJ4lfg3ZGMEMh',
    //   'emKPxbGTYUU:APA91bGuvbwiYaI_FmpDUAO4SKRFTxCmV0A9UCvXKdz3MuulZiMlcxplH_xlGUNGKStwI9aErQm6sU2rJwuOdn-YB7YTXjmcMEwhURJAIvRQXYmpoojL8N0COWvz9deWvD_grM9kYfYQ'
    // ];

    var registrationToken = deviceId;
    //title = 'test notification';
    //body = 'this is test',
    //silent = false,
    //data = {},
    app = "user";
    if (silent) {
      Object.assign(data, { silent: silent.toString() });
    } else {
      Object.assign(data, { title, body, silent: silent.toString() });
    }

    // See documentation on defining a message payload.
    var message = {
      data: data,
      token: registrationToken,
      apns: {
        payload: {
          aps: {
            badge: 0,
            sound:"default",
            contentAvailable: true,
          },
        },
      },
    };
    if (!silent) {
      message.notification = {
        body: body,
        title: title,
      };
    }

    // Send a message to the device corresponding to the provided
    // registration token.
    try {
      var response;

      //sails.log.debug({userApp, message: JSON.stringify(message)})
      // const db = appObj.firestore();
      //sails.log({ message1111: message });
      response = await appObj.messaging().send(message);

      // Response is a message ID string.
      sails.log.debug("Successfully sent message:", response);
      sails.log.debug("Payload:", JSON.stringify(message));
      sails.log.debug(`Sent  At:`, moment().toISOString());
      sails.log.debug("============================================");
      return response;
    } catch (error) {
      sails.log.error("Error sending android push notification:", error);
    }
  },
  sendBulk: async function (
    deviceId,
    title,
    body,
    silent,
    data = {},
    app = "user"
  ) {
    let appObj = null;

    if (!admin.apps.length) {
      appObj = admin.initializeApp(
        {
          credential: admin.credential.cert(userAppServiceAccount),
          databaseURL: process.env.FCM_USER_DATABASE_URL,
        },
        "userApp"
      );
    }

    sails.log("Calling api/lib/PushNotifications/firebasePushNotification");
    //  deviceId = ['e9q0usIz3oY:APA91bGIsnQi1BZgPvhce3Qu5JKPDZCvbg5t3PU-TJOkVpZw9VwlG2UTt1MKkdlobpbP-0L4jRFsnCxQu3HTpage7xLDtOLI9Wp4-0pNH9xVu_YlPQWTn0GqsYQU8q_NJ4lfg3ZGMEMh',
    //   'emKPxbGTYUU:APA91bGuvbwiYaI_FmpDUAO4SKRFTxCmV0A9UCvXKdz3MuulZiMlcxplH_xlGUNGKStwI9aErQm6sU2rJwuOdn-YB7YTXjmcMEwhURJAIvRQXYmpoojL8N0COWvz9deWvD_grM9kYfYQ'
    // ];

    var registrationTokens = deviceId;
    //title = 'test notification';
    //body = 'this is test',
    //silent = false,
    //data = {},
    app = "user";
    if (silent) {
      Object.assign(data, { silent: silent.toString() });
    } else {
      Object.assign(data, { title, body, silent: silent.toString() });
    }

    // See documentation on defining a message payload.
    var message = {
      data: data,
      tokens: registrationTokens,
      apns: {
        payload: {
          aps: {
            sound:"default",
            // badge: 1,
            contentAvailable: true,
             sound: "default",
            priority: "high",
          },
        },
      },
    };
    if (!silent) {
      message.notification = {
        body: body,
        title: title,
      };
    }

    // Send a message to the device corresponding to the provided
    // registration token.
    try {
      var response;

      //sails.log.debug({userApp, message: JSON.stringify(message)})
      response = await appObj.messaging().sendMulticast(message);

      // Response is a message ID string.
      sails.log.debug("Successfully sent message:", response);
      sails.log.debug("Payload:", JSON.stringify(message));
      sails.log.debug("============================================");
      return response;
    } catch (error) {
      sails.log.error("Error sending android push notification:", error);
    }
  },
};
