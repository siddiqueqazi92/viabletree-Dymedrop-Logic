/**
 * Published_page.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: "published_pages",
  attributes: {
    page_id: {
      model:'page'
    },
    title: {
      type:'string'
    },
    description: {
      type:'string'
    },
    screenshot: {
      type:'string'
    },
    image: {
      type:'string'
    },
    image_id: {
      type: 'number',
      required:false,
      allowNull:true
    },
    is_deleted :{
      type: "boolean",
      defaultsTo: false,
    }

  },

};

