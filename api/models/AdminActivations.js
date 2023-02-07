/**
 * Activations.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

 module.exports = {
    tableName: "activation_admin",
    attributes: {
          id: {
          type: "number",
          autoIncrement: true,
          },
      activation_name: {
          type :"string",
          required:true
      },
      activation_price :{
          type: "number",
          required : true
      },
      activation_frequency :{
          type :"string",
          required : true
      },
      activation_description : {
          type :"string",
          required:true
      },
      activation_scanlimit :{
          type :"string",
          required : true
      },
      activation_fanlimit :{
          type :"string",
          required :true
      },
      activation_promocode :{
          type :"string",
          required :false
      },
      published :{
          type :"number",
          required :false
      }
    },
  };
  