/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "users",
  attributes: {
    user_id: {
      type: "string",
    },
    email: {
      type: "string",
      required: false,
      isEmail: true,
      allowNull: true,
    },

    first_name: {
      type: "string",
      required: false,
      allowNull: true,
    },
    last_name: {
      type: "string",
      required: false,
      allowNull: true,
    },
    phone_number: {
      type: "string",
      // required: false,
      allowNull: true,
    },
    organization: {
      type: "string",
      // required: false,
      allowNull: true,
    },
    job_title: {
      type: "string",
      // required: false,
      allowNull: true,
    },
    fanbase_size: {
      type: "string",
      // required: false,
      allowNull: true,
    },
    location: {
      type: "string",
      // required: false,
      allowNull: true,
    },
    is_form_submitted: {
      type: "boolean",
      // required: false,
      defaultsTo: false,
    },
    status: {
      type: "string",
      isIn: global.STATUS,
      //  required: false,
      // defaultsTo: global.STATUS[0]
    },
    avatar: {
      type: "string",
      required: false,
      defaultsTo:
        "https://ahauserposts.s3.amazonaws.com/image_2021_11_25T18_57_06_110Z.png",
      // allowNull: true,
    },
    is_active: {
      type: "boolean",
      defaultsTo: true,
    },
    is_blocked: {
      type: "boolean",
      defaultsTo: false,
    },
    customer_stripe_id: {
      type: "string",
    },
    currentUser: {
      type: "string",
    },
    full_name: {
      type: "string",
    },
    account_id: {
      type: "string",
    },
    account_setup: {
      type: "boolean",
      defaultsTo: false,
    },
    total_earnings: {
      type: "string",
    },
    available_amount: {
      type: "number",
    },
    is_invited: {
      type: "boolean",
    },
    device_token: {
      type: "string",
      required: false,
      allowNull: true,
    },
    // pages: {
    //   collection: 'page',
    //   via: 'user_id'
    // }
  },

  customToJSON: function () {
    return _.omit(this, ["createdAt", "updatedAt"]);
  },
  updateAvalableAmount: async function (user_id, available_amount = 0) {
    let updated = false;
    try {
      let user = await User.findOne({
        where: { user_id },
        select: ["available_amount"],
      });
      if (user) {
        available_amount += user.available_amount;
        available_amount = parseFloat(available_amount).toPrecision(2);
        await User.updateOne({ user_id }).set({ available_amount });
        updated = true;
      }
    } catch (err) {
      sails.log.error(
        `Error in model User, function updateAvalableAmount. ${err}`
      );
    }
    return updated;
  },
};
