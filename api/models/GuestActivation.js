/**
 * GuestActivation.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const sailsHookGrunt = require("sails-hook-grunt");

module.exports = {
  tableName: "guest_activations",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
    },
    guest_user_id: {
      type: "string",
      required: true,
    },
    activation_id: {
      type: "string",
      required: true,
    },
    qr_code: {
      type: "string",
      required: true,
    },
    page_id: {
      type: "string",
      required: true,
    },
    is_purchased: {
      type: "number",
      required: true,
    },
    is_expire: {
      type: "boolean",
      required: false,
    },
    qr_code_usage: {
      type: "string",
      // required : true
    },
    payment_reference: {
      type: "string",
      allowNull: true,
    },
    subscription_start: {
      type: "ref",
      columnType: "datetime",
    },
    subscription_end: {
      type: "ref",
      columnType: "datetime",
    },
    is_subscribed: {
      type: "boolean",
      defaultsTo: false,
    },
    is_expire: {
      type: "boolean",
      defaultsTo: false,
    },

    purchased_at: {
      type: "ref",
      columnType: "datetime",
    },
  },
  getGuestActivations: async function (filter = {}) {
    let data = [];
    try {
      let where = `fa.id IS NOT NULL`;
      if (filter.id) {
        where += ` AND fa.id = ${filter.id}`;
      }
      if (filter.activation_id) {
        where += ` AND fa.activation_id = ${filter.activation_id}`;
      }
      if (filter.guest_user_id) {
        where += ` AND fa.guest_user_id = '${filter.guest_user_id}'`;
      }
      if (filter.activation_frequency) {
        where += ` AND a.activation_frequency = '${filter.activation_frequency}'`;
      }
      if (!_.isUndefined(filter.is_expire)) {
        where += ` AND fa.is_expire = ${filter.is_expire}`;
      }
      let query = `
       SELECT fa.*,a.activation_scanlimit
       FROM guest_activations fa
       INNER JOIN activation a
       ON a.id = fa.activation_id
       WHERE ${where}`;
      sails.log(query);
      let result = await sails.sendNativeQuery(query);
      data = result.rows;
    } catch (err) {
      sails.log.error(
        `Error in model fan_activations,function getFanActivations. ${err}`
      );
    }
    return data;
  },
};
