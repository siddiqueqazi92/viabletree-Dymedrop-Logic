/**
 * Activations.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "recent_activities",
  attributes: {
        id: {
        type: "number",
        autoIncrement: true,
        },
    user_id: {
      type: "string",
      required: true,
    },
   
    page_id :{
        type :"string",
        required :true
    },
    type :{
        type :"string",
        required :true
    },
    count :{
        type :"number",
      //  required :false
    },
    
  },
};
