const moment = require('moment')
/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Checks that user is logged in and adds user to input
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = async (req, res, next) => {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token === null) { return res.forbidden(); }

  try {
    user = await sails.helpers.jwt.verifyToken.with({ token });
    sails.log.debug(JSON.stringify(user))
    if (user.role == 'admin') {
      next()
    }
    else {
      return res.unauthorized();
    }
  } catch (e) {
    sails.log.error(e);
    return res.forbidden();
  }

};
