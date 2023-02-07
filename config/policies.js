/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {
  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/

  "admin/user/get-all": ["isAdmin"],
  "admin/user/get-one": ["isAdmin"],

  "admin/user/create/user-account": ["isAdmin"],
  "admin/user/update/user-account": ["isAdmin"],
  "admin/user/update/account-status": ["isAdmin"],

  "admin/pages/get": ["isAdmin"],
  "admin/pages/get-one": ["isAdmin"],
  "admin/settings/get": ["isAdmin"],
  "admin/settings/get-one": ["isAdmin"],
  "admin/settings/update": ["isAdmin"],

  "user/account/form": ["isLoggedIn"], //['isFormSubmitted'],
  "user/account/deactivate": ["isLoggedIn"],
  "fan/get-publish-pages": ["isLoggedIn"],

  //invite

  "invitation/send": ["isLoggedIn"],
  "invitation/list": ["isLoggedIn"],
  "invitation/accept": ["isLoggedIn"],
  "invitation/confirm": ["isLoggedIn"],

  //Payment

  "payment/status": ["isLoggedIn"],

  // '*': true,
  "user/pages/create": ["isLoggedIn"],
  "user/pages/edit": ["isLoggedIn"],
  "user/pages/delete": ["isLoggedIn"],
  "user/pages/get": ["isLoggedIn"],
  "user/pages/get-one": ["isLoggedIn"],
  "user/pages/publish": ["isLoggedIn"],
  "user/pages/change-attributes": ["isLoggedIn"],
  "user/account/form-fan": ["isLoggedIn"],
  "fan/purchase-act": ["isLoggedIn"],
  "fan/purchase-act/apple-pay": ["isLoggedIn"],
  "fan/purchase-act/confirm-apple-pay": ["isLoggedIn"],
  "fan/get-activations": ["isLoggedIn"],
  "fan/get-purchased-pages": ["isLoggedIn"],
  "fan/get-one": ["isLoggedIn"],
  "fan/cancel-subs": ["isLoggedIn"],
  "fan/recent-act": ["isLoggedIn"],
  "fan/qr-scan-code": ["isLoggedIn"],
  "fan/cancel-act": ["isLoggedIn"],
  "fan/purchase-act/create-customer": ["isLoggedIn"],

  // Activation

  "activations/create": ["isLoggedIn"],
  "activations/delete": ["isLoggedIn"],
  "activations/edit": ["isLoggedIn"],
  "activations/activation": ["isLoggedIn"],
  "activations/get": ["isLoggedIn"],

  "admin/pages/activations/activations": ["isAdmin"],

  //Templaters

  "admin/templates/list": ["isAdmin"],
  "admin/templates/create": ["isAdmin"],

  //finance

  "admin/finance/list": ["isAdmin"],

  //Perfect Pass
  "passes/enable": ["isLoggedIn"],

  "user/profile-image-upload": ["isLoggedIn"],

  //Card Add

  "card/add": ["isLoggedIn"],
  "card/list": ["isLoggedIn"],
  "card/transaction": ["isLoggedIn"],
  "card/success": ["isLoggedIn"],
  "user/payouts/create": ["isLoggedIn"],
  "user/device-tokens/save": ["isLoggedIn"],
  "pages/get-one": ["isTokenValid"],
};
