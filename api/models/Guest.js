/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

 module.exports = {
    tableName: "guestusers",
    attributes: {
      guest_user_id: {
        type: "number",
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
      device_id: {
        type: "string",
      },
      customer_stripe_id: {
        type: "string",
      },
      is_signup :{
        type : "number"
      },
      is_deleted : {
        type : "number"
      }
      // pages: {
      //   collection: 'page',
      //   via: 'user_id'
      // }
    },
  
    customToJSON: function () {
      return _.omit(this, [
        "createdAt",
        "updatedAt",
      ]);
    },
  
  
  
  };
  