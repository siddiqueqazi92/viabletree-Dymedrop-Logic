/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "settings",
  attributes: {
    setting_type: {
      type: "string",
      required: false,
      columnName: "type",
    },
    value: {
      type: "string",
      required: false,
    },
    deletedAt: {
      type: "ref",
      columnType:"datetime",
      required: false,      
    },
  },

  customToJSON: function () {
    return _.omit(this, ["createdAt", "updatedAt"]);
  },
};
