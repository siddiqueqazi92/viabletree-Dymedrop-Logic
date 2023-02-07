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
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token === null) {
        return res.forbidden();
    }

    try {
        let user = await sails.helpers.jwt.verifyToken.with({ token });
        let extra_attributes = await User.findOne({ where: { user_id: user.id }, select: ["first_name", "last_name", "is_active", "is_blocked", "is_form_submitted"] })

        if (extra_attributes) {
            if (extra_attributes.is_blocked) {
                return res.forbidden({ status: false, message: 'You are blocked by admin.' });
            }
            if (extra_attributes.is_form_submitted) {
                return res.forbidden({ status: false, message: 'Form is already submitted' });
            }
        }

        if (!extra_attributes) {
            await User.updateOrCreate({ user_id: user.id }, {
                user_id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                avatar: user.avatar,
            });
            extra_attributes = await User.findOne({ where: { user_id: user.id }, select: ["first_name", "last_name", "is_active", "is_blocked"] })
        }
        if (extra_attributes) {
            if (extra_attributes.is_active == false) {
                return res.forbidden();
            }
            delete extra_attributes.id
            user = _.merge(user, extra_attributes)
        }
        sails.log.debug(`policy isLoggedIn user_id: ${user.id} path: ${req.path}`);
        // if (req.method == "GET") {
        //   req.query.user = user;
        // } else {
        //   req.body.user = user;
        // }
        req.query.user = user;
        return next();
    } catch (e) {
        sails.log.error(e);
        return res.forbidden();
    }

    // return res.unauthorized();
};
