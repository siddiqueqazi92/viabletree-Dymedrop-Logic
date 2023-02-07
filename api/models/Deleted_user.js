/**
 * Deleted_users.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: "deleted_users",
  attributes: {
    id: {
      type: "string",
      columnName: "_id",
      autoIncrement: true,
    },
    email: {
      type: "string",
      required: true,
      isEmail: true,
    },
    user_id: {
      type: "string",
      required: true,
    },
  },

};

