/**
 * Published_page_link.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "published_page_links",
  attributes: {
    order: {
      type:'number'
    },
    page_id: {
      model: "page",
    },
    draft_page_link_id: {
      model: "draft_page_link",
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
    clicks: {
      type:'number'
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
    if (this.action) {
      this.action = JSON.parse(this.action)
    }
    this.show_thumbnail = Boolean(this.show_thumbnail)
    return _.omit(this, [ 
      "page_id",
      "createdAt",
      "updatedAt",       
    ]);
  },
  countClick: async function (id) {
    try {
      updated = await sails.getDatastore().transaction(async (db) => {    
         updated = await Published_page_link.findOne({where:{id},select:[
          'clicks'
        ]
        })        
        let clicks = updated.clicks + 1;
        await Published_page_link.updateOne({where:{id}}).set({clicks})
        return clicks;
      });
      return updated;
    } catch (err) {
      sails.log.error(`Error in model Page, function countClick. ${err}`);
    }
  },
};
