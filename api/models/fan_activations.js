/**
 * fan_ctivations.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const sailsHookGrunt = require("sails-hook-grunt");

module.exports = {
  tableName: "fan_activations",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
    },
    fan_user_id: {
      type: "string",
      required: true,
    },
    activation_id: {
      type: "string",
      required: true,
    },
    activation_id: {
      model: "activations",
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
    deletedAt: {
      type: "ref",
      columnType: "datetime",
      required: false,
    },
  },
  getFanActivations: async function (filter = {}) {
    let data = [];
    try {
      let where = `fa.id IS NOT NULL`;
      if (filter.id) {
        where += ` AND fa.id = ${filter.id}`;
      }
      if (filter.activation_id) {
        where += ` AND fa.activation_id = ${filter.activation_id}`;
      }
      if (filter.fan_user_id) {
        where += ` AND fa.fan_user_id = '${filter.fan_user_id}'`;
      }
      if (filter.activation_frequency) {
        where += ` AND a.activation_frequency = '${filter.activation_frequency}'`;
      }
      if (!_.isUndefined(filter.is_expire)) {
        where += ` AND fa.is_expire = ${filter.is_expire}`;
      }
      if (filter.payment_reference) {
        where += ` AND fa.payment_reference = '${filter.payment_reference}'`;
      }
      let query = `
      SELECT fa.*,a.activation_scanlimit , a.activation_name , a.activation_frequency , a.activation_price , p.title ,p.page_id as page_id
      FROM fan_activations fa
      INNER JOIN activation a
      ON a.id = fa.activation_id
      INNER JOIN published_pages p
      ON p.page_id = fa.page_id
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
  getFanActivationCountByPage: async function (
    fan_id,
    page_reference,
    field = "slug"
  ) {
    let data = 0;
    try {
      let where = `fa.fan_user_id = '${fan_id}'`;
      where +=
        field == "slug"
          ? `AND p.${field} = 'scanlimit'`
          : `AND p.${field} = ${page_reference}`;
      let query = `SELECT COUNT(fa.id) as purchased_activations_count
      FROM fan_activations fa
      INNER JOIN pages p
      ON p.id = fa.page_id
      WHERE ${where}
       `;

      let result = await sails.sendNativeQuery(query);
      data =
        result.rows.length > 0 ? result.rows[0].purchased_activations_count : 0;
      console.log({ query, result });
    } catch (err) {}
    return data;
  },
};
