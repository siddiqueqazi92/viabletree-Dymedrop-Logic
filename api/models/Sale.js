/**
 * Sale.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "sales",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
    },
    fan_or_guest_activation_id: {
      type: "number",
      required: false,
      allowNull: true,
    },
    activation_id: {
      type: "number",
      required: false,
      allowNull: true,
    },
    total: {
      type: "number",
      required: true,
    },
    creator_share: {
      type: "number",
      required: true,
    },
    admin_share: {
      type: "number",
      required: true,
    },
    is_guest: {
      type: "boolean",
      required: false,
      defaultsTo: false,
    },
  },
};
