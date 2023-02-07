/**
 * Draft_page_link.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "draft_page_links",
  attributes: {
    order: {
      type:'number'
    },
    page_id: {
      model: "page",
    },
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
    thumbnail: {
      type: "string",
    },
    show_thumbnail: {
      type: "boolean",
    },
    position: {
      type: "string",
    },
    action: {
      type: "string",
    },
    link_height: {
      type:'number'
    },
    is_deleted :{
      type: "boolean",
      defaultsTo: false,
    }
  },
   
  customToJSON: function () {
    if (this.action && !_.isObject(this.action)) {
      this.action = JSON.parse(this.action)
    }
    this.show_thumbnail = Boolean(this.show_thumbnail)
    return _.omit(this, [ 
      "page_id",
      "createdAt",
      "updatedAt",       
    ]);
  },
};
