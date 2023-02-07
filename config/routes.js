/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */
const corsPolicy = {
  allRoutes: true,
  allowOrigins: "*",
  allowCredentials: false,
  allowRequestMethods: "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  allowRequestHeaders: "*",
};
module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  "GET /ping": { action: "ping" },
  "GET /api/v1/user/stripe": { action: "stripe" },
  /**
   * admin routes
   */
  "GET /api/v1/admin/fans/activations/:id": "admin/fan/getactivations",

  "GET /api/v1/admin/activations": "admin/pages/activations/activations",
  "GET /api/v1/admin/activations/:id":
    "admin/pages/activations/getone-activations",

  //templates
  "POST /api/v1/admin/templates": "admin/templates/create",
  "GET /api/v1/admin/templates": "admin/templates/list",
  "GET /api/v1/admin/templates/:id": "admin/templates/list-one",
  "PUT /api/v1/admin/templates/:id": "admin/templates/update",
  "PUT /api/v1/admin/templates/active/:id": "admin/templates/activate-deactive",

  //finance

  "GET /api/v1/admin/finance": "admin/finance/list",
  "GET /api/v1/admin/finance/guest": "admin/finance/guest",

  //Transfer

  "GET /api/v1/admin/transfer/list": "admin/transfer/history",

  //Invitee
  "GET /api/v1/admin/invitee/list": "admin/invitee/list",
  "GET /api/v1/admin/invitee/list/:id": "admin/invitee/get-one",

  "GET /api/v1/admin/users": "admin/user/get-all",
  "GET /api/v1/admin/users/:id": "admin/user/get-one",
  "PUT /api/v1/update/users/:id": "admin/user/update/user-account", // update by admin
  "PUT /api/v1/create/users/:id": "admin/user/create/user-account", // create by admin
  "PUT /api/v1/admin/users/change-status": "admin/user/update/account-status",

  "PUT /api/v1/users/create/:id": "user/account/user-account", //update or create by user
  // 'PUT /api/v1/users/update/:id': 'user/account/user-account', //update or create by user or admin // currently not in use, made for edit user

  "GET /api/v1/admin/pages": "admin/pages/get",
  "GET /api/v1/admin/pages/:id": "admin/pages/get-one",
  "GET /api/v1/admin/settings": "admin/settings/get",
  "GET /api/v1/admin/settings/:id": "admin/settings/get-one",
  "PUT /api/v1/admin/settings/:id": "admin/settings/update",

  "POST /api/v1/user/deactivate": "user/account/deactivate", //deactivate account by user
  "POST /api/v1/user/activate": "user/account/activate", //reactivate account by user

  // api/controllers/user/account/form.js
  "POST /api/v1/user/submit-form": "user/account/form", //submit form by user
  "POST /api/v1/user/submit-form-fan": "user/account/form-fan", //submit form by fan
  "POST /api/v1/user/fan/purchase-act": "fan/purchase-act", //purchase activation
  "POST /api/v1/user/fan/purchase-act/apple-pay": "fan/purchase-act/apple-pay", //purchase activation/apple=pay
  "POST /api/v1/user/fan/create-customer/apple-pay":
    "fan/purchase-act/create-customer", //purchase activation/apple=pay

  //GUEST USER
  "POST /api/v1/user/guest/create": "guest/create", //purchase activation/apple=pay
  "POST /api/v1/user/guest/purchase-act/confirm-apple-pay":
    "guest/guest-purchase/confirm-apple-pay",
  "POST /api/v1/user/guest/purchase-act/apple-pay":
    "guest/guest-purchase/apple-pay",
  "POST /api/v1/user/guest/confirm": "guest/confirm",

  //Invite

  "POST /api/v1/user/send/invite/:id": "invitation/send",
  "GET /api/v1/user/get/invite/:id": "invitation/list",
  "POST /api/v1/user/invite/accept/:id": "invitation/accept",

  "GET /api/v1/user/invite/confirm/:id": "invitation/confirm",

  // ---------

  "GET /api/v1/generate/qr": "qrcode/qrcode",

  "POST /api/v1/user/fan/purchase-act/confirm-apple-pay":
    "fan/purchase-act/confirm-apple-pay", //purchase activation/apple=pay

  "GET /api/v1/user/fan/get-publish-pages/:id": "fan/get-publish-pages", //purchase activation
  "GET /api/v1/user/fan/get-publish-pages-appclip/:id":
    "fan/get-publish-pages-appclip",
  "GET /api/v1/user/fan/get-activations": "fan/get-activations", //get activation
  "GET /api/v1/user/fan/get-purchased-pages": "fan/get-purchased-pages", //get pages
  "GET /api/v1/user/fan/get-one/:id": "fan/get-one", //get pages
  "GET /api/v1/user/fan/get-one-appclip/:id/:device_id": "fan/get-one-appclip", //get pages
  "POST /api/v1/user/fan/cancel-subs/:id": "fan/cancel-subs", //get pages
  "GET /api/v1/user/fan/recent-acts/:id": "fan/recent-act", //recent activites
  "POST /api/v1/user/fan/qr-code-scan": "fan/qr-scan-code", //scan qr code
  "POST /api/v1/fan/verify": "fan/verify", //scan qr code

  "GET /api/v1/pages/:slug": {
    cors: corsPolicy,
    action: "pages/get-one",
  },
  "POST /api/v1/pages/count-view": {
    cors: corsPolicy,
    action: "pages/count-view",
  },
  "POST /api/v1/pages/links/count-click": {
    cors: corsPolicy,
    action: "pages/links/count-click",
  },

  "GET /api/v1/aws/sign-url": "aws/sign-url",

  "POST /api/v1/user/pages": {
    cors: corsPolicy,
    action: "user/pages/create",
  },
  "GET /api/v1/user/pages": {
    cors: corsPolicy,
    action: "user/pages/get",
  },
  "GET /api/v1/user/pages/:id": {
    cors: corsPolicy,
    action: "user/pages/get-one",
  },
  "PUT /api/v1/user/pages/:id": {
    cors: corsPolicy,
    action: "user/pages/edit",
  },
  "PUT /api/v1/user/pages/change-attributes": {
    cors: corsPolicy,
    action: "user/pages/change-attributes",
  },
  "DELETE /api/v1/user/pages/:id": {
    cors: corsPolicy,
    action: "user/pages/delete",
  },
  "PUT /api/v1/user/pages/publish": {
    cors: corsPolicy,
    action: "user/pages/publish",
  },

  // Payment

  "POST /api/v1/user/payment/status": {
    cors: corsPolicy,
    action: "payment/status",
  },

  // Activation

  "POST /api/v1/activation/create": {
    cors: corsPolicy,
    action: "activations/create",
  },

  "DELETE /api/v1/activation/delete": {
    cors: corsPolicy,
    action: "activations/delete",
  },

  "PUT /api/v1/activation/edit": {
    cors: corsPolicy,
    action: "activations/edit",
  },

  "POST /api/v1/activation/save": {
    cors: corsPolicy,
    action: "activations/activation",
  },

  "GET /api/v1/activation/get/:pageId": {
    cors: corsPolicy,
    action: "activations/get",
  },

  "POST /api/v1/generate/voucher": {
    cors: corsPolicy,
    action: "activations/voucher",
  },

  // Perfect Pass

  "POST /api/v1/user/perfectpass": {
    cors: corsPolicy,
    action: "passes/enable",
  },
  "POST /api/v1/test-payment": {
    cors: corsPolicy,
    action: "test-payment",
  },

  "PUT /api/v1/user/profile-image-upload": {
    action: "user/profile-image-upload",
  },

  //Card

  "POST /api/v1/card/add": {
    cors: corsPolicy,
    action: "card/add",
  },

  "GET /api/v1/card/list": {
    cors: corsPolicy,
    action: "card/list",
  },

  "POST /api/v1/card/login": {
    cors: corsPolicy,
    action: "card/transaction",
  },

  "POST /api/v1/card/success": {
    cors: corsPolicy,
    action: "card/success",
  },

  "POST /api/v1/user/fan/cancel-act": "fan/cancel-act", //purchase activation/apple=pay
  "POST /api/v1/stripe/webhook": "stripe/webhook",
  "POST /api/v1/user/payouts": "user/payouts/create",
  "POST /api/v1/user/device-tokens": "user/device-tokens/save",

  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/
};
