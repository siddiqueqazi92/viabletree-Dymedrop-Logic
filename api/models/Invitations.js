/**
 * Activations.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "invitations",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
    },
    page_id: {
      type: "string",
      required: true,
    },
    fullname: {
      type: "string",
    },
    email: {
      type: "string",
      required: true,
    },
    user_id: {
      type: "string",
    },
    accepted: {
      type: "boolean",
    },
    page_owner: {
      type: "string",
      required: true,
    },
    is_removed :{
        type: "number"
    },
    color : {
      type : "string"
    },
    createdAt : {
      type :"string"
    }
  },
};
