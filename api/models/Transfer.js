/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "transfers",
  attributes: {
    id :{
        type: "number",
        autoIncrement: true,
    },
    user_id: {
      type: "string",
      required: false,
    },
    page_id: {
      type: "string",
      required: false,
    },
    activation_id: {
      type: "string",
      required: false,
    },
    purchase_id: {
      type: "string",
      required: false,
    },
    amount: {
      type: "string",
      required: false,
    },
    transfer_date: {
      type: "string",
      required: false,
    },
    transfer_id: {
      type: "string",
      required: false,
    },
  },

  customToJSON: function () {
    return _.omit(this, ["createdAt", "updatedAt"]);
  },
};
